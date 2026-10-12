# Consolidated PRO-VISION competition app

This folder contains the latest main app: conversational football AI, fan/coach views, team/player preferences, replay, commentary, personal photo/video-frame trading cards, and simulated shirt/replay interaction. The parent folder retains the earlier authored-event experiment. Use this folder for the final demo and deployment.

Local run: Node 24+, `npm ci`, `npm run build`, `npm test`, `npm run validate`, then `npm run dev`. Supply ignored `.env` locally; never commit secrets.

## Azure App Service setup — prepare before deploying

Choose Linux, Node 24, Free F1 if offered, and deploy from this directory as the app root. Startup command: `npm start`. Deploy the complete folder, not the static `dist` folder. The frontend and API are served by one Node app. Set `HOST=0.0.0.0` and `PORT=8080`. App Service's `WEBSITE_HOSTNAME` supplies the HTTPS origin. For a custom domain set `PUBLIC_ORIGIN` to that exact HTTPS origin.

Set Azure resource endpoint, API key and deployment name as server-side application settings: `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_DEPLOYMENT`. Set `PROVISION_AI_DAILY_LIMIT=20` and `PROVISION_AI_MONTHLY_LIMIT=100`. The persistent single-instance quota ledger lives at `/home/provision/azure-usage.json`; do not delete it to reset usage. This deployment supports a single instance; do not scale out without a distributed quota store. Native Foundry Local mode is not used by hosted Azure inference.

F1 hosting has no hosting charge but limited shared resources. Model inference is billed separately. Confirm SKU, region availability and portal price before creating resources. Avoid inadvertently selecting a paid App Service plan. No custom domain, registry, storage account or telemetry service is required by this prepared setup. Monitor actual billing; quotas are request limits, not dollar guarantees.

Credit expiry: November 4, 2026. Arrange continued judge access beyond this date and use a judge-access plan that meets the competition rules. Public repository and working app publication are still pending; this document does not prove deployment.
