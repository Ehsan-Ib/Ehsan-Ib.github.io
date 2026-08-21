---
title: "PUnC — a 16-bit LC-3 processor in Verilog"
slug: "punc-lc3-processor"
date: 2025-12-15
period: "November – December 2025"
summary: "A 16-bit microprocessor implementing most of the LC-3 ISA — datapath, FSM controller, and a sixteen-program instruction-level testbench."
tags: ["Verilog", "RTL", "computer architecture"]
stack: ["Verilog"] # TODO: add your simulator — Vivado, ModelSim, QuestaSim, whichever you actually used
course: "ECE 206 — Digital Logic Design"
source_note: "Source withheld under course policy."
featured: true
order: 3
status: "complete"
metrics:
  - label: "Instructions"
    value: "15"
  - label: "Control"
    value: "4-state FSM"
  - label: "Test programs"
    value: "16"
---

A working 16-bit processor built from the ISA spec: datapath, control unit,
register file, and the test infrastructure to prove it runs real programs.

<!-- TODO: one sentence on what was provided vs. what you wrote. Reviewers assume
     the worst if you don't say — e.g. "Memory and register-file modules were
     provided; datapath, controller, and testbench are mine." -->

The design keeps control and datapath strictly separated. A four-state FSM —
fetch, decode, execute, halt — emits control signals; the datapath holds the
ALU, program counter, instruction register, condition-code flags, and the mux
network wiring them together. Condition codes update combinatorially whenever
the controller asserts the flag enable, driven by either ALU results or memory
loads.

Most instructions retire in a single execute cycle. Three need two, and the
reasons are the interesting part: `LDI` is a double dereference, reading a
pointer from memory and then reading through it; `LDR` computes base+offset in
one step and uses that address in the next; `STR` latches the computed target
before writing to it.

Verification is sixteen assembly programs, each compiled to a memory image and
run through a testbench that loads it, pulses reset, waits for the PC to stop
advancing, and asserts on expected register and memory state. Coverage runs from
single-instruction checks — every addressing mode of every load and store, both
ALU operand forms — up to two real programs: Euclidean GCD, and Fibonacci
combined with an AND test.

## A pipelined variant

I also built SIPP, a separate pipelined implementation with its own controller,
datapath, and testbench.

<!-- TODO: two or three sentences here, and they're worth more than anything
     above. Pipelining is where hazards, forwarding, and stalls live, and that's
     what hardware interviews actually probe. How many stages? Forwarding or
     stalling on data hazards? What happens on a taken branch? -->
