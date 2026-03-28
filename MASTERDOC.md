# Momentum — Master Product Document
**Version:** 1.0
**Date:** March 2026
**Use:** LLM consultation, advisor conversations, fundraising prep, strategic planning

---

## How To Use This Document

This document is the single source of truth for Momentum. Use it as context when consulting LLMs or advisors. It covers: what the product is, why it exists, what the market looks like, who the competition is, what is built today, and where it is going.

Start any LLM session with: *"I'm building a product called Momentum. Here is the full product context: [paste this doc]. My question is: [your question]."*

---

## Part 1: The One-Line Summary

**Momentum is an AI app builder that generates a visual map of your app's flows at the same time it builds the app — so every future edit is targeted to one specific part, and nothing else breaks.**

The core bet: the hard problem in AI-built software is not the first version. It is controlled iteration. Momentum is built around that.

---

## Part 2: The Problem

### What everyone else does

Every major AI builder today — Lovable, Bolt, Replit, Base44 — works the same way at its core:

1. User types a description
2. AI generates an app (code, HTML, or a rendered UI)
3. User sees the result
4. User wants to change something specific
5. User types another prompt
6. AI regenerates — often touching things the user did not ask about

This is the fundamental UX loop of every current AI builder. And it breaks down at step 5.

### Why it breaks

The AI has no visibility into the structure of what it built. It sees a codebase or a rendered output as an undifferentiated whole. When you say "change the onboarding step," the AI does not know where onboarding starts and ends. It guesses. Sometimes it gets it right. Often it does not.

The documented failure mode: projects with 15-20+ components experience severe context loss — the AI forgets established patterns, creates duplicate code, and loses architectural consistency. Changes break unrelated features. Users lose confidence. They stop touching the app.

### The quote that captures it

> *"As your app grows, the AI can lose track of the full codebase, with changes sometimes breaking unrelated features."*

This is written about Bolt.new but applies equally to Lovable, Replit, and every other prompt-based builder. It is not a bug. It is a structural limitation of the current generation of tools.

### Why this matters more over time

The problem compounds. The bigger the app, the worse it gets. The longer you've been building with a tool, the more likely a re-prompt breaks something you built three sessions ago.

This means every existing AI builder has a natural ceiling: they work great for MVPs, and become increasingly unreliable as the product grows. The user base eventually churns or stays stuck at prototype stage.

---

## Part 3: The Solution

### The core insight

Every part of an app needs an address.

If you want to change only the login screen, the system needs to know what "the login screen" is — where it starts, what state it touches, what comes before and after it, and what other parts of the app would be affected by changing it.

Momentum solves this by making the app's structure explicit and visual from the first prompt.

### What Momentum does differently

When you describe your app to Momentum, two things are generated simultaneously:

1. A **runnable app** — interactive, navigable, real
2. A **visual Journey Map** — a graph showing every user flow, every screen, every branch

The map is not documentation. It is the operating interface for everything that happens next.

Every screen, step, AI action, data operation, and branch in your app gets a node on the map. Every node has an address. Every edit targets one node.

### The edit model

Instead of: *"Re-prompt the whole app to change one thing"*

Momentum does: *"Click the specific node. Describe the change. Only that node updates."*

This is structurally different from every other tool. It is not faster generation. It is a different model of how you interact with AI-built software after the first version.

### The full loop (vision)

```
Describe app
  → App is built + map appears simultaneously
  → Click any node to inspect or edit it
  → Edit one moment → only that moment changes
  → Launch the app
  → Watch real user behavior
  → See which nodes have the most drop-off (on the map)
  → Click the problem node → fix it
  → Repeat
```

Everything happens inside one interface. No context switching. No external analytics tool. No separate deployment pipeline. The map is the place where the app is built, run, and understood.

---

## Part 4: Market Context

### The market is exploding

The vibe coding / AI builder market reached **$4.7 billion in 2025** and is projected to grow to **$12.3 billion by 2027**. The broader no-code/low-code market hit **$30.1 billion in 2024** and is projected to reach **$101.7 billion by 2030** (32.2% CAGR).

