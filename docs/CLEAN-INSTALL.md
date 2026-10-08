# Clean archive installation check

Checked October 8, 2026, on the same 8 GB Apple Silicon Mac used for development. This is a fresh dependency installation, not an independent hardware or operating-system test.

1. Extracted PRO-VISION-test-build.zip into a new temporary folder. No development node_modules or symlink was carried into the archive.
2. Ran npm ci --ignore-scripts: three packages installed; npm reported zero known vulnerabilities for this dependency set at that time. This is not a full security audit.
3. Ran npm run ai:setup: native ONNX runtime libraries downloaded and installed successfully.
4. Ran npm test: all 26 checks passed, including HTTP behavior, offline startup and blocked-worker recovery.
5. Ran npm run build:offline: self-contained preview was rebuilt successfully.
6. Started the isolated local AI server from the clean directory and loaded Phi-3.5-mini-instruct-generic-gpu:2. Only the existing model-weight cache was shared to avoid another approximately 2.2 GB download. This does not test a first-ever model download.

The runtime emits a duplicate Objective-C class warning. Loading and inference results should be judged separately; see clean-install.json and EVALUATION.md for actual responses.

Outstanding: fresh model download, another supported computer, real browser visual/download checks, category confirmation and published demo video. The supported/tested target remains Node.js 24 on Apple Silicon macOS. No Windows/Linux compatibility claim is made.
