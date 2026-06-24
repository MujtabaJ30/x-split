# Architecture Decisions

## Firefox First

**Context:** Extensions ship on Chrome, Firefox, Edge, Opera, Safari.

**Decision:** Build v1 for Firefox only.

**Rationale:**
- AMO (Firefox Add-ons) has no listing fee and a faster review process (24-48 hours for simple extensions)
- Chrome Web Store charges a $5 one-time registration fee and reviews take 2-7 days
- Firefox's Manifest V3 is more permissive with content scripts and DOM access
- Firefox has a smaller but more privacy-conscious user base -- good fit for a utility extension

**Trade-off:** Delays Chrome reach but validates the product with a smaller, cheaper launch.

---

## No API Integration

**Context:** X offers a write API that can post threads programmatically.

**Decision:** Do not use the X API. All text processing is client-side.

**Rationale:**
- X API Basic tier ($100/month) is required for write access
- API keys must be stored and managed server-side
- Adds backend infrastructure (auth, rate limiting, error handling)
- X frequently changes API terms and deprecates endpoints
- Client-side execution with manual copy-paste has zero ongoing cost

**Trade-off:** User must manually copy and post each chunk. This is intentional (see "Manual Post").

---

## Manual Post Workflow

**Context:** Users could click a single button to auto-post the entire thread.

**Decision:** Users manually copy each chunk and paste into X's compose box.

**Rationale:**
- Auto-posting requires X API access (cost, complexity, terms)
- Auto-posting triggers rate limits (300 posts/day for Basic API)
- Manual posting gives users control to edit, reorder, or discard chunks before publishing
- No permission scope creep -- extension never needs "post on your behalf" permissions
- Avoids accidental double-posts or posting incomplete threads

**Trade-off:** More user clicks per thread. Acceptable for the zero-cost, zero-backend trade.

---

## Clean URL Counting

**Context:** X counts URLs as 23 characters (t.co wrapped) regardless of actual URL length.

**Decision:** Detect URLs in text and count them as 23 characters each.

**Rationale:**
- Matching X's counting ensures split accuracy at the boundary
- Users won't hit "clipboard has more chars than expected" when pasting
- Implementation is a simple regex + character budget adjustment

**Trade-off:** URL detection regex must handle edge cases (trailing punctuation, non-http protocols, already-shortened URLs). These are well-known and tested patterns.

---

## No Framework

**Context:** Many extensions use React, Vue, or Svelte for UI.

**Decision:** Vanilla JavaScript, no build step.

**Rationale:**
- Extension bundles must be small (Manifest V3 recommends < 4MB)
- React adds ~40KB minified for a button and a preview panel
- No build step means no Webpack, no Babel, no config files
- Direct DOM manipulation is simpler for single-purpose content scripts
- Easier to debug in Firefox's dev tools without source maps

**Trade-off:** More manual DOM code. No reactive UI. For a panel with a list of text chunks, this is not a limitation.

---

## Contenteditable DOM Injection

**Context:** X's compose box uses React with a contenteditable div (not a textarea).

**Decision:** Read/write content via the contenteditable element using `execCommand` and direct text node manipulation.

**Rationale:**
- React contenteditables reject `value` or `innerText` writes -- they restore React state immediately
- `execCommand('insertText')` triggers React's synthetic event pipeline correctly
- Reading via `innerText` on the contenteditable div gives plain text without HTML artifacts
- No need to reverse-engineer X's React state or use a framework adapter

**Trade-off:** `execCommand` is deprecated in the spec but still supported in all browsers. X itself uses it internally. If `execCommand` is removed, the extension must switch to Clipboard API + dispatchEvent.

---

## Auto-Split on Input vs Button-Triggered

**Context:** Initial design had a Split button inside X's compose box toolbar. User clicks it to trigger splitting.

**Decision:** Split automatically on `input` events. No button needed.

**Rationale:**
- Zero-friction: user types, sidebar appears. No discovery of a button.
- X's content editable toolbar is crowded (bold, italic, emoji, gif, poll, schedule). Adding another button competes for space.
- Auto-split also means the sidebar updates as the user types (fills, deletes) — always in sync.

**Trade-off:** The split runs on every keystroke. Mitigated by a 100ms debounce and a guard that only runs while `text.length > maxChars`.

---

## Sidebar Panel vs Modal

**Context:** Initial design showed chunks in a modal overlay centered on screen.

**Decision:** Slide-in sidebar panel on the right edge of the page.

