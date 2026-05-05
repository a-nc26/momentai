# Mid-Code AI Architecture Mapping Tool — Product Requirements Document

**Public product name:** TBD (working title: *Architectural Building Tool*)  
**Codebase / materials:** Momentum  
**Version:** 2.2  
**Updated:** April 11, 2026  
**Status:** Part I = strategic source of truth · Part II = active execution spec

---

## Part I — Strategic product definition (source of truth)

**Author:** AITOOL LU  
**Date:** April 11, 2026

### 1. Overview

**Problem statement:** No-code tools (Bubble, Lovable, Bolt) are too abstracted — users lose control. Full-code AI tools (Cursor) require deep technical knowledge. There is an underserved **middle segment** of builders who:

- Understand architecture, APIs, and product structure
- Want more control than no-code offers
- Lack the fluency to prompt AI coding tools effectively

This leads to frustration: prompting endlessly, getting unexpected changes, and losing visibility into what's being built.

**Solution:** A **visual architecture mapping tool** that lets users prompt an idea, receive an interactive map of their product's architecture, and make precise, contextual edits — at the screen, flow, and data layer level. This is **not no-code** — it is **architectural building**: designing and editing at the system and UX level, not just the UI.

---

### 2. Target audience

**Primary user: "Architectural Builder"**

- Understands product architecture and APIs
- Has a clear vision of what they want to build
- Cannot yet use AI coding tools (e.g., Cursor) effectively
- Frustrated by the lack of precision in no-code tools
- Wants to build architecture, not just screens

---

### 3. Goals and success metrics

| Goal | Metric |
|------|--------|
| Validate pain point | 30 user interviews confirm frustration with no-code precision |
| MVP adoption | Users engage with demo map and provide feedback |
| Pre-seed funding | Raise $350,000 to hire founding team |
| Product-market fit | Users say "I would absolutely use this" |

---

### 4. Product scope — what it is NOT

- Not a replacement for Bolt, Lovable, or Bubble
- Not a full AI coding IDE
- Not a no-code tool — targets architectural builders who need system-level control
- Targets a distinct user segment from all existing categories

---

### 5. The prompting gap: why no-code falls short

#### 5.1 The blind prompting problem

- No-code users describe what they want but have **no visibility into the underlying architecture**
- Without seeing the structure, they cannot give the AI proper context
- The AI makes assumptions — often wrong — leading to unexpected or broken changes
- This creates a **"prompt and pray" cycle**: prompt → something random changes → prompt again to fix → repeat indefinitely

#### 5.2 Complexity compounds over time

- As the product grows, the environment becomes **increasingly complex and unmanageable**
- Small prompt changes trigger **unintended ripple effects** across the product
- Users lose track of what's connected to what — because they never had architectural visibility to begin with
- This was a consistent finding across **30 user interviews**: builders described their no-code environments as "very complex and annoying"

#### 5.3 The root cause

The issue is not that users need to *code* — it's that they need to **speak to the AI more precisely**. But without seeing the architecture, they have no frame of reference to do so. They are giving vague instructions to a system they cannot see.

- No-code tools focus on **UI changes** (what it looks like) but ignore **UX changes** (how it works and flows)
- Users can select a box to edit, but cannot navigate the underlying journey or data flow
- The result: builders are stuck at the surface, unable to go deeper

#### 5.4 What this tool fixes

By surfacing the architecture as an interactive map, users can:

- **Point to exactly what they want changed** rather than describing it vaguely
- **Give the AI more context** by working within a specific node, flow, or data moment
- Move from *"change this thing"* → *"change this specific node, in this specific flow, at this specific point in the user journey"*
- Edit the **AI prompt itself** at the node level, test it, and iterate with precision

---

### 6. Core features

#### V1 — MVP (current)

**6.1 Prompt-to-map**

- User inputs a product idea via text prompt
- System generates a **visual architecture map**
- Map includes branching user journeys (e.g., Beginner / Intermediate / Advanced paths)

**6.2 Interactive map canvas**

