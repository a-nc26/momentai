# Momentum — Vision & Technical Purpose

**Version:** 2.2  
**Updated:** April 11, 2026  
**Purpose:** Long-term product intent, architecture philosophy, and invariants

**Alignment:** Strategic positioning, audience (*architectural builders*), and roadmap live in `PRD.md` **Part I** (source of truth). This file states how Momentum implements that strategy in product philosophy and technical invariants.

---

## True Purpose

Momentum exists to solve one problem:

**Making AI-built software safe to edit as it grows.**

Not "generate faster."  
Not "prettier first drafts."  
Not "easier prototyping."

**Controlled iteration at scale.**

---

## The Founding Insight

AI can produce strong first versions. The breakdown happens during sustained iteration.

Without explicit structure:
- Every change is a guess across an undifferentiated whole
- The model has no stable notion of boundaries
- Unintended consequences compound
- Trust erodes, projects stall

Momentum's response:
- Make structure explicit from the first prompt
- Give every screen and flow a stable identity
- Make that structure visual and editable
- Scope changes to specific parts instead of re-rolling everything

---

## Vision Statement

From one prompt, Momentum should produce:

1. A runnable application
2. A living graph of every flow

Over time, that graph becomes the single place where teams:
- **Build** (generate and edit)
- **Run** (execute and deploy)
- **Debug** (inspect and fix)
- **Learn** (observe behavior and optimize)

Structure, execution, and intelligence share one model.

---

## The Three-Layer Architecture

### Layer 1 — Canvas (Structure & Authoring)

**Purpose:** Make every part of the app addressable and visible.

**Responsibilities:**
- Visualize journeys, moments, edges, branches
- Provide stable selection targets for editing
- Show relationships and dependencies
- Eventually become the control surface for debugging and analytics

**Not just documentation.** The operating interface for the app.

**Key principle:** If you can't see it on the graph, you can't reliably change it.

---

### Layer 2 — Runtime (Execution)

**Purpose:** Execute the graph as a real application.

**Responsibilities:**
- Interpret structured screen definitions
- Hold and manage application state
- Execute navigation, branching, and effects
- Run auth/data/AI behaviors safely
- Provide shareable, testable app output
- Eventually support production deployment

**Evolution path:**

**V1 (Current):** Interpreter-based prototype runtime
- Session state only
- Deterministic stubs for AI/data/auth
- Constrained component/action schema
- Mobile + web shells

**V2 (6-12 months):** Shareable testbed runtime
- Stable share links
- Richer state modeling
- Better branch/navigation support
- Revision tracking

**V3 (12-24 months):** Production surface
- Backend integrations (auth providers, DBs, APIs)
- External deployment targets
- Environment management
- Code export option

**Key principle:** The graph should be runnable, not just documentative.

---

### Layer 3 — Intelligence (Learning & Optimization)

**Purpose:** Connect observed behavior back to the graph.

**Responsibilities:**
- Instrument runtime events (pageviews, clicks, drop-offs, errors)
- Map behavior to moments and edges
- Detect friction, loops, abandonment
- Surface findings on the graph itself
- Suggest targeted fixes
- Eventually support experiments and A/B tests at node level

**Why this matters strategically:**

Traditional analytics: "Signup flow has 40% drop-off somewhere."  
Graph-native analytics: "Moment `create-account` has 40% drop-off after email field. Suggested fix: simplify form to name + email only."

The insight resolves to a **specific node you can click and edit**.

**Key principle:** Learning should point to what to change, not just what's broken.

---

## Object Model (The Contract)

`AppMap` is the platform contract across all layers.

### Structure

