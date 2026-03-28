# Momentum — Product Requirements Document
**Date:** March 10, 2026
**Status:** Working MVP → V2 Planning

---

## 1. Vision

> *"Every other tool gives you an app. Momentum gives you an app and a map of how it works — so every future edit is surgical, targeted, and safe."*

Momentum is a full development platform where your first prompt builds the app **and** automatically generates a living visual map you use to change everything after. You describe it. It builds. Then the map appears.

The core insight: current AI builders have no concept of structure. When you re-prompt to fix one thing, three other things break — because the AI has no idea what "one thing" even means. Momentum solves this by giving every part of an app an address. You never edit the whole app again. You only ever touch the specific Moment you want to change.

---

## 2. The Problem

Building with AI today is fast — until it isn't.

- **Prompt to fix one thing.** Three other things break.
- **Re-prompt to fix those.** Something else shifts.
- **No map, no structure, no way to isolate.** Just guessing until something sticks.

This loop exists because today's AI builders output an undifferentiated blob of code with no internal structure exposed to the user. There is no "address" for a login button or a receipt scanner — so when you touch one, the AI might touch the other.

---

## 3. The Solution — Three Layers

Momentum is built on three integrated layers. The first prompt triggers all three simultaneously.

### Layer 1 — The Canvas
*The visual environment where journeys are built and edited.*

The Canvas is where the Journey Map lives. After your first prompt it is populated automatically. You can view every journey, zoom into any Moment, make targeted edits, add new steps, restructure flows, or extend the app with new journeys — all without touching code and without risking anything outside the Moment you are working on.

*Without this: You have an engine with no interface. No way to see, reason about, or safely change what was built.*

### Layer 2 — The Runtime *(vision; not yet built)*
*The execution engine that makes the map real.*

The Runtime takes the Journey Map and runs it as a live application. What you see on the Canvas is not a mockup — it is a working product serving real users, managing real state, handling authentication, data flow, API calls, and every other side effect a production app requires. When you edit a Moment on the Canvas and commit, the Runtime reflects that change immediately.

*Without this: You have a prototype tool. The map exists but nothing executes.*

### Layer 3 — The Intelligence Layer *(vision; not yet built)*
*The feedback loop that connects real behavior back to the map.*

The Intelligence Layer watches real users move through your Journeys and surfaces what it finds directly on the Canvas — on the map itself. The Moment where users are dropping off is highlighted. The Journey with the most friction is flagged. You see the problem, click the node, fix it, and commit. The loop closes without ever losing context.

*Without this: You ship and guess. There is no connection between what users actually do and the specific thing you need to change.*

---

## 4. The Full Loop

```
Prompt → App is built → Map appears → Edit a Moment → Ship
→ Watch real behavior → Return to the map → Fix the specific Moment → Repeat
```

Every part of this loop happens inside Momentum. No external analytics tool to configure. No separate deployment pipeline. No context switching between where you build and where you learn.

---

## 5. Core Concepts

### Journey
A named user flow — a distinct path through the app a real user would take. Examples:
- "Add Expense" → Scan Receipt → OCR Extraction → Category Assignment → Log to Database
- "Sign In" → Landing → Login Form → Email Verification → Dashboard

### Moment
A single step inside a Journey. Every Moment is a node on the Canvas and a real, working piece of the application. A Moment has:
- **Label** — short name
- **Type** — `ui` | `ai` | `data` | `auth`
- **Description** — what this step does
- **Preview** — detailed UI/behavior description
- **mockHtml** — rendered screen preview (auto-generated)
- **promptTemplate** — for `ai` type: the structured Claude prompt driving this step
- **branchOf** — optional: parent node ID (hidden until parent is expanded)
- **position** — x/y on the Canvas

### Moment Types
| Type | What it represents |
|------|-------------------|
| `ui` | A screen, form, or navigation step |
| `ai` | An AI-powered step (Claude call with a prompt template) |
| `data` | A database read/write or storage operation |
| `auth` | An authentication or authorization step |

### AppMap
The central data structure. Contains all Journeys, Moments, and directed edges (FlowEdges) connecting them. This is both the source of truth for the Canvas and — eventually — the spec for the Runtime.

---

## 6. Current State (What Is Built)

### 6.1 What Works Today

**Prompt Screen**
- Static landing screen with tagline and single CTA
- "Launch Pulse — AI Fitness Demo" button loads a hardcoded demo AppMap (no API call)
- No free-text prompt input yet (prompt → generate flow is wired in the API but not surfaced in the UI)

