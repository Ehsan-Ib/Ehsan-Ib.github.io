---
title: "FlashAttention from scratch in CUDA"
slug: "cuda-flash-attention"
date: 2026-08-01
summary: "A fused attention kernel in raw CUDA that cuts measured DRAM traffic 22.2×, and a measured roofline model showing why that correctly buys only 1.46× in wall-clock."
tags: ["CUDA", "GPU", "kernel fusion", "roofline", "performance"]
stack: ["CUDA C++", "Nsight Compute", "Python", "PyTorch"]
repo: "https://github.com/Ehsan-Ib/cuda-flash-attention"
featured: true
order: 2
status: "complete"
metrics:
  - label: "DRAM traffic reduction"
    value: "22.2× (23.75 → 1.07 MB)"
  - label: "Wall-clock speedup"
    value: "1.46×"
  - label: "vs. PyTorch SDPA (FP32)"
    value: "within 1.54×"
  - label: "Correctness"
    value: "~1 ULP vs. four references"
---

Attention is the canonical memory-bound GPU workload. Computed naively, the N×N
score matrix crosses off-chip memory four times for no algorithmic reason. I
implemented the forward pass both ways in raw CUDA on a Tesla T4 — an unfused
three-kernel pipeline and a fused FlashAttention-style kernel with online
softmax — to measure exactly what fusion buys.

It bought 22.2× less DRAM traffic and 1.46× wall-clock. The gap between those
two numbers is the finding, not a shortfall.

## Results

N = 1024, d = 64, FP32, single head, forward pass. Tesla T4 (sm_75), clocks
locked at 1590 MHz, CUDA 12.8, Nsight Compute 2025.1.1.

| Metric | Unfused | Fused | Ratio |
|---|---|---|---|
| Wall-clock | 0.4648 ms | 0.3182 ms | **1.46×** |
| DRAM traffic (measured) | 23.75 MB | 1.07 MB | **22.2×** |
| L2 traffic | 52.45 MB | 17.66 MB | 2.97× |
| Arithmetic intensity | 11.30 FLOP/byte | 250.47 FLOP/byte | 22.2× |
| Achieved throughput | 578 GFLOP/s | 844 GFLOP/s | 1.46× |
| Max abs error vs. CPU | 1.378e-07 | 1.267e-07 | — |

Against PyTorch: SDPA in FP32 runs 0.2069 ms — 1.54× faster than my kernel at
equal precision, agreement 4.47e-08. Its FP16 tensor-core path is 3.78× faster.
The honest claim is that a from-scratch fused kernel lands within 2× of a
production library at equal precision, with every step of the distance measured.

## Why 22× traffic bought only 1.46× time

Both implementations do identical arithmetic — 268.4 MFLOP on identical
committed inputs. Fusion changes only where bytes move, so the optimization
travels almost purely *horizontally* on the roofline: arithmetic intensity goes
11.30 → 250.47 FLOP/byte.

I measured the card's actual ceilings rather than reading the datasheet: 232.6
GB/s DRAM bandwidth (73% of the published 320) and 7433 GFLOP/s FP32 (92% of the
published 8100), giving a ridge point of **31.96 FLOP/byte** — squarely between
the two kernels. The unfused pipeline runs left of the ridge, where cutting
bytes cuts milliseconds. The fused kernel runs right of it, where DRAM no longer
binds and further traffic reductions move the point sideways rather than up.

Crossing the ridge is not reaching the roof. The baseline achieves ~22% of the
memory ceiling; the fused kernel ~11% of the compute ceiling. What binds both is
implementation quality — no tensor cores, simple 32×32 tiling with no double
buffering, and a 32-block grid on a 40-SM GPU, leaving 8 SMs idle by
construction.

The traffic also didn't vanish so much as move up the hierarchy: the fused
kernel reads 17.66 MB from L2 against 1.07 MB from DRAM. All 32 blocks stream
the same K and V, and the L2 absorbs the re-reads.

## Kernel design

Q tiles stay resident in shared memory for the block's lifetime while K and V
stream past — about 28 KB of shared memory, under the 48 KB default, so it
launches on any sm_75 configuration as-is.

