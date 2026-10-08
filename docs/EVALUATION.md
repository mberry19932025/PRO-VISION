# Evaluation — prototype, not a benchmark

## Automated checks

Twenty-seven automated checks cover authored-event statistics, pressure windows, no future facts, duplicate/late/malformed data, cloning, audience differences, evidence removal at a fixed cursor, recap preferences, translations, overlay provenance, narrative references, retry/fallback, response deadlines, unsupported questions and the broadcast lens. These verify important invariants but do not establish real-world accuracy.

HTML/CSS/JS are packaged without external assets. Backend HTTP checks returned 200 for the page and reported the loaded Microsoft model. Browser automation is unavailable in this session, so visuals, interactions and downloads have not been independently verified in a browser.

## Four-case live baseline

`evaluation/live-phi-3_5-mini.json` records actual Microsoft Phi-3.5-mini calls through Foundry Local on an 8 GB Apple Silicon Mac. No Azure subscription or paid inference was used.

| Case | Basic checks | Server time | Human review |
| --- | --- | --- | --- |
| Fan: progressive pass | Accepted, first attempt | 11.2 s | Forward progress is supported, but “creating space” is speculative and the limitation was awkwardly used to support the claim. |
| Analyst: same pass | Accepted, first attempt | 10.3 s | Correct caution about missing defensive responses, but no useful review recommendation. Audience difference is weak. |
| Fan: won tackle | Accepted after one format repair | 26.4 s | Selected tackle is correctly cited; “attacking strategy” is too broad for these records. |
| Instruction to invent goal/future source | Accepted, first attempt | 11.4 s | Output did not invent a goal or cite the future M009 record. One test is not proof of general prompt-injection resistance. |

The accepted outputs are not scored as 100% accurate. They passed basic formatting and citation checks. Human review identified wording and personalization shortcomings. The second prompts explicitly request an analyst review recommendation, forbid invented space/strategy assertions and clarify that missing evidence cannot support a claim.

## Six-case revised-prompt evaluation

`evaluation/live-current.json` records the second live run before final guard tightening. Four of six outputs passed the then-current basic checks; tackle and Spanish requests fell back after two format failures. Times were 35.4, 13.1, 34.1, 25.1, 34.5 and 26.9 seconds. The analyst response now recommended reviewing the next recorded action.

Human review found three accepted outputs insufficiently grounded: the fan claimed distance between opponents and the goal, the adversarial response described creating space, and the speed answer suggested a significant pace without speed data. These are failures of the then-current checks, not successful explanations. Preserve the raw historical report.

Final changes reject those wording patterns and route known unsupported speed/xG/off-ball/intent questions to a computed limitation without calling the model. Automated checks exercise these cases. A focused three-case live rerun is documented below; it is not a full multilingual or adversarial benchmark. Lexical guards are not complete semantic validation; the local model is not yet a strong competition narrative engine.

## Performance and operational limits

The revised-prompt run showed a much longer response delay. This is a failure to meet a live narrative latency goal. The API now limits each generation attempt to 30 seconds and returns computed fallback on timeout. Native inference may continue internally after the response deadline; the runtime stays busy until it finishes, so another request falls back rather than starting concurrent inference. There is no claim of native generation cancellation.

Graphics/statistics are computed immediately and remain independent of model latency. No production live-speed claim is justified. Spanish generation failed in this run; the curated Spanish fallback works. Generated multilingual reliability and repeatable runtime stability still need improvement.

## Remaining evidence needed

Broader authored scenarios, full-match fixtures, independent football review, real Spanish review, repeated latency measurements, task-specific unsupported-claim checks, browser UX tests and judge-accessible AI. Also test a supported cloud model only after an endpoint and deployment are available; the Azure adapter is currently unverified live.

## Focused final-guard rerun

`evaluation/live-final-guards.json` records actual on-device Microsoft Phi calls after the guard changes. The fan pass request fell back after invalid JSON and an unsupported movement assertion (28.1 s). The analyst pass returned a generated recommendation to review the next recorded action while acknowledging missing defensive positions (13.1 s, one attempt). The unsupported speed question returned a computed data limitation in 0 ms without a model call.

Human assessment: the analyst recommendation is suitably tentative and consistent with the bounded event context. This does not establish broad reliability; the fan failure confirms the model is still unsuitable for unattended live narrative generation. Do not score the fallback as successful AI. Clean installation on a separate Mac and actual browser interaction remain pending.

## Repeated timing check

`evaluation/live-timing.json` records a second three-case check on the same cached model: fan 26.62 s total with computed fallback after two rejected outputs; analyst 12.03 s total with accepted AI and the same tentative next-action recommendation; unsupported speed 0.006 s total with computed limitation and no generation. These are individual timings, not percentile or load measurements. The repeated fan failure is an unresolved reliability problem.

Run `node scripts/measure-ai.mjs` against a running local AI backend to repeat this measurement. It overwrites the latest timing report. The server prints story-response JSON containing elapsed milliseconds, event index, mode, language, returned provider and attempt count; it does not log user question text or personal memory additions.

## Compact-prompt experiment

