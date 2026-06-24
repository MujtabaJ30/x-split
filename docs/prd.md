# Product Requirements Document: X-Split

## Problem Statement

Free-tier X/Twitter users are limited to 280 characters per post. Posting long-form content requires manual splitting: counting characters, cutting at awkward mid-sentence points, adding thread numbering, and formatting each chunk. This takes 5-15 minutes per thread and produces ugly cut-off posts.

## Target User

Free-tier X users (no Premium/X Pro subscription) who regularly post threads of 2-10 posts. Writers, journalists, founders, marketers, and casual users who refuse to pay X for a character limit increase.

## User Stories

| ID | User Story |
|----|------------|
| US1 | As a user typing a long post, I want the text to split automatically so I don't have to click anything or count characters. |
| US2 | As a user writing a thread, I want splits to happen at sentence boundaries so my posts read naturally. |
| US3 | As a user posting a thread, I want `(1/5)` numbering added automatically so readers know this is a thread. |
| US4 | As a user before posting, I want to preview each chunk so I can verify the split makes sense. |
| US5 | As a user composing, I want to copy each chunk individually so I can paste into the next compose box. |
| US6 | As a user installing an extension, I want it to do one thing well with no config screens. |
| US7 | As a user who edits text after splitting, I want to re-split with one click so I don't have to start over. |
| US8 | As a user who writes on X at night, I want the extension to follow my system's dark mode. |
| US9 | As a user who wants predictable chunk sizes, I want an option to fill chunks to the max character limit. |
| US10 | As a user who wants the compose box uncluttered, I want the sidebar to collapse and a floating tab to reopen it. |

## Success Metrics

| Metric | Target | How Measured |
|--------|--------|-------------|
| Firefox installs (30 days) | 500 | AMO dashboard |
| Weekly active users | 40% of installs | AMO daily usage |
| Threads created per install | 3+ in first week | Analytics event (Phase 4) |
| 7-day retention | 25% | AMO usage stats |
| Store rating | 4.0+ | AMO reviews |

## Scope: v1 Features

- Firefox + Chrome extension (Manifest V3, vanilla JS)
- Auto-split on input (no button needed) when text exceeds 280 chars
- Smart split at sentence boundaries respecting 280-char limit
- URL-aware counting (t.co length = 23 chars per X spec)
- Per-chunk numbering `(1/N)` appended to each post (configurable style: parens, brackets, slash)
- Sidebar panel showing all chunks with copy buttons
- Character count displayed per chunk
- Re-split button with pulse animation when source text changes
- Collapsible sidebar with floating tab to reopen
- Fill mode toggle (opt-in, fills chunks to max chars)
- Dark mode following system preference
- Popup settings (max chars, numbering style, URL counting toggle, fill mode toggle)

## Out of Scope (v1)

- Auto-posting or API integration
- X Premium/X Pro features
- Scheduling or draft management
- Analytics dashboard for users
- Thread templates or saved drafts
- Multiple account support
- Image/video splitting
- Language detection or translation
- Keyboard shortcuts
- Read receipts or engagement tracking

## Open Questions

- How does the split button trigger on dynamic X DOM (React virtual DOM)? — Answered: MutationObserver tracks compose box mount/unmount.
- Does X's t.co count change for verified vs unverified users? — Answered: 23 for all.
- Should we strip trailing punctuation before counting? — Answered: No, keep original text intact.
- What happens if user pastes 5000 chars — freeze threshold? — Answered: Outer loop caps at 50 iterations, no freeze.
- Should Chrome manifest use `browser` polyfill or dual code paths? — Answered: Thin polyfill in content.js and popup.js.

## Future Considerations (Post-v1)

- Edge/Opera ports (same Chromium codebase)
- Thread repost detection (avoid re-splitting an already posted thread)
- Character budget display (show how many posts a thread will produce before splitting)
- Automated posting using X API for paid tier