**Canvas (`/components/Canvas.tsx`)**
- React Flow canvas renders all Moments as draggable nodes
- Journey color-coded legend (top-left overlay)
- Minimap + zoom controls
- Branch nodes (e.g. goal plan variants): hidden by default, revealed on parent click
- Double-click to zoom-to-fit a node and its neighbors
- Click pane to deselect / collapse branches
- Hint bar at the bottom

**MomentNode (`/components/MomentNode.tsx`)**
- 220px card with colored left border (journey color)
- Journey label, type badge, type icon, step label, truncated description
- Source/target connection handles

**MomentPanel (`/components/MomentPanel.tsx`)**
- 420px right sidebar — opens when a node is selected
- **Screen Preview**: lazy-loads an HTML mockup via `/api/generate-mock` on first open; renders in a sandboxed `MockFrame` iframe styled as a phone
- **Description**: plain text display
- **AI Implementation** (expandable, `ai` type only): shows model, inputs, outputs, prompt template, API call snippet
- **Edit this Moment**: textarea + "Apply Edit" button → calls `/api/edit-moment` → updates metadata + regenerates mockHtml in parallel; keeps existing screen if new HTML is invalid
- `⌘ + Enter` shortcut to apply edit
- Loading overlay on mock during regeneration

**API Routes**
- `POST /api/generate` — description → full AppMap JSON via Claude (currently unused by UI; demo loads hardcoded data)
- `POST /api/generate-mock` — {moment, journey, appMap} → production-quality HTML mockup for a single screen
- `POST /api/edit-moment` — {moment, change, journey, appMap} → updated moment fields + regenerated mockHtml (parallel Claude calls)

**Store (`/lib/store.ts`)**
- Zustand store: `appMap`, `selectedMomentId`, `isGenerating`, `isEditing`
- `updateMoment`, `setMomentMock`, `reset`

**Demo Data**
- "Pulse — AI Fitness Coach" hardcoded AppMap: 4 journeys, 21 moments, 15 edges
- All screen HTMLs pre-baked in `lib/demo-screens.ts`
- Branch nodes wired (goal plan variants off Fitness Assessment; PR/Share/AI Debrief off Workout Log)

### 6.2 What Is Missing / Not Yet Built

| Feature | Status |
|---------|--------|
| Free-text prompt → live AppMap generation | API exists, UI not wired |
| Loading state during generation | `isGenerating` in store, no UI |
| App persistence (localStorage / DB) | Not implemented |
| Export / share map | Not implemented |
| Add new Moment to existing map | Not implemented |
| Delete / reorder Moments | Not implemented |
| Add new Journey | Not implemented |
| Edge editing (add/remove connections) | Not implemented |
| Runtime (live app execution) | Vision only |
| Intelligence Layer (usage analytics on map) | Vision only |
| Auth / multi-user | Not implemented |
| Mobile layout | Not implemented |
| `branchOf` nodes generated by Claude | Not in generate prompt |

---

## 7. User Stories

### MVP (Canvas + Edit Loop)

| # | As a... | I want to... | So that... |
|---|---------|-------------|-----------|
| 1 | Builder | Describe my app in plain language | Momentum generates a full Journey Map automatically |
| 2 | Builder | See all my app's user flows on one canvas | I understand the full structure at a glance |
| 3 | Builder | Click any Moment to see its screen preview | I can inspect every UI state without running anything |
| 4 | Builder | Describe a change to a specific Moment | Only that screen updates; nothing else is touched |
| 5 | Builder | See AI implementation details for AI-powered steps | I understand what prompt drives each AI feature |
| 6 | Builder | Expand branch paths (conditional flows) | I can see alternate user journeys without cluttering the main view |

### V2 (Runtime + Intelligence)

| # | As a... | I want to... | So that... |
|---|---------|-------------|-----------|
| 7 | Builder | Share a live link to my app | Real users can test it |
| 8 | Builder | See which Moments have the highest drop-off | I know exactly which node to fix first |
| 9 | Builder | Add a new Moment to an existing Journey | I can extend the app without re-prompting everything |
| 10 | Builder | Zoom into an AI Moment's prompt segments | I can edit one specific instruction without touching the others |

---

## 8. Functional Requirements

### 8.1 Journey Map Generation (Priority: P0)