**One warp owns one query row.** That makes both softmax reductions — row max
and row sum — pure `__shfl_xor_sync` butterflies: five steps, registers only, no
barrier. The baseline's softmax uses an eight-step shared-memory tree with
`__syncthreads()` between levels.

**Transposed access is structurally impossible.** The score contraction runs
over d, which is the contiguous last index of *both* Q and K. The Kᵀ in the
formula never becomes a memory pattern — there is no column to walk and no
indexing choice to get wrong. Nsight measures 4 sectors per request against the
baseline's 18.

Only the K tile needs bank-conflict padding (`Ks[32][65]`): its access in the
score loop puts the lane index on the row, so a stride of 64 lands all 32 lanes
in one bank. The output never touches shared memory at all — d = 64 across 32
lanes is exactly two register accumulators per thread, from first tile to final
divide.

Online softmax was implemented from memory, then validated against a tiled numpy
reference with a per-tile invariant check before any CUDA was written: after tile
t, `O/l` is exactly the attention output over the keys seen so far. It was
correct on the first working run.

## Verification

Five independent checks, all gated — a kernel failing the 1e-3 threshold exits
before timing runs at all, so a wrong kernel produces no numbers to
accidentally publish.

| Check | Compares | Max abs error |
|---|---|---|
| CPU triple-loop | each kernel vs. naive host code | 1.378e-07 / 1.267e-07 |
| Tiled numpy | per-tile online-softmax state | 1.57e-08 |
| PyTorch SDPA | vs. an independent production implementation | 4.470e-08 |
| Direct kernel diff | the two kernels against each other | 1.229e-07 |
| Late-max stress | the rescale path, forced to fire | 7.749e-07 |

Two independently written kernels agreeing to roughly 1 ULP is the strongest
check here — neither validates itself against its own assumptions. At N=64 and
N=128 the CPU comparison bottoms out at 1.192e-07, which is 2⁻²³ exactly: FP32
machine epsilon. The kernel sits at the floating-point floor, not merely near a
reference.

The late-max test is the one I'd point at. On well-scaled random inputs the
running max settles in tile 0, so the rescale correction is ≈1.0 everywhere —
meaning the entire rescale path could be deleted and every other test would
still pass. I made the input generator scale the last 32 rows of K by 8×, which
at Bc=32 and N=1024 is exactly tile 31, forcing the max to jump on the final
iteration. Error moved to 7.749e-07: large enough to prove the path executed,
still small enough (~6 ULP) to prove the arithmetic is right. A stale-max bug
would show 1e-1 or worse.

## Two things that went wrong

**A clock ramp masquerading as a speedup.** Successive runs of the same binary
on the same data kept getting faster — 0.5202 → 0.4359 → 0.3442 ms — while
within-run min and mean agreed to 0.4%. The instrument was precise; the state
was drifting. The T4 idles at 825 MHz and boosts to ~1590, a 10-iteration warmup
on a 0.3 ms kernel is only ~3 ms of load, and my CPU reference ran first,
guaranteeing an idle GPU before every timing run. Fixed with a 2-second
duration-based warmup and `nvidia-smi -lgc 1590`. Two earlier headline numbers
were retired as cold-clock artifacts.

**A passing test suite that had lost its premise.** The host code silently
generated random inputs when the committed `.bin` files were missing — and
still printed PASS, legitimately, since it validated against a CPU reference on
whatever data it ran. Both phases could pass on *different* data, quietly
invalidating the direct kernel-to-kernel diff. I replaced it with a hard
failure, which fired on the very first run afterward: a Colab reset had wiped
`data/`.

## Scope

One (N, d) point, FP32, single head, forward pass, one GPU. No tensor cores, no
causal masking, no multi-head, no backward pass, no scaling claim.

The baseline is deliberately generous — swapping in the faster GEMM from the
Phase 1 ladder would shrink the 1.46× while leaving the DRAM claim untouched.
Even against a *perfect* unfused baseline the DRAM ratio floor is ~17×.

Next steps, ordered by what the measurements say is binding rather than by
interest: FP16 with tensor cores (844 vs. 7433 GFLOP/s available), then
multi-head batching to fill the 8 idle SMs, then causal masking — the kernel
already initializes the running max to `-FLT_MAX` rather than `-INFINITY` so a
fully-masked tile can't produce NaN.