Key signal: **21% of Y Combinator's Winter 2025 batch had codebases that were 91%+ AI-generated.** More than 30% of early-stage startups globally reported using vibe coding to build MVPs in under a week.

This is not a niche. It is the new normal for early-stage product development.

### The players and their numbers

| Company | ARR / Revenue | Valuation | Raise | Notes |
|---|---|---|---|---|
| **Lovable** | $200M ARR (Nov 2025) | $6.6B | $330M Series B | $0 → $100M ARR in 8 months — fastest in software history |
| **Replit** | $265M ARR (2025) | $9B | $400M Series D | 85% of Fortune 500 companies using it |
| **Base44** | $50M ARR (run-rate) | Acquired | $80M acquisition by Wix | Solo founder, 6 months old, 2M users |
| **Bolt.new** | Not public | Not public | StackBlitz-backed | Strong developer user base |
| **v0 (Vercel)** | Embedded in Vercel | $3.25B (Vercel) | Vercel-funded | UI component generation; no full app runtime |
| **Bubble** | ~$100M ARR | Not public | Bootstrapped → raised | Legacy no-code; visual but not AI-native |

### What these numbers mean for Momentum

This market has already proven the demand is real. Lovable went from zero to $100M ARR in 8 months. Base44 was acquired for $80M after 6 months. Replit went from $16M to $265M ARR in a single year.

**The problem is not whether people want to build apps with AI. They do. The problem is that the current tools break down as the product grows.** That is Momentum's wedge.

### Who is building on these tools

The primary user is not a developer. It is:

- **Non-technical founders** building MVPs and early-stage products
- **Product managers and designers** who want something real to test, not a Figma prototype
- **Solo builders and indie hackers** who think in product flows, not code
- **Small agency teams** building client projects quickly

44.4% of vibe coding platforms' stated value is "enabling non-technical founders to build products." This is the user Momentum is designed for.

---

## Part 5: Competitive Positioning

### The landscape

| | Lovable | Bolt.new | Base44 | v0 | Momentum |
|---|---|---|---|---|---|
| **Generates full app** | ✓ | ✓ | ✓ | Partial | ✓ |
| **Visual flow map** | ✗ | ✗ | ✗ | ✗ | ✓ |
| **Targeted per-screen editing** | ✗ | ✗ | ✗ | ✗ | ✓ |
| **Shareable app URL** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Usage analytics on the map** | ✗ | ✗ | ✗ | ✗ | Vision |
| **Mobile + web** | Web only | Web only | Web only | Web only | Both |

### How each competitor fails at the core problem

**Lovable** — Beautiful output, fastest to first version. But every edit is a full-context re-generation. At scale, it degrades. Context is lost across sessions. Nothing is addressable.

**Bolt.new** — Code-first, developer-friendly. Gives you the actual codebase. But the codebase is the control layer — which means non-technical founders hit a wall quickly, and re-prompting a codebase has all the same structural risks.

**Base44** — Best out-of-the-box for non-developers. Auth, backend, and database included. But same re-prompting model. No structural address system. Change one thing, risk something else.

**v0** — Exceptional UI generation. But it generates components, not apps. You still need to connect the logic, build the routing, and deploy a backend separately. It is a design tool, not a builder.

**Bubble** — The legacy leader. Visual and structured, but it predates AI generation and feels like it. Steep learning curve. Not prompt-native.

### What Momentum does that none of them do

**The map.** Every other tool gives you an output. Momentum gives you an output and a structured, visual, addressable representation of the app's flows — generated at the same time, always in sync.

The map is not a visualization of the code. It is the contract between generation, editing, and (eventually) runtime behavior. It is what makes targeted editing possible. It is what will eventually make analytics graph-native.

No current competitor has this. None of them are building toward it. Their architecture does not support it — they would have to be redesigned from scratch.

---

## Part 6: The Product Today

### What exists as of March 2026

