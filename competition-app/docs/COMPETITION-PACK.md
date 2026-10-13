# PRO-VISION AI — Competition Pack

## Project description

PRO-VISION AI is a conversational football companion that helps fans understand a match and keep the moments that matter. Ask a question, explore a recorded play on the pitch, inspect its evidence, compare players, and turn a favourite moment into a personal trading memory card or a T-shirt design concept.

The working demo uses 180 original fictional football events, not a live Premier League feed. Fan and coach perspectives, English/Spanish explanations, replay, team/player filters and time-bounded match reports make the same match accessible in different ways.

## Technology and innovation

Hosted on Azure App Service, with Microsoft Foundry/Azure OpenAI generating evidence-linked interpretations. The bounded Match Director uses a model-selected function call to choose a recorded moment, the server executes that selection within the replay boundary, and a second model request explains the supplied evidence. It is a single-model tool workflow, not a multi-agent system. Recorded facts and fallback explanations work without model calls.

The public repository is https://github.com/mberry19932025/PRO-VISION . Canonical source is competition-app/. Live app: https://provision-mberry-demo-h4b4bjh7fpapcgfp.westus3-01.azurewebsites.net/ .

## Demo and limits

Start in Chat, ask for recorded player statistics, explore a shot, generate an interpretation, inspect its event citations, then create and download a memory card in Studio. Photo/video media stays in the browser page; download the card to preserve it. The T-shirt and replay tag are concepts, not manufactured products or working physical NFC hardware.

AI responses undergo basic evidence and unsupported-claim checks; these do not guarantee every tactical interpretation is correct. No external live sports feed, video recognition, xG, tracking speed or real injury data is connected. Fictional fixtures are clearly labelled.

## Submission still required

Owner registration/eligibility, a public video under two minutes, real desktop/phone acceptance checks and confirmation that judges retain free access throughout judging. Shared development quotas are not unlimited judge access. Credits expire November 4, before the judging window ends.
