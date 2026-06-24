# X-Split - Project Rules

## Project
Browser extension for X/Twitter that splits long text into 280-char thread posts. Free tier users only.

## Stack
- Firefox Manifest V3 extension
- Vanilla JS, no frameworks
- DOM manipulation on x.com contenteditables

## Writing Standards
See `docs/general-indicators.md`. Write clean, direct, no AI slop.

## Build
No build step. Extension is raw HTML/CSS/JS. Load via about:debugging.

## Deploy
Firefox Add-ons (AMO) first. Chrome Web Store later.
