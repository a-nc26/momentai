# Momentum — Master Product Document

**Version:** 2.2  
**Updated:** April 11, 2026  
**Purpose:** Canonical product truth for team, advisors, investors, and LLM context

**Strategic source of truth:** `PRD.md` **Part I** (Mid-Code AI Architecture Mapping Tool — positioning, audience, prompting-gap thesis, roadmap, funding). This document implements that strategy in product and technical terms under the codebase name **Momentum**.

---

## Executive Summary

Momentum (public name TBD; working title *Architectural Building Tool*) serves **architectural builders**: people who understand product structure and APIs and want more precision than typical no-code, but who are not yet fluent with full-code AI IDEs. The wedge is **visibility**: a prompt produces an interactive **architecture map** (screens, flows, data) so users stop **blind prompting** and can point changes at specific nodes and journeys.

Technically, Momentum is a graph-native AI app builder that generates a runnable application and a visual flow map together from a single prompt. Every screen, flow, and branch becomes a named node on that map. Edits target specific nodes instead of re-generating the entire app, addressing the **prompting gap** — vague instructions to a system you cannot see — that makes no-code environments feel brittle and complex at scale (a pattern validated across **30 user interviews** in thesis research).

**The core bet:** The hard problem in AI-built software is not first-draft speed — it's **precise, contextual iteration** as the product grows, enabled by architectural visibility.

---

## The Problem (Market Context)

### How AI Builders Work Today

Tools like Lovable, Bolt, Replit Agent, and Base44 have proven massive demand for AI-assisted app building. They excel at first-draft generation: describe what you want, get a working prototype in minutes.

The loop breaks when users want to iterate:

1. User asks to "fix the signup flow"
2. Model has no stable notion of what "signup" means structurally
3. Model infers, regenerates broad surfaces
4. Unrelated screens drift or break
5. Trust drops, users stop iterating or rebuild manually

### Why This Happens

Current builders output **undifferentiated code or UI blobs**. There's no persistent structure that says "this is the login screen," "this is the branch for payment failure," or "this state flows from onboarding to dashboard."

When structure is invisible, every change is a guess. The model might:
- Touch unrelated components
- Duplicate patterns
- Break cross-screen dependencies
- Lose architectural consistency

### The Ceiling Effect

This creates a **practical ceiling** for prompt-only tools:
- Excellent for MVPs and prototypes
- Increasingly fragile as apps grow beyond 10-15 screens
- Iteration confidence drops with session count
- Many projects stall or require manual rebuild

Documented pattern: users abandon AI tools when projects reach complexity thresholds where changes feel unpredictable.

### The Real Constraint

The market has proven demand for AI-assisted building. The unresolved constraint is **sustained iteration** — making the 2nd, 5th, and 20th edit as safe and predictable as the first generation.

---

## Momentum's Solution

### Core Insight

Every meaningful part of an app needs an **address**.

To edit "just the login screen," the system must know:
- What login is (structurally, not lexically)
- What state it depends on
- What screens connect to it
- What should remain untouched when login changes

Momentum makes this structure **explicit, visual, and editable from the first prompt**.

### The AppMap

From one description, Momentum generates:

1. **A runnable app** — interactive flows with real state, navigation, and branching
2. **A journey map** — visual graph of screens (moments), flows (journeys), and relationships (edges)

The map is not static documentation. It's the **authoring surface** for everything that happens next.

### The Edit Model

Instead of "describe app → regenerate everything → hope nothing broke," the loop is:

```
Select the node → describe the change → update that moment
```

The system knows:
- Which moment you're editing
- What state that moment touches
- What downstream moments depend on those state changes
- What can safely stay unchanged

Result: **scoped, explainable, safer edits**.

### Downstream Awareness

When an edit affects shared state (e.g. changing a field name or adding a new step), Momentum:
- Flags potentially affected moments on the map
- Offers to refresh their descriptions/previews
- Shows you which screens changed and why

You stay in control of propagation instead of discovering breakage later.

---

## Product Architecture

### The AppMap Structure

`AppMap` is the central contract. It contains:

**App-level:**
- `appName`, `appDescription`, `appPlatform` (mobile/web)
- `stateSchema` — typed fields (string, number, boolean, enum, arrays)
- `initialState` — default values

