# PRO-VISION build brief

## Product

A viewer sees a completed pass on the pitch. PRO-VISION shows why it matters, the events supporting the explanation, and a different presentation for a casual fan or a data-hungry analyst. The viewer can choose a fictional club, player and language. A broadcaster can export the same insight as a timed overlay. At the end, the viewer receives a recap shaped by those preferences.

Product name: PRO-VISION, following the entrant's corrected spelling. See README for implemented capabilities and limitations; this brief describes the intended finished entry. No trademark clearance or claim of unprecedented invention is made.

## Original document inspiration

The entrant's 30-page PRO-VISION Prototype Starter Pack inspires the camera/lens identity, electric-blue visual language, multiple audience perspectives, synchronized replay, highlights and personalized viewing. Its American-football helmet specifications and future targets are not verified capabilities of this association-football entry.

| Document idea | Working competition adaptation |
| --- | --- |
| Three camera feeds, one coherent experience | Three information lenses over the same evidence: fan, analyst and broadcast |
| Player perspective | Player-focused event stream and recap; no first-person video or tracking claim |
| Replay and analysis controls | Clock-synchronized original pitch actions, scrubber, key moments and clickable sources |
| Broadcast viewing | A lower-third graphic preview and timed machine-readable overlay export |
| Coaches, teams and fans | Analyst review prompts, accessible fan stories and tailored club/player preferences |

Source document: PRO-VISION_Prototype_Starter_Pack_Competition_Edition_30_Pages.pdf, reviewed for inspiration. No document pages or third-party logos are embedded in the competition app. No wireless, camera stitching, VR, certification or hardware claim is made.

## Rules translated into build requirements

| Rules | What we will build | Acceptance evidence |
| --- | --- | --- |
| 4.1(i)(a): ingest | Deterministic fictional event stream, match metadata, sequence IDs, coordinate units and match clock | Repeatable replay; malformed, duplicate and out-of-order records handled explicitly |
| 4.1(i)(b): interpret | Counts and rates computed in code; possession changes, progressive passes and pressure windows | Exact expected values for scripted scenarios; no future information |
| 4.1(i)(c), (iii), (iv): explain | AI selects evidence through tools and writes tentative interpretations separately from observations | Real model responses, source citations, unsupported-question and failure tests |
| 4.1(i)(d): render | Original pitch animation with synchronized explanation cards and overlay JSON | Visible running application; export has clock, duration, audience and source IDs |
| 4.1(i)(e), (vi): personalize | Casual fan and analyst modes, favorite club/player, English and Spanish | Same event yields meaningfully different explanations; translation checked |
| 4.1(iii): recap | End-of-match recap grounded in recorded key moments | Facts agree with completed replay; no invented milestones |
| 4.2, 6.1: Microsoft technology/category | Real Microsoft AI integration; proposed Foundry-based deployment | Successful live calls and reproducible setup; no claim based only on an adapter |
| 4.3, 4.4: new functioning project | New isolated source; accurate pitch and demo | Documented creation date, install instructions and working release |
| 4.4, 4.8: submission access | Public GitHub repo, public video under two minutes, judge-accessible demo/test build | Test access from outside the owner's account |

Player identification, pass distance/accuracy and narrative quality are sensible additions. Video auto-eventing, ball/shot speed and pass difficulty are listed as features to consider, not a mandate to build every feature. We will not manufacture them without suitable data and a defensible model.

## AI approach

Target a small tool-using narrative agent: retrieve the current match state, fetch a bounded preceding event window, identify the relevant evidence, produce a structured story, validate references, and retry once on invalid output. Preserve the tool trace for inspection. Computation of statistics stays in deterministic code. The model interprets and communicates those facts.

Start with one agent; add specialized agents only if measured improvement justifies them. Do not label ordinary functions as AI agents. Do not claim a multi-agent category until distinct agents, coordination and failure recovery actually work.

Microsoft Foundry is the proposed cloud AI path because the local candidates tested in the previous project were slow and failed structured-response checks. This decision is provisional until a real endpoint and a suitable deployment are available. Azure is not universally mandated by these rules. No subscription, billable resource or paid inference is authorized by this document. A provider simulator must remain explicitly labeled and is not evidence of an AI-powered entry.

## Implementation sequence

1. Synthetic event contract, authored coherent scenarios, ingestion and reliable state calculations.
2. Real Microsoft AI integration, evidence tools, structured output, recovery and a small human-reviewed evaluation set.
3. Viewing interface, synchronized overlays, fan/analyst presentation and preferences.
4. Grounded recap, English/Spanish checks and machine-readable export.
5. Judge-accessible deployment/test build, public source, reproducible instructions and a 1:50 recording.

## Readiness gates

- Exact computed statistics and no access to future events.
- Successful real AI explanations of at least a progressive pass, pressure change and possession change.
- No invented goal, score, speed, player intent or off-ball position in the reviewed test set.
- Evidence links resolve; unsupported questions return an explicit limitation.
- Fan and analyst views differ in substance, not just their headings.
- Measure median and slow response times. Keep immediate numeric overlays independent of AI latency; disclose late narratives. No live-speed claims until measured.
- Browser interactions and narrow-screen layout verified; provider failure shows an honest fallback.
- Actual functioning app shown in the video; public repository and judge access verified.

## Judging strategy

Five criteria each count 20%: technological implementation, agentic design/innovation, real-world impact, user experience/presentation, category fit. Optimize for a complete, observable pipeline and useful personalization rather than a large speculative feature list. Proposed category: Best Use of Microsoft Foundry Project, conditional on meaningful working Foundry use. Grand prize remains an ambition, not a promised result.

## Deliverables and dates

Chicago local time, using the October 2026 rules:

- Register by October 20, 2:00 p.m.
- Submissions open October 6, 11:00 a.m.
- Submit by October 28, 1:59 a.m. (October 27, 11:59 p.m. Pacific); aim to finish October 26.
- Keep judge access available through November 11, 1:59 a.m. (November 10, 11:59 p.m. Pacific).
- Final materials: English pitch, public GitHub URL, public demo video URL under two minutes, test access instructions, architecture and evaluation evidence.

## Sources

User-provided official rules attachment, read October 5, 2026. The pasted text omitted the judging/prize tables, so those were checked against the published source:

https://github.com/microsoft/insidethegamehackathon/blob/main/OFFICIAL%20RULES.md

The published rules take precedence over this interpretation. Check again before submission.
