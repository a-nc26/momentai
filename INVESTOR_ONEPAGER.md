# Momentum — Investor One Pager

**Updated:** April 11, 2026  
**Strategic source of truth:** `PRD.md` Part I

---

## The Opportunity

AI app builders are a proven, fast-growing category. Multiple well-funded companies (Lovable, Bolt, Replit) have validated demand and shown strong revenue growth.

**The gap:** No-code tools abstract away architecture, so users **cannot see** what they are changing — leading to blind prompting, ripple effects, and environments that feel "very complex and annoying" (consistent theme across **30 user interviews** in thesis research). Full-code AI IDEs demand a fluency many product-minded builders do not have.

**Momentum's wedge:** **Architectural building** — not no-code, not a full IDE. From one prompt, generate an **interactive architecture map** (screens, flows, data) *and* a runnable app. Edits target specific nodes with context instead of re-rolling everything.

---

## Problem

**User pain:**
"I asked to fix the signup flow. Now three other screens are broken. I don't know what changed or how to undo it."

**Why it happens:**

- Models see undifferentiated code/UI blobs
- No stable structure for "this screen" or "this flow"
- Every edit is broad inference
- Unintended changes accumulate

**Market evidence:**

- Documented pattern: projects stall at 10-15+ screens
- Users cite "iteration unpredictability" as blocker
- Retention drops as app complexity grows

---

## Solution

From one prompt, Momentum produces:

1. **Runnable app** — real navigation, state, branching
2. **AppMap** — visual graph (journeys, moments, edges)

The graph becomes the edit surface:

- Click node → describe change → update that moment
- System knows dependencies, flags affected screens
- Downstream impact transparent before commit

**Result:** Scoped, explainable, safer iteration.

---

## Product State (April 2026)

**Shipped:**

- Prompt/codebase → `AppMap` generation (streaming, fallbacks, error transparency)
- Visual canvas (journeys, moments, horizontal branch layout)
- Interactive runtime (tap through flows, real state, branching)
- Scoped moment edits with downstream awareness
- Build & share (component generation, hosted output)

**Demo:**
Pulse fitness coach — 30 moments, 4 journeys, fully clickable (onboarding → plan selection → workout tracking → progress/nutrition).

**Not built yet:**

- Advanced map editing (add/delete/rewire in UI)
- Production runtime (auth, data, deployment infra)
- Graph-native analytics (behavior → nodes)

---

## Traction & Proof

**Current state:**

- Working product with end-to-end generation → editing → build loop
- Architecture supports roadmap (runtime + intelligence layers)
- Demo validates core UX (graph-based iteration)

**Next proof points:**

- 100 active projects
- 30%+ retention among users who make 5+ edits
- Qualitative feedback: "I can change things without fear"

---

## Market Size

**TAM (Total Addressable Market):**

- Low-code/no-code: $13B+ (Gartner 2026)
- Developer tools: $30B+ (IDC 2026)
- AI coding assistance: rapidly expanding segment

**SAM (Serviceable Addressable):**

- Non-technical builders: ~5M globally
- Product/design operators: ~3M
- Small teams (<10): ~50M businesses

**SOM (Serviceable Obtainable, Year 3):**

- 50K active users (0.1% of non-technical builders)
- 5K paying ($24/mo avg): **$1.4M ARR**
- 200 teams ($79/mo avg): **$190K ARR**
- 10 enterprise ($2K/mo avg): **$240K ARR**
- **Total Year 3 target: ~$1.8M ARR**

---

## Competitive Position


| Dimension         | Lovable | Bolt | Momentum      |
| ----------------- | ------- | ---- | ------------- |
| First-gen polish  | ★★★     | ★★☆  | ★★☆           |
| Visual structure  | ☆☆☆     | ☆☆☆  | ★★★           |
| Scoped editing    | ☆☆☆     | ★☆☆  | ★★★           |
| Non-tech friendly | ★★★     | ★☆☆  | ★★★           |
| Runtime depth     | ★★☆     | ★★☆  | ★☆☆ (roadmap) |
| Analytics         | ☆☆☆     | ☆☆☆  | ☆☆☆ (vision)  |


**Momentum's moat:** Graph-native structure that persists across generation, editing, runtime, and future intelligence.

---

## Business Model

### Revenue Model

**Tiers:**

- Free: 3 gens/mo, 10 edits, 1 project
- Builder ($24/mo): unlimited, 10 projects, build/share
- Team ($79/mo/3 seats): collaboration, analytics, history
- Enterprise (custom): SSO, dedicated env, graph intelligence

**Key drivers:**

- Iteration volume (not just generation count)
- Team collaboration (shared maps)
- Analytics tier (when intelligence ships)

### Economics

**Unit economics (mature state):**

- COGS: $5-10/user/mo (API + hosting)
- Target margin: 70%+
- CAC: <$100 (PLG)
- Payback: <3 months