- Zoom in/out for varying levels of detail
- Three navigable layers:
  - **Screens layer** — UI screens
  - **Flows layer** — User journey flows with branching logic
  - **Data layer** — Data passed between components/services
- Nodes are clickable for inspection and editing
- Branching prevents overcrowding; only relevant nodes shown per journey path

**6.3 Node-level editing**

- Click any node to edit it directly
- View and modify the AI prompt associated with that node
- Test changes in context
- Enables micro-adjustments without re-prompting the entire product

#### V2 — expansion

**6.4 Build mode**

- Evolve from architecture mapping → active building tool
- Reminiscent of no-code tools but with architecture-level control
- Support both:
  - **Direct node editing** (individual moment)
  - **General/global editing** (broader scope)

---

### 7. User flow

```
User inputs idea (prompt)
        ↓
System generates architecture map
        ↓
User navigates layers (Screens / Flows / Data)
        ↓
User clicks into specific node
        ↓
User edits node or modifies associated AI prompt
        ↓
User tests change in context
        ↓
Iterates until architecture reflects intent
```

---

### 8. Key differentiators

| Feature | No-code (Bolt/Lovable) | AI code (Cursor) | This tool |
|---------|------------------------|------------------|-----------|
| Requires coding knowledge | No | Yes | No |
| Architecture visibility | No | Partial | Yes |
| Node-level precision editing | No | No | Yes |
| UX flow mapping | No | No | Yes |
| Data flow visibility | No | Partial | Yes |
| Prompt-to-map | No | No | Yes |
| Contextual AI prompt editing | No | No | Yes |

---

### 9. Risks and open questions

| Risk | Notes |
|------|-------|
| **Feature vs. product** | Could be perceived as a feature of existing tools. Still unresolved. |
| **Competitive threat** | Lovable/Bolt could replicate this. Mitigation: move fast, build moat through UX precision and community. |
| **Technical feasibility** | Interactive map with live node editing is possible but requires a strong technical team to execute. Addressed via funding. |
| **Solo founder bandwidth** | Not sustainable without a team. Addressed via $350K pre-seed raise. |
| **Pricing model** | TBD — not yet determined. |

---

### 10. Go-to-market strategy

- **Primary approach:** Targeted conversations with major builders in the space
- **Positioning:** Architectural building tool — distinct from no-code, distinct from AI coding IDEs
- **Validation base:** 30 user interviews from thesis research showing strong intent to use
- Full GTM strategy in development

---

### 11. Research and validation

- **30 user interviews** conducted as part of thesis on no-code tools
- Common pain point: tools create overly complex, hard-to-manage environments
- Strong positive signal: interviewees expressed clear willingness to use this product
- Founder is an active no-code builder with firsthand experience of the problem

---

### 12. Team and advisers

| Role | Status |
|------|--------|
| Founder | Active (solo) |
| Senior Software Developer & AI Specialist (Meta/Facebook) | Adviser |
| Startup founder (scaled to $500K ARR in 1 year) | Adviser |
| Experienced operator (scaled multiple companies) | Unofficial adviser |
| Technical co-founder | **Needed** |

---

### 13. Funding

**Ask:** $350,000 pre-seed  
**Use of funds:** Hire founding team (technical co-founder + engineers) to build out V1 → V2  
**Pricing model:** TBD

---

### 14. Roadmap

| Phase | Focus |
|-------|-------|
| **Now** | MVP demo map, user validation, funding conversations |
| **V1** | Polished interactive map, node editing, layer navigation, initial user acquisition |
| **V2** | Build mode, expanded editing capabilities, architectural building at scale |

**Terminology note:** In the implementation (Part II), *screens* map to **moments**, *flows* to **journeys**, and the **data layer** to shared **state** and data-type moments — see `MASTERDOC.md`.

---

## Part II — Implementation and execution specification

Part I is the strategic source of truth for positioning, audience, and roadmap. Part II translates that into shipped behavior, acceptance criteria, and technical requirements for the **Momentum** codebase.

**Related documents**

