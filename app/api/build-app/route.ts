import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { put } from '@vercel/blob';
import { AppMap } from '@/lib/types';

const client = new Anthropic();

function buildPrompt(appMap: AppMap): string {
  const momentsSummary = appMap.moments.map((m) => {
    const actions = m.screenSpec?.actions?.map((a) =>
      `  - "${a.label}" (${a.kind}${a.target ? ` → ${a.target}` : ''}${a.branchKey ? `, branch on ${a.branchKey}` : ''})`
    ).join('\n') ?? '';
    const components = m.screenSpec?.components?.map((c) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cc = c as any;
      return `  - ${c.type}${cc.label ? `: "${cc.label}"` : ''}${cc.title ? ` title="${cc.title}"` : ''}${cc.placeholder ? ` placeholder="${cc.placeholder}"` : ''}${cc.stateKey ? ` stateKey=${cc.stateKey}` : ''}`;
    }).join('\n') ?? '';
    return `### Moment: ${m.id}
Label: ${m.label}
Journey: ${appMap.journeys.find((j) => j.id === m.journeyId)?.name ?? m.journeyId}
Type: ${m.type}
Description: ${m.description}
Preview: ${m.preview}
Screen title: ${m.screenSpec?.title ?? m.label}
Screen subtitle: ${m.screenSpec?.subtitle ?? ''}
Components:
${components || '  (none)'}
Actions:
${actions || '  (none)'}`;
  }).join('\n\n');

  const edgesSummary = appMap.edges.map((e) =>
    `${e.source} → ${e.target}`
  ).join('\n');

  const stateFields = (appMap.stateSchema ?? []).map((f) =>
    `  ${f.key} (${f.type}, default: ${JSON.stringify(f.defaultValue ?? '')})`
  ).join('\n');

  // Derive accent color from app description/name for visual identity
  const desc = (appMap.appDescription + ' ' + appMap.appName).toLowerCase();
  let accentHex = '#6366f1'; // default indigo
  let accentLight = '#eef2ff';
  let accentBorder = '#c7d2fe';
  let accentDark = '#4f46e5';
  if (desc.match(/finance|money|invest|budget|expense|bank|wealth|saving|mortgage|loan|real.?estate|home.buy/)) {
    accentHex = '#10b981'; accentLight = '#ecfdf5'; accentBorder = '#a7f3d0'; accentDark = '#059669';
  } else if (desc.match(/health|fitness|workout|gym|nutrition|diet|wellness|run|exercise|sport/)) {
    accentHex = '#8b5cf6'; accentLight = '#f5f3ff'; accentBorder = '#ddd6fe'; accentDark = '#7c3aed';
  } else if (desc.match(/food|cook|recipe|restaurant|meal|eat|delivery|grocery/)) {
    accentHex = '#f97316'; accentLight = '#fff7ed'; accentBorder = '#fed7aa'; accentDark = '#ea580c';
  } else if (desc.match(/travel|trip|hotel|flight|vacation|booking|destination/)) {
    accentHex = '#0ea5e9'; accentLight = '#f0f9ff'; accentBorder = '#bae6fd'; accentDark = '#0284c7';
  } else if (desc.match(/social|friend|chat|community|network|dating|connect/)) {
    accentHex = '#ec4899'; accentLight = '#fdf2f8'; accentBorder = '#fbcfe8'; accentDark = '#db2777';
  } else if (desc.match(/learn|course|education|study|school|quiz|skill/)) {
    accentHex = '#f59e0b'; accentLight = '#fffbeb'; accentBorder = '#fde68a'; accentDark = '#d97706';
  }

  return `You are building a BEAUTIFUL, production-quality single-page app as one self-contained HTML file. The quality bar is Stripe, Linear, or Lovable — not a bootstrap template. Every screen must look like it was designed by a professional product designer.

APP: ${appMap.appName}
DESCRIPTION: ${appMap.appDescription}
ACCENT COLOR: ${accentHex} (use this as your primary/brand color throughout)

STATE FIELDS:
${stateFields || '  (none)'}

NAVIGATION GRAPH (edges):
${edgesSummary}

SCREENS:
${momentsSummary}

---

TECHNICAL REQUIREMENTS:

1. **Single HTML file** — Tailwind CDN v3 (https://cdn.tailwindcss.com), vanilla JS, no React/Vue
2. **Every screen** is a <div class="screen" id="screen-{momentId}"> (display:none by default, shown via showScreen())
3. **State object** — JS object 'state' holds all values; inputs/selections write to state on change
4. **Navigation** — showScreen(id) hides all screens, shows target, sends postMessage, saves to localStorage
5. **Branching** — branch actions evaluate state[branchKey] against branch values, navigate to matching target
6. **Templating** — replace {{key}} in any text with state[key] value
7. **Required keys** — primary buttons are disabled until all requiredKeys in state are non-empty
8. **postMessage sync** — in showScreen(id): add \`if(window.parent!==window)window.parent.postMessage({type:'screenChanged',momentId:id},'*');\`
9. **postMessage listener** — \`window.addEventListener('message',function(e){if(e.data&&e.data.type==='navigate'&&e.data.momentId)showScreen(e.data.momentId);});\`
10. **localStorage** — persist state on every change, restore on load
11. Start screen: ${appMap.moments[0]?.id ?? ''}

---

DESIGN SYSTEM — FOLLOW EXACTLY:

**CSS Variables** — set these in <style> in <head>:
\`\`\`
:root {
  --accent: ${accentHex};
  --accent-light: ${accentLight};
  --accent-border: ${accentBorder};
  --accent-dark: ${accentDark};
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
\`\`\`

**App shell** — full-height, subtle gradient background:
\`\`\`html
<body style="background: linear-gradient(135deg, ${accentLight} 0%, #f9fafb 60%, #ffffff 100%); min-height:100vh;">
  <div style="max-width:390px;margin:0 auto;min-height:100vh;position:relative;background:white;box-shadow:0 0 40px rgba(0,0,0,0.08);">
    <!-- screens go here -->
  </div>
</body>
\`\`\`

**Screen layout:**
\`\`\`html
<div class="screen" id="screen-{id}" style="display:none;min-height:100vh;display:flex;flex-direction:column;">
  <!-- optional progress bar at top -->
  <!-- scrollable content area -->
  <div style="flex:1;overflow-y:auto;padding:24px 20px 100px;">
    <!-- content -->
  </div>
  <!-- fixed action button area -->
  <div style="position:sticky;bottom:0;padding:16px 20px 28px;background:linear-gradient(transparent,white 30%);z-index:10;">
    <!-- primary button -->
  </div>
</div>
\`\`\`

**Progress bar** (when a screen has progress info):
\`\`\`html
<div style="padding:16px 20px 0;">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
    <span style="font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--accent)">Step X of Y</span>
    <button onclick="goBack()" style="font-size:13px;color:#9ca3af;background:none;border:none;cursor:pointer;">✕</button>
  </div>
  <div style="height:3px;background:#f3f4f6;border-radius:2px;">
    <div style="height:3px;width:X%;background:var(--accent);border-radius:2px;transition:width 0.4s ease;"></div>
  </div>
</div>
\`\`\`

**Hero component:**
\`\`\`html
<div style="padding:32px 0 24px;">
  <h1 style="font-size:28px;font-weight:800;color:#111827;line-height:1.2;letter-spacing:-0.02em;margin:0 0 10px;">{title}</h1>
  <p style="font-size:15px;color:#6b7280;line-height:1.6;margin:0;">{body}</p>
</div>
\`\`\`

**Input component:**
\`\`\`html
<div style="margin-bottom:16px;">
  <label style="display:block;font-size:13px;font-weight:600;color:#374151;margin-bottom:6px;">{label}</label>
  <input type="text" placeholder="{placeholder}"
    style="width:100%;padding:13px 15px;border:1.5px solid #e5e7eb;border-radius:12px;font-size:15px;color:#111827;background:white;outline:none;box-sizing:border-box;transition:border-color 0.15s;"
    onfocus="this.style.borderColor='var(--accent)'"
    onblur="this.style.borderColor='#e5e7eb'"
    onchange="state['{key}']=this.value;saveState();updateButtons();" />
</div>
\`\`\`

**Choice-cards component** (REQUIRED for any selection — never use plain radio buttons):
\`\`\`html
<div style="margin-bottom:20px;">
  <p style="font-size:13px;font-weight:600;color:#374151;margin:0 0 10px;">{label}</p>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
    <!-- For each option: -->
    <div onclick="selectChoice('{key}', '{value}', this, {isMulti})"
      style="border:2px solid #e5e7eb;border-radius:14px;padding:14px 12px;cursor:pointer;transition:all 0.15s;background:white;text-align:center;">
      <div style="font-size:22px;margin-bottom:6px;">{icon or emoji}</div>
      <div style="font-size:13px;font-weight:600;color:#111827;">{label}</div>
      <div style="font-size:11px;color:#9ca3af;margin-top:2px;">{description if any}</div>
    </div>
  </div>
</div>
\`\`\`
JS for selectChoice:
\`\`\`js
function selectChoice(key, value, el, isMulti) {
  if (isMulti) {
    if (!Array.isArray(state[key])) state[key] = [];
    const idx = state[key].indexOf(value);
    if (idx > -1) { state[key].splice(idx, 1); el.style.borderColor='#e5e7eb'; el.style.background='white'; el.style.color='#111827'; }
    else { state[key].push(value); el.style.borderColor='var(--accent)'; el.style.background='var(--accent-light)'; }
  } else {
    const parent = el.parentElement;
    parent.querySelectorAll('[onclick]').forEach(c => { c.style.borderColor='#e5e7eb'; c.style.background='white'; });
    state[key] = value; el.style.borderColor='var(--accent)'; el.style.background='var(--accent-light)';
  }
  saveState(); updateButtons();
}
\`\`\`

**Chip-group component:**
\`\`\`html
<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px;">
  <button onclick="toggleChip('{key}', '{value}', this)"
    style="padding:8px 16px;border-radius:999px;border:1.5px solid #e5e7eb;background:white;font-size:13px;font-weight:500;color:#374151;cursor:pointer;transition:all 0.15s;">
    {label}
  </button>
</div>
\`\`\`

**Stats-grid component:**
\`\`\`html
<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">
  <div style="background:var(--accent-light);border:1px solid var(--accent-border);border-radius:16px;padding:16px;">
    <div style="font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:var(--accent);margin-bottom:6px;">{label}</div>
    <div style="font-size:24px;font-weight:800;color:#111827;">{value}</div>
  </div>
</div>
\`\`\`

**Notice component (success):**
\`\`\`html
<div style="background:var(--accent-light);border:1px solid var(--accent-border);border-radius:14px;padding:16px 18px;margin-bottom:16px;">
  <div style="font-size:13px;font-weight:600;color:#111827;margin-bottom:4px;">✓ {title}</div>
  <div style="font-size:13px;color:#374151;line-height:1.5;">{body}</div>
</div>
\`\`\`

**Summary-card component:**
\`\`\`html
<div style="background:white;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;margin-bottom:20px;">
  <div style="padding:14px 16px;border-bottom:1px solid #f3f4f6;display:flex;justify-content:space-between;">
    <span style="font-size:13px;color:#6b7280;">{label}</span>
    <span style="font-size:13px;font-weight:600;color:#111827;">{value}</span>
  </div>
</div>
\`\`\`

**Primary action button:**
\`\`\`html
<button id="btn-{screenId}-primary" onclick="handleAction('{actionId}', '{screenId}')"
  style="width:100%;padding:16px;background:var(--accent);color:white;border:none;border-radius:14px;font-size:16px;font-weight:700;cursor:pointer;transition:all 0.15s;letter-spacing:-0.01em;"
  onmouseover="if(!this.disabled)this.style.background='var(--accent-dark)'"
  onmouseout="this.style.background='var(--accent)'"
  onmousedown="this.style.transform='scale(0.97)'"
  onmouseup="this.style.transform='scale(1)'">
  {label}
</button>
\`\`\`
Disabled style: \`background:#e5e7eb;color:#9ca3af;cursor:not-allowed;\`

**Back button** (top-left of screen):
\`\`\`html
<button onclick="goBack()" style="display:flex;align-items:center;gap:6px;font-size:14px;color:#6b7280;background:none;border:none;cursor:pointer;padding:16px 20px 0;font-weight:500;">
  ← Back
</button>
\`\`\`

---

SCREEN-BY-SCREEN REQUIREMENTS:
- EVERY ui screen MUST have real interactive content — never just a title and button with nothing in between
- For selection screens: use choice-cards or chip-group (never plain radio buttons)
- For form screens: use the styled input component
- For result/dashboard screens: use stats-grid prominently
- For welcome/hero screens: use a large, bold hero with a brief description + visually interesting layout
- For AI result screens: use the notice component with the response content

QUALITY CHECKLIST before outputting:
□ Does every screen have substantive content between the title and the button?
□ Are all choice selections using the beautiful card design (not plain radio/checkbox)?
□ Does the primary button have the accent color and hover/press states?
□ Is the background gradient applied to the body?
□ Do stats use the accent-light card design?
□ Are all screen transitions smooth (opacity + translateY)?

Start screen ID: ${appMap.moments[0]?.id ?? ''}

Return ONLY the complete HTML file. No explanation, no markdown fences. Start with <!DOCTYPE html>.`;
}

