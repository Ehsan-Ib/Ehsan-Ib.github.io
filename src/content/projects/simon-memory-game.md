---
title: "Two-player Simon memory game in Verilog"
slug: "simon-memory-game"
date: 2025-11-15
period: "November 2025"
summary: "A complete RTL implementation of a two-player Simon game — custom datapath, control FSM, and 64-entry pattern memory."
tags: ["Verilog", "RTL", "FSM", "digital design"]
stack: ["Verilog"] # TODO: add your simulator
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

<!-- TODO: this page is built from your resume bullets and nothing else. Two or
     three sentences of your own turn it from a description into a project page.
     The useful ones to answer:

       - How does two-player work? Alternating turns on one shared sequence,
         or does each player build their own? This is the part that makes it
         yours rather than a standard assignment, so it's worth a sentence.
       - How many FSM states, and what are they? (idle / show pattern / await
         input / compare / advance / game over — whatever yours actually are.)
       - How is the sequence generated? An LFSR is the usual hardware answer,
         and if that's what you did it's worth naming.
       - What's the I/O? Buttons and LEDs on a board, or simulated stimulus?
       - Was it synthesized to hardware or simulation-only? If synthesized,
         add the board and utilization numbers and put the FPGA tag back.
-->

Verification is modular: separate testbenches for the datapath and the
controller, so each is exercised in isolation, plus a gameplay testbench that
drives full rounds end to end — the sequence growing, a correct replay
advancing, an incorrect one ending the game.

<!-- TODO: a waveform screenshot would carry this page. With no repo, it's the
     only direct evidence the design runs. A capture showing a round advancing
     and then a wrong input triggering game-over would do it. -->
