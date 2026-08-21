---
title: "Two-player Simon memory game in Verilog"
slug: "simon-memory-game"
date: 2025-11-15
period: "November 2025"
summary: "A complete RTL implementation of a two-player Simon game — custom datapath, control FSM, and 64-entry pattern memory."
tags: ["Verilog", "RTL", "FSM", "digital design"]
stack: ["Verilog", "Vivado"]
course: "ECE 206 — Digital Logic Design"
source_note: "Source withheld under course policy."
featured: false
order: 5
status: "complete"
metrics:
  - label: "Pattern memory"
    value: "64 entries"
---

A two-player version of Simon, built as hardware rather than software: custom
datapath, control FSM, and a 64-entry pattern memory holding the sequence as it
grows.

Verification is modular: separate testbenches for the datapath and the
controller, so each is exercised in isolation, plus a gameplay testbench that
drives full rounds end to end: the sequence growing, a correct replay
advancing, an incorrect one ending the game.

