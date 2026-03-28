# Momentum Technical Vision
**Date:** March 14, 2026  
**Purpose:** Product and engineering source of truth for the long-term system

## 1. Product Thesis

Momentum is an app builder where the primary artifact is not just generated UI or generated code. The primary artifact is a **living application map**.

The first prompt should produce two things at once:

1. A runnable app
2. A structured map of the journeys and moments that make the app work

The map is the key product insight. It gives every part of the app an address, so edits can be scoped to a specific moment instead of re-prompting an undifferentiated whole.

## 2. Core Product Promise

Momentum should let a builder:

1. Describe a product in plain language
2. Receive a visual map of the product's flows
3. Click any node in that map to inspect, edit, and launch that part of the app
4. Apply natural-language changes to a specific moment
5. See the running app update in a controlled, explainable way
6. Eventually connect live user behavior back to the exact nodes that need attention

The long-term promise is:

`Prompt -> map -> runnable app -> targeted edits -> live learning -> targeted fixes`

## 3. Product Layers

### Layer 1: Canvas

The Canvas is the authoring surface.

Responsibilities:

- Visualize journeys, moments, and edges
- Show branching structure
- Provide a stable place to inspect specific moments
- Let the user edit flows without touching raw code
- Eventually become the control surface for analytics and debugging

The Canvas is not documentation. It is the operating interface for the app.

### Layer 2: Runtime

The Runtime executes the map as a real application.

Responsibilities:

- Interpret structured screen definitions
- Hold session/app state
- Execute navigation and branching
- Run auth/data/AI behaviors in a safe, deterministic way in early versions
- Eventually support real backend bindings and production deployment

Important distinction:

- **Current v1 reality:** mobile-first, stateful prototype runtime with deterministic stub behavior
- **Long-term vision:** production-grade runtime or code-export system that can serve real users

### Layer 3: Intelligence

The Intelligence Layer connects observed behavior back to the map.

Responsibilities:

- Track behavior at the moment and journey level
- Surface friction, drop-off, and abnormal flow behavior on the map itself
- Help the user identify what to change next
- Eventually propose edits, experiments, and safe refactors

## 4. System Model

Momentum is built around a structured app graph.

### Core domain objects

#### Journey

A named user flow.

Examples:

- Onboarding
- Add Expense
- Checkout
- Track Progress

#### Moment

A single node in a journey. A moment is the smallest editable unit in the product.

A moment can represent:

- A screen or form
- An auth step
- An AI-powered step
- A data operation

Current types:

- `ui`
- `auth`
- `ai`
- `data`

#### Edge

A directed connection between moments.

Edges express:

- Sequential progression
- Branching paths
- Cross-journey movement
- Labeled transitions

#### AppMap

The canonical product structure.

It contains:

- app metadata
- journeys
- moments
- edges
- runtime metadata

In the long-term architecture, `AppMap` is not just a canvas artifact. It is the contract between generation, editing, runtime, and intelligence.

## 5. Current v1 Architecture

Momentum now has an early but real mobile runtime path.

### Current v1 scope

- Mobile-first only
- Canvas stays as the primary map UI
- Each moment can contain a structured `screenSpec`
- `Launch App` runs a real React-based runtime, not just HTML iframes
- State is held in a session store
- Auth/data/AI moments are still prototype-safe and deterministic
- Natural-language edits can patch structured runtime data

### Current runtime primitives

App-level runtime fields:

- `runtimeVersion`
- `stateSchema`
- `initialState`

Moment-level runtime fields:

- `screenSpec`
- `actions`
- `components`

Supported v1 components:

- `hero`
- `input`
- `choice-cards`
- `chip-group`
- `notice`
- `summary-card`
- `stats-grid`
- `list`
- `spacer`

Supported v1 actions:

- `navigate`
- `branch`
- `back`

This is intentionally constrained. The goal is not arbitrary generation. The goal is a reliable executable prototype system.

## 6. Why The Structured Runtime Matters

The old HTML-mock path was useful for visual prototyping, but it could not deliver the real product promise.

Problems with HTML-only generation:

- interactions are not trustworthy
- state does not persist meaningfully
- buttons require brittle click-guessing
- downstream screens cannot reliably reflect prior user choices
- edits mostly regenerate presentation, not app behavior

The structured runtime fixes that by making nodes executable.

Instead of:

- node -> HTML mock

Momentum should be:

- node -> structured screen definition + state dependencies + actions + transitions

That makes it possible for the app to actually run from the graph.

## 7. Long-Term Technical Architecture

The full platform can be thought of as five systems.

### 7.1 Generation System

Input:

- plain-language app description

Output:

- normalized `AppMap`
- journeys
- moments
- edges
- runtime schema
- screen specs

Responsibilities:

