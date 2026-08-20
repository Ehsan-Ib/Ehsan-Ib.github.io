---
title: "PUnC — a 16-bit LC-3 processor in Verilog"
slug: "punc-lc3-processor"
date: 2025-12-01 # TODO: replace with actual date
summary: "A 16-bit microprocessor implementing most of the LC-3 ISA, with FSM control, a separate datapath, and a full instruction-level testbench."
tags: ["Verilog", "RTL", "computer architecture", "FPGA"]
stack: ["Verilog", "Vivado", "iverilog"]
repo: none
featured: true
order: 3
status: "complete"
metrics:
  - label: "Instructions implemented"
    value: "15"
  - label: "Control"
    value: "4-state FSM"
  - label: "Test programs"
    value: "16 memory images"
---

A working 16-bit processor built from the ISA spec up: datapath, control unit, register file, memory, and the test infrastructure to prove it runs real programs.

<!-- TODO: state clearly what was provided as course scaffolding vs. what you wrote.
     Reviewers assume the worst if you don't say. One sentence is enough, e.g.
     "Memory.v and RegisterFile.v were provided; datapath, control, and testbench are mine." -->

## Structure

The design keeps control and datapath strictly separated. `PUnCControl.v` is a four-state FSM — fetch, decode, execute, halt — that emits control signals; `PUnCDatapath.v` holds everything that stores or transforms data: the ALU, program counter, instruction register, condition-code flags, and the mux network wiring them together.

Most instructions retire in a single execute cycle. Three need two, and the reasons are the interesting part of the design:

- **`LDI`** is a double dereference — read a pointer from memory, then read through it
- **`LDR`** computes base+offset in one step, then uses that address in the next
- **`STR`** latches the computed target address before writing to it

Condition codes (N/Z/P) update combinatorially whenever the control unit asserts `flag_enable`, driven by either ALU results or memory loads.

## Verification

Sixteen assembly test programs, each compiled to a `.vmh` memory image and run through the testbench. Each test loads its image, pulses reset, waits for the PC to stop advancing for ten cycles, then asserts on expected register and memory state.

Coverage runs from single-instruction checks (each addressing mode of every load and store, both ALU operand forms) up to two real programs: Euclidean GCD, and a Fibonacci routine combined with an AND test.

## Also in the repo

`SIPP/` holds a separate pipelined variant of the processor with its own control unit, datapath, and testbench.

<!-- TODO: This is underselling itself badly. A pipelined design is a much stronger
     signal than a single-cycle one — pipelining is where hazards, forwarding, and
     stalls live, and that's what hardware interviewers actually probe.
     Either write it up properly here or split it into its own project page.
     Worth answering: how many stages? How are data hazards handled — forwarding
     or stalling? What happens on a taken branch? Any CPI measurement vs. PUnC? -->

## Known issues

The testbench hard-codes absolute image paths, so `PUnC.t.v` needs its `START_TEST` macro edited before it will run anywhere else. Worth fixing — it's a two-minute change and it's the first thing anyone cloning the repo will hit.
