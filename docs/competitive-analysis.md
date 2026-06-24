# Competitive Analysis

## Competitors

| Criteria | Chirr App | Typefully | Hypefury | Manual Thread Writing | X-Split |
|----------|-----------|-----------|----------|----------------------|---------|
| **Friction** | Requires tab switch, copy-paste back to X | Requires tab switch, login, scheduling | Requires tab switch, login, queue management | High -- manual count, cut, number, paste | Low -- one click inside X compose box |
| **Integration** | External web app | External web app | External web app | None | In-page extension injected into X compose box |
| **Cost** | Free (limited), Pro $9/mo | Free (10 posts/mo), Pro $18/mo | Free (1 profile), Pro $19/mo | Free | Free |
| **Platform** | Web app only | Web + mobile | Web app only | Anywhere you can type | Firefox (v1), Chrome (v2) |
| **Core Function** | Manual thread composer | Thread scheduling + analytics | Thread scheduling + growth tools | Text editor + character count | Split text into 280-char chunks |
| **URL Counting** | Custom (may not match X) | Matches X API | Matches X API | User must account for t.co | Matches X's t.co spec (23 chars) |
| **Auto-Numbering** | Yes | Yes | Yes | Manual | Yes |
| **Preview** | Yes, separate tab | Yes, in-app | Yes, in-app | User reads raw text | Yes, inline in extension panel |
| **Learn to Use** | 2 minutes | 10 minutes | 15 minutes | 0 minutes | 30 seconds |
| **Setup** | Create account | Create account, connect X | Create account, connect X | None | Install extension |

## Key Insight

Every existing tool treats thread writing as a separate workflow in a separate app. The user composes in the tool, then copies to X. X-Split eliminates the tab switch entirely by injecting into X's compose box. It does less but does it with less friction.

## Market Position

X-Split owns the "zero friction" corner. It trades features for speed and presence. No signup, no pricing page, no dashboard. Install and your compose box has a Split button. That's the entire pitch.

## Risk

- X could break the extension with a DOM or API change (no SLA)
- X could introduce a free split feature (unlikely -- they want Premium revenue)
- Chirr App could build a browser extension
