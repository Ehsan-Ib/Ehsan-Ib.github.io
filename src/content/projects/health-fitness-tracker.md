---
title: "Health & Fitness Tracker"
slug: "health-fitness-tracker"
date: 2025-11-01 # TODO: replace with actual date
summary: "An iOS app that estimates meal macros from a plain-English description by routing it through a mixture-of-agents pipeline across five models."
tags: ["iOS", "SwiftUI", "LLM systems", "Firebase"]
stack: ["Swift", "SwiftUI", "Firebase Firestore", "Python/Flask", "Groq", "NVIDIA NIM"]
repo: "https://github.com/Ehsan-Ib/HealthTracker"
featured: true
order: 4
status: "personal use"
---

An app I built for myself and actually use. You describe a meal — or photograph it — and it returns a macro breakdown. Also logs lifts and tracks consistency.

## The interesting part: mixture-of-agents

Single-model macro estimation is unreliable, and the failure mode is specific: models are decent at estimating generic food and bad at branded or restaurant items, where the real answer is a database lookup, not a guess. So the pipeline splits the problem.

A classifier pass (Llama 4 Scout) first pulls out any branded or restaurant items. Those get resolved against the FatSecret food database for verified numbers. Meanwhile three workers — Qwen3.5-397B, Llama-4-Scout, Llama-3.2-11B — estimate the full meal independently and in parallel. A head model (GPT-OSS-120B) then reconciles the verified database facts against worker consensus and produces the final breakdown plus a plain-English explanation of how it got there.

The design principle is that ground truth beats consensus, and consensus beats a single sample — so use each where it's actually available. After logging, a chat interface lets you challenge the estimate.

## An infrastructure problem worth mentioning

FatSecret whitelists by IP. A phone's IP changes constantly, so the app can't call the API directly. Requests route through a small Flask proxy running on a machine with a whitelisted address. Unglamorous, but it's the kind of constraint that only shows up once you try to ship something against a real third-party API.

## Rest of the app

Workout logging covers ten compound lifts with a live session timer, rest timer, and a proportional bar chart of your previous sets for that same exercise shown while you log. PR tracking uses a rolling two-week window with a 1RM trend line via the Epley formula. Workout templates are saveable.

The calendar colour-codes each day by what you completed and computes a streak that counts backwards from today, breaking on any day that didn't qualify.

Built on SwiftUI with the `@Observable` macro — no Combine, no `ObservableObject`. Persistence is Firestore.

<!-- TODO: two things worth adding if you have them —
     1. Screenshots. This is the only project on the site that has a visual
        interface, so it should be the only page with a UI screenshot. Two or
        three: the meal-logging flow, the calendar, the PR chart.
     2. Any accuracy check on the MoA pipeline. Even informal — "spot-checked
        N meals against labels, median macro error was X%" — would turn the
        design rationale above from a plausible story into a measured claim,
        and that's the same move that makes the BitNet page work. -->