- Vision and invariants: `VISION_TECH.md`
- Canonical product narrative (team, investors, LLM context): `MASTERDOC.md`
- Positioning and fundraising one-pager: `INVESTOR_ONEPAGER.md`

### Document purpose (engineering)

This part of the PRD defines:

- What we are building in code (maps, canvas, runtime, edits)
- What is in scope vs. out of scope for releases
- Acceptance criteria for releases
- Technical requirements and constraints

---

## Product Goal

Enable builders to generate, navigate, and iteratively edit applications through a visual graph where each change is scoped to a specific moment.

**Success means:**
- First map generates reliably from any reasonable prompt
- Runtime is actually clickable (not just pretty screenshots)
- Users can edit one moment without breaking unrelated flows
- Teams return to make 5+ scoped edits per project

---

## Scope Boundaries

### In Scope (Current Cycle)

**P0 (Must Have):**
- ✅ Prompt/codebase → `AppMap` generation
- ✅ Visual canvas with journey/moment/edge rendering
- ✅ Branch visibility and horizontal layout
- ✅ Interactive runtime from `screenSpec`
- ✅ Moment-scoped natural-language edits
- ✅ Build & share path
- ✅ Generation fallback transparency
- ✅ SSE stream reliability (no dropped results)

**P1 (Should Have):**
- ⏳ Add/delete moments in canvas UI
- ⏳ Rewire edges visually
- ⏳ Project revision history
- ⏳ Better error recovery UX
- ⏳ Canvas performance optimization (>50 moments)

**P2 (Nice to Have):**
- Journey renaming
- Bulk operations (multi-select)
- Keyboard shortcuts for common actions
- Export `AppMap` JSON

### Explicitly Out of Scope

- Multi-tenant billing implementation
- Production enterprise deployment platform
- Full analytics/intelligence productization
- Mobile canvas support (desktop-first for V1)
- Real-time collaboration (later)

---

## User Stories

### Core Loop (P0)

**US-1:** As a builder, I want to describe my app in plain language so I receive a complete flow map without manual assembly.

**US-2:** As a builder, I want to click any moment on the canvas so I can see that screen's preview and details.

**US-3:** As a builder, I want to describe a change to a specific moment so only that screen updates (nothing else breaks).

**US-4:** As a builder, I want to click through the runtime preview so I can validate flows feel real (not just static mocks).

**US-5:** As a builder, I want to build and share my app so others can test it immediately.

### Extended Loop (P1)

**US-6:** As a builder, I want to add a new moment to an existing journey so I can extend flows without re-generating the whole map.

**US-7:** As a builder, I want to see which moments are affected by my edit so I understand downstream impact before committing.

**US-8:** As a builder, I want to revert my last edit so I can recover from mistakes safely.

**US-9:** As a builder, I want to see generation failures clearly so I know whether to retry or adjust my prompt.

### Team Features (P2)

**US-10:** As a team member, I want to collaborate on shared maps so we can iterate together.

**US-11:** As a team, we want revision history so we can review changes over time.

---

## Functional Requirements

### Generation (GEN)

**GEN-1 (P0):** System MUST accept natural-language description and return valid `AppMap` with journeys, moments, edges.

**GEN-2 (P0):** Generation MUST stream progress to UI with status messages (thinking, parsing, validating).

**GEN-3 (P0):** If primary generation fails, system MUST surface failure reason before attempting fallback.

**GEN-4 (P0):** If SSE stream closes without `result` event and without `error` event, UI MUST show explicit failure (no false success).

**GEN-5 (P1):** Generated maps SHOULD include branch moments for conditional flows (success/failure, choice variants).

**GEN-6 (P1):** System SHOULD infer state schema from description (profile fields, preferences, activity logs).

**GEN-7 (P1):** Codebase upload path MUST analyze structure and produce equivalent `AppMap`.

---

### Canvas (CAN)

**CAN-1 (P0):** Canvas MUST render journeys as color-coded grouped regions.

**CAN-2 (P0):** Canvas MUST render moments as nodes with type badges, labels, descriptions.

**CAN-3 (P0):** Canvas MUST render edges as connections between moments with optional labels.

