> Historical prototype notes. For the current deployed app, use [the canonical application](../competition-app/README.md) and [current submission checklist](../competition-app/docs/SUBMISSION-CHECKLIST.md).

# Azure credit setup — PRO-VISION

Use GitHub for source and Azure for the model and hosted backend. No model key belongs in GitHub or chat.

1. Open https://portal.azure.com → Subscriptions → the subscription holding the trial credit. Confirm its offer/type, remaining credit and expiry.
2. Open the existing project at https://ai.azure.com. Build → Models shows deployments. Discover → Models shows candidate models. Confirm available quota before creating a model deployment.
3. Select a small Azure-sold chat model supported by the app's chat-completions adapter, with available quota. Use usage-based Standard/Global Standard settings and a small allocation. Give the deployment a recognizable name such as pro-vision-chat. Test one football prompt in Playground.
4. If quota is zero, review subscription eligibility and ask Microsoft for quota or a supported region/model. An account upgrade retains unused credit only until the original trial expiry and can permit charges beyond that credit. Do not assume an upgrade guarantees quota or is risk-free.
5. Once inference is verified, host server.mjs and the interface together on Azure. Configure AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, AZURE_OPENAI_DEPLOYMENT and PUBLIC_ORIGIN as server-side settings. Keys stay out of the Pages bundle. The container recipe uses Node 24; actual Azure deployment and container execution are not yet verified.
6. Set cost alerts and check actual usage. Alerts notify; they do not stop spending. The code's PROVISION_AI_DAILY_LIMIT is a per-process attempt limit, not a currency cap and not persistent across restarts. Begin with one backend instance and bounded scaling.
7. Verify actual generated answers from the public HTTPS app, provider failure/fallback, exports and the demo flow before submitting.

The earlier account screenshot showed credit expiry November 4, 2026. Confirm the current date in the portal. Judging continues through November 10 Pacific, so credit alone may not cover the entire access period.

Sources:
- https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/upgrade-azure-subscription
- https://learn.microsoft.com/en-us/azure/foundry/foundry-models/how-to/deploy-foundry-models
