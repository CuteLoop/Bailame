# Dance Games — Exploration Playbook

A bank of small, buildable prototypes for learning game dev around salsa, bachata, and cumbia. Built to be picked apart: grab one mechanic, ship a tiny MVP, throw it away or keep it, repeat.

Organizing principle: **start with rhythm-only touch games (no body tracking), then add instruments, then add the body, then add a partner, then add choreography, then go to hardware.** Each tier reuses the audio/timing engine you build in Tier 0, so nothing is wasted.

---

## Stack & music — the short version

- **Build in web tech first** (TypeScript + Vite, plus a small canvas/WebGL lib). Zero install, you can showcase prototypes by sending a URL, and it's the fastest possible iteration loop for vibe coding with an agent. Move a *winning* prototype to **Godot 4** (or Unity) only when you need rock-solid native audio latency or heavy 3D.
- **Use the Web Audio API**, not an HTML `<audio>` element. Drive all timing off `AudioContext.currentTime`, never off frame/`Date.now()` — this is the single thing that makes or breaks a rhythm game.
- **Ship with your own audio files** (`.ogg`/`.wav`). Pre-analyze them offline with **librosa** (Python) to extract beat grids, onsets, and per-instrument onset envelopes; bake the results into a JSON "chart" the game loads.
- **Spotify/YouTube can't power beat-sync.** DRM blocks raw audio access, and Spotify deprecated its audio-features/audio-analysis endpoints for new apps in Nov 2024 with no official replacement. Use streaming services only for *discovery/metadata*, never as the timing source.

---

## Tier 0 — Find the beat (your named MVP)

Pure rhythm, single tap input, no body. This is where the audio engine gets born.

1. **Find the 1 (Salsa)** — Loop plays; tap only on the **1** and **5**. On-screen dancer steps forward on the 1; tap on the 2 and they trip. Teaches phrase-feel, the #1 beginner struggle.
2. **Find the 1 (Bachata)** — Tap 1-2-3, then *pop* on the 4 (and 8). Trains the four-count + hip accent.
3. **Cumbia Pulse Lock** — Hold the steady `chucu-chucu` pulse, then tap only the offbeat accent. Trains the rolling güiro feel.
4. **Clave Clap** — Use the mic: clap the 2-3 / 3-2 clave. Onset detection on your own claps.
5. **Tempo Catch** — Tap along to guess the BPM; score your drift over 16 bars.
6. **Half-time / Double-time** — Same song, prove you can feel and tap both subdivisions on command.
7. **Silence Survivor** — Music drops for 2 bars; keep tapping the phantom beat; it returns and grades how far you drifted. Brutal, addictive.

## Tier 1 — Instrument / percussion (Guitar Hero with congas)

Reuses the chart engine; each instrument is its own lane. These *stack* into a full groove.

8. **Tumbao Trainer** — Two pads (slap / open tone), play the conga tumbao.
9. **Clave Keeper** — Hold the clave through distractor melody lines without slipping.
10. **Güiro Scraper** — Drag gestures whose length must match the scrape duration.
11. **Bongó Martillo** — Fast bachata bongo lane; the genre's heartbeat.
12. **Campana Endurance** — Ride the mambo bell through the montuno without dropping.
13. **Maracas Shake** — Phone IMU; shake on the right subdivision, not just "shake fast."
14. **Montuno Lane** — A simplified piano montuno as a repeating two-hand pattern.
15. **Layer Builder** — Each instrument minigame you pass *adds its track* to the mix; passing all of them assembles the full song. Great progression loop and great teaching tool.
16. **Section Caller** — Recognize when the song hits the breakdown / mambo and switch modes on time.

## Tier 2 — The body (pose + IMU)

Now the input is movement. Start with **ankles only** for pose; start with **one phone** for IMU.

17. **Ankle Velocity Step** — Phone on the ankle; check not just *when* the foot moves but the sharp accel-then-controlled-land profile against the beat envelope. (Your best first hardware-ish MVP.)
18. **Hip Isolation Cam** — Front camera; reward hip motion while shoulders stay quiet.
19. **Weight-Transfer Meter** — Estimate center-of-mass shift; clean step vs. dragged weight.
20. **Basic Step Mirror** — Pose-match the salsa basic, scored frame by frame.
21. **Shines Freestyle Scorer** — Solo footwork scored for *musicality* (hitting accents), not exact match.
22. **Spot-the-Spin** — Gyro detects a clean spotted turn vs. a wobble.
23. **Traveling Step Tracker** — Cumbia/grapevine lateral movement across a floor zone.
24. **Posture Coach** — Passive mode that just nudges you when you slouch during practice.