**CAN-4 (P0):** Branch moments MUST be hidden by default and revealed when parent or child becomes active.

**CAN-5 (P0):** All moments with `branchOf` MUST lay out horizontally to the right of their parent (not downward).

**CAN-6 (P0):** Canvas selection (click) MUST sync with active runtime moment.

**CAN-7 (P0):** Active runtime moment MUST auto-pan canvas to that node.

**CAN-8 (P1):** Canvas SHOULD support node drag repositioning (persisted for session).

**CAN-9 (P1):** Canvas SHOULD handle >50 moments without performance degradation.

**CAN-10 (P2):** Canvas SHOULD support zoom-to-fit gestures (pinch, scroll, controls).

---

### Runtime (RT)

**RT-1 (P0):** Runtime MUST execute `screenSpec` actions (`navigate`, `branch`, `back`, `compute`).

**RT-2 (P0):** Buttons in runtime preview MUST navigate successfully (not dead clicks).

**RT-3 (P0):** Internal runtime navigation MUST NOT be overwritten by stale prop sync.

**RT-4 (P0):** Preview column MUST appear when any moment has `screenSpec`, `componentCode`, or `mockHtml`.

**RT-5 (P0):** State values MUST persist across navigation within a session.

**RT-6 (P0):** Template resolution (`{{stateKey}}`) MUST work in all component text fields.

**RT-7 (P1):** Runtime SHOULD validate required keys before enabling actions.

**RT-8 (P1):** AI moments SHOULD auto-trigger when navigated to (in demo mode: instant stubs; production: API call).

**RT-9 (P2):** Runtime SHOULD support session persistence across page refresh.

---

### Editing (ED)

**ED-1 (P0):** User MUST be able to select a moment and apply natural-language edit scoped to that moment.

**ED-2 (P0):** Edit MUST update moment metadata and regenerate component/preview.

**ED-3 (P0):** If edit affects shared state, system MUST flag downstream moments.

**ED-4 (P0):** User MUST be able to revert last edit (session-level undo).

**ED-5 (P0):** Edit operation MUST NOT block unrelated preview interactions (no global lock).

**ED-6 (P1):** Edit scope hints (amounts, headlines, buttons) SHOULD steer model focus effectively.

**ED-7 (P1):** Downstream propagation SHOULD offer batch refresh of affected moments.

**ED-8 (P1):** User SHOULD see which moments were affected and why.

**ED-9 (P2):** System SHOULD support multi-level undo/redo.

---

### Build & Share (BLD)

**BLD-1 (P0):** Build MUST generate components for all top-level moments.

**BLD-2 (P0):** Build MUST return per-moment status (building/done/error).

**BLD-3 (P0):** Build MUST handle partial failures gracefully (some moments succeed, some fail).

**BLD-4 (P0):** Share link MUST be available after build completes.

**BLD-5 (P1):** Build output SHOULD be cached to avoid regenerating unchanged moments.

**BLD-6 (P2):** Share SHOULD support custom domains.

---

## Non-Functional Requirements

### Performance

- **NFR-P1:** Initial map generation target: <10s for typical app (5-10 journeys, 20-40 moments)
- **NFR-P2:** Moment edit target: <8s for metadata + component regeneration
- **NFR-P3:** Build target: <15s for 10 moments, <60s for 50 moments (parallel generation)
- **NFR-P4:** Canvas render: <200ms for maps with <100 moments
- **NFR-P5:** Runtime action latency: <100ms for navigate/branch actions

### Reliability

- **NFR-R1:** Generation success rate MUST be >85% (primary + fallbacks combined)
- **NFR-R2:** Invalid output MUST NEVER replace valid screens
- **NFR-R3:** SSE streams MUST process final chunks (no dropped results)
- **NFR-R4:** Runtime navigation MUST succeed >99% of time in demo/validated flows

### Security

- **NFR-S1:** Anthropic API key MUST NEVER be exposed to client
- **NFR-S2:** Preview iframes MUST run in sandbox (`allow-scripts` only when safe)
- **NFR-S3:** User-generated content MUST be sanitized before rendering
- **NFR-S4:** Shareable app links MUST NOT leak project data to unintended recipients