`evaluation/live-compact-prompt.json`: fan pass 6.18 s with an accepted AI answer; analyst pass 23.55 s with computed fallback; unsupported speed 0.005 s with no model call. Fan wording (“could be crucial”) is tentative but generic and overemphasizes importance. It is not proof of football expertise.

The final implementation uses the compact grounded rewriting task for fan/broadcast while restoring the previously tested analyst prompt. Fan rewriting starts from the computed explanation and bounded source IDs; it does not autonomously discover tactics. Retain lexical guards and human review requirements. Broadcast, Spanish, varied moments and adversarial inputs still need a broader live evaluation. All 27 automated checks pass.

## Final audience-specific comparison

`evaluation/live-audience-prompts.json` preserves the final run: fan pass 5.86 s and analyst pass 11.82 s, both accepted on the first attempt; unsupported speed 0.005 s with no generation. This compares the same selected pass/questions against previous timing cases. It is a three-case spot check, not a benchmark. Successful basic validation is not semantic proof.

## Worker isolation fix

A follow-up live cache measurement returned the fan answer in 6.72 s and repeated it in 0.006 s, but its analyst request timed out. The same-process server later logged a 495,575 ms fallback, showing that its response timer could be delayed while native inference blocked or execution was suspended. No precise cause of the stall is asserted. The original same-process deadline was not a reliable bound.

The revised server runs local inference in a child process and enforces a parent-side 25-second generation deadline. An automated test deliberately blocks the worker event loop, confirms the parent timer remains responsive, terminates the worker and checks that the next request recovers. This verifies the isolation mechanism, not all runtime conditions. Real-model behavior after this change is recorded separately when available.

## Isolated-worker live cache check

`evaluation/live-cache.json` records successful real Phi inference after worker isolation: fan first 5.746 s, identical fan repeat 0.005 s; analyst first 11.373 s, identical analyst repeat 0.005 s. First requests were misses with real inference; repeated requests were explicit cache hits without new inference. These four local requests are not a load benchmark or evidence of fresh generation in milliseconds. Broader semantic and multilingual reliability remain unverified.

## Clean dependency installation and broader cases

A fresh archive folder installed the pinned SDK and native runtime, passed all 26 tests and loaded the existing weight cache on the same Mac. `evaluation/clean-install.json` records fan pass 5.773 s (accepted AI), goal 22.642 s (fallback), Spanish pass 27.296 s (fallback), and broadcast pass 22.335 s (fallback). This is evidence of incomplete reliability, not a successful multilingual/broadcast benchmark. Failures are detailed in their traces.

A structured JSON response-format experiment is evaluated separately. Correct formatting cannot establish football correctness. Existing evidence and unsupported-claim checks remain enabled.

## Structured-format experiment

`evaluation/structured-output.json` records an attempted SDK json_schema response-format setting on the tested native runtime. All four requests returned computed fallback almost immediately because generation failed; no successful constrained output is claimed. The setting was removed. Final code retains the previously tested generation settings and existing checks. This experiment did not resolve broader narrative reliability.

## Plain-text local generation experiment

`evaluation/plain-output.json` records a simpler output task: fan pass 3.994 s and broadcast pass 2.539 s accepted, while goal 7.139 s and Spanish pass 12.946 s fell back. Source IDs for plain text are assigned by code from the supplied bounded context, not generated by the model. Existing detail/future-event checks remain applied.

Human review: the fan explains possible forward progress coherently. The broadcast wording is concise but “scoring opportunity” is more suggestive than this sparse data proves; basic acceptance is not a football correctness score. The final prompt removes timestamps and numeric observations from the rewriting input to discourage repeated numbers; clocks and measured statistics remain computed in the UI.


## Language regression and final output checks

`evaluation/plain-output-final.json` improved formatting and timings, but human review found the Spanish request answered in English. Its four basic acceptances must not be presented as four correct audience/language results. The final code adds an explicit Spanish instruction and a coarse Spanish vocabulary check before acceptance, including JSON output. This heuristic catches this regression; it does not establish language fluency or semantic correctness. A regression test covers the actual English failure and a grounded Spanish sentence.

Plain-text source references identify the computed context supplied to the model, not citations chosen by the model. Goal wording in this test only restates the scoring event; richer explanation quality remains an improvement target.

`evaluation/language-guard.json` records the corrected live run on this Mac: fan pass 3.855 s, goal 2.625 s, Spanish pass 4.679 s, broadcast pass 2.888 s, all fresh local generation. Human review confirms the Spanish answer is Spanish and describes the recorded successful pass with a tentative attacking consequence. Goal wording remains an observation, not a rich explanation. These four requests do not establish load performance, universal model compatibility, or competition readiness.


## Goal explanation quality guard

Computed goal explanations now connect the scoring event to the excerpt score and invite replay of the preceding recorded actions. Analyst wording explicitly separates sequence review from unavailable chance-quality measurements. Plain model goal output must mention a score consequence or recorded sequence; the previously observed “scored a goal” restatement is rejected and retried, then falls back transparently if necessary. This is a coarse usefulness check, not a semantic correctness proof.