**Structural:**
- `journeys` — named flows (Onboarding, Checkout, Track Progress, etc.)
- `moments` — typed steps within journeys
- `edges` — directed connections between moments

**Per-Moment:**
- `id`, `journeyId`, `type`, `label`, `description`, `preview`
- `position` — canvas coordinates
- `branchOf` — optional parent for conditional paths
- `screenSpec` — structured UI definition (components + actions)
- `componentCode` — optional generated React (for build path)
- `promptTemplate` — for AI moments

### Moment Types

| Type | Represents | Example |
|------|-----------|---------|
| `ui` | Screen, form, navigation step | Login form, Dashboard, Settings |
| `ai` | AI-powered step with prompt template | Generate workout plan, Analyze receipt, Suggest meals |
| `data` | Database read/write, storage operation | Save expense, Load user profile, Log workout |
| `auth` | Authentication or authorization | Sign up, Login, Verify email |

### Runtime Screen Spec

Declarative UI schema interpreted by `MobileRuntime` / `ReactRuntime`:

**Components:**
- `hero` — title, subtitle, badge
- `input` — text/email/password/number fields
- `choice-cards` — single/multi-select cards with icons
- `chip-group` — tag-style selection
- `notice` — info/success/warning callouts
- `summary-card` — content cards with title/body/items
- `stats-grid` — key-value metric displays
- `list` — bulleted items
- `spacer` — vertical spacing

**Actions:**
- `navigate` — go to target moment
- `branch` — conditional navigation based on state value
- `back` — return to previous moment
- `compute` — evaluate formulas, write results to state, then navigate

**Effects:**
- `set-values` — write state on action
- `append-list` — add item to array state

### Branch Moments

Conditional paths (success/failure, choice variants) are hidden by default to keep the canvas clean.

Example:
```
fitness-assessment
  └─ goal-beginner (branchOf: fitness-assessment)
  └─ goal-intermediate (branchOf: fitness-assessment)
  └─ goal-advanced (branchOf: fitness-assessment)
  └─ goal-athlete (branchOf: fitness-assessment)
```

When `fitness-assessment` is active, all four branch options become visible.  
When `goal-beginner` is active, its own substeps expand to the right in a horizontal journey.

Branches lay out **left-to-right** from parent position (not downward), so flows read as progressions.

---

## Current Product State (What's Live)

### 1. Generation System

**Input paths:**
- Natural language description (with platform choice)
- Codebase upload (zip analysis and reverse mapping)

**Process:**
- Primary generation: extended thinking mode, rich output
- Fallback 1: compact mode (stricter schema, smaller output)
- Fallback 2: starter scaffold (minimal valid map)

**Output:**
- Normalized `AppMap` with journeys, moments, edges
- Structured `screenSpec` for each moment
- Auto-derived `branchOf` relationships from branch actions
- Auto-filled edges from action targets

**Status visibility:**
- Streaming progress log in UI
- Fallback reasons surfaced as warnings with detail
- Explicit error if stream closes without result

### 2. Visual Canvas

**Features:**
- React Flow–based graph with journey grouping
- Moments as nodes, edges as connections
- Color coding by journey (consistent palette)
- Branch visibility derived from active moment (no manual toggle state)
- Horizontal branch layout (reads left-to-right like a flow)
- Bird's-eye view mode (journey boxes only)
- Journey/Screens/Data Flow view modes
- Minimap, zoom controls, fit-to-selection
- Selection syncs with runtime preview and side panel

**Interaction:**
- Single-click node → select for editing
- Double-click node → fit view to node + neighbors
- Double-click journey group → zoom into that journey
- Click pane → deselect

### 3. Runtime & Preview

**MobileRuntime:**
- Interprets `screenSpec` into real UI
- Holds session state (values persist across navigation)
- Executes actions (`navigate`, `branch`, `back`, `compute`)
- Applies effects (`set-values`, `append-list`)
- Auto-runs AI moments with deterministic stubs in demo mode
- Scales preview to fit container (phone shell or web chrome)

**ReactRuntime:**
- Persistent iframe shell for generated React components
- Falls back to `MobileRuntime` when only `screenSpec` exists
- Handles `mockHtml` for static demo screens (legacy path)
- Message-based navigation sync with canvas

