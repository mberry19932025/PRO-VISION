# Architecture

Browser → bounded replay state → facts and heuristic signals → narrative workflow → checked explanation → evidence cards, pitch overlay and exports.

## Data and interpretation

`src/events.js` defines an original nine-event fixture, event contract and ingestion rules. Coordinates are metres on a 105 × 68 m pitch, normalized so each team's attack increases x. The renderer reflects Marina x and y into Cedar's fixed pitch orientation. A pressure location describes the ball, not an inferred pressing-player position.

Pass accuracy is completed passes divided by recorded attempts; no attempts returns null. No possession percentage, xG, speed, difficulty model, line breaks or player intent is inferred. A progressive-pass signal is a disclosed demo heuristic: a completed pass gaining at least 15 metres. A pressure cluster is at least two same-team pressure records in an inclusive trailing 20-second window.

Statistics include accepted events up to the cursor. Narrative context is bounded to the preceding 20 seconds. Future events never enter a moment's analysis. The scoreboard starts at zero within the excerpt; it does not assert a full match score.

Duplicates and late records are explicitly rejected; malformed records throw. Input events and returned snapshots are cloned. Evidence ablation holds the replay clock fixed and recomputes the pressure rule excluding one record. It is sensitivity analysis, not a causal football simulation.

## Narratives and personalization

`src/stories.js` provides curated English/Spanish fan/analyst/broadcast templates, recap and overlay serialization. Club/player choices filter the stream and recap. The pitch, scoreboard and selected-moment explanation retain full context; the UI explains this scope. Analyst mode adds derived measurements and review recommendations. Fan mode uses accessible consequences and limitations. Broadcast mode uses a shorter line and a lower-third graphic preview with source IDs and an eight-second export cue; it is not connected to an actual broadcaster.

`src/api.js` is a bounded generation workflow, not an autonomous agent. It supplies facts, checks a structured response and retries once. The model never computes official statistics. IDs must exist in context and include the selected event. Checks reject malformed JSON, unknown IDs and several unsupported claims. Lexical checks are incomplete, especially across languages. Passing is not a truth score; human review remains necessary.

Observed facts, titles and measurements remain computed. Only interpretation and source selection are replaced by accepted AI output. Failure preserves a visibly computed response. AI latency is shown. Request cancellation and revision IDs prevent late responses from overwriting a different moment or preference state.

## Execution boundaries

`server.mjs` binds to loopback port 4180, serves a fixed asset whitelist, validates fields, bounds bodies to 4 KB and checks browser origins. Keys never reach the browser. Native inference allows one request at a time; concurrent attempts fall back as busy.

Foundry Local libraries and weights download separately and are excluded from source/deployment. The optional Azure adapter uses server-side variables and allowlisted Microsoft resource hostnames; it is not live-tested in this entry.

`dist/` contains static HTML, CSS and browser modules. Sites has no native SDK/model or AI endpoint. A judge-facing cloud server or supported installable build is still needed.

## Exports

Overlay schema 1.0 includes synthetic status, match ID, clock, duration, audience, language, preferences, observations, interpretation, IDs and provider. No broadcaster integration is claimed. Recaps use only replayed events and identify themselves as excerpt recaps. Exports contain no secrets.

## Observable processing and response reuse

The UI shows the actual ingestion window, computed patterns, explanation provider, render output and selected preferences. This is a processing record, not hidden reasoning or a claim of autonomous multi-agent orchestration. Source boundaries are checked separately from the truth of an interpretation.

The server stores up to 64 accepted AI responses in memory for ten minutes. Keys include moment, audience, language, club, player and exact question. No failed answer is cached. Returned objects are cloned, cache hits explicitly disclose reuse, and original generation time remains visible. Cache data is lost on restart. Reusing an answer does not improve its factual accuracy.

Native local inference runs in a separate child process. The parent imposes a 25-second generation deadline and kills a stalled worker; a subsequent generation can reload the model. Model startup has a separate deadline. The parent remains responsive during a blocked worker operation. This avoids relying on timers inside a process whose native model call may block its event loop.

## Smaller local generation task

Fan, broadcast and Spanish requests ask the model for plain explanation text. The backend attaches source IDs from the supplied computed context, labels evidenceOrigin as computed-input, and applies the same source, unsupported-detail and future-event checks before replacing the interpretation. English analyst requests retain their previously evaluated JSON contract. Legacy valid JSON responses remain checked as model-selected evidence. The UI distinguishes computed source assignment from model-selected citations.

This is grounded rewriting, not proof that the model independently derived a tactic or selected every cited source. A sentence passing lexical checks still needs semantic review. Broadcast text must stay within eighteen words. Personal memory notes/photos are never included in model prompts.