### Usability

- **NFR-U1:** Generation progress MUST be visible within 1s of submission
- **NFR-U2:** Errors MUST include actionable next steps (retry, adjust prompt, contact support)
- **NFR-U3:** Keyboard shortcuts MUST work for common actions (⌘+Enter to submit, ESC to close)
- **NFR-U4:** Canvas MUST provide contextual hints (e.g. "Click screen to edit, double-click to fit")

### Scalability

- **NFR-SC1:** System MUST handle maps with 100+ moments (future)
- **NFR-SC2:** API costs MUST stay <$10/user/month at steady-state usage
- **NFR-SC3:** Frontend bundle MUST stay <500KB (initial load)

---

## Acceptance Criteria (Release Gates)

### Alpha Release (Internal Testing)

- ✅ Generate map from prompt
- ✅ Canvas renders journeys/moments/edges
- ✅ Click node → see preview
- ✅ Edit moment → only that node updates
- ✅ Demo is fully clickable

### Beta Release (Limited Users)

- ⏳ Generation success rate >80%
- ⏳ No silent failures (explicit error states)
- ⏳ Scoped edits work reliably (>90% success)
- ⏳ Build produces shareable link
- ⏳ User can create/save/load projects

### Public Launch (V1.0)

- Map editing (add/delete/rewire moments)
- Revision history (7-day minimum)
- Team collaboration baseline
- Generation success >85%
- Paying customers (Builder tier)
- D7 retention >30%

---

## Technical Architecture Detail

### System Components

```
┌─────────────────────────────────────────┐
│          User Interface Layer           │
│  (Canvas, Panel, PromptScreen, Runtime) │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Application State Layer         │
│     (Zustand Store, Local Persist)      │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│           API Routes Layer              │
│   (Generate, Edit, Build, Propagate)    │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         AI Services Layer               │
│      (Anthropic Claude Sonnet 4)        │
└─────────────────────────────────────────┘
```

### Data Flow: Generation

```
User enters description
  ↓
POST /api/generate
  ↓
Primary: streamThinkingCall (40K tokens, 9K thinking)
  ├─ Success → parseGeneratedMap → validateAndRepair → return AppMap
  └─ Failure → log error, emit warning event
  ↓
Fallback: streamBasicCall (15K tokens, no thinking)
  ├─ Success → parseGeneratedMap → return AppMap
  └─ Failure → log error, emit warning event
  ↓
Last resort: buildStarterAppMap (hardcoded scaffold)
  ↓
Normalize AppMap (derive branchOf, auto-fill edges, normalize specs)
  ↓
Send result event over SSE
  ↓
Client receives, calls setAppMap
  ↓
Canvas renders, runtime initializes
```

### Data Flow: Editing

```
User selects moment on canvas
  ↓
Panel opens, shows preview
  ↓
User types change ("make button green")
  ↓
Optional: select scope chip (buttons)
  ↓
POST /api/edit-moment {moment, change, journey, appMap}
  ↓
Build digest: moment context, graph neighbors, state schema
  ↓
Claude call (parallel: metadata + component)
  ├─ Metadata: updated label, description, preview
  └─ Component: regenerated code or screenSpec
  ↓
Check for downstream impact (shared state changes)
  ├─ If yes → flag affected moments, return list
  └─ If no → return updated moment only
  ↓
Client updates moment in store
  ↓
Preview refreshes
  ↓
If flagged moments exist → show amber badges, offer batch refresh
```

### Data Flow: Runtime Execution

```
MobileRuntime initializes
  ↓
Create session from AppMap.initialState
  ↓
Resolve current moment's screenSpec
  ↓
Render components (hero, inputs, cards, stats, etc.)
  ↓
Render actions (buttons at bottom)
  ↓
User taps button
  ↓
Check isActionEnabled (requiredKeys filled?)
  ├─ No → button disabled
  └─ Yes → continue
  ↓
Apply effects (set-values, append-list)
  ↓
Resolve target (navigate: direct, branch: conditional, back: history, compute: formula eval)
  ↓
Update session.currentMomentId
  ↓
Call onMomentChange → sync canvas activeMomentId
  ↓
Re-render with new moment's screenSpec
```

