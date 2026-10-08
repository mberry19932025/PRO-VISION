# Judge test build — local Microsoft AI

This is an installation route permitted by the rules' test-build option, not a claim that a static preview contains working AI. Current verification is on an 8 GB Apple Silicon Mac. Other hardware/operating systems, a clean judge installation, and organizer acceptance of the selected prize category remain unverified. Do not submit until installation and interaction are reproducible.

## Requirements

Node.js 24 (the version used during development), internet for initial dependencies/runtime/model download, and disk space for those downloads. The tested Microsoft Phi-3.5 GPU model download is approximately 2.2 GB. No Azure subscription, user API key or paid cloud inference is required for local inference. Hardware and network costs remain the user's own.

## Install and run

Download or clone the public repository, enter its directory, then run:

```sh
npm ci --ignore-scripts
npm run ai:setup
npm run preview:ai
```

After installing dependencies/runtime, Mac users can also double-click `Open PRO-VISION AI.command` in the extracted project folder.

The app prints its address after the model loads and opens the browser on macOS. Leave the Terminal window open. On other platforms open the printed URL manually; those platforms have not been tested. First launch downloads the model; subsequent launches use the ignored local cache. The installer retrieves Microsoft's native libraries. It emits a known duplicate Objective-C class warning on the tested Mac; see EVALUATION.md for limitations.

## Verify actual AI

Select the progressive pass. Ask why it may matter and watch the response arrive. The provider label must say MICROSOFT FOUNDRY LOCAL · AI for a generated answer. COMPUTED EXPLANATION means fallback, not successful generation. Basic output checks do not establish factual truth. Inspect the source IDs, compare fan/analyst modes, then ask about speed: the app should state that speed is absent from its dataset without fabricating a measurement.

The replay and calculations stay responsive independently of the model. Slow generation and rejected output return a computed explanation; do not present that fallback as AI. Local inference now runs in a separate worker. A stalled generation is killed after its parent-side deadline; a later request reloads the model. Repeated identical accepted answers may be reused from a clearly labeled in-memory cache.

## Verify personalization and memories

Try a player filter, Spanish computed lens, timed overlay export and recap. The excerpt is nine authored synthetic events, not a full match. The recap currently uses templates. Save a personal memory, download its card/interactive HTML, and simulate the clothing tap. No physical tag is scanned, and no XtremeSignPost partner connection is implemented.

## Preview only

`npm run build:offline` creates a self-contained HTML preview. This works without the server but does not run AI. It cannot substitute for the functioning test build in an AI submission.

## Before submission

Reproduce installation on another supported Mac, verify browser interactions and exports, record the real functioning software in a video under two minutes, and ensure the submitted build remains freely available through the judging period. Public source must include the final changes; a local-only commit is insufficient.
