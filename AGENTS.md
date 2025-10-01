# InboxA.ai Agents Guide

**Purpose:** This doc explains every agent in InboxA—what it does, when it runs, what it needs, and what “success” looks like. It’s written for product, ops, and sales (no code).

---

## 0) Mental model

* **Voice-first assistant** orchestrates a set of **specialized agents**.
* Each agent owns a user outcome (e.g., “unsubscribe safely”).
   * Orchestrator routes intent → agent → confirms risky actions → reports back.

---

## 1) Voice Orchestrator (Router)

**What it does**

* Listens, understands, and routes natural commands to the right agent.
* Manages confirmations, read-backs, and the “undo” window.
* Keeps short-term conversation context (“the second email,” “that PDF”).

**User moments**

* “Read today’s important emails.”
* “Reply ‘approved—thanks’ and send.”
* “Unsubscribe from CalmCo and delete the last month.”

**Inputs → Outputs**

* Input: voice/text command, current inbox context, memory.
* Output: a clear action (“Send,” “Unsubscribe,” “Bulk clean”) + spoken/written confirmation.

**Success**

* <2 turns to complete task; high STT accuracy; minimal re-prompts.

---

## 2) Search & Retrieve Agent

**What it does**

* Finds messages/threads by people, topics, attachments, and time windows.
* Understands fuzzy phrasing (“the redlines from Legal,” “Sarah’s Zoom for Thursday”).

**User moments**

* “Find the PDF Legal sent last week.”
* “Show invoices over $500 from August.”

**Success**

* Top results are correct; user doesn’t need to refine query.

---

## 3) Summarize & Extract Agent

**What it does**

* Produces TL;DRs, action items, and key facts (dates, amounts, addresses, attachments).
* Different read modes: Full, TL;DR, Action-only, Numbers & dates only.

**User moments**

* “Give me a two-sentence TL;DR.”
* “List just the action items.”
* “Read the last reply only.”

**Success**

* Short, accurate, and immediately useful summaries.

---

## 4) Compose & Send Agent (with Safe-Send)

**What it does**

* Drafts replies/new emails in your tone; reads back recipients/subject/length; sends.
* Enforces **Safe-Send** guardrails and “undo send” buffer.

**What Safe-Send checks**

* Recipient safety: externals, new addresses, large reply-alls, look-alike domains.
* Content safety: secrets/PII, payments/commitments, link mismatch.
* Attachment safety: “see attached” without a file, risky file types, big files → link.
* Timing: quiet hours → schedule or confirm; 10s undo window.

**User moments**

* “Reply-all ‘approved—wire $12,500 by Friday.’ Send.”
* “Email Sarah at Acme: ‘Running 5 late—be there 3:05.’”

**Success**

* Error-free sending; catches mistakes before they happen; quick confirmations.

---

## 5) Unsubscribe Agent (Safety-First)

**What it does**

* Detects legitimate unsubscribe paths; executes the safest route.
* If safe path missing or suspicious, blocks/marks spam and sets filters.

**User moments**

* “Unsubscribe from Coursera and archive the last month.”
* “Unsubscribe from anything I haven’t opened in 90 days.”

**Success**

* User stops receiving unwanted mail; no risky link clicks; filters applied.

---

## 6) Bulk Cleanup Agent (Preview → Confirm)

**What it does**

* Runs large actions with a preview count first: archive, delete, spam, label, keep latest N.
* Defaults to **Archive**; uses **Trash** only when explicitly asked.

**User moments**

* “Delete promos older than 30 days—how many is that?” → “324 match. Proceed?”
* “Archive newsletters; keep the latest 2.”

**Success**

* Big reductions with zero surprises; reversible where possible.

---

## 7) Follow-Up & Reminder Agent

**What it does**

* Detects asks like “Can you by Friday?”; creates reminders and watches threads.
* Pings you before deadlines or when a reply arrives.

**User moments**

* “If Legal doesn’t reply by 3pm tomorrow, remind me.”
* “Watch this vendor thread and notify me on reply.”

**Success**

* No dropped balls; reminders feel timely, not noisy.

---

## 8) Digest Agent (Daily/Weekly Briefs)

**What it does**

* Delivers a concise morning brief: urgent items, deadlines, key threads, quick actions.
* Weekly cleanups: “Here are noisy senders; unsubscribe/auto-archive?”

