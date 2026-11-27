# CyberPro Hub

A clean, modern static website for seasoned cybersecurity practitioners.

Curated sections:
- Renowned news sources
- Threat intel feeds & newsletters
- Expert voices
- Best podcasts (Pocket Casts friendly)
- High-signal X/Twitter accounts
- Verified Bluesky and Mastodon profiles where available
- Top Reddit communities
- Security frameworks, certifications, learning, and tools
- Government advisories, vulnerability prioritization, and risk frameworks
- Threat intelligence, IOC research, and malware-analysis sandboxes
- Incident response, SOC operations, and Windows security references
- Cloud, identity, and AI security guidance
- Cybersecurity careers, workforce data, and professional communities
- Philadelphia-area cybersecurity groups, executive peer networks, and conferences
- Advanced threat actor field guide
- Weekly rotating resource picks and searchable, collapsible resource categories

## Deploy to Cloudflare Workers (Static Assets)

This GitHub repository is the source of truth: make and commit site updates here first. When you are ready to publish, deploy the repository root—including `_headers`, `.well-known/security.txt`, all HTML pages, styles, scripts, and referenced image assets—to the existing Worker static-assets deployment. Cloudflare Workers applies the custom security headers in `_headers`.

No build step is required. Keep `_headers` in the static asset root and `.well-known/security.txt` at its exact path.

## Customize

- `students-start-here.html` offers a beginner pathway, linked from the homepage's Students Start Here box and the Career Launchpad. Keep introductory links and free-access claims current.
- `reserve-shelf-image-credits.html` records third-party image attribution and licenses; update it whenever a credited Reserve Shelf image changes.
- Explore `ai-resources.html`, `security-essentials.html`, and `homelab.html` from the homepage's More field guides section. `beyond-the-screen.html` brings together the garden, Reserve Shelf, motorcycles, coffee, everyday carry, BBQ, and heritage goods guides.
- The garden's planting timeline is generated from the same month arrays as the crop cards in `garden.js`. Custom crops have text notes but no month arrays, so their timeline shows no recorded windows.
- `garden-canning.html` links to tested preservation guidance; `garden-hot-peppers.html` includes the color-printable Scoville chart. Keep food-safety and heat references current.
- Motorcycle card photo attributions are listed in the expandable photo credits on `motorcycles.html`; update the credits when replacing an image.
- Edit `index.html` to add/remove links or change copy.
- Update the homepage footer's revision date in `index.html` when publishing a new revision. This static site has no build-time version stamping.
- Review the weekly picks, social profile links, and `security.txt` expiration when publishing. Update `Expires` in `security.txt` annually.
- The site's contact email is assembled in `script.js` rather than embedded in the homepage HTML. `security.txt` points to the contact section.
- Edit `threat-actors.html` to update threat-group profiles and defensive notes.
- Adjust colors and spacing in `styles.css` (CSS variables at the top).
- Theme toggle (dark/light) is built-in and remembers preference.

Built as a static resource hub and threat guide — no trackers or backend. SPF, DKIM, and DMARC are DNS records and are not configured by this website; add them only if sending email from `danreither.win`.

## Daily Intel Board Worker

`workers/intel-feed/index.js` refreshes the Daily Intel Board from public RSS feeds and the CTI Watch and CyberNetSec publication pages. A Cloudflare Cron Trigger runs the refresh daily at 12:00 UTC and stores the latest items in the `INTEL_FEED` KV namespace. The frontend falls back to its curated source links when a publisher has no usable public feed.

Deploy the feed Worker from `workers/intel-feed` with Wrangler. Keep the KV namespace binding and the daily cron trigger configured for the `intel-feed` Worker. The static site links to that Worker through the CSP `connect-src` allowlist in `_headers`.
## Career Launchpad and community

- Career Launchpad (career-resources.html) groups resources by role exploration, safe practice, frameworks, tools, labs, curated lists, and contribution opportunities.
- Signal Boost (signal-boost.html) features community practitioners Jonathan (Jon) Taylor and Brian Stephen Demeter, with profiles based on their supplied information and public professional links.
- Personal contact details from the supplied resume are not published.
