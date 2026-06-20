# Dance Games — Mechanics & Stacks (Vol. 2)

Companion to the Exploration Playbook. This volume answers three things: (A) which *known game-mechanic archetypes* map cleanly onto dance and what each becomes, (B) the **symmetry/transformation games** (your math edge), (C) **Spanish-through-song** games, and (D) a **specific stack for every avenue** you named. Prototype numbering continues from the Playbook (which ended at #40), so this is one growing bank.

---

# Part A — Game-mechanic archetypes → dance

Each entry: **source mechanic → dance mapping → concrete prototype.**

## A1. Fighting games (your richest vein)

- **Stance trees (Soulcalibur's Maxi, Tekken transitions)** → a dance *position* is a stance; the same buttons mean different things per stance. Closed → (quarter-circle) → Cross-Body Lead → (distance break) → Open Shines. Frame windows govern when a transition is legal.
  - **#41 Stance Flow** — 3 stances, ~4 moves each, but moves only chain on the correct count. The fun is discovering legal transition paths, like a fighting-game move tree you *feel* instead of memorize.
- **Frame data (startup / active / recovery)** → every move has a windup, a hit-the-beat moment, and a recovery you can't cancel out of early.
  - **#42 Cancel Windows** — a move shows its cancel window as a shrinking ring; nail it and you link into the next move, miss and you eat full recovery (stumble).
- **Parry / counter** + **attacks synced to an instrument** → **your flagship idea.**
  - **#43 Clave Fighter** — a 1v1 (or vs. AI) fighter where *defense must land on the beat* (block/parry only registers on the pulse) and *each attack is tied to an instrument hit* — a conga slap throws a jab, a bell pattern is a combo string, the montuno is a super. Off-beat defense whiffs; off-instrument attacks have no power. Rhythm literally is the combat system.
- **Tension / super meter** → the lead–follow connection gauge; fill it by staying in the green to unlock flashy patterns.
  - **#44 Connection Meter** — multi-spin combos and dips are locked until the tension bar is full and centered.
- **Footsies / neutral / spacing** → partner distance management; baiting and committing.
  - **#45 Distance Duel** — keep ideal frame distance; closing too hard breaks frame, drifting too far drops the connection.
- **Momentum redirection (For Honor)** → rotational momentum from spins must be absorbed or redirected on the next 1.
  - **#46 Spin Absorber** — after a double spin, only momentum-compatible exits score; a hard counter-rotation = stumble.
- **Complex-move control schemes** (how a few inputs express many moves): **modal/stance-gated buttons**, **motion inputs** (quarter-circle = turn pattern), **charge inputs** (hold = a held balance or dip, release on a count), and **analog intensity** (how hard/fast you input = styling amount). Use these instead of one-button-per-move so the controller can express real dance vocabulary.

## A2. Rhythm games

- **Note highway (Guitar Hero / DDR / Beatmania)** → instrument lanes (already in Playbook Tier 1).
  - **#47 Conga Hero** — full Guitar-Hero-style highway, but the lanes are Latin percussion (clave / tumbao / bell / güiro) and styling notes give the multiplier.
- **Move-on-beat roguelike (Crypt of the NecroDancer)** → you can only act on the beat; miss a beat and you lose ground.
  - **#48 NecroSalsa** — navigate/perform only on the pulse; a forgiving cumbia level and a brutal mambo level.
- **Feel-first minigames (Rhythm Heaven)** → minimal visuals, pure groove, generous "you nailed the *feel*" scoring. Perfect frame for your beat-finding MVPs.
  - **#49 Groove Heaven** — a pack of 8 tiny, charming, feel-based timing toys (one per concept: the 1, the clave, the 4-pop, the offbeat...).
- **Call-and-response sequencer (Patapon)** → the game (or a lead) issues a rhythmic command; you echo it to trigger a combo. **This is your "sequencer with randomized cards."**
  - **#50 Llamada** — lead calls a 4-count pattern; you answer it in time; correct answers queue up into a routine. Doubles as a real lead/follow trainer.
- **Sustained flow / rhythm-violence (Thumper)** → one continuous high-speed lane, momentum builds.
  - **#51 Mambo Rush** — a single escalating line through a song's energy build into the breakdown.

## A3. Skate / freestyle (combo-line scoring)

- **Combo line + multiplier (Skate, Tony Hawk)** → chain moves without a "bail" to keep a multiplier; styling modifiers stack.
  - **#52 Shine Line** — string footwork → spin → styling → footwork into one unbroken line; landing off-beat = bail, resets the multiplier. Pure freestyle scoring, no fixed chart.
- **Trick stringing / modifiers (SSX)** → base move + arm styling + body roll = score modifiers layered on one action.
- **Flow / grind continuity (Jet Set Radio)** → reward unbroken motion and musicality over discrete hits.

## A4. Cards / deckbuilders / roguelikes

- **Move-cards (Slay the Spire)** → each move is a card; you build a deck; a song deals you a hand; you play cards on the beat. **Your "randomized cards" idea, fully.**
  - **#53 Deck of Sabor** — draft footwork/styling/turn cards; "combos" are card synergies (cross-body card enables the inside-turn card); a song = one run; energy = how many moves fit the phrase.
- **Drafting between songs** → pick 1 of 3 new cards after each track; build an identity (spin-heavy, footwork-heavy, smooth).
- **Roguelike run** → a setlist is a run with escalating tempo; permadeath = a dropped multiplier.
- **Balatro-style scoring** → multipliers for symmetry, on-beat streaks, and musical-accent hits — chase the big "hand."

## A5. Puzzles

- **Transition-graph constraint puzzle** → moves are nodes; legal transitions (compatible weight/foot/facing) are edges; build a valid path through a target length. (This is a real graph problem — very you.)
  - **#54 Legal Path** — given a start and end position and a beat budget, find a sequence where every transition is mechanically legal. Auto-validates with a transition matrix.
- **Simon / memory (copy the combo)** → repeat a growing sequence exactly, on time.
  - **#55 Copy the Combo** — watch a phrase, reproduce it; it grows by one move each round; timing windows tighten.
- **Falling-block placement (Tetris)** → moves fall down lanes; drop each on its correct count.
- **Match / sequence** → arrange tiles so the groove resolves.

## A6. Music creation / sandbox

- **Layered-loop sandbox (Incredibox)** → drag instrument loops onto avatars to build a groove; instant, beginner-friendly, no fail state. **Best onboarding toy you could build.**
  - **#56 Sabor Box** — drag clave / conga / bell / güiro / bass loops onto dancers; the groove assembles live; secret combos unlock animations. This *is* your Layer Builder, made playful.
- **Sequencer / DAW toy** → program a tumbao or clave on a step grid; hear it loop.
- **Generative drill maker** → model emits fresh footwork at your level (Playbook #40).

## A7. Record-yourself / ghost

- **Pose record + compare** → record a clip, overlay the skeleton, score against a reference with DTW (dynamic time warping) so timing differences align fairly.
  - **#57 Mirror Match** — record your basic, get a frame-by-frame similarity score vs. a reference dancer; heatmap shows where you drifted.
- **Ghost replay (racing games)** → dance against a translucent "ghost" of your past best run.
  - **#58 Ghost Dancer** — beat your previous self; great for tracking real practice progress.

## A8. Dodge / bullet-hell on beat

- **Rhythm-dodge (Just Shapes & Beats, NecroDancer bosses)** → dodge hazards that fire on musical accents.
  - **#59 Clave Dodge** — survive a pattern of hits that always land on the clave; learning to dodge *is* learning to hear the clave.

---

# Part B — Symmetry & transformation games (your unfair advantage)

Dance phrases are objects you can act on with the symmetry group of the body and the floor. No one builds games here, and it's exactly your ARC-AGI / program-synthesis world: **infer and apply a transformation.**

The operations:
- **Reflection (mirror):** swap left↔right / do it on the other side. (`r`, with `r² = identity`.)
- **Rotation:** turn your facing 90°/180° and execute the same phrase.
- **Translation:** repeat the phrase displaced in space (a traveling step).
- **Glide reflection:** translate **and** mirror. *Walking footprints are literally a glide reflection* — left, right, left — a perfect, true teaching hook.
- **Retrograde (time reversal):** perform the phrase backwards in time.
- **Inversion:** flip the sense — up↔down, into-center↔out, CW↔CCW.
- **Identity / neutral:** the rest position; the thing transformations return you to.
- **Composition / generators:** every transform is a product of a few generators; a phrase puzzle is a *word* in those generators.

Games:
- **#60 Apply the Symmetry** — shown a phrase + an operation card (mirror / rotate / glide / retrograde); execute the transformed phrase correctly, on beat.
- **#61 Name That Transform (Dance-ARC)** — shown phrase A → phrase B, deduce which operation (or composition) maps A to B. This is ARC for dance: pure transformation inference. Build a solver alongside it and you've got a research-flavored toy.
- **#62 Return to Identity** — given a scrambled sequence of generators, find the shortest addition that brings you back to neutral facing/weight (a group word-problem you *dance*).
- **#63 Frieze Builder** — the **7 frieze groups** are the 7 families of 1-D repeating traveling patterns; classify or generate a traveling footwork pattern by its frieze type.
- **#64 Floorcraft (Wallpaper)** — the **17 wallpaper groups** as 2-D floor patterns for group/formation choreography; place dancers so the formation has a target symmetry.
- **#65 Partner Mirror Duel** — leader does a phrase, follower must produce its exact mirror in real time (pose-checked); pure reflection-symmetry training.

Why this is worth doing: it's genuinely novel, it's deeply teachable (symmetry is *already* how good dancers think about left/right and traveling), and the inference version (#61) is a clean, fundable bridge to your synthesis research.

---

# Part C — Spanish through bachata & salsa

Music + language + rhythm is a strong combination, and Latin lyrics are vocabulary-rich and repetitive (good for learning).

- **#66 Typing of the Bachata** — *Typing of the Dead* on beat: type each lyric word as it's sung; on-beat + correct = combo. Trains spelling, vocab, and rhythm at once.
- **#67 Letra Fill** — karaoke fill-in-the-blank: a word drops out of the line, you supply it before it's sung.
- **#68 Translate the Line** — match the sung line to its meaning under time pressure; tap the right gloss before the next phrase.
- **#69 Conjugación a Tiempo** — conjugation drills clocked to the beat (a song's chorus loops one verb's forms).
- **#70 Cuenta / Numbers** — uno-dos-tres on the dance counts; doubles as count training and number vocab.
- **#71 Call-and-Response Vocab** — the singer calls, you answer with the meaning, Patapon-style.

**One caution for anything public:** shipping copyrighted lyrics needs licensing. For learning prototypes, use **your own recordings, Creative-Commons / public-domain tracks, or original songs** — which also conveniently solves the audio-sync problem from the Playbook (you control the files).

---

# Part D — Specific stack per avenue

You start in **p5.js**, port winners to a **dev blog/showcase**, and branch into Godot, pose, hardware, and mobile as specific prototypes demand. Here's the concrete kit for each.

### 1. Fast online prototyping — **p5.js**
- **p5.js** for drawing/interaction. *But don't time off p5.sound* — its scheduling isn't tight enough for rhythm. Pair p5 (visuals) with **Tone.js** (sample-accurate transport + lookahead scheduler) driving the clock. p5 draws what Tone schedules.
- **Vite** + TypeScript wrapper for module imports and fast reload (or the bare p5 web editor for the very first sketches).
- Share instantly via a static host: **GitHub Pages / Netlify / Vercel** → one URL per prototype.
- *Rule:* all timing reads from `Tone.Transport` / `AudioContext.currentTime`, never from `draw()` frames.

### 2. Showcase / dev blog (port winners here)
- **Astro** — ships zero JS by default, lets you write blog posts in Markdown/MDX and embed each prototype as an interactive "island" or iframe. Ideal for a portfolio of playable demos with writeups; gives you full control over your risograph/punk type and layout.
- Alternative: **Next.js** if you want a heavier app shell. Astro is the lighter, cleaner pick for "blog + embedded demos."
- Host on **Vercel/Netlify**; each prototype = an embed.

### 3. Native / production winners — **Godot 4**
- **Godot 4.x**, GDScript (or C# — you already know it). One codebase exports to **web, desktop, Android, iOS**.
- Rhythm timing the right way: drive a **Conductor** off the audio playback position, compensating for output latency (`AudioStreamPlayer.get_playback_position()` + `AudioServer.get_time_since_last_mix()` − `AudioServer.get_output_latency()`). This is the well-trodden Godot rhythm pattern.
- Use this when a p5 prototype proves fun but needs native latency, gamepad/pad input, or 3D.

### 4. Pose estimation
- **In browser / mobile (start here):** **MediaPipe Pose Landmarker** (WASM/WebGL) or **TensorFlow.js MoveNet** (Lightning = fast, Thunder = accurate). Track **ankles/feet first**, not the full body.
- **Python / desktop research:** MediaPipe Python, **Ultralytics YOLO-Pose**, or **MMPose** for heavier accuracy.
- **Record-and-compare:** store landmark sequences, align two takes with **DTW (dynamic time warping)** so timing offsets don't unfairly tank the score; report a per-joint similarity.
- Runs as a **PWA** so the phone camera + on-device model need no app store.

### 5. Hacked hardware
- **Phone/watch IMU streaming:** a phone web page using the **DeviceMotion API** → **WebSocket** to your laptop; or off-the-shelf streamers (Sensor Logger, HyperIMU, SensorStream) over **UDP/OSC** (parse with **osc.js**). Apple Watch / WearOS can stream too.
- **Dance pad:** **FSR or piezo** pads → **Raspberry Pi Pico (RP2040)** or **Arduino Pro Micro / Leonardo** acting as a **USB HID** gamepad (the OS sees a controller — zero driver work).
- **Wireless wearable sensor:** **ESP32** (Wi-Fi/BLE) + an **MPU-6050 / BNO055** IMU in an insole or ankle strap, streaming over WebSocket/OSC.
- *Protocols:* HID for pads (looks like a controller), OSC/WebSocket for streamed sensor data. Build the IMU→WebSocket bridge once; reuse everywhere.

### 6. Mobile
- **Web-first: PWA** — installable, uses DeviceMotion + camera (MediaPipe), no store friction. Best for the exploration phase.
- **Native cross-platform:** **Godot export** (recommended) for store presence. Use Flutter/React Native **only for surrounding UI**, never for the timing core (they lack the low-level audio clock).
- **iOS-native later (if needed):** Swift + **AVAudioEngine** for the lowest audio latency.

### 7. Audio analysis / charting (the backbone under all of it)
- **Python:** **librosa** (beat tracking, onset detection, HPSS to isolate percussion) for the basics; **madmom** for *much* better beat/downbeat tracking — important because Latin downbeats are hard; **Essentia** for richer features (BPM, danceability).
- **Stem separation:** **Demucs** (or Spleeter) to split a track into drums/bass/vocals → analyze each stem's onsets → **per-instrument lanes**. This is what makes the Conga-Hero / Layer-Builder lanes accurate.
- **Output:** bake everything to a **JSON chart** that p5, Godot, and the mobile build all consume. One analysis pipeline feeds every front end.

---

## How the avenues connect
```
librosa/madmom/Demucs  →  JSON chart  →  p5.js prototype  →  (if fun)  →  Astro showcase
                                              │                              │
                                              └─ winning mechanic ──────────→ Godot (native/mobile)
IMU bridge / pose (MediaPipe) ───────────────→ feed the same chart + scoring
```
Build the chart pipeline and the timing discipline once; every game in both documents plugs into it.