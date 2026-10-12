# Foundry Local first live evaluation

The SDK and its native runtime are installed in this project. The on-device model successfully downloaded, loaded and generated text on the Mac. No Azure subscription or inference charges were used.

Model: `qwen2.5-0.5b-instruct-generic-gpu:4`, accessed through `foundry-local-sdk` 2.1.0. This tiny model was selected to verify runtime compatibility, not as a final competition model.

## Observed results

Four baseline live requests (fan pass explanation, coach pass explanation, possession-change explanation and an adversarial instruction to invent a goal) all fell back to rules because their generated output failed the structured-output checks. Measured server times were approximately 5.6, 10.5, 4.2 and 9.9 seconds. This is a small smoke test, not a performance or accuracy benchmark.

A direct diagnostic for selected event EV-007 produced prose falsely describing a pass to Okoro and a subsequent goal, rather than the required JSON. The selected record was a completed pass by Vale; no such goal is in its supplied preceding-event context. The format check rejected that output. Do not claim the system separately detected every factual hallucination: the output failed formatting first.

The attempted SDK JSON-schema constraint triggered a native `guidance_type and guidance_data must be provided together` error. It was removed. `output/Foundry-Local-Evaluation.json` preserves that intermediate diagnostic and is explicitly historical. The final checker accepts a single complete JSON code fence while still rejecting prose outside the JSON. This parser adjustment has unit coverage; it does not fix the observed model-quality failure.

## Decision

Do not use this tiny model as evidence of a reliable competition AI experience. The connection works, but none of the four baseline requests produced an accepted narrative. The next candidate is a stronger model, such as Microsoft Phi-4-mini, which the live catalog lists at approximately 3,809 MB for this Mac's GPU variant. Check available memory, storage, download suitability and measured inference performance before selecting it.

Next evaluation should include supported and unsupported questions, fan/coach differences, strict evidence coverage and human review of interpretation quality. Evidence-validation acceptance is not a factual-accuracy score. Preserve local fallback and reject unsafe output rather than weakening the checks to improve acceptance.

The hosted preview still runs its previous rule-based version; the new native AI integration operates only in the local Node app. Public judge access and the winning-entry story remain future work.
