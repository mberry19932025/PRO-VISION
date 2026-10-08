# PRO-VISION

**Every moment, explained.** An evidence-linked football storytelling prototype for the Microsoft × Premier League Inside the Game hackathon.

Fresh hackathon code started October 5, 2026, inspired by the original PRO-VISION prototype document's multi-perspective viewing, replay and personalized experience. The helmet remains a future concept; this working software uses synthetic association-football events.

## What works

- A coherent nine-event synthetic excerpt (2:00–2:38), fictional clubs/players, original pitch replay and synchronized clock.
- Computed score, shots, pass accuracy, pass distance, forward progress, recorded possession changes, pressure clusters and source-linked recovery-to-shot intervals.
- Fan/analyst/broadcast lenses, lower-third graphic preview, English/Spanish templates, club/player filters for the stream and recap.
- Clickable evidence, a pressure-record removal experiment, overlay JSON, recap and dataset downloads.
- Real Microsoft Phi-3.5-mini generation through Foundry Local in the **local Node server**, with basic checks, one repair attempt and visibly computed fallback.

This is an authored excerpt, not a full match, real footage or player tracking. Interpretations are tentative. Basic validation is not a truth guarantee. The workflow is not yet a tool-using autonomous agent or multi-agent system. Recaps currently use deterministic templates.

## Run without AI

Node 24 is the tested target. No dependency installation needed for this mode:

```sh
npm test
npm run dev
```

Open `http://localhost:4180`. Play uses actual excerpt-clock intervals; key-moment buttons jump faster.

## Run Microsoft AI locally

```sh
npm ci --ignore-scripts
npm run ai:setup
npm run preview:ai
```

First launch downloads the model (approximately 2.2 GB for the tested GPU variant) into ignored `.provision/models`. Tested on an Apple Silicon Mac with 8 GB RAM; other platforms remain unverified. The native installer downloads Microsoft runtime libraries. Inference runs on-device without an Azure subscription or paid cloud inference.

Optional operator environment variables: `PROVISION_LOCAL_MODEL` selects a supported catalog model; `PROVISION_MODEL_CACHE` points to an existing cache. These are never accepted from HTTP requests. The tested model is `Phi-3.5-mini-instruct-generic-gpu:2`.

The pinned SDK supports the deprecated ChatClient API; a later migration should use ChatSession. The native runtime emits a duplicate Objective-C class warning on the tested Mac. It generated successfully, but the warning remains an upstream/runtime concern.

## Optional Azure adapter

Set server-side `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_DEPLOYMENT` in ignored `.env`, then run `npm run dev`. Requires an HTTPS Azure OpenAI or AI Services resource. This adapter has not been tested against a real Azure resource in this entry. Never put keys in browser assets, exports or submission materials. The user created a Foundry project, but the attempted cloud model deployment was blocked by quota; cloud inference remains unverified.

## Hosted preview and judging

The Sites preview serves static assets and computed explanations. **It cannot run the native model.** It is not a fully AI-powered hosted entry. Public source is available at https://github.com/mberry19932025/PRO-VISION. Judge access to live AI and a recorded public video remain pending. `npm run build` packages the static preview. The Sites source repository does not replace the required public GitHub repository.

## Evidence and next work

- [Build brief](docs/BUILD-BRIEF.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Evaluation](docs/EVALUATION.md)
- [Demo plan](docs/DEMO.md)
- [Submission readiness](docs/SUBMISSION.md)
- [GitHub Pages and future domain plan](docs/HOSTING.md)

Before submission: browser QA, broader human-reviewed AI evaluation, better latency/personalization, a full-match dataset, AI recap generation and judge-accessible AI. Do not claim a winning result, production readiness or a unique invention based on this prototype.

### Fan memories

“My match. My memory.” captures the selected event with its evidence, optional personal note/photo and a locally saved keepsake. Download a memory card or an interactive offline HTML version. A shirt mockup demonstrates how a simulated tag tap could reopen the replay. Real XtremeSignPost data, physical tags and clothing production are not connected. See [memory feature details](docs/MEMORIES.md). All 18 automated tests pass; browser interaction and visual review remain pending.

### Preview without a server

Run `npm run build:offline`, then open `dist/PRO-VISION Preview.html` directly in a browser. It embeds the app, styles and synthetic data in one file and uses computed explanations. No Terminal server, module imports or network fetch is needed for startup. A startup banner reports success or an error. The backend and local-AI entry point remain available separately.

All 34 automated checks pass, including offline startup and replay/recap/memory interactions against the actual page IDs in a simulated DOM. This does not replace real browser visual and download testing. No browser automation connection was available for that review.

See [judge test-build instructions](docs/JUDGE-TEST-BUILD.md) for the proposed local installation route and its current limitations.

Local generation now uses audience-specific prompting: a short grounded rewrite for fan/broadcast and the separately tested analyst instructions. Latest measured outputs and failure cases are recorded in the evaluation reports.

The explanation panel now exposes the five processing stages and source-boundary checks. Accepted answers may be reused from a bounded in-memory cache with an explicit reuse label. Local inference uses an isolated worker so a stalled native call can be terminated without freezing the HTTP server.
