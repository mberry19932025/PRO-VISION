# PRO-VISION AI — Competition Pack

## Problem

The scoreline reports the result; raw event streams do little to explain why a moment matters. Casual fans need accessible context, coaches need evidence, and broadcasters need concise narratives.

## Pitch

PRO-VISION AI turns synthetic football events into explainable match intelligence. Fans and coaches explore the same match through different perspectives: an interactive pitch shows the ball action, computed statistics provide context, and explanations expose the underlying event IDs. Team filters and time-bounded recaps make the story personal.

## Working prototype

180 original synthetic events, replay, possession trails, score and passing statistics, tactical rules, fan/coach modes, English/Spanish local summaries, team filtering and downloadable data and recaps.

## Architecture

Ingest synthetic events → compute statistics and tactical rules → construct preceding-event evidence → explain → render the moment → personalize by audience and team.

The server-side Azure OpenAI / Microsoft Foundry narrative adapter is implemented and tested with mocked responses. It is not connected to a live Azure resource. GitHub Actions configuration is included; public GitHub publication remains outstanding. Sites hosting is not an Azure-hosting claim.

## Unique advantage

Perspective with visible evidence. Viewers inspect the actual action behind an explanation and switch audience modes. Unsupported metrics and player intentions are not substituted with invented values.

## Roadmap

Connect and evaluate Azure-generated narratives; synthetic streaming ingestion; timed broadcast overlay exports; fuller multilingual explanations; Azure deployment with budgets and rate controls. Player-perspective hardware capture remains a separate research direction.

## Honest status

Working now: event generation, replay, calculations, rule-based explanations, audience modes and exports.

Implemented but awaiting live verification: Azure narrative generation.

Not built: video recognition, external live feed, multi-agent orchestration, Azure hosting, physical helmet integration.

## Impact

The prototype aims to make match analysis accessible while keeping evidence available. User comprehension, real model latency and narrative accuracy have not been measured. Add actual Microsoft service/model names to the pitch only after verifying them.