export async function POST(req: NextRequest) {
  try {
    const { appMap } = (await req.json()) as { appMap: AppMap };

    if (!appMap?.moments?.length) {
      return NextResponse.json({ error: 'Invalid appMap' }, { status: 400 });
    }

    const prompt = buildPrompt(appMap);

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 16000,
      messages: [{ role: 'user', content: prompt }],
    });

    const html = (message.content[0] as { type: string; text: string }).text.trim();

    // Strip markdown fences if Claude added them anyway
    const cleaned = html
      .replace(/^```html\n?/i, '')
      .replace(/^```\n?/, '')
      .replace(/\n?```$/, '')
      .trim();

    if (!cleaned.includes('<!DOCTYPE') && !cleaned.includes('<html')) {
      return NextResponse.json({ error: 'Claude did not return valid HTML' }, { status: 500 });
    }

    // Upload to Vercel Blob (optional — only if token is present)
    let url: string | null = null;
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const slug = `${appMap.appName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;
      const blob = await put(`apps/${slug}.html`, cleaned, {
        access: 'public',
        contentType: 'text/html',
      });
      url = blob.url;
      console.log(`[build-app] Built and uploaded: ${blob.url}`);
    } else {
      console.log('[build-app] No BLOB_READ_WRITE_TOKEN — skipping upload');
    }

    return NextResponse.json({ url, html: cleaned });
  } catch (err) {
    console.error('[build-app] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
