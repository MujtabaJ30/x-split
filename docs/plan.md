# X-Split Roadmap

## Phase 1: Foundation (Done)

- [x] Define product requirements (prd.md)
- [x] Define user personas (user-personas.md)
- [x] Competitive analysis (competitive-analysis.md)
- [x] Architecture decisions (decisions.md)
- [x] Writing standards (general-indicators.md)
- [x] Project AGENTS.md rules

## Phase 2: Firefox v1 (Done)

**Goal:** Working extension on Firefox.

### Tasks

- [x] Extension manifest (MV3, `browser_specific_settings.gecko.id`)
- [x] Split algorithm:
  - [x] Sentence-boundary detection (. ! ? followed by space or end)
  - [x] URL-aware counting (t.co = 23 chars)
  - [x] Chunk numbering `(1/N)` with configurable style
  - [x] Short-word handling (bump to next chunk if <3/4 chars)
  - [x] Fill mode (opt-in, fills to max chars)
  - [x] Intra-paragraph space normalization (innerText + /\s+/g collapse)
  - [x] Cross-chunk spacing (padNext: leading space on chunk N+1)
- [x] Auto-split on input (MutationObserver watches compose box, splits on input event)
- [x] Sidebar panel (slide-in from right, shows all chunks)
  - [x] List with numbered chunks
  - [x] Copy button per chunk (Clipboard API + execCommand fallback)
  - [x] Character count per chunk
  - [x] Flash animation on copy
- [x] Re-split button (⟳) with pulse animation when source text changes
- [x] Collapse sidebar (X button — hides panel, keeps tab)
- [x] Floating tab to reopen collapsed sidebar
- [x] Dark mode (follows system prefers-color-scheme)
- [x] Popup settings (max chars, numbering style, URL counting, fill mode)
- [x] Icons (16, 48, 128 SVG)
- [x] Error handling (.catch on all storage calls)
- [x] UI polish (button titles, sizing, hover states)
- [ ] ~~Submit to AMO~~ (deferred to Chrome launch — submit both together)

### Milestone

v1.0 ready for store submission (Firefox + Chrome).

---

## Phase 3: Chrome Port (Current)

**Goal:** Same extension on Chrome Web Store.

### Tasks

- [x] `browser` API polyfill in content.js and popup.js
- [x] Chrome-specific manifest.json (extension_chrome/)
- [x] Convert SVG icons to PNG (16, 48, 128px)
- [x] Create build script (build.ps1 — generates dist/x-split-firefox.zip + x-split-chrome.zip)
- [ ] Test on Chrome (load unpacked, verify all features)
- [ ] Store listing assets:
  - [ ] Screenshot (1280x800 showing sidebar on x.com)
  - [ ] Small promo tile (440x280)
  - [ ] Privacy policy (required — need a URL or hosted page)
- [ ] Submit to Chrome Web Store ($5 developer fee)

### Milestone

v1.0 published on Chrome Web Store.

---

## Phase 4: Firefox AMO

**Goal:** Submit Firefox version to AMO.

### Tasks

- [ ] Final Firefox-specific review
- [ ] Source code upload (AMO requires source for review)
- [ ] Store listing (description, screenshots, category)
- [ ] Submit for review

### Milestone

v1.0 published on Firefox Add-ons.

---

## Phase 5: Analytics + Growth

**Goal:** Measure usage, find retention leaks, improve.

### Tasks

- [ ] Add privacy-first analytics:
  - Count installs, active users, total splits
  - No PII, no X data, no text content
  - Store in Firefox Telemetry or a simple pingback endpoint
- [ ] Landing page with install link and 30-second demo GIF
- [ ] Collect feedback via GitHub Issues template
- [ ] Analyze drop-off:
  - Install but never split
  - Split once then never again
  - Heavy users (10+ splits/day)

### Milestone

Data-driven decisions for next features.

---

## Phase 6: Edge + Opera

**Goal:** Minimal-effort ports to Chromium derivatives.

### Tasks

- [ ] Edge: Submit to Microsoft Partner Center (no fee, same Chrome codebase)
- [ ] Opera: Submit to Opera Add-ons (no fee, same Chrome codebase)
- [ ] Both: Same review process, same code, separate listing pages

### Milestone

Available on all four major browsers.