---

## Key Requirements (Detailed)

### Generation Requirements

**GEN-REQ-1: Input Flexibility**
- Accept 10-1000 word descriptions
- Support platform choice (mobile/web)
- Handle vague prompts with reasonable defaults
- Gracefully handle overly complex descriptions

**GEN-REQ-2: Output Quality**
- 2-5 journeys per app
- 5-10 moments per journey
- Realistic edge connections (no orphaned moments)
- Valid `screenSpec` for every moment (real components, not just descriptions)
- At least 1-2 branch points per app (real apps have conditional flows)

**GEN-REQ-3: Error Handling**
- Primary failure → show warning with error detail
- Compact failure → show warning with error detail
- Stream interrupt → show error
- No result received → show error (not silent success)

**GEN-REQ-4: Performance**
- Progress visible within 1s
- Status updates every 2-3s during generation
- Total time <15s for typical app (elastic based on complexity)

### Canvas Requirements

**CAN-REQ-1: Rendering**
- Journey groups with headers (name, screen count, color)
- Moment nodes with type icons, labels, truncated descriptions
- Edges with optional labels
- Build status indicators (building/done/error badges)

**CAN-REQ-2: Layout**
- Journeys on separate horizontal rows (avoid vertical stacking)
- Moments within journey spaced 280px apart
- Branch moments lay out horizontally from parent position
- Journey bounds adjust to visible moments (expand when branches show)

**CAN-REQ-3: Interaction**
- Click node → select, open panel
- Double-click node → fit view
- Click pane → deselect
- Drag node → reposition (persisted for session)
- View mode buttons → switch between overview/journey/screens/dataflow

**CAN-REQ-4: State Sync**
- `selectedMomentId` = user-selected node (canvas click, panel select)
- `activeMomentId` = runtime cursor (where preview currently is)
- Both can differ (user selecting while runtime is elsewhere)
- Canvas auto-pans to `activeMomentId` when it changes (unless change came from canvas click)

### Runtime Requirements

**RT-REQ-1: Component Support**
- All defined component types render correctly
- Template resolution works (`{{key}}`, `{{key.subfield}}`, `{{array.length}}`)
- State updates from user interaction (input onChange, choice selection)

**RT-REQ-2: Action Support**
- `navigate` → changes `currentMomentId`, adds to history
- `branch` → reads `branchKey` state, finds matching branch, navigates (or fallback)
- `back` → pops history, navigates to previous
- `compute` → evaluates formulas, writes results, then navigates

**RT-REQ-3: Effects Support**
- `set-values` → batch write to state
- `append-list` → push item to array state
- Effects apply before navigation

**RT-REQ-4: State Management**
- Initialize from `AppMap.initialState`
- Merge with `stateSchema` defaults
- Persist across navigation (within session)
- Template values update reactively

**RT-REQ-5: Sync Safety**
- Prop `startMomentId` updates → sync session only when prop actually changed
- Internal navigation → do NOT reset session
- `onMomentChange` callback → notify parent for canvas sync

### Editing Requirements

**ED-REQ-1: Scope**
- Edit applies to selected moment only (not whole app)
- Model receives: moment, change text, journey context, graph neighbors, state schema
- Model returns: updated moment fields + new component

**ED-REQ-2: Scope Hints**
- User can select: amounts, headlines, buttons, layout
- Scope prefix added to change text
- Model focuses on that aspect only

**ED-REQ-3: Validation**
- Check output has minimum required fields
- Prevent invalid HTML/code from replacing valid screens
- Show error if generation fails

**ED-REQ-4: Downstream Detection**
- Compare before/after state keys referenced in moment
- Flag moments that depend on changed keys
- Return affected moment IDs + reasons

**ED-REQ-5: Propagation**
- Batch refresh affected moments' descriptions
- User can review first affected moment
- Show count of updated screens