**Component Preview (Panel):**
- Renders generated `componentCode` in sandboxed iframe
- Shows `MobileRuntime` for `screenSpec`-only moments
- Falls back to streaming mock generation when needed

### 4. Editing System

**Scoped Edits:**
- Select moment → describe change in natural language
- Optional scope hints: amounts, headlines, buttons, layout
- Model receives moment context, journey context, graph neighbors, state schema
- Parallel updates: moment metadata + regenerated component/mock

**Downstream Propagation:**
- When edit affects shared state, system flags connected moments
- Background batch refresh updates affected moment descriptions
- User can review first affected screen before accepting changes

**Safety:**
- Session-level revert (restores previous `componentCode` and `screenSpec`)
- Edit overlay prevents double-submission
- Invalid output doesn't replace valid screens

### 5. Build & Share

**Build Pipeline:**
- Generates React components for all top-level moments
- Parallel generation with per-screen status tracking
- Handles partial failures gracefully
- Returns shareable app artifact

**Share:**
- Hosted URL for built app
- Modal with copy link + open in new tab

### 6. Persistence & Projects

- Client-side project storage (Zustand + localStorage)
- Project listing with last-modified sorting
- Active project auto-saves on map/build changes
- Optional backend integration for team/cloud sync

---

## What Momentum Does Differently

### Comparison: Momentum vs. Typical AI Builders

| Dimension | Typical AI Builders | Momentum |
|-----------|---------------------|----------|
| **First generation** | Fast, polished | Fast, structured |
| **Structure visibility** | Hidden in codebase | Visual graph (AppMap) |
| **Edit model** | Re-prompt entire app | Select node, edit that moment |
| **Scope control** | Broad inference | Explicit moment boundaries |
| **Downstream impact** | Discover breakage after | Flagged before commit |
| **Analytics (vision)** | Separate dashboard | On the graph itself |
| **Best for** | Fast prototypes | Sustained iteration |

### Structural Differentiator

The **journey map** is not post-hoc documentation. It's:
- Generated alongside the app
- The contract for editing
- The runtime execution model
- The future analytics surface

Competitors built for monolithic regeneration would need **architectural refoundation** to replicate this, not just UI parity.

---

## Market Positioning

### Category

AI-assisted app builder / intelligent no-code hybrid

### TAM Context

Low-code/no-code market: $13B+ and growing (Gartner, Forrester projections).  
AI coding assistance adoption accelerating across non-technical and technical users.  
Multiple well-funded AI builder competitors validate demand and category growth.

### Target Customers

**Primary:**
- Non-technical founders who think in flows, not code
- Product/design operators prototyping real software
- Indie builders and consultants shipping client tools

**Secondary (future):**
- Small engineering teams needing rapid iteration
- Enterprise teams replacing legacy internal tools

**Shared need:** Change this specific part safely without destabilizing the rest.

### Competitive Landscape

**Direct:**
- Lovable (polished first-gen, prompt-based iteration)
- Bolt (code-forward, full-context edits)
- Replit Agent (codebase generation, chat-based changes)
- Base44 (mobile-first AI builder)

**Adjacent:**
- v0 (component generation, not full apps)
- Cursor/Codeium (code assistants, not builders)
- Traditional no-code (Bubble, Webflow — structured but not AI-native)

**Momentum's wedge:** Graph-native structure that persists across edits, not just faster generation.

---

## Technical Stack

### Core Technologies

**Frontend:**
- Next.js 15 (App Router) — framework
- React 19 — UI library
- TypeScript — type safety
- Tailwind CSS v4 — styling
- `@xyflow/react` (React Flow v12) — canvas
- Zustand — client state
- shadcn/ui patterns — component library

**Backend/APIs:**
- Next.js API routes
- Anthropic SDK — Claude Sonnet 4 for generation/editing
- Vercel (hosting)
- Optional: Supabase (auth, DB, logging when configured)

**Build & Runtime:**
- esbuild (component bundling)
- Babel standalone (browser JSX transform)
- React + ReactDOM CDN (iframe preview)
- Tailwind CDN (preview styling)

### Key Architecture Patterns

**State Management:**
- `AppMap` in Zustand store with localStorage persistence
- Session state in `MobileRuntime` (per-project when configured)
- Separate `activeMomentId` (runtime cursor) and `selectedMomentId` (canvas selection)

