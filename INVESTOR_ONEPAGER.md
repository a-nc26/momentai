# Momentum — Investor one-pager

**Product:** Graph-native AI app builder  
**Last updated:** March 2026

---

## Thesis

AI builders are great at the **first** version and weak at **everything after**: re-prompts touch unrelated parts because the model has no stable notion of “this screen” or “this flow.” Momentum’s answer is structural: the first prompt produces a **runnable app** and a **journey map** (graph of screens, flows, and branches). Every screen is a **named node**. Edits target that node so changes stay scoped instead of destabilizing the whole project.

**In one line:** Other tools generate software; Momentum is built so that software stays **editable** as it grows.

---

## Problem

Prompt-only builders collapse to a single undifferentiated output. As apps grow, users see **context loss**, inconsistent patterns, and changes that break unrelated behavior. Retention and iteration suffer; many projects stall at prototype stage. The market has proven demand for AI-assisted building; the unresolved pain is **controlled iteration**, not first-shot generation.

---

## Solution

1. **AppMap** — A single structured model: journeys, moments (typed steps), edges, shared state, and optional branch relationships.  
2. **Canvas** — The map is the authoring surface: inspect flows, expand branches, edit by node.  
3. **Scoped edits** — Natural-language changes apply to the selected moment; downstream impact can be surfaced explicitly.  
4. **Runtime** — Screen specs and generated components run as interactive previews; shareable builds for demos.

**Differentiation vs. Lovable-class tools:** A native flow map and moment addresses, not only a faster codegen loop.

---

## Product status (snapshot)

- Describe product or upload codebase → **AppMap** generation with streaming feedback.  
- **Visual canvas** (journeys, moments, branches with layout that avoids overlap when branches expand).  
- **Per-moment** preview, regenerate, and natural-language edit.  
- **Build** pipeline generates per-screen UI components (parallel generation).  
- Projects persist locally; optional logging/admin hooks where configured.

**Roadmap direction:** Deeper production runtime (auth, data, deployment), then **map-linked behavior** (which node loses users, where to fix first) as a long-term moat.

---

## Market & positioning

AI-assisted builders and adjacent low-code markets are large and growing quickly; several well-funded products have scaled revenue fast, which validates demand. Momentum does not compete on “first screenshot” alone; it competes on **iteration under structure** for founders, PMs, designers, and small teams who ship flows, not files.

---

## Business model (directional)

Aligned with category norms: free / limited tier, builder subscription, team tier, eventual enterprise for production features and (later) analytics on the map. Longer term, map-native insights are a natural **team and enterprise** upsell.

---

## Why this can compound

The **map is the product contract**: generation, editing, and future instrumentation can attach to the same graph. Competitors optimized for monolithic re-prompting would need a structural rethink to replicate that—not a single UI feature.

---

## Risk & execution focus

- **Incumbents** have distribution; wedge must stay crisp (who iterates on flows, not files).  
- **Output quality** must stay competitive with best-in-class first-gen polish.  
- **Proof** comes from repeat editing, retention, and willingness to pay for scoped change and sharing.

---

*This document summarizes the full narrative in `MASTERDOC.md` for quick investor and advisor sharing.*