**Prompt → Journey Map generation**
- User describes an app in plain language
- Claude (Sonnet 4.6 with extended thinking) generates a structured AppMap
- AppMap contains: journeys, moments, edges, state schema, screen specs
- Streaming generation with live progress feedback
- Mobile or web platform selection
- Upload existing codebase (.zip) → analyzed and mapped

**Visual Canvas**
- React Flow canvas renders all moments as nodes
- Color-coded by journey
- Branch nodes (conditional paths) expand on click
- Drag-and-drop node repositioning
- Bidirectional sync between canvas nodes and running app

**Running App Preview (inline)**
- After generation, a real working HTML app is built by Claude
- Renders in an iframe alongside the canvas (left = map, right = app)
- Clicking a canvas node navigates the app to that screen
- Navigating the app highlights the active node on the canvas
- Mobile: phone frame shell. Web: browser frame shell.

**Moment Editing**
- Click any node → edit panel opens
- Type a change in plain English → only that moment updates
- Edit flags downstream moments that may be affected
- Changes reflected immediately in the running app

**App Sharing**
- "Build & Share" generates a shareable URL (Vercel Blob)
- Anyone with the link can use the app — no login required

**Project Persistence**
- Projects auto-save to localStorage
- Project browser for returning users
- Supabase session storage for runtime state

**Production Logging**
- All warnings and errors from live sessions logged to Supabase
- Admin log viewer at `/admin/logs` with filter, time-ago, and expandable data
- Auto-refreshes every 15 seconds

**Platform Support**
- Mobile-first: phone frame, mobile UX patterns
- Web: browser chrome, desktop layouts, data-dense components

### Tech stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Canvas**: @xyflow/react (React Flow v12)
- **State**: Zustand (persisted to localStorage)
- **UI**: shadcn/ui + Tailwind CSS v4
- **AI**: Anthropic SDK (claude-sonnet-4-6 with extended thinking for generation)
- **Persistence**: Supabase (sessions, logs)
- **Storage**: Vercel Blob (shareable app HTML)
- **Deployment**: Vercel

### Key architectural concept: the AppMap

The AppMap is the central data structure. It contains:

```
AppMap {
  appName, appDescription, appPlatform
  stateSchema[]        — all stateful fields the app tracks
  initialState{}       — default values
  journeys[]           — named user flows
  moments[]            — individual steps (ui/ai/data/auth)
  edges[]              — directed connections between moments
}

Moment {
  id, label, type, journeyId
  description, preview
  position { x, y }   — location on canvas
  screenSpec           — structured screen definition (components + actions)
  branchOf             — optional: this node is a branch variant of another
  promptTemplate       — for AI moments: the Claude prompt that runs here
  componentCode        — generated app code for this screen
}
```

The AppMap is not just a canvas artifact. It is the contract between generation, editing, runtime, and (eventually) intelligence. Every layer reads from and writes to the same structure.

---

## Part 7: The Vision

### The full platform: three layers

**Layer 1 — The Canvas (built)**
The authoring surface. The visual map where journeys are built and edited. The Canvas is not documentation — it is the operating interface for the app.

**Layer 2 — The Runtime (in progress)**
The execution engine that makes the map real. The Runtime takes the Journey Map and runs it as a live, interactive application. In the current version, it is a stateful prototype runtime. In the long-term version, it is a production-grade application runtime with real auth, data, and backend integrations.

**Layer 3 — The Intelligence Layer (vision)**
The feedback loop that connects real user behavior back to the map. Every user interaction in the running app maps to a specific moment and edge. Drop-off, friction, and rage-clicks surface as visual signals on the Canvas — on the specific node that needs attention. The user sees the problem, clicks the node, fixes it, and commits.

### Why the Intelligence Layer is the real moat

Every analytics tool today — Mixpanel, Amplitude, PostHog — shows you aggregate events on dashboards. They tell you a metric went down. They do not tell you which specific part of the product to fix.

Momentum's Intelligence Layer would answer a different question: *not "what happened?" but "which node do I fix first?"*

That is a category-defining capability. It closes the loop between product observation and product action inside a single interface.

### Runtime maturity model

