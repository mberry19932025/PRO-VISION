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