**ED-REQ-6: Safety**
- Session undo: store snapshot before edit
- Revert button restores previous `componentCode` and `screenSpec`
- Loading overlay prevents double-submit

### Build Requirements

**BLD-REQ-1: Generation**
- Generate React component for each top-level moment (excludes `parentMomentId` submomentsments)
- Include moment context, journey, state schema
- Parallel generation (all moments concurrently)
- Stream status per moment

**BLD-REQ-2: Status Tracking**
- Per-moment status: idle → building → done/error
- Progress counter (N/total completed)
- Graceful partial failure (continue on errors)

**BLD-REQ-3: Output**
- Shareable hosted URL
- Modal with copy link
- Open in new tab option

---

## Technical Constraints

### Current Limitations

**Platform:**
- Desktop-first (canvas requires >1280px width)
- Mobile canvas not supported

**Runtime:**
- Mobile and web shells only
- Constrained component vocabulary
- No real backend/data/auth (prototype stubs only)

**Editing:**
- Single-user (no real-time collaboration)
- One-level undo only
- Downstream propagation is manual batch (not atomic)

**Deployment:**
- Static builds only (no live runtime deployment yet)
- Shareable links expire after 30 days (current implementation)

### Known Technical Debt

1. **Canvas virtualization** — Slows at >50 moments (needs viewport culling)
2. **Edit atomicity** — Downstream refresh is separate from edit commit
3. **State schema conflicts** — Changing field type mid-project requires manual resolution
4. **SSE error recovery** — Better retry/resume logic needed
5. **Component generation prompt size** — Can hit token limits for very complex moments

### Prioritized Fixes (Q2 2026)

- Canvas virtualization (viewport-based rendering)
- Atomic edit + propagation
- Schema conflict resolution UI
- Better SSE error recovery

---

## Milestones & Timeline

### Milestone 1 — Stable Core (Current → April 2026)

**Goals:**
- ✅ Generation works reliably
- ✅ Canvas renders correctly
- ✅ Runtime is clickable
- ✅ Edits are scoped
- ✅ Build produces output

**Acceptance:**
- All P0 requirements met
- Demo fully functional
- Ready for limited alpha users

### Milestone 2 — Team-Ready (May-June 2026)

**Goals:**
- Map editing controls (add/delete/rewire)
- Project revision history
- Better collaboration baseline
- Performance optimization

**Acceptance:**
- 10+ active teams
- D7 retention >35%
- Positive qualitative feedback on iteration UX

**Deliverables:**
- Add/delete moment UI
- Edge editing controls
- Revision history (7-day minimum)
- Canvas performance fixes

### Milestone 3 — Production Surface (Q3-Q4 2026)

**Goals:**
- Deeper runtime maturity
- Backend integration patterns
- Deployment controls
- Enterprise features baseline

**Acceptance:**
- 5+ apps running in production on Momentum
- Team tier launched
- Enterprise pilot customers

**Deliverables:**
- Auth provider integrations
- Database/API connection patterns
- Environment management
- SSO support

### Milestone 4 — Intelligence Layer (2027)

**Goals:**
- Behavior tracking instrumentation
- Graph-native analytics
- Suggested fixes on flagged nodes

**Acceptance:**
- Analytics tier launched
- 3+ enterprise customers using intelligence
- Proof that graph-native insights drive retention

**Deliverables:**
- Event instrumentation SDK
- Moment-level funnel analytics
- Drop-off/friction detection
- AI-suggested fixes on nodes

---

## Testing Strategy

### Unit Testing

- `lib/runtime.ts` — action application, template resolution, state management
- `lib/canvasLayout.ts` — branch visibility, positioning logic
- Generation output validation

### Integration Testing

- Full generation flow (prompt → AppMap → canvas render)
- Edit flow (select → change → update → refresh)
- Build flow (AppMap → components → share link)
- Runtime flow (navigate → branch → back → compute)

### E2E Testing

- User can generate map, click through runtime, edit moment, verify change
- User can generate map, build, share, recipient can use app
- User can edit moment with downstream impact, verify flags appear, refresh works