| Version | Goal | Status |
|---|---|---|
| V1 | Make the map executable as a stateful prototype | Current |
| V2 | Shareable, stable prototype links with real state persistence | Next |
| V3 | Production-grade runtime with auth, data, and deployment | 12-18 months |
| V4 | Intelligence-native: behavior surfaces on the map itself | 24+ months |

---

## Part 8: Business Model (Thinking)

### How others price

- **Lovable**: $25/mo (starter), $100/mo (pro), enterprise custom
- **Bolt.new**: Token-based + subscription (~$20/mo)
- **Replit**: $25/mo (core), $40/mo (pro), enterprise
- **Base44**: $29/mo to enterprise (pre-acquisition)

### Where Momentum fits

The natural pricing model mirrors the value layers:

**Free tier** — generate up to 3 apps, see the map, try the editor
**Builder ($29/mo)** — unlimited apps, shareable URLs, project history
**Team ($99/mo)** — multi-user, shared projects, custom domains
**Enterprise (custom)** — SSO, deployment pipelines, analytics layer, SLA

The Intelligence Layer (V4) is likely the enterprise upsell: "understand your users through your map, not a separate analytics dashboard."

### Potential acquirers / strategic fits

| Company | Why they'd want this |
|---|---|
| Figma | Figma is moving toward executability. A graph-native app runtime is exactly what they're missing. |
| Notion | Notion wants to become a product development surface. The map model fits their "connected workspace" thesis. |
| Vercel | They have v0 for UI. They need the journey layer and the runtime to complete a full app builder. |
| Atlassian | They own the product development workflow (Jira, Confluence). A builder that maps flows is a natural fit. |
| Salesforce | They want to own the full build-deploy-observe loop for business apps. |

---

## Part 9: Open Strategic Questions

These are the real questions worth discussing with advisors and LLMs:

**1. What is the right wedge user?**
Non-technical founders are the most obvious user, but they also have the shortest retention if the app doesn't feel polished. Product managers and technical designers may be more reliable early adopters — they understand flow-based thinking naturally.

**2. How do we talk about the map without sounding like a workflow tool?**
The map is the differentiator, but "visual flow map" sounds like a process documentation tool (Miro, Lucidchart). The language needs to communicate that the map is alive — it runs the app, it reflects user behavior, it is the control surface.

**3. What is the right scope for V1 targeting?**
The full vision is large. The narrow wedge that could win fast: **non-technical founders building internal tools and lightweight SaaS products**. Internal tools are a proven no-code/low-code use case (Retool, Glide) and the map model is especially compelling when multiple people need to understand and change the app.

**4. Does the intelligence layer require scale, or can it be useful at small user counts?**
A/B experiments on individual moments could be valuable with as few as 100-200 sessions. "Which onboarding variant has better completion?" mapped to two nodes on the canvas could be a compelling V2 feature long before you need Mixpanel-scale data.

**5. How does Momentum stay defensible as Lovable adds structure?**
Lovable is at $200M ARR and growing fast. They will eventually add some form of structural editing. The moat for Momentum is: (a) the map is generative — it appears automatically, not as a secondary feature; (b) the Intelligence Layer makes the map richer over time; (c) the edit model is architecturally different, not a UI feature on top of the same codebase approach.

**6. Interpreter vs. codegen — which direction?**
Current: interpreter (screenSpec → MobileRuntime). Longer term: codegen (AppMap → real React/TypeScript files). The tradeoff is editability vs. ownership. The interpreter is better for targeted editing; codegen is better for developer handoff and deployment. Recommended path: interpreter through V2, then add codegen export as a parallel track.

**7. What does "the build" feel like vs. Lovable?**
This is a live product concern. Lovable's generation produces beautiful, polished UI. Momentum's generated app quality needs to match or exceed that standard — otherwise the map advantage is undermined by output quality. The current HTML generation via build-app is functional but not design-leading.

---

## Part 10: Talking Points

### For LLM consultation

> *"Momentum is a graph-native AI app builder. The core insight is that AI-built software needs structural addresses so edits can be targeted and safe. The first prompt generates both a runnable app and a visual journey map. Every subsequent edit targets a specific node on that map. The long-term vision includes a third layer: an intelligence system that maps real user behavior back to the specific nodes that need attention."*

