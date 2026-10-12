# PRO-VISION demo readiness — October 12, 2026

## Verified

- Build and deployable ESM artifact validation pass.
- 30 automated tests pass: replay controls, duplicate submissions, stale response handling, local fallback labels, request validation, evidence checks, Spanish questions and recaps, cache reuse, persistent quotas, concurrent quota reservations, and corrupt-ledger rejection.
- All 180 fictional events were evaluated in fan/coach and English/Spanish modes: 720 local explanation/recap combinations had no missing text, undefined values or NaN values.
- Pressure counts now use exactly the cited possession context rather than unrelated prior events.
- Score and estimated pass-distance questions return recorded facts without inference. Questions about unsupported metrics return an explicit limitation without inference.
- Live fan pass, coach shot, and Spanish turnover responses were observed. Spanish turnover passed the latest evidence checks. Coach retry hit Azure HTTP 429 and correctly fell back to local with a rate-limit notice.
- Dataset endpoint exports all 180 events.
- Configured API key was absent from source and generated public assets.

## Fixes from this review

Pressure evidence alignment; direct factual responses; translated Spanish observed lead; stronger intent/goal checks in Spanish and English; understandable provider rate-limit/authentication/timeout errors; event selection accessibility state; pitch labels remain near ball coordinates; rule-based recap disclosure; ordering label for paired team statistics.

## Limits to represent honestly

AI checks are basic filters, not factual or tactical verification. A model can still produce an inaccurate interpretation. Examples that pass checks do not prove all future responses will pass. Synthetic coordinate records are not video or player tracking. Spanish selection changes narrative/recap language, not the full interface. No connected browser is available for fresh visual/mobile QA in this session.

Local request controls cover this single local server only: 10 new Azure attempts per UTC day, 100 per UTC month, one cloud request at a time, up to 1,024 completion tokens per request. Failed attempts count. Cached answers do not consume new attempts. Azure may also impose a lower provider rate limit. Quotas are not a dollar ceiling and do not cover Foundry playground usage or other resources. Hosted inference requires a durable usage guard and otherwise fails closed.

Azure home screenshot displayed $200 remaining with expiry November 4, 2026; billing updates can lag. At the end of this review, the persistent local ledger recorded 8 requests today/month. Preserve the remaining requests for recording, or show the existing cached Spanish turnover. Do not remove the ledger to bypass the limits.

## Before recording

Refresh http://localhost:4173. Use an already successful interpretation where possible. If Azure reports a rate limit, allow time before another request and keep the local fallback label visible. Record only the app; hide credentials and billing pages. Recaps are deterministic, not AI-generated. Do not claim real match/video recognition, guaranteed tactical accuracy, public hosting, or a hard Azure spending cap.

## Fan experience follow-up

35 tests now pass. Added next-shot/next-goal navigation that respects the chosen team, goals-only filtering, everyday wording for completed/incomplete passes and shot outcomes, selected-team fan recaps with the latest recorded goal, clickable evidence navigation, and free score/distance shortcuts. Highlight navigation does not wrap into earlier events and disables at the end. All new interactions use local data; no live Azure requests were made during this follow-up. The restarted local app served the new controls and preserved usage counts. Visual/mobile browser verification remains unavailable.

## Consolidated demo check

The main app on port 4173 now includes the photo/video-frame trading-card studio, front/back export, simulated replay tap and shirt color preview. Its conversation retains recent follow-up context, resets context across event/view changes, and labels each reply with its provider. 47 automated tests cover control IDs from the real HTML, replay/filter/evidence interactions, conversation, free facts, photo decoding flow, video-frame capture, card replay and downloads. Media/voice tests use controlled browser API substitutes; real playback, file compatibility and visual/mobile review are still pending because no browser connection is available. No new live AI calls were made during this check; the existing daily allowance is exhausted.