## Tier 3 — Partner & connection (your real differentiator)

No existing rhythm game does lead/follow. This is your unfair advantage as a teacher.

25. **Two-Phone Tension** — Two players, two IMUs; keep "frame tension" in the green (not too pushy, not too loose).
26. **Lead/Follow Latency** — Leader signals; follower's reaction window is scored.
27. **Cross-Body Lead Timing** — Both partners must hit the slot on the right count.
28. **Connection Echo** — Single-player: practice *answering* a simulated lead cue.

## Tier 4 — Choreo & routine (DDR / Just Dance / Pump It Up)

29. **Step Chart Player** — Author a salsa step chart; play it DDR-style on touch.
30. **Pad Mode** — Map the same charts to a 4/5-panel floor pad.
31. **Full-Body Mirror** — Just-Dance-style pose scoring over a whole routine.
32. **Routine Builder** — Chain your taught combos into a playable choreography (doubles as a class tool).
33. **Couples Routine** — Two synced screens for partner practice at home.

## Tier 5 — Hardware experiments

34. **IMU WebSocket Bridge** — Phone/watch streams accel+gyro over local Wi-Fi to a laptop screen. *Build this once; every body/partner game reuses it.*
35. **DIY Dance Pad** — Pressure pads + a Pico/Arduino as a USB HID controller.
36. **Shoe Sensor** — FSR or tiny IMU in an insole; the "real instrument" of footwork.

## Tier 6 — Experimental / research-flavored (your CUDA + ML edge)

37. **Live Onset Detector** — Build your own real-time beat tracker (prototype offline in librosa, then port the hot loop).
38. **Style Classifier** — A model that says "that felt more cumbia than salsa."
39. **Musicality Score** — Signal-alignment scoring: did the dancer hit the *accents*, not just the grid?
40. **Generative Drill Maker** — A model that emits fresh footwork drills calibrated to your level.

---

## A build ladder (suggested order)

| Step | Build | What it teaches you | Throwaway? |
|---|---|---|---|
| 1 | Web Audio metronome that visibly stays in sync for 5 min | Audio clock discipline | Keep — it's your spine |
| 2 | **#1 Find the 1 (Salsa)** | Charts, hit windows, scoring | Keep the engine |
| 3 | **#5 Tempo Catch** + **#7 Silence Survivor** | Latency calibration, internal clock | Maybe |
| 4 | **#9 Clave Keeper** | Multi-lane, sustained input | Keep |
| 5 | **#15 Layer Builder** | Stacking + progression loop | Keep — this is a real game |
| 6 | **#34 IMU Bridge** + **#17 Ankle Velocity Step** | Sensor input, your first "physical" game | Keep the bridge |
| 7 | **#20 Basic Step Mirror** (MediaPipe, ankles only) | Pose estimation on real hardware | Maybe |
| 8 | **#25 Two-Phone Tension** | The thing no one else has | Keep — flagship |

Rule of thumb: a prototype is "done exploring" the moment you know whether the *core feel* is fun. If it's fun in 2 days, invest. If it's not fun by then, harvest the engine and move on.

## Reusable tech you'll build along the way
- **Audio clock + chart format** (Tier 0) → used by everything.
- **librosa analysis script** → turns any track into a chart.
- **Calibration screen** (measures the player's audio+input latency once).
- **IMU WebSocket bridge** (Tier 5) → used by every body/partner game.
- **Pose wrapper around MediaPipe** (ankles-first) → Tiers 2–4.

## Notes on the genres (for charting)
- **Salsa** — 8-count, breaks on 1 (On1) or 2 (On2); clave is the law; mambo/montuno section = "boss mode."
- **Bachata** — 4-count with the pop/tap on the 4 and 8; bongó martillo + guitar requinto are the signature lanes.
- **Cumbia** — rolling güiro/guacharaca `chucu-chucu`; steady, hypnotic, forgiving — a *great* beginner MVP because the pulse is so clear.