**Path to $1M ARR:**

- 3.5K Builder users @ $24/mo = $84K MRR
- OR 1K Team seats @ $26/mo avg = $26K MRR + enterprise
- OR mix: 2K Builder + 400 Team seats + 5 enterprise = ~$80K MRR

Achievable in 12-18 months with strong product-market fit.

---

## Why This Defends

### Technical Moat

`AppMap` is the platform contract. To replicate:

- Redesign generation for durable structure
- Build graph-aware editing
- Couple runtime to same graph
- Retrofit analytics to nodes

That's 12+ months of architectural work, not a feature sprint.

### Data Moat (Future)

When intelligence layer ships:

- Behavior data maps to moments/edges
- Teams build muscle memory on graph-based optimization
- Switching means losing behavioral context tied to their flows

### Network Effects (Long-term)

- Shared journey templates
- Community patterns for common flows
- Ecosystem of map-compatible integrations

---

## Risks

### Product Risks

**Generation quality variance**

- Mitigation: Validation passes, fallback modes, better prompting

**Scoped edit reliability**

- Mitigation: Extensive testing, user feedback loop, revert safety

**Runtime complexity**

- Mitigation: Start constrained, expand incrementally, hybrid model option

### Market Risks

**Incumbents add structure**

- Mitigation: Speed to intelligence layer, brand as "iteration-first"

**Expectations mismatch**

- Mitigation: Clear positioning, better onboarding, demo clarity

**Switching cost to code ownership**

- Mitigation: Code export path in roadmap

### Execution Risks

**Team bandwidth**

- Mitigation: Ruthless prioritization, fundraise for key hires

**API cost scaling**

- Mitigation: Caching, tiered limits, volume discounts

---

## The Ask

**Raising:** **$350,000 pre-seed** (aligned with `PRD.md` Part I)

**Use of funds:**

- Hire founding team: technical co-founder + engineers to execute V1 → V2 (interactive map, node-level editing, layer navigation, then build mode at architectural depth)
- Runway for product iteration and continued validation with architectural-builder segment
- Infrastructure: API costs, hosting, tools

**Milestones with funding:**

- Ship polished map + node-level editing + layer navigation (V1 scope per PRD)
- Progress toward build mode and broader editing (V2)
- Traction and retention metrics as defined in PRD success metrics (e.g., strong qualitative "would use this," quantitative targets as the business layer matures)

**Exit paths:**

- Strategic acquisition (design tools, dev platforms, collaboration suites)
- Standalone revenue growth to profitability
- Series A at $2-5M ARR with proven intelligence moat

---

## Why Now

1. **Demand validated** — AI builder category growing fast, multiple competitors raising/scaling
2. **Pain is real** — Iteration reliability is the next frontier after generation speed
3. **Technical feasibility** — LLMs can generate structure + code reliably now
4. **Window is open** — Incumbents optimized for monolithic regen; retrofitting structure is hard

---

## Founder

**Avi** (full-stack founder, product + engineering)

- Built V1 end-to-end (generation, canvas, runtime, editing, build)
- Prior: [relevant background if applicable]
- Thesis: iteration confidence > generation speed

---

## What We've Built (Proof Points)

- Working product: generation → canvas → runtime → editing → build
- Pulse demo: 30-moment interactive fitness app, fully clickable
- Architecture supports roadmap (runtime maturity + intelligence)
- Clean separation: map model, execution layer, future analytics layer

**Key technical wins:**

- Streaming generation with fallback transparency
- Horizontal branch layout (reads like a flow, not clutter)
- Runtime that executes from graph (not just mocks)
- Scoped editing with downstream awareness

---

## Traction Plan (Next 6 Months)

**Month 1-2:**

- Product Hunt launch
- 100 sign-ups, 30 active projects
- Feedback loop on iteration UX

**Month 3-4:**

- Team tier launch
- 5 paying teams
- Content: comparison posts, iteration case studies

**Month 5-6:**

- Intelligence layer alpha
- Proof: behavior → graph → fix
- Early enterprise conversations

---

## Comps & Valuation Context

**Public comps:**

- Figma: $20B (Adobe acquisition) — design collaboration
- Webflow: $4B (2024) — visual web builder
- Bubble: $100M ARR (est.) — no-code platform

**Private comps:**

- Lovable: raising at $XXM (unconfirmed)
- Bolt: YC-backed, strong traction
- Replit: $1B+ valuation (broader IDE play)

**Momentum positioning:**

- Earlier stage, smaller TAM capture initially
- Structural differentiation (graph-native)
- Long-term moat from intelligence layer

**Valuation:** Terms TBD; round size and use of funds per `**PRD.md` Part I** ($350K pre-seed to hire founding team).

---

*Strategic scope: `PRD.md` Part I. Full product detail: `MASTERDOC.md`. Technical vision: `VISION_TECH.md`.*