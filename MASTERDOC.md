# Momentum — Master Product Document

**Version:** 1.1  
**Date:** March 2026  
**Use:** Internal alignment, advisor briefings, fundraising materials, LLM context

---

## Purpose of this document

This document is the canonical description of Momentum: what it is, why it exists, how it differs from other AI builders, what is implemented today, and where the product is headed. It is written as explanatory narrative, not as a questionnaire.

---

## The one-line summary

**Momentum is an AI app builder that generates a visual map of your app’s flows at the same time it builds the app — so every future edit can target one specific part without breaking the rest.**

The core bet is that the hard problem in AI-built software is not the first version; it is **controlled iteration**. Momentum is built around that.

---

## The problem

### How most AI builders work today

Major AI builders — Lovable, Bolt, Replit, Base44, and similar — share the same basic loop:

1. The user describes what they want.  
2. The model generates an app (code, HTML, or a rendered UI).  
3. The user sees the result.  
4. The user wants a small, specific change.  
5. They prompt again.  
6. The model regenerates — often touching areas they did not intend to change.

That loop works until the product grows. Then it frays.

### Why it breaks

The model typically has no durable, user-visible structure for “this screen,” “this flow,” or “this branch.” It sees a codebase or a blob of output as one surface. When the user says “change the onboarding step,” the system does not reliably know where onboarding begins and ends. It infers. Sometimes it is right; often it drifts.

A documented failure mode across tools is that larger projects suffer **context loss**: duplicate patterns, inconsistent architecture, and changes that break unrelated behavior. Confidence drops; users stop iterating or stay at prototype scale.

### Why this worsens over time

The issue compounds with app size and session count. That creates a **ceiling** for prompt-only builders: excellent for MVPs, increasingly fragile as the product grows.

---

## The solution

### Core insight

Every part of an app needs an **address**. To change only the login screen, the system must know what “login” is in structural terms: how it relates to state, what connects to it, and what should remain untouched when that node changes.

Momentum makes structure **explicit and visual from the first prompt**.

### What Momentum does differently

From a single description, Momentum aims to produce two things together:

1. A **runnable app** — interactive and navigable.  
2. A **visual journey map** — a graph of flows, screens, branches, and relationships.

The map is not an afterthought or static documentation. It is the **authoring surface** for what happens next: select a node, describe a change, and scope work to that moment instead of the whole project.

### Edit model

Instead of repeatedly re-prompting the entire app, the intended loop is: **select the node → describe the change → update that scoped unit**. Downstream effects can be flagged when a change might impact connected moments.

### Intended end-to-end loop

```
Describe the app
  → App and map are produced together
  → Click a node to inspect or edit it
  → Edit one moment → that unit updates
  → Launch or share the app
  → (Future) Observe behavior tied to nodes
  → Click the problem node → fix → repeat
```

The long-term vision is a single environment where structure, execution, and feedback share one representation.

---

## Market context

### Scale

The AI-assisted builder / “vibe coding” segment has grown rapidly alongside enterprise no-code and low-code adoption. Analyst projections for adjacent markets point to multi-year double-digit growth; incumbents in the space have reported very large revenue ramps in short windows, which validates demand for AI-assisted product creation even if exact figures move quarter to quarter.

### Signal

A growing share of early-stage teams use AI heavily in their build process. The constraint is less “can we generate something?” and more “can we **maintain and evolve** what we generated?”

### Who builds with these tools

Typical users include non-technical founders, product and design roles prototyping real software, indie builders, and small teams shipping client or internal tools. A large stated value of many platforms is enabling people who do not write production code to still ship working software.

---

## Competitive positioning

### Comparison axes

| | Typical AI builders | Momentum |
|---|---|---|
| Full app generation | Yes | Yes |
| Native visual flow map as first-class output | No | Yes |
| Targeted per-screen / per-moment editing | Rare / prompt-only | Yes (by design) |
| Shareable hosted preview | Common | Yes |
| Map-native analytics | Not standard | Vision |

### How incumbents relate to the core problem

- **Lovable-class tools:** Strong at fast, polished first versions; iteration is still largely full-context prompting.  
- **Code-forward tools (e.g. Bolt):** Ownership of code is clear; structural scoping for non-developers is still hard.  
- **Integrated backend platforms:** Speed to a working stack; same broad re-prompt risk on change.  
- **UI-focused generators (e.g. v0):** Excellent components; assembling full apps and flows remains separate work.  
- **Legacy visual builders:** Structured, but not prompt-native in the same way.

### Momentum’s structural differentiator

The **journey map** is generated alongside the app and stays tied to the same underlying model (the AppMap). It is intended as the contract for generation, editing, and (later) instrumentation — not a diagram pasted on top of an opaque codebase.

---

## The product today

### Generation and input

- Natural-language description of the product (with platform choice, e.g. mobile vs web).  
- Optional codebase upload path: zip analysis and mapping into the same moment/journey model.  
- Streaming generation with progress feedback where implemented.  
- AppMap output: journeys, moments, edges, state schema, screen specs, and layout hints.

### Visual canvas

- React Flow–based canvas with journeys as grouped regions and moments as nodes.  
- Color coding by journey; zoom, minimap, and controls.  
- **Branch moments** (conditional paths): hidden until the parent is expanded; expanding fans branch nodes **horizontally under the parent** so paths do not stack on the same coordinates. Journey bounds follow which branches are expanded.  
- Bird’s-eye mode at low zoom: journey-level overview; double-click to drill into a journey.  
- Selection syncs with the right-hand panel and runtime preview where applicable.