- infer journeys
- infer moment boundaries
- assign types
- generate layout
- generate runnable runtime specs
- normalize unsupported output into a safe schema

### 7.2 Runtime Compiler / Interpreter

Input:

- `AppMap`

Output:

- runnable application session

Responsibilities:

- initialize state
- resolve current moment
- render the active screen
- enforce action rules
- apply effects
- branch on state
- preserve navigation history

Two possible long-term models:

1. **Interpreter model**
   - runtime renders directly from spec
   - easier editing, safer constraints, faster iteration

2. **Codegen model**
   - runtime exports a true codebase
   - better for deployment, extension, and ownership

Recommended path:

- v1/v2: interpreter-first
- later: exportable codegen on top of the same graph model

### 7.3 Edit System

Input:

- selected moment
- current graph context
- natural-language edit request

Output:

- patch to moment
- optional graph rewiring
- optional app-level runtime schema changes
- optional downstream impact list

Responsibilities:

- scope edits correctly
- preserve graph integrity
- flag downstream moments affected by shared state changes
- avoid unnecessary global rewrites

This system is one of the hardest product differentiators. The user should feel they are editing with a scalpel, not re-rolling the whole app.

### 7.4 Deployment / Launch System

Responsibilities:

- run app inside Momentum
- share runnable prototype links
- eventually deploy generated projects externally
- preserve a stable mapping between deployed behavior and the graph revision that produced it

Near-term versions can launch a runtime snapshot from the current map. Later versions can create full app deployments.

### 7.5 Intelligence System

Responsibilities:

- instrument runtime events
- map behavior to moments and edges
- store funnel and interaction data
- surface drop-off, loops, rage-clicks, and low-conversion transitions
- support AI-assisted diagnosis and suggested fixes

The key design rule:

Analytics should resolve back to moments and journeys, not only to pages or generic events.

## 8. Editing Philosophy

Momentum should not promise magic global correctness. It should promise:

- local editability
- explicit impact awareness
- constrained execution
- understandable propagation

This means:

- some edits affect only one node
- some edits must update downstream nodes
- some edits require rewiring edges
- some edits require app-level state changes

The system should explain which case happened and why.

## 9. Runtime Maturity Model

### V1: Stateful prototype runtime

Goal:

- make the graph executable

Characteristics:

- mobile-first
- session-only state
- deterministic auth/data/AI stubs
- constrained component/action schema
- launch from current map snapshot
- edits update the running prototype

### V2: Shareable runtime

Goal:

- make prototypes testable by other people

Characteristics:

- stable share links
- persisted drafts and revisions
- richer state and entity modeling
- stronger branch support
- cleaner edit propagation

### V3: Production path

Goal:

- move from executable prototype to deployable app system

Characteristics:

- backend/data integrations
- external deployment targets
- code export or hybrid runtime/codegen model
- environment management
- auth providers
- stronger observability and rollback

### V4: Intelligence-native builder

Goal:

- make the map the place where product learning happens

Characteristics:

- node-level analytics
- suggested fixes
- experiment workflows
- AI debugging on specific moments, transitions, or prompts

## 10. Technical Constraints

Momentum should stay honest about its current limits.

Current constraints:

- mobile-first only
- constrained UI schema
- limited action vocabulary
- no true backend persistence in runtime session
- no production deployment pipeline yet
- no real analytics instrumentation yet

These are not product failures. They are scope boundaries that protect execution quality while the core architecture hardens.

## 11. What Must Stay True

Regardless of implementation path, the following must remain true:

1. The map is the central artifact.
2. Every important piece of behavior should have an address on the map.
3. Editing should feel scoped and explainable.
4. Runtime behavior should resolve back to graph structure.
5. Analytics should attach to moments and journeys, not float outside the system.
6. The product should reduce the fear of changing AI-built software.

## 12. Strategic Positioning

Momentum is not just:

- an AI builder
- a no-code tool
- a prototype generator
- a graph editor
- an analytics dashboard

Momentum is a **graph-native application builder**.

Its wedge is not "faster generation."

Its wedge is:

`AI-generated software that remains editable because its structure stays visible and executable.`

## 13. Open Technical Questions

These are the real engineering questions still worth tracking:

1. How accurate can journey inference become across ambiguous prompts?
2. How much of the product should stay interpreter-based versus codegen-based?
3. How should AI moments be represented when they need real prompt-segment editing?
4. What is the right persistence model for revisions, launches, and user sessions?
5. How should real backend integrations map onto moments without breaking the graph abstraction?
6. What is the cleanest event model for Intelligence so analytics remain graph-native?

## 14. Short Version

Momentum should become the system where:

- the app is generated
- the map is generated with it
- the map runs the app
- the map is where the app is edited
- the map is where user behavior is understood

That is the full vision.
