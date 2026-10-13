# PRO-VISION demo readiness — October 12, 2026

The canonical application is `competition-app/`, deployed from GitHub main to:
https://provision-mberry-demo-h4b4bjh7fpapcgfp.westus3-01.azurewebsites.net/

## Verified

Automated checks cover replay, filters, conversation history, stale responses, fan/coach lenses, English/Spanish narratives and recaps, microphone fallbacks, memory media, card exports, evidence tours, app navigation, startup recovery, validation and persistent quotas. Build and artifact validation pass. Browser API tests use substitutes; they do not establish real phone microphone or video compatibility.

The hosted usage endpoint responds. This review made no paid model requests. Its observed allowance was 20 attempts per UTC day and 100 per UTC month, with 6 monthly attempts consumed. Counts can change after this check. Hosting is the configured Free F1 plan; AI inference has separate usage costs. Request limits are not a dollar spending ceiling.

## Demo sequence

1. Open the public app. Explain that the match is original synthetic data.
2. Select a shot, open Chat, ask why it matters, then ask a follow-up.
3. Use Show me why to inspect the cited records and replay a record.
4. Open Studio, add a prepared JPEG or playable MP4 frame, create a card, flip it and download it.
5. Return to Match using the card's simulated replay control.

If Azure is unavailable or a quota is reached, the app labels its rule-based fallback. Keep that label visible. Recaps are rule-based. Personal media stays in the browser page and must be downloaded to keep it.

## Owner checks before recording

Use a real phone to check microphone permission, video playback, card download and navigation. No connected browser is available for fresh visual/mobile verification here. Record only the app and keep credentials out of the recording. Prepare a public video shorter than two minutes and complete registration/submission separately.

Credits expire November 4, 2026, before judging ends. Confirm continued access and billing in Azure; changing request quotas does not extend credits. Do not describe the development allowance as unlimited judge access.