### Runtime and preview

- Interpreter-style runtime from structured screen specs (mobile and web layouts).  
- Per-moment **component preview** where generated code exists: iframe-based preview with a loading state while remote scripts (e.g. React, Babel, Tailwind CDN) hydrate — avoids a long blank white screen during load.  
- Streaming mock generation for moments without stored HTML.  
- Build pipeline produces shareable hosted output where configured.

### Editing and build

- Moment panel: inspect description, AI prompt templates where relevant, regenerate or apply natural-language edits scoped to that moment.  
- Build & Share flow to produce a URL for the built app (e.g. hosted static artifact).  
- Flags for possible downstream impact when editing connected flows.

### Persistence and operations

- Client-side project persistence (e.g. local storage) and project listing.  
- Session and logging hooks where Supabase or similar backends are configured (e.g. admin log viewing for production warnings/errors).

### Stack (representative)

- Next.js (App Router), TypeScript, React.  
- Canvas: `@xyflow/react`.  
- Client state: Zustand with persistence.  
- UI: Tailwind + component library patterns.  
- Models: Anthropic API for generation and editing routes.  
- Hosting and assets: commonly Vercel and blob storage for shared builds.

---

## Architecture: the AppMap

The AppMap is the central artifact. It ties the canvas, generators, and runtime together.

Conceptually it includes:

- **App metadata:** name, description, platform.  
- **State:** schema and initial values for shared application state.  
- **Journeys:** named flows.  
- **Moments:** typed steps (`ui`, `ai`, `data`, `auth`) with labels, descriptions, positions, optional `branchOf` for conditional variants, screen specs, optional generated component code, and AI prompt templates where relevant.  
- **Edges:** directed connections between moments, optionally labeled.

The AppMap is the structural contract: generation writes it, the canvas renders it, runtimes interpret it, and edits patch slices of it.

---

## Vision: three layers

**Layer 1 — Canvas (authoring)**  
The map is the place where flows are seen, explained, and edited. This layer is the product’s differentiator and is in active development.

**Layer 2 — Runtime (execution)**  
Turn the map into a reliable, shareable, production-capable application: auth, data, deployment, performance. Parts exist today as prototype runtimes; depth grows over time.

**Layer 3 — Intelligence (behavior on the map)**  
Connect real usage to specific nodes: drop-off, friction, and success paths visible **on the journey map**, not only in a separate analytics product. This closes the loop between observation and a concrete edit target.

### Why the intelligence layer matters strategically

Classic analytics tools aggregate events in dashboards. The map-native version of the story is: **which moment should change first** — aligned with how Momentum already thinks about the product.

### Runtime maturity (roadmap framing)

| Stage | Aim |
|---|---|
| Early | Executable prototype from the map |
| Next | Stable sharing, persistence, polish |
| Later | Production-grade auth, data, deployment |
| Longer-term | Map-linked behavioral intelligence |

Exact timelines depend on team and funding; the ordering reflects dependency (execution before deep instrumentation).

---

## Business model (directional)

Comparable products often use tiered subscriptions (free trial or limited generation, pro builder tier, team tier, enterprise). For Momentum, a natural structure would align price with:

- Volume of generation and editing.  
- Sharing, collaboration, and history.  
- Production features (domains, SSO, environments).  
- Eventually, analytics and map-level insights for teams that ship real traffic.

The intelligence layer, when real, is a plausible **enterprise** upsell: observability tied to the same graph the team already edits.

Strategic acquirer categories that often care about builder surfaces and workflow graphs include design-tool platforms, developer-infrastructure companies, and collaboration suites; specifics depend on how the product and traction evolve.

---

## Messaging

**Short pitch:**  
Momentum is a graph-native AI app builder: the first prompt produces both a runnable app and a journey map so every later change can stay scoped to one moment instead of destabilizing the whole project.

**User problem framing:**  
Other tools regenerate a blob; you hope nothing else breaks. Momentum gives every screen and flow an address on the map — you change the part you mean to change.

**Differentiation sentence:**  
Other AI builders optimize for the first generation; Momentum optimizes for **everything after that**.

---

## Appendices

### Appendix A: Key codebase locations

```
app/app/page.tsx                 Main workspace
app/api/generate/route.ts        Description → AppMap
app/api/build-app/route.ts       AppMap → built app
app/api/edit-moment/route.ts     Scoped natural-language edit
components/Canvas.tsx            Flow canvas, branches, bird’s eye
components/MomentPanel.tsx       Moment detail, preview, edit
components/runtime/*             Runtime interpreters
lib/types.ts                     AppMap and related types
lib/store.ts                     Client state
lib/canvasLayout.ts              Branch layout (fan under parent)
lib/buildSrcdoc.ts               Iframe preview document for components
```

### Appendix B: Metrics worth tracking

| Metric | Role |
|---|---|
| Time to first valid AppMap | Core UX quality |
| Generation success rate | Reliability |
| Edits per session | Iteration depth |
| Share / build rate | Intent to distribute |
| Return usage (D7, D30) | Stickiness |
| Abandonment vs. map size | Stress-test of the “grows with you” thesis |

### Appendix C: Founding insight (one paragraph)

AI often produces a strong first version; the breakdown is **sustained iteration**. Without explicit structure, every change is a guess across an undifferentiated whole. Momentum’s response is to make structure explicit: journeys and moments with stable identities, visible on a map, so that “change this part” is a precise operation rather than another full-app roll of the dice.

---

*End of document.*
