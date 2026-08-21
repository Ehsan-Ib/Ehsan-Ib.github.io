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

The design keeps control and datapath strictly separated. A four-state FSM —
fetch, decode, execute, halt — emits control signals; the datapath holds the
ALU, program counter, instruction register, condition-code flags, and the mux
network wiring them together. Condition codes update combinatorially whenever
the controller asserts the flag enable, driven by either ALU results or memory
loads.

Most instructions retire in a single execute cycle. Three need two: `LDI` is a double dereference, reading a
pointer from memory and then reading through it; `LDR` computes base+offset in
one step and uses that address in the next; `STR` latches the computed target
before writing to it.

Verification runs through an automated testbench that asserts on expected register and memory state for each instruction and a few combinations of instructions. I inspected the waveform when anything failed. On top of that I wrote an original LC-3 assembly program and ran it end to end, which exercises the instructions together rather than one at a time.