**Generation Flow:**
- Streaming SSE from `/api/generate`
- Primary: extended thinking mode (40K tokens, 9K thinking budget)
- Fallback: compact mode (15K tokens, no thinking)
- Last resort: starter scaffold (hardcoded minimal map)
- Client handles final chunk flush to prevent dropped results

**Canvas Architecture:**
- `deriveExpandedBranchAnchor` from `activeMomentId` (no separate toggle state)
- Branch visibility = pure function of active context
- Horizontal layout for all `branchOf` moments
- Journey bounds computed from visible moments
- Node/edge dimming based on selection and branch focus

**Runtime Architecture:**
- Interpreter pattern: `screenSpec` → rendered UI
- Session state initialized from `AppMap.initialState`
- Actions apply effects then navigate
- Sync guard: only update from `startMomentId` when prop actually changes (avoids clobbering internal navigation)

---

## Detailed Feature Breakdown

### A. Prompt-to-Map Generation

**Capabilities:**
- Single natural-language input → full application graph
- Journey inference from description
- Moment boundary detection
- Type assignment (ui/ai/data/auth)
- Auto-layout (journeys on rows, moments spaced 280px)
- Branch relationship inference from conditional patterns
- State schema extraction
- Screen spec generation with real interactive components

**Quality Mechanisms:**
- Extended thinking for complex apps
- Validation pass repairs common issues (missing edges, shallow screens)
- Compact fallback for parse failures
- Explicit error states with retry options

**Example Output:**
- App: "AI fitness coach with workout generation and progress tracking"
- Result: 4 journeys (Onboarding, Daily Workout, Progress, Nutrition), 30 moments, 20 edges
- Includes: branch paths for fitness levels, AI workout generator, nutrition suggestions
- State schema: user profile, plan settings, workout history, nutrition log

### B. Visual Canvas

**Layout Intelligence:**
- Journeys as color-coded grouped regions
- Moments positioned to avoid overlaps
- Branch moments hidden until parent is active
- All branches flow horizontally from parent (left-to-right readability)
- Cross-journey edges shown with distinct styling