- **FR-1**: The system MUST accept a plain-language app description and return a complete AppMap JSON without requiring the user to define structure in advance.
- **FR-2**: Generated AppMaps MUST contain 2–5 Journeys, each with 3–6 Moments.
- **FR-3**: Moments MUST be typed (`ui`, `ai`, `data`, `auth`) and positioned automatically on a grid (journeys on separate horizontal rows, 320px vertical gap; moments 280px apart horizontally).
- **FR-4**: The UI MUST show a generation loading state while the API is running.
- **FR-5**: If generation fails, the user MUST see an actionable error and be able to retry.

### 8.2 Canvas (Priority: P0)

- **FR-6**: The Canvas MUST render all Moments as draggable nodes, color-coded by Journey.
- **FR-7**: Dragging a node MUST persist its position for the duration of the session; re-generating the AppMap MUST NOT reset manually-adjusted positions.
- **FR-8**: Branch nodes (conditional paths) MUST be hidden by default and revealed on parent node click.
- **FR-9**: Double-clicking a node MUST zoom the canvas to fit that node and its direct neighbors.

### 8.3 Screen Preview (Priority: P0)

- **FR-10**: Clicking a Moment MUST open the MomentPanel and trigger a lazy-load of its HTML mockup if not already cached.
- **FR-11**: The mockup MUST render in a sandboxed iframe styled as a 390px-wide mobile phone.
- **FR-12**: The system MUST validate returned HTML (presence of `<!DOCTYPE html>`, closing tags, minimum length) before displaying it. Invalid HTML MUST NOT replace a previously valid mock.

### 8.4 Moment Editing (Priority: P0)

- **FR-13**: The user MUST be able to describe a change in plain language and apply it to a single Moment.
- **FR-14**: Applying an edit MUST update both the Moment metadata AND regenerate the screen mockup in parallel.
- **FR-15**: While an edit is processing, the existing screen MUST remain visible with a loading overlay; the edit input MUST be disabled.
- **FR-16**: `⌘ + Enter` MUST trigger the edit submission.

### 8.5 AI Moment Details (Priority: P1)

- **FR-17**: AI-type Moments MUST expose an expandable "AI Implementation" section showing model, inputs, outputs, prompt template, and API call shape.
- **FR-18**: Prompt templates MUST use `{{variable}}` syntax to identify dynamic inputs.

### 8.6 Persistence (Priority: P1)

- **FR-19**: The current AppMap MUST be persisted to localStorage so a page refresh does not lose work.
- **FR-20**: "New App" MUST clear localStorage and return to the PromptScreen.

### 8.7 Map Editing (Priority: P1)

- **FR-21**: Users MUST be able to add a new Moment to an existing Journey via the Canvas.
- **FR-22**: Users MUST be able to delete a Moment (with confirmation).
- **FR-23**: Users MUST be able to rename a Journey.

---

## 9. Non-Functional Requirements

| Category | Requirement |
|----------|------------|
| **Latency** | Initial AppMap generation: target < 8s. Mock generation: target < 6s. Moment edit: target < 10s. |
| **Reliability** | HTML mock validation must prevent blank/broken previews from ever replacing a working screen. |
| **Security** | All mocks render in sandboxed iframes (`sandbox="allow-scripts"`). No external CDN calls inside mocks. ANTHROPIC_API_KEY never exposed to client. |
| **Accessibility** | Keyboard navigation for Canvas controls. Focus management in MomentPanel. |
| **Responsiveness** | Canvas + panel layout targets 1280px+ screens. Mobile not in scope for V1. |

---

## 10. Technical Architecture

### Stack
- **Framework**: Next.js 16 (App Router) + TypeScript
- **Canvas**: `@xyflow/react` (React Flow v12)
- **State**: Zustand
- **UI**: shadcn/ui + Tailwind CSS v4
- **AI**: Anthropic SDK (`claude-sonnet-4-6`)

### Key Files
```
app/
  page.tsx                  — Root layout (header, PromptScreen or Canvas+Panel)
  api/
    generate/route.ts       — description → AppMap JSON
    generate-mock/route.ts  — moment → HTML mockup
    edit-moment/route.ts    — {moment, change} → updated moment + new mockHtml

components/
  Canvas.tsx                — React Flow canvas, node/edge rendering, branch logic
  MomentNode.tsx            — Custom node card component
  MomentPanel.tsx           — Right panel: preview + edit
  MockFrame.tsx             — Sandboxed iframe for HTML mocks
  PromptScreen.tsx          — Initial prompt input

lib/
  types.ts                  — Moment, Journey, FlowEdge, AppMap
  store.ts                  — Zustand store
  colors.ts                 — Journey color palette
  demo.ts                   — Hardcoded Pulse demo AppMap
  demo-screens.ts           — Pre-baked HTML for all demo screens
```

