# Evaluation — prototype, not a benchmark

## Automated checks

Fourteen checks cover authored-event statistics, pressure windows, no future facts, duplicate/late/malformed data, cloning, audience differences, evidence removal at a fixed cursor, recap preferences, translations, overlay provenance, narrative references, retry/fallback, response deadlines, unsupported questions and the broadcast lens. These verify important invariants but do not establish real-world accuracy.

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

Final changes reject those wording patterns and route known unsupported speed/xG/off-ball/intent questions to a computed limitation without calling the model. Automated checks exercise these cases. No full live rerun after guard changes has been performed. Lexical guards are not complete semantic validation; the local model is not yet a strong competition narrative engine.

## Performance and operational limits

The revised-prompt run showed a much longer response delay. This is a failure to meet a live narrative latency goal. The API now limits each generation attempt to 30 seconds and returns computed fallback on timeout. Native inference may continue internally after the response deadline; the runtime stays busy until it finishes, so another request falls back rather than starting concurrent inference. There is no claim of native generation cancellation.

Graphics/statistics are computed immediately and remain independent of model latency. No production live-speed claim is justified. Spanish generation failed in this run; the curated Spanish fallback works. Generated multilingual reliability and repeatable runtime stability still need improvement.

## Remaining evidence needed

Broader authored scenarios, full-match fixtures, independent football review, real Spanish review, repeated latency measurements, task-specific unsupported-claim checks, browser UX tests and judge-accessible AI. Also test a supported cloud model only after an endpoint and deployment are available; the Azure adapter is currently unverified live.