**View Modes:**
1. **Overview** — Journey boxes only (bird's eye)
2. **Journey** — Compact moment cards in journey frames
3. **Screens** — Full moment details + edge labels
4. **Data Flow** — Maximum detail + data flow annotations

**Interaction Details:**
- Selection state separate from active runtime cursor
- Auto-pan to active moment when runtime navigates
- Fit view on node click when it has branches (shows parent + branch column)
- Hint overlay explains controls contextually

**Branch Visibility Logic:**
- If active moment has branches → show those branches
- If active moment is under a branch → show that branch's siblings
- Siblings along ancestry path stay visible for context
- Pure derivation (no manual toggle that can desync)

### C. Runtime Execution

**Interpreter Pattern:**
- Executes `screenSpec` directly (no codegen step)
- Session state holds all `{{templated}}` values
- Components render with resolved templates
- Actions enforce `requiredKeys` before enabling
- Effects write state before navigation
- Branch actions choose target based on state value
- Back navigation uses history stack

**Component Rendering:**
- Choice cards, chip groups, inputs write state on interaction
- Stats grids, summary cards, notices display templated values
- Hero components support badges, alignment, body text
- Spacers for layout control

**Action Execution:**
- `navigate` → go to target moment
- `branch` → read `branchKey` state, match against branches, navigate to matched target (or fallback)
- `back` → pop history, navigate to previous moment
- `compute` → evaluate JS formulas using state as variables, write results, then navigate

**State Management:**
- Schema-driven initialization (defaultValues from `stateSchema`)
- Template resolution with dot-path support (`{{profile.name}}`)
- Array operations (`append-list` for activity tracking)
- Effects chain (can set multiple values in one action)

**AI Moment Handling:**
- Auto-trigger on navigation if `type === 'ai'` and `promptTemplate` exists
- Demo mode: instant deterministic stubs (no API call)
- Production mode: POST to `/api/run-moment` with template + current state
- Response written to `responseKey` in state
- Subsequent screens can display `{{responseKey}}` in notices/cards

### D. Editing & Iteration

**Moment-Scoped Edit Flow:**

1. User selects moment on canvas
2. Panel opens with preview + edit interface
3. User describes change ("make the button green", "add a progress bar")
4. Optional scope chips narrow focus (amounts, headlines, buttons, layout)
5. Client sends: moment, change text, journey context, graph neighbors, state schema
6. Model receives digest of current implementation + request
7. Model returns: updated metadata + new component/mock
8. Client validates output (prevents blank screens)
9. Moment updates, preview refreshes
10. If edit touched shared state, downstream moments flagged

**Scope Chips:**
- **Amounts:** steer model to change numbers, prices, quantities only
- **Headlines:** focus on titles, subtitles, labels
- **Buttons:** target CTAs, action labels, navigation text
- **Layout:** adjust spacing, ordering, grouping

**Downstream Propagation:**
- System detects when edit changes state keys referenced by other moments
- Affected moments marked with amber flag + reason
- Background batch can refresh those moments' descriptions/previews
- User can review first affected moment before accepting
- Option to skip propagation if change is cosmetic

**Safety Features:**
- Session undo buffer (one-level revert)
- Loading overlay prevents double-submission
- Edit input disabled while processing
- Keyboard shortcut (⌘+Enter) for fast apply

### E. Build & Share

**Build Pipeline:**
- Generates React component for each moment
- Uses moment context, journey context, neighbors, state schema
- Parallel generation (all moments at once)
- Per-moment status tracking (building/done/error)
- Streaming SSE with progress updates
- Partial success handling (some moments build, some fail)

**Component Generation Prompt Pattern:**
- App description and platform
- State schema with current values
- Moment type, label, description, screenSpec
- Incoming/outgoing edges (navigation context)
- All other screens in journey (architectural consistency)
- Theme color derived from app description

**Share Output:**
- Hosted static app (all screens bundled)
- Shareable URL
- Copy link + open in new tab
- Modal with completion celebration

---

## Competitive Deep Dive

### Lovable

**Strengths:**
- Extremely polished first output
- Fast iteration loop
- Strong design quality

**Weakness Momentum targets:**
- No persistent flow structure
- Re-prompts touch broad surfaces
- Hard to scope changes to specific screens

### Bolt (StackBlitz)

**Strengths:**
- Full codebase ownership
- Real code editing
- Live preview

**Weakness Momentum targets:**
- Code-first (harder for non-technical users)
- No visual flow map
- Scoping requires manual file/function targeting

### Replit Agent

**Strengths:**
- Integrated environment
- Chat-based iteration

**Weakness Momentum targets:**
- No visual structure for flows
- Changes still inferred from chat context
- Hard to isolate "this screen only"

### Base44

**Strengths:**
- Mobile-first
- Fast generation

**Weakness Momentum targets:**
- Limited structural visibility
- Iteration model still prompt-based

### Traditional No-Code (Bubble, Webflow)

**Strengths:**
- Explicit structure
- Visual editing

**Weakness Momentum targets:**
- Not AI-native (manual assembly)
- Steeper learning curve
- Slower iteration speed

---

## Strategic Moat

### Short-Term Defensibility

1. **Systems integration** — Canvas, runtime, editing, and build all share `AppMap` contract
2. **Iteration data** — Early proof of scoped edit reliability builds brand trust
3. **User muscle memory** — Once teams learn graph-based iteration, switching cost is high

### Long-Term Defensibility

1. **Intelligence layer** — Analytics that resolve to moments/edges (not generic events) creates lock-in
2. **Execution depth** — As runtime matures to production-grade, switching means losing the deployment model
3. **Network effects** — Teams sharing maps, templates, and journey patterns

### Why This Is Hard to Replicate

Competitors optimized for monolithic regeneration would need to:
- Redesign generation to produce durable structure
- Build graph-aware editing systems
- Couple runtime behavior to that same graph
- Retrofit analytics to map back to nodes

That's not a UI feature. It's an architectural re-foundation.

---

## Go-to-Market Strategy

### Phase 1 — Product-Market Fit (Current)

**Target:**
- Early adopters who feel iteration pain acutely
- Non-technical founders
- Design/product operators

**Channels:**
- Product Hunt launch
- Twitter/X (builder communities)
- Direct outreach to YC/indie hacker communities
- Content: "How to iterate on AI-built apps without breaking everything"

**Success Metrics:**
- 100 active projects
- 5+ edits per retained user
- 30% build/share conversion
- Positive qualitative feedback on iteration confidence

### Phase 2 — Growth (6-12 months)

**Target:**
- Small teams (2-5 people)
- Agencies building client tools
- Internal tool builders at scale-ups

**Channels:**
- SEO (comparison content vs. Lovable/Bolt)
- Partnerships with design tools
- Team plan launch

**Success Metrics:**
- 1K+ active projects
- 20% month-over-month growth
- Team tier adoption
- Repeat usage (D7/D30 retention)

### Phase 3 — Scale (12-24 months)

**Target:**
- Enterprise internal tools
- Product teams at mid-size companies

**Channels:**
- Enterprise sales
- Integration partnerships
- Graph-native analytics as differentiator

**Success Metrics:**
- Enterprise deals
- Map-linked intelligence proving value
- Expansion revenue from analytics tier

---

## Business Model Detail

### Pricing Structure (Directional)

**Free Tier:**
- 3 map generations/month
- 10 edits/month
- 1 active project
- Public sharing only

**Builder Tier ($24/month):**
- Unlimited generations
- Unlimited edits
- 10 active projects
- Build & share
- Revision history (7 days)

**Team Tier ($79/month, 3 seats):**
- All Builder features
- Collaboration (shared projects)
- 30-day revision history
- Priority support
- Team analytics dashboard

**Enterprise (Custom):**
- All Team features
- Graph-native behavior analytics
- SSO, SAML
- Dedicated deployment environments
- SLA + support
- Custom integrations

### Revenue Levers

1. **Iteration volume** — More edits = more value
2. **Collaboration** — Teams pay for shared maps
3. **Analytics** — Graph-native intelligence commands premium
4. **Deployment** — Production runtime features drive enterprise deals

### Unit Economics (Estimates)

**Costs per user/month:**
- API costs (Claude): ~$3-8 depending on usage
- Hosting: ~$0.50-2
- Infrastructure: ~$1

**Target margin:** 70%+ at scale

**CAC target:** <$100 (PLG motion)  
**Payback period:** <3 months

---

## Key Metrics & Goals

### Product Metrics

| Metric | Current Target | Why It Matters |
|--------|----------------|----------------|
| Generation success rate | >85% | Core UX quality |
| Time to first valid map | <10s | Activation friction |
| Edits per active project | >5 | Iteration depth proof |
| Build/share conversion | >20% | Intent to distribute |
| D7 retention | >40% | Stickiness signal |
| D30 retention | >25% | Long-term value |

### Business Metrics (Future)

| Metric | Target (Year 1) | Target (Year 2) |
|--------|-----------------|-----------------|
| Active users | 1K | 10K |
| Paying users | 100 | 1K |
| MRR | $5K | $50K |
| Churn | <10%/mo | <7%/mo |

---

## Roadmap (Execution Detail)

### Q2 2026 — Core Reliability

**Priorities:**
- Fix remaining SSE/stream bugs
- Harden scoped edit reliability
- Improve generation output quality
- Add basic map editing (add/delete/rewire moments)

**Success criteria:**
- 90%+ generation success rate
- Zero false "success" states with empty maps
- Demo fully clickable without hacks

### Q3 2026 — Team Features

**Priorities:**
- Multi-project collaboration
- Revision history (30-day)
- Better persistence (cloud sync option)
- Team plan launch

**Success criteria:**
- 10+ teams on Team tier
- 50%+ D7 retention
- Positive NPS from early teams

### Q4 2026 — Runtime Depth

**Priorities:**
- Production auth integrations
- Database/backend patterns
- Stronger deployment path
- Performance optimization

**Success criteria:**
- 5+ production apps running on Momentum runtime
- <100ms action latency
- Deployment reliability >99%

### 2027 — Intelligence Layer

**Priorities:**
- Instrumentation for behavior tracking
- Graph-native analytics dashboard
- Drop-off/friction mapping to moments
- Suggested fixes on flagged nodes

**Success criteria:**
- Analytics tier launched
- 3+ enterprise customers using intelligence features
- Proof that graph-native analytics drives retention

---

## Open Strategic Questions

### Product

1. Should we support code export or stay interpreter-only?
2. What's the right balance between constrained reliability and generation freedom?
3. How much backend/infra should we own vs. integrate?

### Market

1. Is the wedge "non-technical founders" or "small teams iterating fast"?
2. Do we compete directly with Lovable or position as complementary?
3. What's the right enterprise entry point (internal tools, agency partners)?

### Execution

1. What team size can ship runtime depth + intelligence in 12 months?
2. Should we fundraise now or build to revenue first?
3. What level of polish is required for Team tier launch?

---

## Risk Assessment

### Product Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Generation quality variance | High | High | Validation passes, fallback modes, user testing |
| Graph/runtime desync bugs | Medium | High | Robust sync guards, integration tests |
| Edit scope creep (model touches too much) | Medium | Medium | Better prompting, scope validation |
| Runtime performance at scale | Low | Medium | Profiling, caching, lazy loading |

### Market Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Incumbent adds structure | Medium | High | Speed to intelligence layer, brand trust |
| Market shifts to code-first | Low | Medium | Add export path, hybrid model |
| User expectation mismatch | Medium | Medium | Clear messaging, better onboarding |

### Execution Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Team bandwidth for roadmap | Medium | High | Ruthless prioritization, fundraise if needed |
| API cost scaling | Low | Medium | Caching, tiered usage limits |
| Quality bar too high for velocity | Medium | Low | Ship iterations, validate with users |

---

## Success Definition

Momentum succeeds when:

1. **Users trust iteration** — 5+ scoped edits per retained project
2. **Structure proves valuable** — Graph visibility drives feature adoption
3. **Runtime becomes real** — Production apps run on Momentum
4. **Intelligence closes loop** — Behavior → graph → targeted fix

If we achieve those, the business outcomes follow.

---

## Messaging Framework

### Elevator Pitch (30 seconds)

"Momentum is an AI app builder designed for iteration. One prompt generates your app and a visual map of every flow. Instead of re-prompting the whole app and hoping nothing breaks, you click a node and edit just that screen. The map keeps every change scoped and safe as your product grows."

### Problem Statement

"AI builders are great at first drafts. When you want to change something later, you re-prompt and the model touches everything. Three screens break. You fix those, something else drifts. Iteration feels like gambling."

### Solution Statement

"Momentum gives every screen and flow an address on a graph. Edits target that address. The map shows what connects, what depends on what, and what stays safe. You iterate with confidence instead of guessing."

### Differentiation

"Other AI builders optimize for generation speed. Momentum optimizes for safe, repeated editing. The graph is the difference."

### Vision Statement

"Over time, the graph becomes where you build, run, debug, and learn from user behavior — all in one place. Structure, execution, and intelligence share one model."

---

## Team & Roles (Ideal State)

**Now (solo founder):**
- Full-stack product development
- Strategy and positioning

**Next hire (when fundraising closes):**
- Senior full-stack engineer (runtime depth + quality)

**6-month team:**
- Founder (product, strategy)
- Senior engineer (runtime, infra)
- Design/product engineer (canvas, editing UX)
- Optional: growth/marketing

**12-month team:**
- Add: backend specialist (if we own infrastructure)
- Add: data engineer (intelligence layer)
- Add: growth lead

---

## Appendix: Technical Debt & Known Issues

### Current Tech Debt

1. **SSE stream handling** — Fixed recently, needs monitoring
2. **Canvas performance** — Slows with >50 moments (needs virtualization)
3. **Edit propagation** — Downstream refresh is separate flow (should be atomic)
4. **State schema conflicts** — Manual resolution required when edits change field types
5. **Mobile responsiveness** — Canvas requires desktop (not in V1 scope)

### Prioritized for Q2

- Canvas virtualization
- Atomic edit propagation
- Schema conflict resolution UI

### Deferred

- Mobile canvas support
- Offline mode
- Advanced graph algorithms (auto-layout optimization)

---

## Appendix: Reference Links

- **Demo:** [momentai.app/app?demo=true](https://momentai.app/app?demo=true) (Pulse fitness coach, 30 moments, fully interactive)
- **Repo:** github.com/AviLPA/momentai (private)
- **Stack:** Next.js + React Flow + Anthropic
- **Related docs:** `PRD.md` Part I (strategic source of truth), Part II (execution spec), `INVESTOR_ONEPAGER.md` (fundraising), `VISION_TECH.md` (long-term invariants)

---

*Strategy and scope: `PRD.md` Part I. Full product + technical narrative: this document.*