### Performance Testing

- Canvas render time with 50, 100, 200 moments
- Generation latency across various prompt complexities
- Build time for 10, 25, 50 moments
- Memory usage during long editing sessions

---

## Dependency Map

### External Dependencies

- Anthropic API (Claude Sonnet 4) — generation, editing, building
- Vercel (hosting) — deployment, serverless functions
- React Flow — canvas rendering
- Optional: Supabase (auth, DB, logging)

### Internal Dependencies

- `lib/types.ts` — AppMap schema (contract across all systems)
- `lib/runtime.ts` — state, actions, screen resolution (used by runtime + editing)
- `lib/store.ts` — client state (used by all UI components)
- `lib/canvasLayout.ts` — positioning (used by canvas)

### Critical Paths

**Generation → Canvas:**
- `/api/generate` → `AppMap` → `setAppMap` → canvas renders

**Canvas → Runtime:**
- `activeMomentId` → `MobileRuntime.startMomentId` → session update

**Runtime → Canvas:**
- Runtime navigation → `onMomentChange` → `setActiveMomentId` → canvas pans

**Editing → Preview:**
- `/api/edit-moment` → updated moment → `setMomentComponentCode` → preview refreshes

---

## Success Metrics (Detailed)

### Product Health

| Metric | Target | Measurement |
|--------|--------|-------------|
| Generation success rate | >85% | (primary success + fallback success) / total attempts |
| Time to first valid map | <10s | p50 latency from submit to result event |
| Edits per active project | >5 | Median edits in projects with >1 edit |
| Build/share conversion | >20% | % of projects that trigger build |
| Scoped edit success rate | >90% | % of edits that complete without error |

### User Engagement

| Metric | Target | Measurement |
|--------|--------|-------------|
| Activation rate | >60% | % of sign-ups who generate first map |
| D1 retention | >50% | % who return next day |
| D7 retention | >30% | % who return within week |
| D30 retention | >20% | % who return within month |
| Weekly active editing | >40% | % of retained users who edit each week |

### Business (Future)

| Metric | Year 1 Target | Year 2 Target |
|--------|---------------|---------------|
| Active users | 1,000 | 10,000 |
| Paying users | 100 | 1,000 |
| MRR | $5K | $50K |
| Monthly churn | <10% | <7% |
| NPS | >40 | >50 |

---

## Open Questions & Decisions Needed

### Product

1. **Code export vs. interpreter-only?**  
   - Export gives ownership, interpreter gives reliability
   - Decision: Start interpreter, add export later

2. **How much backend should we own?**  
   - Option A: Full stack (auth, DB, deploy)
   - Option B: Integrations only (Supabase, Firebase, etc.)
   - Leaning: Start with integrations, own critical paths later

3. **What's the right polish bar for Team tier?**  
   - Ship fast and iterate, or wait for higher quality?
   - Decision: Ship when core loop is reliable (not pixel-perfect)

### Market

1. **Primary ICP: founders or teams?**  
   - Founders = faster PMF, lower ACV
   - Teams = slower PMF, higher ACV
   - Leaning: Start with founders, expand to teams

2. **Positioning: complementary or competitive to Lovable?**  
   - Complementary = smaller fight, slower growth
   - Competitive = clearer wedge, faster growth
   - Leaning: Competitive on iteration, complementary on first-gen quality

### Execution

1. **Fundraise now or bootstrap?**  
   - Fundraise = faster execution, dilution
   - Bootstrap = control, slower
   - Decision: Raise **$350K pre-seed** (Part I) for founding team (technical co-founder + engineers)

2. **Team size for runtime + intelligence in 12 months?**  
   - Minimum: 3 (founder + 2 engineers)
   - Ideal: 5 (founder + 2 eng + design + growth)

---

*Part I is the strategic source of truth. Part II is the execution spec. For vision invariants, see `VISION_TECH.md`. For fundraising one-pager, see `INVESTOR_ONEPAGER.md`. For full narrative, see `MASTERDOC.md`.*
