# if. — The Independent Filmmaker OS

> **A place for the film.**  
> From the first spark of the screenplay to the spotlights of the premiere. A unified operating system crafted exclusively for independent cinema.

![License](https://img.shields.io/badge/license-MIT-d4af37.svg)
![Version](https://img.shields.io/badge/version-2.4-emerald.svg)
![Design](https://img.shields.io/badge/aesthetic-Film%20Noir%20Cinema-0d231a.svg)

---

## 🎬 Overview

**if.** is a luxury cinematic landing platform designed around the physical **"Memory Box"** metaphor. It transforms classic web scrolling into a director's monitor viewfinder, taking the viewer through a tactile 15-chapter scrollytelling journey that mirrors the history of cinema and the complete director workflow.

---

## ✨ Key Features

1. **Tactile Photo & Video Frame Stacking (Memory Box)**
   * Each chapter is mounted on an archival director's photo frame with deep physical floating drop-shadows.
   * Incoming frames physically slide over previous ones, simulating physical photo prints stacking on a editing desk.

2. **Section-by-Section Discrete Scroll-Stop Engine**
   * Deterministic transition lock ensures viewers stop and absorb each chapter with no accidental skipping.
   * Powered by a synchronized **Lenis Smooth Scroll + GSAP ScrollTrigger** pipeline.

3. **Prologue 35mm Silent Film Noir Interaction**
   * Scene 00 starts with a static, pristine title card.
   * The first scroll initiates the 1920s silent noir film playback behind the text with an authentic splice light leak flash.
   * The main typography remains 100% visible throughout playback.
   * A subsequent scroll cleanly advances to Scene 01.

4. **Film Playback & Replay Engine**
   * Non-looping background videos for Chapters 00 to 13 that naturally freeze on the final frame.
   * Integrated luxury dark-glass Replay buttons with gold borders (`#d4af37`) allowing one-click rewind and replay.
   * Scene 14 (Grand Finale Climax) loops continuously under pure radiant white illumination.

5. **Director's Viewfinder HUD & Telemetry**
   * Live 24 FPS Timecode generator (`HH:MM:SS:FF`).
   * 4K DCI aspect ratio overlay with 2.39:1 anamorphic crop lines.
   * 3-Epoch physical margins: **Analog 35mm Sprocket Holes** $\rightarrow$ **Hybrid DI Optical Sound Waveform** $\rightarrow$ **Pure Digital VU Meters**.

6. **Ascending Roadmap Navigation (00 at Bottom $\rightarrow$ 14 at Top)**
   * Vertical progress rail with gold gradient fill.
   * Quick Chapter Navigation dock featuring dual circular glassmorphic buttons with downward-oriented indicators for intuitive step-by-step retreat and direct jump back to Prologue.

7. **Analog Noir Cinema Soundscape**
   * Subtle Web Audio API synthesis generating a 48Hz acoustic room tone, mechanical clock ticks, and analog sub drone.
   * Interactive volume toggle with visual status tooltip.

---

## 🛠 Tech Stack

* **Styling:** Custom CSS3 with luxury glassmorphism, responsive CSS Grid/Flexbox, and Tailwind CSS.
* **Animation & Scrolling:** [GSAP 3](https://greensock.com/gsap/) with [ScrollTrigger](https://greensock.com/scrolltrigger/) and [Lenis Smooth Scroll](https://lenis.darkroom.engineering/).
* **Typography:** *Playfair Display*, *Cinzel*, *Inter*, and *JetBrains Mono*.
* **Icons:** [Lucide Icons](https://lucide.dev/).
* **Audio:** Web Audio API (OscillatorNode, BiquadFilter, GainNode, StereoPanner).
* **Test Suite:** Automated Node.js acceptance verification script (`test-video-acceptance.js`).

---

## 🚀 Local Setup & Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/vladciorniciuc-a11y/withif.app.git
   cd withif.app
   ```

2. **Serve locally:**
   You can serve the directory using any static HTTP server:
   ```bash
   # Using Python:
   python -m http.server 8080

   # Or using Node.js:
   npx serve .
   ```

3. **Open in browser:**
   Navigate to `http://localhost:8080/index.html`.

4. **Run Acceptance Checks:**
   ```bash
   node test-video-acceptance.js
   ```

---

## 📜 License

Created exclusively for independent filmmakers. All rights reserved.
