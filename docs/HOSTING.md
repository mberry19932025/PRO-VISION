# Hosting plan: GitHub Pages first, custom domain later

The entrant requested GitHub Pages when the app is complete, with a domain purchase later. No Pages site or custom domain is enabled by this change.

## Prepare the static site

```sh
npm run build:pages
```

`dist/` contains the original interface, pitch replay, event engine, computed stories, preferences, evidence lab, recap/export functions and `.nojekyll`. CSS and module paths are relative so the same build works under `/PRO-VISION/` or a future domain root. No API keys, local models, server files or private Sites identity belong in this publishing bundle.

## Publish when the demo is complete

Publish the contents of `dist/` to the root of a dedicated `gh-pages` branch. In repository Settings → Pages, choose Deploy from a branch, `gh-pages`, `/ (root)`. This does not require installing a custom workflow file with the current credential, which lacks workflow permission. Creating/enabling that publishing branch is deferred until completion.

Expected project address after activation and successful deployment:

https://mberry19932025.github.io/PRO-VISION/

This is a planned address, not a currently verified live URL.

## Working AI

GitHub Pages hosts static HTML, CSS and JavaScript; it cannot run `server.mjs` or the native Foundry Local model. The static bundle currently uses computed explanations and disables AI requests when no API is available. It must not be presented as the finished AI-powered entry.

Before competition launch, provide judge-accessible working AI through a separately hosted, secured Microsoft AI backend, or another evaluated deployment approach. A separate backend would require an explicitly configured HTTPS API origin, suitable CORS/access controls and server-side secrets. Those changes and any paid-resource setup remain pending; no model key belongs in Pages source.

The local AI test build remains documented in README while hosting is unfinished. Reliability, response speed and supported judge installation still need work.

## Domain later

GitHub's default URL is sufficient for initial publication. After the entrant chooses and buys a domain, connect it in Pages settings, configure the required DNS records, verify domain ownership and enable HTTPS. Do not create a placeholder CNAME, buy a domain or alter DNS before that selection.

## Sources

- https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
- https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site

## Preferred live-AI deployment: one Azure app

Host the interface and `/api/*` on the same HTTPS origin in Azure Container Apps; use the existing Azure model adapter. Render is optional, not required. This avoids adding cross-origin browser requests and keeps credentials server-side. The provided Dockerfile packages hosted mode only; it does not run Foundry Local or install its native SDK.

Server changes are tested locally: configurable PORT/HOST, explicit HTTPS PUBLIC_ORIGIN, origin rejection, payload validation, private-file rejection and fallback behavior. AI requests have a per-process limit of 12 starts per minute and two concurrent requests. This is a prototype bound, not a distributed spending cap or authentication system. Multiple replicas multiply that limit; begin with one maximum replica. Azure inference still incurs model usage costs; hosting free allowances do not make inference free.

Before deployment: confirm subscription, model access and quota; select a supported deployment; store AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY and AZURE_OPENAI_DEPLOYMENT as server-side secrets; set PUBLIC_ORIGIN to the actual HTTPS app address; set ingress to port 4180. Use a capped replica configuration and review billing separately. Budget alerts notify; they do not stop charges. Do not create paid resources on the assumption that trial credit is available.

Cloud deployment, container execution and live Azure inference have not yet been verified. The local HTTP integration test runs without credentials. After deployment, test from another browser/account: health, actual generated story, source references, provider failure, replay and keepsake downloads. Keep judge access working through the judging deadline. Do not present a configured health response as proof of successful model generation.