**User moments**

* “What changed overnight? Keep it to 30 seconds.”
* “Send me the weekly cleanup on Fridays.”

**Success**

* Brief, actionable, habit-forming updates.

---

## 9) Categorization Agent

**What it does**

* Auto-tags newsletters, receipts, promos, intros, billing, travel, and “important.”
* Feeds the Bulk Cleanup & Digest agents with smart suggestions.

**User moments**

* “Show important + unread only.”
* “Batch archive promos older than two weeks.”

**Success**

* High tagging precision → fewer manual triage steps.

---

## 10) Memory Manager

**What it does**

* Remembers **VIPs, preferences, templates, tone**, and typical actions.
* Tracks **task memory** (todos extracted from mail) and **email memory** (noisy senders/patterns).
* Keeps **conversation context** short-term (“the second email,” “that PDF”).

**User moments**

* “Make Sam and Priya VIP.”
* “Default to TL;DR when I say ‘read my email’.”
* “Use my ‘intro thanks’ template.”

**Success**

* Interactions get faster and more personalized over time.

---

## 11) Recommendations Agent

**What it does**

* Suggests actions that save time: unsubscribes, filters, bulk cleans, VIPs, rules.
* Prioritizes by potential time saved and your past behavior.

**User moments**

* “You haven’t opened ‘Daily Deals’ in 120 days—unsubscribe?”
* “Create a filter to auto-archive shipping updates after 14 days?”

**Success**

* High acceptance rate; measurable time savings.

---

## 12) Voice UX Layer (applies across agents)

**Capabilities**

* Push-to-talk, optional always-listening, call-in number.
* **Barge-in** (interrupt while it speaks): “Stop—next email.”
* Navigation: next/previous, jump to attachments, open link, repeat a bullet.
* Dictation controls: punctuation, inline edits, tone & length tweaks.
* Accessibility: **drive mode** (shorter phrasing), slower/faster/softer.
* **Personalization by voice**: set defaults & rules without menus.
* **Universal commands**: “Confirm,” “Cancel,” “Undo,” “Shorter,” “More.”

**Success**

* Users complete multi-step tasks hands-free in one go.

---

## 13) Safety, Privacy, and Trust (cross-cutting)

**Principles**

* Least-privilege account access.
* Confirmations for destructive/bulk actions.
* Phishing-aware unsubscribe; never click shady links.
* Action log + undo windows; rate limiting to avoid mail provider flags.

**Modes**

* **Paranoid** (max prompts), **Standard** (recommended), **Fast** (minimal prompts—still blocks secrets).

---

## 14) KPIs & SLAs (what we measure)

* **Voice task completion rate** (no re-prompt)
* **Average turns to completion**
* **Time saved** (bulk ops / cleanups)
* **Reminder efficacy** (on-time tasks)
* **Unsubscribe stickiness** (no re-appearance)
* **Safe-Send catches** (mistakes prevented)
* **User-reported satisfaction** (CSAT/NPS style)

---

## 15) Typical customer “recipes”

* *Morning:* “What matters from overnight? 30 seconds.”
* *Commute triage:* “Summarize unread; archive promos; reply ‘on my way’ to Sam.”
* *Friday clean:* “Unsubscribe from anything unopened in 90 days; archive shipping updates older than 14 days.”
* *Safety net:* “Remind me if Legal doesn’t reply by 3pm; pin the thread.”

---

## 16) What’s included today vs. next

**Live now**

* Voice control end-to-end (listen → act → speak back)
* Search/retrieve; summarize/extract; categorize
* Unsubscribe (safe paths + filters)
* Bulk cleanup with preview/confirm
* Follow-ups & reminders; daily/weekly digests
* Compose & send with Safe-Send + undo

**Next up**

* Deeper rules UI & automations
* Outlook/Office 365 support
* More enterprise controls (SSO, audit exports)
* Marketplace listings (e.g., HubSpot, Slack app polish)

---

## 17) One-page takeaway for sales

InboxA is **email you talk to**. It **reads**, **finds**, **summarizes**, **sends**, **unsubscribes**, **bulk-cleans**, and **remembers**—with **voice confirmations and safety checks** so nothing embarrassing goes out. Customers reclaim hours each week and stop missing commitments.
