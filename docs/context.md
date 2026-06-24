# Session Log

## Session 5 — GitHub Readiness (Current)

### What we did

- Added `browser` API polyfill to content.js and popup.js (wraps `chrome.storage.*` callbacks into Promises)
- Created `extension_chrome/` directory with:
  - Chrome-specific manifest.json (no gecko settings, PNG icons)
  - PNG icons (16, 48, 128px) converted from SVGs via sharp-cli
  - Copies of content.js, content.css, popup/ (same files as Firefox — polyfill makes them cross-browser)
- Created `build.ps1` — generates `dist/x-split-firefox.zip` and `dist/x-split-chrome.zip`
- Ran build — ZIPs work

### Files changed

- `extension/content.js` — added polyfill at top
- `extension/popup/popup.js` — added polyfill at top
- `extension_chrome/manifest.json` — created (Chrome-specific)
- `extension_chrome/icons/icon-{16,48,128}.png` — created
- `build.ps1` — created
- `docs/plan.md` — marked Chrome port tasks done
- `docs/context.md` — added this session

### What we did

- Created `.gitignore` (excludes dist/, node_modules/, .DS_Store, etc.)
- Created `LICENSE` (MIT)
- Rewrote `README.md` — clean, direct, consumer-facing, one hero screenshot slot
- Moved user screenshots to `docs/screenshots/`
- Initialized git repo, staged all files

### Next steps

1. Run `git commit -m "Initial commit"` to make the first commit
2. Create repo on GitHub, push with `git remote add origin ...` + `git push -u origin main`
3. Enable GitHub Pages on Settings → Pages → /docs → privacy page goes live
4. Test Chrome extension from `extension_chrome/`
5. Register $5 Chrome Web Store account
6. Submit to both stores

## Session 4 — Chrome Port + Build Script (Previous)

## Session 3 — PM Doc Overhaul (Previous)

### What we did

- Fixed `processInput` + `reSplit` + `updateHeader` text extraction: `textContent` → `innerText` + `/\s+/g` normalize
  - Fixes X's nested `<div>` paragraphs being concatenated without separators
  - Converts paragraph breaks to single spaces
- Fixed `renderChunks` display: `.trim()` on chunk text to hide `padNext` leading spaces
- Updated all PM docs to reflect current build:
  - `README.md`: Rewrote for auto-split + sidebar workflow
  - `docs/prd.md`: Updated user stories (US7-US10), scope, out-of-scope
  - `docs/plan.md`: Marked Phase 2 done, detailed Phase 3 (Chrome port)
  - `docs/decisions.md`: Added 7 new decisions (auto-split, sidebar, innerText, padNext, display trim, floating tab, fill mode, no background worker)
  - `docs/context.md`: Created this file

### Files changed

- `extension/content.js` — `processInput` line 93, `reSplit` line 111, `updateHeader` lines 397/411, `renderChunks` line 318
- `README.md` — full rewrite
- `docs/prd.md` — significant update
- `docs/plan.md` — significant update
- `docs/decisions.md` — appended 7 new entries
- `docs/context.md` — created

### Next steps

1. Add `browser` polyfill for Chrome (content.js + popup.js)
2. Create Chrome manifest (PNG icons, no gecko settings)
3. Convert SVGs to PNGs
4. Write store descriptions and create screenshots/GIF
5. Submit to both stores

## Session 2 — UI Polish + Spacing Fixes

### What we did

- Fixed AMO manifest ID (`x-split@x-unlimitext`)
- Added `.catch()` to all `browser.storage.local` calls
- Wired up `numStyle` and `urlCounting` settings in popup
- Added fill mode toggle in sidebar header
- Added `formatSuffix()` helper for numbering style
- Changed X button: `clearChunks` → `collapseSidebar`
- Added `title` attributes to all buttons and tab
- Dark mode defaults to system preference
- Increased button sizes in CSS
- Fixed `roughSplit` gap-skipping to consume all whitespace
- Added `padNext` for cross-chunk spacing (prepend space to chunk N+1 on gap)
- Added display-trim in `renderChunks` (show clean, copy with space)

### Files changed

- `extension/manifest.json`
- `extension/content.js`
- `extension/content.css`
- `extension/popup/popup.html`
- `extension/popup/popup.js`

## Session 1 — Initial Build

### What we did

- Project setup: AGENTS.md, docs (prd, personas, competitive analysis, decisions, indicators)
- Extension manifest (Firefox MV3)
- Split algorithm with sentence-boundary detection, URL-aware counting, short-word handling
- DOM injection via MutationObserver (detect X's compose box)
- Auto-split on input with 100ms debounce
- Sidebar UI with chunk list, copy buttons, character count
- Popup settings page
- SVG icons
- Copy-to-clipboard with flash animation
- Collapsible sidebar with floating tab
- Re-split button with pulse animation

### Files created

- `extension/manifest.json`
- `extension/content.js`
- `extension/content.css`
- `extension/popup/popup.html`
- `extension/popup/popup.js`
- `extension/icons/icon-16.svg`
- `extension/icons/icon-48.svg`
- `extension/icons/icon-128.svg`
- `docs/*.md`
- `AGENTS.md`
- `README.md`