### Data Flow
```
User types description
  → POST /api/generate → Claude → AppMap JSON
  → setAppMap(map) → Canvas renders nodes/edges

User clicks node
  → selectMoment(id) → MomentPanel opens
  → POST /api/generate-mock → Claude → HTML
  → setMomentMock(id, html) → MockFrame renders

User applies edit
  → POST /api/edit-moment → Claude (parallel: metadata + mockHtml)
  → updateMoment(id, {label, type, description, preview, mockHtml})
  → MockFrame re-renders with new HTML
```

---

## 11. Open Questions

These are the honest unknowns from the V2 vision document:

1. **Journey inference accuracy** — How reliably can Momentum generate a meaningful Journey Map from an arbitrary first prompt? What happens when the app is too complex, too vague, or too unstructured for clean inference?

2. **Runtime architecture** — What is the right technical model for a runtime that is generated from a Journey definition and stays in sync as the Canvas changes? This is the hardest engineering question in the platform.

3. **AI Moment scoping** — When a builder zooms into a prompt segment inside an AI Moment, how does the system enforce that only that segment is re-evaluated? What does a scoped context window look like in practice?

4. **MVP definition** — The full platform is a large build. The current proof-of-concept validates the core insight (Canvas + Moment editing). Canvas plus a minimal Runtime is likely the next milestone.

5. **Competitive window** — Figma is moving toward executability. AI builders are adding structure. How long does the specific combination of journey-first, auto-generated map, executable runtime, and intelligent feedback remain a gap in the market?

---

## 12. Target Users

### The Non-Technical Founder
Thinks in experiences and user flows, not in components and code. Today they either depend on engineers, accept the limits of no-code tools, or fight the unpredictability of AI builders. Momentum lets them build a real production application by describing what they want — and gives them a map that makes every future change something they can do themselves, safely, without breaking anything.

### The Technical Designer or Product Researcher
Needs to go from idea to something real users can actually use — not a Figma prototype, but a working product. Momentum compresses the build-test-iterate loop dramatically. Describe the product, the map appears, watch real behavior, refine specific Moments. The iteration cycle tightens to hours, not weeks.

**What they share:** Neither of them should have to think in code to build software. Both think naturally in journeys — the flows real people take to accomplish real things.

---

## 13. What Momentum Is — and Is Not

| | Momentum |
|---|---|
| **Not a no-code tool** | No-code tools limit what you can build to protect you from complexity. Momentum does not limit the product — it changes how you author and change it. |
| **Not another AI builder** | Other AI builders give you an app. Momentum gives you an app and a map. That map is the entire difference. |
| **Not a prototyping tool** | The Runtime means what you build is live. Real users. Real data. Real behavior. |
| **Not an analytics dashboard** | The Intelligence Layer surfaces findings on the map itself, pointing directly to the Moment that needs to change. |

---

## 14. Roadmap

### Phase 0 — Current State (Done)
- [x] React Flow canvas with Journey/Moment rendering
- [x] Branch node expand/collapse
- [x] MomentPanel with lazy-loaded HTML mockups
- [x] Moment editing (metadata + mockHtml regeneration)
- [x] AI Implementation panel for `ai` type Moments
- [x] Hardcoded demo (Pulse fitness app, 21 screens)
- [x] `/api/generate`, `/api/generate-mock`, `/api/edit-moment` routes

### Phase 1 — Live Generation (Next)
- [ ] Wire prompt input on PromptScreen to `/api/generate`
- [ ] Generation loading state with progress feedback
- [ ] Persist AppMap to localStorage
- [ ] Error handling + retry on generation failure
- [ ] Map editing: add Moment, delete Moment, rename Journey

### Phase 2 — Map Completeness
- [ ] Edge editing (add/remove connections in Canvas)
- [ ] Multi-branch generation from Claude (branchOf support in `/api/generate`)
- [ ] Export: download AppMap JSON / share link
- [ ] Moment reordering within a Journey

### Phase 3 — Runtime (V2)
- [ ] Define Runtime execution model from AppMap spec
- [ ] Deploy generated app as a live URL
- [ ] Real-time sync between Canvas edits and running app

### Phase 4 — Intelligence Layer (V3)
- [ ] Instrument runtime for user behavior events
- [ ] Surface drop-off / friction data on Canvas nodes
- [ ] Highlight the Moment that needs attention, not just the metric
