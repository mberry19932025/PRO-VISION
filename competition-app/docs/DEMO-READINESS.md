# PRO-VISION demo readiness — October 13, 2026

The canonical application is `competition-app/`, deployed from GitHub main to:
https://provision-mberry-demo-h4b4bjh7fpapcgfp.westus3-01.azurewebsites.net/

## Verified

84 automated tests pass. Checks cover replay, filters, conversation history, stale responses, fan/coach lenses, English/Spanish narratives and recaps, microphone fallbacks, memory media, card exports, evidence tours, app navigation, startup recovery, validation and persistent quotas. Build and artifact validation pass. Browser API tests use substitutes; they do not establish real phone microphone or video compatibility.

The hosted usage endpoint responds. This review made no paid model requests. Its observed allowance was 20 attempts per UTC day and 100 per UTC month, with usage counts available from /api/usage. Counts can change after this check. Hosting is the configured Free F1 plan; AI inference has separate usage costs. Request limits are not a dollar spending ceiling.

## Demo sequence

1. Open the public app. Explain that the match is original synthetic data.
2. Select a shot, open Chat, ask why it matters, then ask a follow-up.
3. Use Show me why to inspect the cited records and replay a record.
4. Open Studio and confirm the selected event. Create a card with or without a JPEG/playable MP4 frame; creation scrolls to the preview. Flip it, download PNG or SVG, then use the simulated replay control.
5. Return to Match using the card's simulated replay control.

If Azure is unavailable or a quota is reached, the app labels its rule-based fallback. Keep that label visible. Recaps are rule-based. Personal media stays in the browser page and must be downloaded to keep it.

## Owner checks before recording

Use a real phone to check microphone permission, video playback, card download and navigation. No connected browser is available for fresh visual/mobile verification here. Record only the app and keep credentials out of the recording. Prepare a public video shorter than two minutes and complete registration/submission separately.

Credits expire November 4, 2026, before judging ends. Confirm continued access and billing in Azure; changing request quotas does not extend credits. Do not describe the development allowance as unlimited judge access.

## October 13 memory section repair

Creation brings the preview into view and focuses it. Media loading has a timeout and handles aborted readers, missing MIME types and invalid dimensions. An unplayable video releases its URL and no longer traps creation behind an impossible frame-selection requirement. PNG export has a recoverable SVG fallback; names/notes retain complete emoji at truncation boundaries. Long AI replies are bounded in follow-up history to the API limit. These changes use no additional Azure model calls. Live browser and phone compatibility remain unverified because no browser connection is available.

## First-time conversation flow

Three entry points explain the journey: explore a moment, ask about a play, or make a memory card. Chat retains the pitch as context and offers explicit follow-up prompts after replies. Evidence and Keep this moment actions link the conversation to records and Studio. Prompts fill the composer and require Send; they do not create automatic Azure requests. On a selected shot, entering the conversation retains that event. The existing demo video is genuine footage recorded before these interface refinements.

## Chat-first opening

The default and brand-home destination is Chat. A large composer and suggested prompts lead the page; personalization is in an expandable section. The play preview is compact and the full Match room is available through navigation or View selected play. Choosing a shot preserves a selected shot or finds a matching one, including from the end of the replay. Startup, suggestions and navigation make no automatic model requests. The existing video predates this layout change; no new UI recording is fabricated.

## Final hosted check — October 13

Chat-first HTML and report/Director client markers are served by the public Azure app. Health reports Azure configuration. A real Match Director request performed tool selection and an evidence-checked explanation in 3.8 seconds; its cached repeat consumed no new attempt. Usage advanced from 11 to 13 monthly attempts (5 to 7 today), with limits unchanged at 20/day and 100/month. Local HTTP checks passed with a corrupt ledger, which stayed unchanged while cloud requests remained disabled. 40 archived tests also passed. These checks do not verify the actual dollar balance or real phone compatibility.