```typescript
AppMap {
  // Metadata
  appName: string
  appDescription: string
  appPlatform: 'mobile' | 'web'
  demoMode?: boolean
  
  // Runtime contract
  runtimeVersion: 1
  stateSchema: StateField[]
  initialState: Record<string, any>
  
  // Graph structure
  journeys: Journey[]
  moments: Moment[]
  edges: Edge[]
}

Journey {
  id: string
  name: string
  description: string
}

Moment {
  id: string
  journeyId: string
  type: 'ui' | 'ai' | 'data' | 'auth'
  label: string
  description: string
  preview: string
  position: { x: number, y: number }
  
  // Branching
  branchOf?: string         // Parent moment ID
  parentMomentId?: string   // For sub-steps (not implemented yet)
  
  // Runtime definitions
  screenSpec?: RuntimeScreenSpec
  componentCode?: string    // Generated React
  buildStatus?: 'idle' | 'building' | 'done' | 'error'
  
  // AI moments
  promptTemplate?: string
  responseKey?: string
}

Edge {
  id: string
  source: string  // Moment ID
  target: string  // Moment ID
  label?: string
  condition?: string
}

RuntimeScreenSpec {
  title?: string
  subtitle?: string
  eyebrow?: string
  progress?: { current: number, total: number }
  components: Component[]
  actions: Action[]
}
```

### Design Invariants

1. `AppMap` is the source of truth (not derived, not cached)
2. Every moment has a stable `id` (persists across edits)
3. Edges are directed (source → target)
4. `branchOf` moments are optional (hidden by default)
5. Runtime state is separate from graph structure

**If a feature can't map to `AppMap`, it probably shouldn't be first-class.**

---

## Editing Philosophy

Momentum is a scalpel, not a slot machine.

### Core Principles

**1. Local-first edits**
- Changes target one moment
- Model receives scoped context
- Output updates that moment only

**2. Explicit downstream impact**
- System detects affected moments
- User sees what might change
- Propagation is opt-in (or reviewable)

**3. Transparent execution**
- No magic global fixes
- Show what changed and why
- Provide undo/revert paths

**4. Explainable decisions**
- System explains scope
- Logs show fallback reasons
- Errors include actionable next steps

### What This Means in Practice

Some edits touch only one node.  
→ System updates that node, done.

Some edits update downstream.  
→ System flags those moments, explains why, offers refresh.

Some edits require rewiring edges.  
→ System shows new connections, asks for confirmation.

Some edits need app-level state changes.  
→ System warns, shows affected moments, validates schema.

**The user always understands which case happened.**

---

## Runtime Design Philosophy

### Interpreter vs. Codegen Tradeoff

**Interpreter (current path):**

