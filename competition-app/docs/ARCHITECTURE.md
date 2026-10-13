# Architecture

The canonical source is src/, compiled into worker/index.js with embedded HTML, CSS and client assets. scripts/dev.mjs adapts the module to Node HTTP for local development and Azure App Service. GitHub Actions builds and deploys the repository; the root start script delegates to competition-app.

Original synthetic events → replay cursor → recorded statistics and tactical rules → preceding-event evidence → local or Azure explanation → pitch/conversation → personalized memory card.

The client submits a replay index and viewing preferences, not arbitrary match facts. The server regenerates the deterministic match and bounds all evidence to that cursor. Navigation cancels stale responses. APIs validate parameters and reject cross-origin requests.

POST /api/analyze answers supported recorded questions locally or requests an Azure interpretation. POST /api/director permits one allowlisted find_key_moment function call, executes it against recorded events, then requests an evidence-linked explanation. Each attempted provider request reserves quota separately. The Director may consume two attempts. Foundry Local mode keeps the Director rule-based.

GET /api/health reports configuration, not proven model connectivity. GET /api/usage reports persistent attempt quotas. Static assets revalidate to reduce stale deployment state. Startup ledger corruption disables cloud requests while preserving recorded features; it never resets usage silently.

Successful Azure results are cached in process. One process shares a busy guard and a persistent usage ledger. This is a single-instance demo, not a distributed quota system. Daily/monthly attempt limits do not enforce a dollar spending ceiling.

Progressive passing uses completed forward movement of at least 15 coordinate points. Distances assume a 105 × 68 m pitch. No xG, speed, off-ball tracking or player intentions are inferred as facts. Evidence checks are basic, not comprehensive factual validation.

Memory-card media is processed locally, never uploaded by this app. Downloads preserve the selected card. Speech input/readout uses supported browser APIs and is optional. Automated DOM substitutes do not establish real browser or phone compatibility.
