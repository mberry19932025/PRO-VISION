# PRO-VISION

**Every moment, explained.** An evidence-linked football storytelling prototype for the Microsoft × Premier League Inside the Game hackathon.

Fresh hackathon code started October 5, 2026, inspired by the original PRO-VISION prototype document's multi-perspective viewing, replay and personalized experience. The helmet remains a future concept; this working software uses synthetic association-football events. The folder retains its initial title `matchlens`; the product name is **PRO-VISION**.

## What works

- A coherent nine-event synthetic excerpt (2:00–2:38), fictional clubs/players, original pitch replay and synchronized clock.
- Computed score, shots, pass accuracy, pass distance, forward progress, recorded possession changes and pressure clusters.
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
npm run dev:ai
```

First launch downloads the model (approximately 2.2 GB for the tested GPU variant) into ignored `.provision/models`. Tested on an Apple Silicon Mac with 8 GB RAM; other platforms remain unverified. The native installer downloads Microsoft runtime libraries. Inference runs on-device without an Azure subscription or paid cloud inference.

Optional operator environment variables: `PROVISION_LOCAL_MODEL` selects a supported catalog model; `PROVISION_MODEL_CACHE` points to an existing cache. These are never accepted from HTTP requests. The tested model is `Phi-3.5-mini-instruct-generic-gpu:2`.

The pinned SDK supports the deprecated ChatClient API; a later migration should use ChatSession. The native runtime emits a duplicate Objective-C class warning on the tested Mac. It generated successfully, but the warning remains an upstream/runtime concern.

## Optional Azure adapter

Set server-side `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_DEPLOYMENT` in ignored `.env`, then run `npm run dev`. Requires an HTTPS Azure OpenAI or AI Services resource. This adapter has not been tested against a real Azure resource in this entry. Never put keys in browser assets, exports or submission materials. No Azure resources have been created.

## Hosted preview and judging

The Sites preview serves static assets and computed explanations. **It cannot run the native model.** It is not a fully AI-powered hosted entry. Judge access to live AI, public GitHub publication and a recorded public video remain pending. `npm run build` packages the static preview. The Sites source repository does not replace the required public GitHub repository.

## Evidence and next work

- [Build brief](docs/BUILD-BRIEF.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Evaluation](docs/EVALUATION.md)
- [Demo plan](docs/DEMO.md)
- [Submission readiness](docs/SUBMISSION.md)

Before submission: browser QA, broader human-reviewed AI evaluation, better latency/personalization, a full-match dataset, AI recap generation and judge-accessible AI. Do not claim a winning result, production readiness or a unique invention based on this prototype.