### For investor conversations

> *"The vibe coding market is at $4.7B and growing 32% annually. The leading tools — Lovable at $200M ARR, Replit at $265M ARR — have proven the demand. But they all share the same structural flaw: re-prompting a complex app breaks things. Momentum's thesis is that the next generation of AI builders will win on controlled iteration, not faster first generation. The map is the mechanism."*

### For user conversations

> *"You know how when you use Lovable or Bolt and you ask it to change one thing and something else breaks? That happens because the AI has no idea what 'one thing' means — everything is one big blob to it. Momentum fixes that by giving every screen and flow a specific address on a map. You click the thing you want to change, change just that, and everything else stays exactly as it was."*

### The single most important sentence

> *"Other AI builders generate software. Momentum makes it editable."*

---

## Part 11: What To Ask An Advisor

When sharing this doc with a technical advisor, product advisor, or investor, the most productive questions are:

1. **On the map model**: Does the journey/moment graph feel like the right abstraction for non-technical users, or is it too developer-brained?

2. **On competitive timing**: Lovable, Replit, and Bolt all have massive distribution advantages. What is the fastest path to a wedge that is defensible against them adding a "map view" feature?

3. **On the runtime**: Should Momentum stay interpreter-first and build depth there, or should it pivot to codegen output (real React/TS) to feel more "real" to developers?

4. **On go-to-market**: Internal tools vs. consumer SaaS vs. AI-native apps — which user segment has the highest tolerance for switching from an existing tool, and the most natural use for a map-based edit model?

5. **On the intelligence layer**: Is there a way to make node-level analytics valuable with small user counts (100-500 sessions), so it becomes a selling point in V2 rather than a V4 feature?

6. **On fundraising readiness**: Given Lovable's $6.6B valuation and Replit's $9B valuation, what does Momentum need to demonstrate to be fundable at a meaningful valuation — and how long does that take from current state?

---

## Appendix A: Key Files In The Codebase

```
app/app/page.tsx              — Main workspace (canvas + app preview)
app/app/launch/page.tsx       — Full-screen launch view
app/api/generate/route.ts     — Description → AppMap (SSE streaming)
app/api/build-app/route.ts    — AppMap → real HTML app (Claude)
app/api/edit-moment/route.ts  — Natural language edit → moment patch
app/api/run-moment/route.ts   — AI moment execution (promptTemplate → response)
components/Canvas.tsx         — React Flow canvas
components/MomentNode.tsx     — Canvas node card
components/MomentPanel.tsx    — Right panel (inspect + edit a moment)
components/AppPreview.tsx     — Inline iframe app preview (phone/browser shell)
components/runtime/MobileRuntime.tsx  — Interpreter-based runtime (mobile + web)
lib/types.ts                  — AppMap, Moment, Journey, FlowEdge types
lib/store.ts                  — Zustand store
lib/runtime.ts                — normalizeRuntimeAppMap, autoDeriveBranchOf
```

## Appendix B: Key Metrics To Track

| Metric | Why It Matters |
|---|---|
| Time to first generated map | Core product experience; should feel fast |
| Generation success rate | % of prompts that produce a valid AppMap |
| Moments edited per session | Proxy for whether users are actually iterating, not just generating |
| Session-to-share rate | % of users who click "Build & Share" — intent signal |
| Return rate (D7, D30) | Measures stickiness; are they building over time or one-and-done? |
| Map size at churn | At what complexity do users abandon? (Tests the core thesis) |

## Appendix C: The Founding Insight In One Paragraph

The fundamental problem with AI-built software is not that AI generates bad first versions. It generates surprisingly good first versions. The problem is that every subsequent change is a guess. The AI does not know what it built in structural terms. It cannot scope a change to one part because it has no concept of parts. The only fix is to make structure explicit — to give every part of the app an address — so that when you want to change something, you change exactly that thing, and nothing else has to be touched. That is what the Journey Map is. That is why Momentum exists.
