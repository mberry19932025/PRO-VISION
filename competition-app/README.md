# PRO-VISION AI

An independent association-football intelligence prototype using original synthetic data.

## Run

Requires Node 24+. Foundry Local is optional; hosted Azure inference uses the server adapter.

```sh
npm run build
npm test
npm run validate
npm run dev
```

Open http://localhost:4173. After edits, rebuild and restart the dev server.

For an immediate offline preview, open `output/PRO-VISION-AI-Demo.html` in your browser. Replay, filters, local explanations and downloads work without a server. Azure requires the server version.

## Working features

180 deterministic fictional match events; chronological replay; ball-action schematic and possession trails; score, shots, pass accuracy and pressure counts; evidence-linked explanations; fan/coach modes; team/player filters; English and Spanish local summaries; downloadable recaps and data; chat-first conversation; recorded player comparisons and match reports; bounded Match Director function calling; personal photo/video memory cards; T-shirt design concepts; optional browser speech input and readout.

**Local explanations are rule-based, not generative AI.** The Azure provider label appears only after a successful live Azure response. Recaps use deterministic English or Spanish templates. Language selection changes narratives and recaps, not the entire interface. No real match footage, video recognition, player tracking, external live feed, multi-agent orchestration or helmet integration is demonstrated.

## Azure configuration

Copy `.env.example` to `.env`, enter your Azure resource endpoint, API key and compatible chat model deployment name, then restart. The local server loads this file. Never commit keys. For Azure App Service, configure the same variables in server-side Environment variables and apply the changes.

The adapter uses Microsoft's documented `/openai/v1/chat/completions` API:
https://learn.microsoft.com/en-us/azure/foundry/openai/latest

Supported resource hosts end in `.openai.azure.com` or `.services.ai.azure.com`. Only the selected event and preceding context are sent. Errors produce an explicitly labeled local fallback. Live Azure inference was verified locally on October 12, 2026. The local server now enforces persistent request limits and caches successful interpretations; see Local Azure usage controls below. Live model calls may incur Azure charges.

## Source

- `src/core.js`: generator, calculations, rules, local narratives and recaps.
- `src/client.js`: dashboard controls and rendering.
- `src/backend.js`: Worker routes and Azure adapter.
- `src/index.html`, `src/styles.css`: responsive interface.
- `scripts/compile.mjs`: compiles embedded assets into the deployable Worker.
- `worker/index.js`: generated output; edit `src/` instead.
- `tests/core.test.mjs`: automated behavior checks.
- `docs/`: pitch, architecture, demo script and submission checklist.

## Data and interpretation

All teams, names and events are fictional and original. Seed 26 generates 180 events at 30-second intervals over 90 minutes. Replay accelerates these records. Coordinates use a 0–100 scale oriented toward the attacking goal for each possession. Distance assumes a 105 × 68 m pitch. Pressure counts are event counts, not tracking metrics. No xG or player speed is inferred. Tactical explanations are tentative interpretations, not verified player intentions.

## Status

Built October 4, 2026. The canonical source is in `competition-app/` in the public repository, deployed through GitHub Actions to [the public Azure app](https://provision-mberry-demo-h4b4bjh7fpapcgfp.westus3-01.azurewebsites.net/). Live Azure inference was verified during deployment. Registration, public demo video and competition submission remain owner actions. Fresh visual/mobile verification remains pending because no connected browser was available.

Official rules: https://github.com/microsoft/insidethegamehackathon/blob/main/OFFICIAL%20RULES.md

## Foundry Local AI (local app only)

The Foundry Local adapter is implemented using `foundry-local-sdk` 2.1.0. After installing project dependencies, prepare Microsoft's native runtime libraries with `npm run ai:setup`, then run `npm run dev:ai`. The first AI launch downloads a model into ignored `.provision/models`; application data and logs also stay under `.provision/`. No Azure key is needed. The hosted Worker cannot access this local native SDK.

`qwen2.5-0.5b` is the initial smoke-test model, not a competition-quality recommendation. Set `PROVISION_LOCAL_MODEL` to another supported model after checking your hardware and evaluating results. The current SDK's compatible chat client is deprecated for removal at the end of 2026; pinning the installed SDK version keeps this October prototype reproducible, and a later release should migrate to ChatSession.

Generated output must have a structured insight and evidence IDs. The server rejects missing selected-event citations, unknown/future evidence, numeric claims and selected unsupported metric/intent/goal phrases. The observed factual lead is assembled from the record. **These are basic checks, not complete factual or tactical verification.** An accepted interpretation can still be wrong. Rejected output is clearly labeled as a rule-based fallback, and request time is reported. Live model quality must be evaluated separately; mocked tests are not live AI evidence.

Model inference is serialized to avoid simultaneous native requests. An aborted browser request does not cancel an already running native inference call; further requests receive a local fallback while it is busy. Before expanding the app, add reliable inference cancellation or a bounded worker-process design and broader narrative evaluation.

Documentation: https://github.com/microsoft/foundry-local

## Local Azure usage controls (October 12 update)

AI requests are explicit: page load, replay, filters and event selection use local explanations. Generate AI insight or submit a question to request cloud analysis. The local server reserves each attempted cloud request before sending it, caps requests at 10 per UTC day and 100 per UTC month by default, and persists counts in ignored `.provision/azure-usage.json`. Configure `PROVISION_AI_DAILY_LIMIT` and `PROVISION_AI_MONTHLY_LIMIT` in `.env`; zero disables new cloud requests. Keep one local server process; this ledger is not a distributed quota system. Do not delete the ledger to reset usage. Attempts that fail still count conservatively.

Successful interpretations are cached in server memory (up to 100 responses); identical requests do not make another provider call. Restarting clears the response cache but preserves usage counts. One Azure request runs at a time. Each request allows at most 1,024 completion tokens, uses low reasoning effort for GPT-5 deployments, and has a 60-second timeout. Browser cancellation does not guarantee Azure cancellation. Basic narrative/evidence validation now applies to both cloud and local AI; it is not full factual verification.

These are request controls, not a guaranteed dollar ceiling. They do not include playground requests, other apps, previously incurred costs, taxes, or other subscription resources. Actual Azure billing and resource-group budget alerts still require verification in Azure Cost Management. Hosted deployments must supply a durable `PROVISION_RESERVE_AI` guard; absent that guard, cloud requests fail closed to local explanations. `/api/usage` is provided by the Node server locally and on Azure. Azure defaults to 20 daily attempts and persists the ledger under `/home/provision/`; local defaults to 10. Both default to 100 monthly attempts.

Verification: after the usage update, live inference passed basic evidence checks and a repeated request used the cache without increasing the persistent counter; automated tests cover quota persistence, concurrency, cache reuse and rejected evidence. Browser visual QA is pending because no browser connection is available in this session.

Match Director may consume two cloud attempts: one validated tool selection and one evidence-linked explanation. It shares the existing quotas and falls back to recorded rules. No cloud calls occur on startup or navigation.