**Rationale:**
- X's compose box is left-aligned. A right sidebar doesn't overlap the text input.
- Users can see chunks alongside the original text as they type — no context switch.
- Modal overlays feel blocking and disruptive. Sidebars feel adjacent and dismissible.
- Floating tab (after collapse) stays visible without blocking content.

**Trade-off:** Sidebar takes up horizontal space on the page. Mitigated by collapse + tab.

---

## innerText vs textContent for X's Nested Divs

**Context:** X's compose box uses nested `<div>` elements for paragraphs. `textContent` concatenates their text without any separator, producing `"heartbeat.i started"` — no space between paragraphs.

**Decision:** Use `innerText` which respects block element boundaries (inserts `\n` between divs), then collapse `\s+` to a single space.

**Rationale:**
- `innerText` is the only DOM API that returns rendered text with block boundary separators.
- Collapsing whitespace converts paragraph breaks to single spaces (readable, not blank lines).
- Alternative: walking child nodes and joining with space. But `innerText` also handles `<br>` within paragraphs correctly.

**Trade-off:** `innerText` is layout-dependent (slightly slower than `textContent`). For a compose box with <10k chars, the performance difference is unnoticeable.

---

## padNext: Leading Space for Cross-Chunk Spacing

**Context:** When text is split at a sentence boundary between paragraphs, the space between sentences is consumed by the split point. Chunk 1 ends with `"heartbeat."` and chunk 2 begins with `"i"` — no gap.

**Decision:** Detect trailing whitespace after each chunk's end position. When found, prepend a single space to the next chunk.

**Rationale:**
- The space between sentences is semantically important for readability.
- Adding the space to chunk 2's start (not chunk 1's end) keeps chunk 1 clean for character counting.
- The space is visible in the sidebar (via `white-space: pre-wrap`) and preserved on copy.

**Trade-off:** Chunks after the first one appear with a leading space in the sidebar. Mitigated by `.trim()` in `renderChunks` for display only — copy preserves the original.

---

## Display Trim vs Data Trim

**Context:** `padNext` adds a leading space to chunks 2+, which is visible in the sidebar as `" i started... (2/5)"`.

**Decision:** Trim chunks only in `renderChunks` (display). Keep original chunk data intact in `chunks[]` for copying.

**Rationale:**
- Sidebar should look clean — no leading whitespace visual noise.
- Clipboard should contain the exact text including the space (so the Twitter post reads naturally after pasting).
- Two representations: display (trimmed) and data (original).

**Trade-off:** Sidebar doesn't exactly match clipboard content. Acceptable because the trim only affects leading/trailing whitespace, not visible content.

---

## Floating Tab vs Reopening Sidebar from Page

**Context:** After collapsing the sidebar (clicking X), the user needs a way to reopen it. No visible toolbar element exists after collapse.

**Decision:** Add a small floating tab on the right edge of the viewport. Clicking it reopens the sidebar.

**Rationale:**
- Always visible regardless of scroll position (fixed positioning).
- Non-intrusive: 32px wide with low opacity until hover.
- No need for a toolbar button on X's already-crowded interface.

**Trade-off:** The floating tab is an additional injected element on the page. Minimal footprint (32x48px).

---

## Fill Mode: Opt-in Toggle

**Context:** Split algorithm naturally breaks at sentence boundaries to produce clean reads. Some users want maximum character utilization per chunk, even at the cost of mid-sentence cuts.

**Decision:** Optional fill mode that skips sentence-boundary detection and fills each chunk up to the character limit.

**Rationale:**
- Most users benefit from clean sentence breaks (default off).
- Power users who want to minimize chunk count can opt in.
- Simple toggle in popup settings and sidebar header button.

**Trade-off:** Two split behaviors means more code paths to test. The toggle is a single boolean with clear effect.

---

## No Background Service Worker

**Context:** Manifest V3 normally uses a background service worker for state management.

**Decision:** Run entirely as a content script. No background worker.

**Rationale:**
- All state (chunks, compose box reference, timer) is page-dependent. Storing it in a service worker that outlives the page is unnecessary.
- Service workers terminate after ~30s idle in MV3, losing state. Content scripts live as long as the page.
- Communication between content script and service worker adds latency and complexity.
- No cross-tab state needed — each tab has its own compose box.

**Trade-off:** Settings can't be shared between tabs without storage reads. Popup and content script communicate via `storage.onChanged`.
