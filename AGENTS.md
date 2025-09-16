# Repository Guidelines

Orientation for InboxA.ai contributors plus a briefing on the agents behind the voice-first experience.

## Project Structure & Module Organization
`inbox-zero/` ships the customer-facing Next.js app; `task_mAIstro/` owns agent automation. Both Turborepo workspaces share the pattern `apps/web/` (product routes), `apps/mcp-server/` and `apps/unsubscriber/` (workers), and `packages/` (loops, resend, tinybird, eslint-config, tsconfig). Tests stay beside source (`__tests__/`, `*.test.ts`); shared assets live in `apps/web/app`.

## Build, Test, and Development
From the workspace root run `pnpm install`, `pnpm dev`, `pnpm build` (triggers `prisma migrate deploy` before `next build`), `pnpm test` (add `RUN_AI_TESTS=true` for extended suites), and `pnpm lint` or `pnpm format-and-lint`.

## Style, Testing, and Reviews
TypeScript + ES modules, 2-space indent, `PascalCase` React, `camelCase` utilities, `.server.ts` for server helpers. Always run `pnpm format` and `pnpm lint`. Vitest + `@testing-library/react` drive tests; mock Prisma and external services with `vitest-mock-extended`. Commits stay short, sentence-case, imperative; PRs flag schema/env shifts and include lint + test output. Copy `apps/web/.env.example` to `.env`, add Gmail/Upstash/Prisma secrets, and prep the DB via `pnpm --filter apps/web prisma migrate dev`.

## Agent Snapshot (Product & Ops)
The voice orchestrator routes intent to outcome-focused agents, confirms risky actions, and reports back.

- **Core workflow**: Voice Orchestrator keeps context and closes tasks in <2 turns; Search & Retrieve finds threads by person, topic, attachment, or time window; Summarize & Extract returns TL;DRs, action lists, and fact pulls; Compose & Send applies Safe-Send checks on recipients, content, and attachments.
- **Inbox hygiene**: Unsubscribe executes safe flows or filters; Bulk Cleanup previews counts and defaults to archive; Categorization tags newsletters, receipts, promos, and travel; Recommendations surfaces unsubscribes, filters, VIPs, and rules ranked by time saved.
- **Keep momentum**: Follow-Up & Reminder tracks commitments and nudges before deadlines; Digest delivers daily/weekly briefs on urgent items; Memory Manager stores VIPs, tone, templates, and noisy senders for faster follow-ups.
- **Experience & trust**: Voice UX offers push-to-talk, barge-in, navigation, dictation controls, and universal commands; Safety, Privacy, Trust enforces least privilege, confirmations, phishing-aware unsubscribe, undo windows, and rate limits across Paranoid, Standard, and Fast modes.
- **Ops overlay**: KPIs cover task completion, turns-to-complete, time saved, reminder efficacy, Safe-Send catches, and CSAT/NPS. Roadmap: live today are voice control end-to-end, search, summarize, categorize, safe unsubscribe, bulk cleanup, follow-ups, digests, and Safe-Send compose; up next are richer rules UI, Outlook/O365 support, enterprise controls (SSO, audit exports), and marketplace listings (HubSpot, Slack). Sales takeaway: InboxA is email you talk to—safe, done.