Pros:
- Instant updates when map changes
- Safer constraints (can't execute arbitrary code)
- Easier editing (change spec, not generated code)
- Faster iteration cycles

Cons:
- Limited to supported component/action vocabulary
- Harder to extend with custom logic
- Deployment requires runtime server (not pure static)

**Codegen (future option):**

Pros:
- Full ownership (export real codebase)
- Unlimited extensibility
- Standard deployment (Vercel, Netlify, etc.)

Cons:
- Generated code can drift from map
- Editing requires regeneration
- Merge conflicts in exported code

**Recommended hybrid path:**
- V1-V2: Interpreter for reliability and speed
- V2-V3: Add code export option (opt-in)
- Long-term: Both modes coexist (interpreter for iteration, export for ownership)

### State Management Philosophy

**App-level state:**
- Defined in `stateSchema` (typed fields)
- Initialized from `initialState`
- Shared across all moments

**Session state:**
- Holds current values during runtime
- Persists across navigation
- Can be saved to backend for continuity

**Moment-local state:**
- Not supported in V1 (everything is app-level)
- Future: scoped state for complex screens

**Key rule:** State changes are explicit (effects, actions) — no hidden mutations.

---

## Intelligence Layer (Future Vision)

### What It Should Do

Track behavior at moment/edge granularity:
- Which moments users reach
- Which buttons they tap
- Where they drop off
- Which paths they loop through
- Where errors happen

Surface findings **on the graph**:
- Amber badge: "40% drop-off"
- Red badge: "High error rate"
- Green badge: "High conversion"

Provide actionable insights:
- "Users abandon at moment `create-account` after email field"
- "Suggested fix: simplify to name + email only (password later)"

### Why This Is the Moat

Traditional analytics: data in dashboards, fixes require guessing.  
Graph-native analytics: data on nodes, fixes are one click away.

That tight loop — observe → identify → edit → validate — is defensible if we ship it first and do it well.

### Technical Approach (Future)

**Instrumentation:**
- Runtime emits events (moment_viewed, action_clicked, error_occurred)
- Events include: moment ID, journey ID, timestamp, user ID, session ID

**Aggregation:**
- Backend collects events
- Aggregates by moment/edge/journey
- Computes funnels, conversion rates, drop-off points

**Display:**
- Canvas overlays badges on nodes
- Click badge → see detail panel
- Suggested fixes appear as AI-generated prompts
- User can apply fix as scoped edit

**Feedback loop:**
- Edit → deploy → observe → new data
- Continuous optimization cycle

---

## What Must Stay True

Regardless of implementation choices, these invariants must hold:

### Invariant 1: Graph is Central

The map is not decoration. It's the product core.

Every meaningful capability should attach to the graph:
- Generation writes it
- Canvas renders it
- Runtime executes from it
- Editing updates it
- Intelligence annotates it

### Invariant 2: Execution Couples to Structure

Runtime behavior should resolve back to graph structure.

When something breaks, the fix targets a moment or edge, not "somewhere in the code."

### Invariant 3: Editing Stays Scoped

Changes target explicit boundaries (moments).

Downstream impact is transparent, not discovered post-facto.

### Invariant 4: Learning Resolves to Nodes

Analytics should answer: "Which moment should change first?"

Not: "Here's aggregate data, good luck finding the issue."

### Invariant 5: Fear Decreases with Size

As apps grow, iteration confidence should increase (or stay stable), not decrease.

This is the opposite of current AI builders.

---

## Long-Term Product Scenarios

### Scenario A: Full-Stack Platform

Momentum owns:
- Generation
- Editing
- Runtime
- Deployment
- Analytics

User never leaves Momentum from idea to production.

**Pros:** Tight integration, full control, strong lock-in  
**Cons:** Large build surface, infrastructure costs

### Scenario B: Integration Hub

Momentum owns:
- Generation
- Editing
- Graph model

Integrates with:
- Vercel/Netlify (deploy)
- Supabase/Firebase (backend)
- PostHog/Amplitude (analytics)

**Pros:** Faster shipping, lower infra cost  
**Cons:** Weaker moat, dependency on partners

### Scenario C: Hybrid (Likely Path)

Momentum owns:
- Generation, editing, graph (core)
- Lightweight runtime (prototype/test)
- Code export option

Partners for:
- Production deployment
- Complex backend needs
- Advanced analytics (until intelligence layer ships)

**This is the pragmatic path.**

---

## Technical Risk Areas

### High-Impact Risks

**1. AppMap schema evolution**
- Risk: Breaking changes as we add features
- Mitigation: Versioning (`runtimeVersion`), migration helpers

**2. Model output quality variance**
- Risk: Generation/editing reliability fluctuates with model updates
- Mitigation: Validation layers, fallback modes, regression testing

**3. Graph/runtime state desync**
- Risk: Canvas shows one thing, runtime executes another
- Mitigation: Single source of truth (`activeMomentId`), sync guards

**4. Edit scope creep**
- Risk: "Scoped" edits touch too much
- Mitigation: Better prompting, validation, user feedback loop

### Medium-Impact Risks

**5. Canvas performance degradation**
- Risk: >100 moments slows canvas
- Mitigation: Virtualization, lazy rendering

**6. API cost scaling**
- Risk: Model calls become expensive at scale
- Mitigation: Caching, tiered limits, batch operations

**7. State schema conflicts**
- Risk: Edits change field types, break downstream moments
- Mitigation: Conflict detection, resolution UI

---

## Open Technical Questions

These are real unknowns that affect long-term architecture:

### 1. How far can we push interpreter reliability?

At what complexity does interpreter model break and require codegen?

Current hypothesis: 80%+ of apps fit constrained schema. Codegen becomes optional export for edge cases.

### 2. What's the right revision/deployment model?

Options:
- A: Map revisions + runtime snapshots (separate)
- B: Unified artifact (map + deployed version linked)
- C: Git-like model (commits, branches, merges)

Leaning: Start with B (simple linking), explore C later.

### 3. How should AI-moment prompt editing work?

When user wants to edit just one part of a complex prompt template:

Option A: Free-text edit (breaks structure)  
Option B: Segment the template, edit segments  
Option C: Natural language "change this part" meta-edit

Leaning: C for consistency with rest of product.

### 4. What's the cleanest event model for intelligence?

Requirements:
- Events map to moments/edges
- Low overhead (performance)
- Privacy-safe
- Queryable for analytics

Candidates:
- Custom instrumentation SDK
- PostHog with moment-level metadata
- Amplitude with journey/moment properties

Decision needed before intelligence layer ships.

### 5. Should we support real backend integrations or stay prototype-only?

Options:
- A: Prototype forever (Momentum is demo tool)
- B: Integration layer (Supabase, Firebase, etc.)
- C: Own the backend stack

Leaning: B (integrations) for V2-V3, revisit C if we see production adoption.

---

## Architecture Principles

### Principle 1: Graph-Native Everything

Every system should think in terms of the graph:

- Generation produces `AppMap`
- Canvas renders `AppMap`
- Runtime executes from `AppMap`
- Editing patches `AppMap`
- Intelligence annotates `AppMap`

**Anti-pattern:** Side systems that bypass the graph.

### Principle 2: Explicit Over Implicit

Make structure visible:
- Show branches, don't infer
- Show state dependencies, don't hide
- Show downstream impact, don't surprise

**Anti-pattern:** Magic global fixes.

### Principle 3: Scoped Over Broad

Default to small, safe changes:
- Edit one moment at a time
- Flag when scope must widen
- Make propagation transparent

**Anti-pattern:** Regenerate everything by default.

### Principle 4: Executable Over Static

The graph should run:
- Not just documentation
- Not just design spec
- Actual working app

**Anti-pattern:** Pretty pictures disconnected from behavior.

### Principle 5: Learning Resolves to Action

Feedback should point to fixes:
- Not just "drop-off exists"
- "Drop-off at this moment, fix by doing X"

**Anti-pattern:** Analytics dashboards divorced from editing surface.

---

## System Evolution Path

### Stage 1 — Executable Prototype (Current)

**State:** Working but constrained.

**Capabilities:**
- Generate map from prompt
- Visual graph with branch handling
- Interpreter runtime (mobile/web)
- Scoped editing
- Component builds

**Limitations:**
- Prototype-only (no production deployment)
- Constrained component vocabulary
- Session state only
- No real backend/auth/data

**Goal:** Prove core loop (generate → navigate → edit → build).

---

### Stage 2 — Shareable Testbed (Next 6-12 months)

**State:** Reliable for demos and user testing.

**Capabilities:**
- Stable share links
- Revision history
- Team collaboration baseline
- Richer state modeling
- Better error recovery

**Limitations:**
- Still not production-ready backend
- Limited to supported integrations
- Analytics not yet graph-native

**Goal:** Teams can build and test real flows together.

---

### Stage 3 — Production Surface (12-24 months)

**State:** Deployable for real user traffic.

**Capabilities:**
- Backend integrations (Supabase, Firebase, custom APIs)
- Auth provider support (OAuth, SAML, etc.)
- External deployment (Vercel, Netlify, custom)
- Environment management (staging, prod)
- Stronger observability

**Limitations:**
- Intelligence layer still in development
- Custom backend logic requires workarounds

**Goal:** Production apps run on Momentum runtime.

---

### Stage 4 — Intelligence-Native Builder (24+ months)

**State:** Learning and optimization built in.

**Capabilities:**
- Behavior tracking at moment/edge level
- Friction and drop-off mapped to nodes
- AI-suggested fixes on graph
- Experiment workflows (A/B test moments)
- Continuous optimization loop

**Limitations:**
- None in core vision (stage 4 is the full vision)

**Goal:** Teams build, run, and optimize all in one environment.

---

## Strategic Bets

### Bet 1: Structure Compounds Value

The more you edit on the graph, the more valuable it becomes:
- You learn the map
- You trust scoped changes
- You rely on downstream awareness
- Switching cost increases

### Bet 2: Intelligence Layer Is Defensible

If Momentum ships graph-native analytics first:
- Competitors need architectural re-foundation to match
- User muscle memory on graph-based optimization
- Data moat (behavior history tied to moments)

### Bet 3: Iteration Beats Generation Speed

Users will pay more for safe iteration than fast first drafts:
- First draft is free/cheap (Lovable, Bolt)
- Sustained editing is premium (Momentum)

### Bet 4: Non-Technical Users Are Underserved

Current tools skew technical (code export, terminal UIs):
- Founders think in flows, not files
- Graph is more natural mental model
- Less competition for this ICP

---

## What Momentum Is (Identity)

Momentum is:
- A **graph-native** application builder
- An **iteration-first** AI tool
- A **structure-explicit** editing environment

Momentum is NOT:
- Just another no-code tool (we don't limit capabilities to protect simplicity)
- Just another AI builder (we optimize for iteration, not just generation)
- A prototyping tool (the runtime is meant to be production-capable)
- A separate analytics product (intelligence attaches to the graph)

---

## The Endgame

In 3-5 years, Momentum should be the system where:

1. Non-technical founders ship production apps
2. Teams iterate faster with more confidence than with code
3. Behavior insights resolve directly to fixable nodes
4. The graph is the single source of truth for structure, execution, and learning

If we achieve that, the business outcomes follow:
- Strong retention (graph becomes sticky)
- High willingness to pay (iteration value compounds)
- Network effects (shared maps, templates, patterns)
- Defensible position (intelligence layer moat)

---

## Architectural Trade-Offs (Honest Assessment)

### Interpreter vs. Codegen

**We chose interpreter-first because:**
- Faster iteration (no regen step)
- Safer constraints (validated schema)
- Easier scoped editing (patch spec, not code)

**Cost:**
- Limited extensibility
- Deployment requires runtime server
- Users can't own raw codebase (yet)

**Future hedge:** Add code export in V2-V3.

### Graph Structure vs. Flexibility

**We chose explicit graph because:**
- Enables scoped editing
- Makes dependencies visible
- Supports future analytics

**Cost:**
- Apps must fit journey/moment model
- Hard to represent very fluid/dynamic UIs
- Learning curve for graph thinking

**Mitigation:** Good defaults, clear error messages, escape hatches for edge cases.

### Proprietary vs. Open

**We chose proprietary `AppMap` format because:**
- Full control over evolution
- Tight coupling enables features
- Platform differentiation

**Cost:**
- Lock-in concerns
- Ecosystem adoption slower
- Harder to integrate with existing tools

**Future hedge:** Consider open spec in V3 if ecosystem benefits outweigh control.

---

## Success Definition (Concrete)

Momentum succeeds when:

### Product Success

1. **Users trust iteration** — Median 7+ scoped edits per retained project
2. **Structure proves valuable** — Graph visibility drives >50% of edit actions
3. **Runtime becomes real** — 100+ production apps running on Momentum
4. **Intelligence closes loop** — Graph-native analytics drives measurable retention lift

### Business Success

1. **Revenue** — $1M+ ARR by end of Year 2
2. **Retention** — D30 >25%, M6 >15%
3. **NPS** — >40 among active users
4. **Growth** — 15-20% month-over-month for 12 months

### Strategic Success

1. **Category leadership** — Top 3 in "iteration-first AI builder" positioning
2. **Moat validation** — Intelligence layer proves defensible
3. **Exit optionality** — Strategic interest from design tools, dev platforms, or collaboration suites

---

## Final Principle

Momentum should never promise magic.

It should promise:
- Visibility (you can see the structure)
- Control (you choose what changes)
- Safety (unintended impact is flagged)
- Learning (behavior maps to fixable nodes)

That's the honest product promise.

---

*This document defines long-term direction. For execution detail, see `PRD.md`. For fundraising, see `INVESTOR_ONEPAGER.md`.*
