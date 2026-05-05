/**
 * Stitch-inspired design tokens for prebuilt `componentCode` demo screens (string-injected iframes).
 * Primary accent: neon lime on near-black.
 */
export const PULSE_DEMO = {
  bg: '#050508',
  bgGradient: 'linear-gradient(180deg, #0a0c10 0%, #050508 45%)',
  card: '#12141a',
  card2: '#181b24',
  border: '#2a2f3a',
  text: '#f4f4f5',
  muted: '#8b90a0',
  muted2: '#5c6370',
  accent: '#C7FF00',
  onAccent: '#0a0a0a',
  success: '#4ade80',
  successDim: 'rgba(74, 222, 128, 0.15)',
  gold: '#e5a543',
  radius: 16,
  radiusLg: 22,
} as const;

/**
 * Shared styles for static HTML demo iframes (`demo-screens.ts`).
 * Matches {@link PULSE_DEMO}: near-black surfaces, neon lime accent, Inter.
 */
export const PULSE_DEMO_IFRAME_BASE_CSS = `
:root {
  --p-bg:#050508;
  --p-bg-mid:#0a0c10;
  --p-card:#12141a;
  --p-card2:#181b24;
  --p-border:#2a2f3a;
  --p-text:#f4f4f5;
  --p-muted:#8b90a0;
  --p-muted2:#5c6370;
  --p-accent:#C7FF00;
  --p-on-accent:#0a0a0a;
  --p-success:#4ade80;
  --p-gold:#e5a543;
  --p-warn-bg:rgba(229,165,67,0.12);
  --p-dim:rgba(199,255,0,0.1);
  --p-dim2:rgba(199,255,0,0.18);
  --p-line:rgba(199,255,0,0.32);
  --p-radius:16px;
  --p-radius-lg:22px;
  --p-glow:0 4px 28px rgba(199,255,0,0.2);
  --p-shadow:0 8px 32px rgba(0,0,0,0.45);
}
*{margin:0;padding:0;box-sizing:border-box;}
body{
  font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  width:390px;
  min-height:720px;
  background:linear-gradient(180deg,var(--p-bg-mid) 0%,var(--p-bg) 55%);
  color:var(--p-text);
  -webkit-font-smoothing:antialiased;
}
.status{display:flex;justify-content:space-between;align-items:center;padding:14px 22px 0;font-size:14px;font-weight:600;color:var(--p-text);}
.status-r{font-size:11px;color:var(--p-muted);display:flex;align-items:center;gap:5px;}
.back{width:36px;height:36px;background:var(--p-card2);border:1px solid var(--p-border);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;color:var(--p-text);}
.back-tap{font-size:15px;color:var(--p-accent);font-weight:600;}
.header-pad{padding:16px 22px 10px;display:flex;align-items:center;gap:12px;}
.header-bar{padding:14px 22px;display:flex;align-items:center;justify-content:space-between;}
.page-h1{font-size:26px;font-weight:800;letter-spacing:-0.6px;}
.subtle{font-size:15px;color:var(--p-muted);line-height:1.55;}
.kicker{font-size:11px;font-weight:700;color:var(--p-muted);text-transform:uppercase;letter-spacing:0.08em;}
.content{padding:8px 22px 100px;}
.content-tight{padding:0 22px 40px;}
.field{margin-bottom:14px;}
.field label{display:block;font-size:11px;font-weight:700;color:var(--p-muted);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.06em;}
input[type="text"],input[type="email"],input[type="password"]{
  width:100%;padding:13px 14px;border:1px solid var(--p-border);border-radius:12px;font-size:15px;background:var(--p-card);color:var(--p-text);outline:none;
}
input:focus{border-color:var(--p-line);box-shadow:0 0 0 3px var(--p-dim);}
.divider{display:flex;align-items:center;gap:12px;margin:18px 0;color:var(--p-muted);font-size:12px;font-weight:600;}
.divider::before,.divider::after{content:'';flex:1;height:1px;background:var(--p-border);}
.social-btn{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:12px;border:1px solid var(--p-border);border-radius:12px;background:var(--p-card2);color:var(--p-text);font-size:14px;font-weight:600;margin-bottom:10px;cursor:pointer;}
.btn-pulse{display:block;width:100%;padding:14px 16px;background:var(--p-accent);color:var(--p-on-accent);border:none;border-radius:14px;font-size:15px;font-weight:800;cursor:pointer;box-shadow:var(--p-glow);text-align:center;}
.btn-quiet{display:block;width:100%;padding:14px;background:transparent;color:var(--p-muted);border:1px solid var(--p-border);border-radius:14px;font-size:14px;font-weight:600;cursor:pointer;text-align:center;}
.btn-soft{background:var(--p-card2);color:var(--p-accent);border:1px solid var(--p-border);}
.progress-bar{margin:14px 22px 0;height:4px;background:var(--p-card2);border-radius:100px;overflow:hidden;}
.progress-bar>i{display:block;height:100%;background:var(--p-accent);border-radius:100px;}
.option-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:18px 0 20px;}
.option{background:var(--p-card);border:1px solid var(--p-border);border-radius:var(--p-radius);padding:16px 12px;text-align:center;cursor:pointer;}
.option.active{border-color:var(--p-line);background:var(--p-dim);}
.option .oi{font-size:28px;margin-bottom:8px;}
.option .ol{font-size:13px;font-weight:700;}
.option .od{font-size:11px;color:var(--p-muted);margin-top:4px;line-height:1.35;}
.tag-row{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:22px;}
.tag{padding:8px 13px;border:1px solid var(--p-border);border-radius:100px;font-size:12px;font-weight:600;background:var(--p-card);color:var(--p-text);cursor:pointer;}
.tag.active{border-color:var(--p-line);background:var(--p-dim);color:var(--p-accent);}
.ai-badge{display:inline-flex;align-items:center;gap:6px;background:var(--p-dim);border:1px solid var(--p-line);border-radius:100px;padding:6px 12px;font-size:11px;font-weight:800;color:var(--p-accent);margin-bottom:14px;}
.surface{background:var(--p-card);border:1px solid var(--p-border);border-radius:var(--p-radius);padding:16px;box-shadow:var(--p-shadow);}
.surface-lg{border-radius:var(--p-radius-lg);padding:18px;}
.bottom-nav{position:fixed;bottom:0;left:0;width:390px;background:rgba(5,5,8,0.94);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-top:1px solid var(--p-border);padding:8px 0 22px;display:flex;justify-content:space-around;}
.bn-i{display:flex;flex-direction:column;align-items:center;gap:3px;}
.bn-l{font-size:10px;font-weight:600;color:var(--p-muted);}
.bn-l.on{color:var(--p-accent);font-weight:800;}
.link-muted{text-align:center;margin-top:16px;font-size:13px;color:var(--p-muted);}
.link-muted a{color:var(--p-accent);font-weight:700;}
.lift-tab{padding:8px 14px;border-radius:100px;font-size:12px;font-weight:700;white-space:nowrap;cursor:pointer;border:1px solid var(--p-border);background:var(--p-card);color:var(--p-muted);}
.lift-tab.on{background:var(--p-accent);color:var(--p-on-accent);border-color:var(--p-accent);}
`;

/**
 * Per-moment **app UI** blocks (concrete components, not spec paragraphs).
 * `firstTarget` = graph first outgoing edge (primary nav + in-card CTAs).
 */
export function buildPulseVariantBlock(momentId: string, firstTarget: string): string {
  const { accent, onAccent, card, border, muted, text, success, radius, radiusLg, gold, muted2, card2 } = PULSE_DEMO;
  const startTarget = firstTarget || 'ai-workout';

  switch (momentId) {
    case 'welcome':
      return `h('div', { style: { marginTop: 10, textAlign: 'center' } },
        h('p', { style: { margin: 0, fontSize: 12, color: ${JSON.stringify(muted)} } }, 'Train smarter. Recover faster.'),
        h('p', { style: { margin: '10px 0 0', fontSize: 15, fontWeight: 800 } }, 'Get started in under a minute.')
      )`;

    case 'create-account':
      return `h('div', { style: { marginTop: 10 } },
        h('p', { style: { margin: 0, fontSize: 10, color: ${JSON.stringify(muted)}, textTransform: 'uppercase' } }, 'New account'),
        h('div', { style: { marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 } },
          [ 'Full name', 'Email', 'Password' ].map(function (label) {
            return h('div', { key: label, style: { borderRadius: 14, border: '1px solid ' + ${JSON.stringify(border)}, background: ${JSON.stringify(card)}, padding: 12, fontSize: 11, color: ${JSON.stringify(muted2)} } }, label);
          })
        )
      )`;

    case 'fitness-assessment':
      return `h('div', { style: { marginTop: 6 } },
        h('p', { style: { margin: 0, fontSize: 9, color: ${JSON.stringify(muted)}, textTransform: 'uppercase' } }, 'Step 2 of 4'),
        h('div', { style: { marginTop: 8, height: 4, borderRadius: 2, background: ${JSON.stringify(card2)} } },
          h('div', { style: { width: '50%', height: '100%', background: ${JSON.stringify(accent)} } })
        ),
        h('p', { style: { margin: '10px 0 0', fontSize: 14, fontWeight: 800 } }, 'What is your current fitness level?'),
        h('div', { style: { marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 } },
          [ 'Beginner', 'Intermediate', 'Advanced', 'Athlete' ].map(function (row, i) {
            return h('div', { key: row, style: { borderRadius: 12, border: '1px solid ' + (i === 0 ? 'rgba(199,255,0,0.45)' : ${JSON.stringify(border)}), background: i === 0 ? 'rgba(199,255,0,0.08)' : ${JSON.stringify(card)}, padding: 10, fontSize: 13, fontWeight: 600 } }, row);
          })
        )
      )`;

    case 'workout-home':
      return `h('div', { style: { marginTop: 4 } },
        h('p', { style: { margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: -0.3 } },
          h('span', { style: { color: ${JSON.stringify(text)} } }, 'Good morning, Alex'),
          h('span', { style: { marginLeft: 4 } }, '💪')
        ),
        h('div', { style: { display: 'inline-flex', marginTop: 8, marginBottom: 2 } },
          h('span', { style: { background: 'rgba(199,255,0,0.12)', color: ${JSON.stringify(accent)}, fontSize: 10, fontWeight: 800, padding: '5px 10px', borderRadius: 8, textTransform: 'uppercase', letterSpacing: 0.6, border: '1px solid rgba(199,255,0,0.3)' } }, '14 day streak')
        ),
        h('div', { style: { display: 'flex', gap: 8, marginTop: 12, justifyContent: 'space-between' } },
          [ { k: 'Today', v: '1' }, { k: 'This week', v: '4' } ].map(function (row) {
            return h('div', { key: row.k, style: { flex: 1, textAlign: 'center', padding: 10, borderRadius: 14, background: ${JSON.stringify(card)}, border: '1px solid ' + ${JSON.stringify(border)} } },
              h('p', { style: { margin: 0, fontSize: 20, fontWeight: 800, color: ${JSON.stringify(accent)} } }, row.v),
              h('p', { style: { margin: '4px 0 0', fontSize: 8, color: ${JSON.stringify(muted)}, textTransform: 'uppercase' } }, row.k)
            );
          })
        ),
        h('div', { style: { marginTop: 14, borderRadius: 20, background: ${JSON.stringify(card)}, border: '1px solid ' + ${JSON.stringify(border)}, padding: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' } },
          h('p', { style: { margin: 0, fontSize: 9, color: ${JSON.stringify(muted)}, textTransform: 'uppercase', letterSpacing: 0.8 } }, "Today's plan"),
          h('p', { style: { margin: '6px 0 0', fontSize: 18, fontWeight: 800 } }, 'Push · Power upper'),
          h('p', { style: { margin: '4px 0 0', fontSize: 12, color: ${JSON.stringify(muted)} } }, '6 exercises · ~45 min · 320 kcal'),
          h('button', { type: 'button', onClick: function () { onNavigate(${JSON.stringify(startTarget)}); }, style: { width: '100%', marginTop: 12, border: 0, borderRadius: 14, padding: '13px 14px', background: ${JSON.stringify(accent)}, color: ${JSON.stringify(onAccent)}, fontWeight: 800, fontSize: 15, cursor: 'pointer', boxShadow: '0 4px 28px rgba(199,255,0,0.3)' } }, 'Start workout')
        ),
        h('p', { style: { margin: '14px 0 6px', fontSize: 9, color: ${JSON.stringify(muted)}, textTransform: 'uppercase', letterSpacing: 0.8 } }, 'Recent'),
        [ { t: 'Legs · volume', s: 'Tue' }, { t: 'Core reset', s: 'Sun' } ].map(function (row) {
          return h('div', { key: row.t, style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid ' + ${JSON.stringify(border)} } },
            h('span', { style: { fontSize: 13, fontWeight: 600 } }, row.t),
            h('span', { style: { fontSize: 11, color: ${JSON.stringify(muted2)} } }, row.s)
          );
        })
      )`;

    case 'ai-workout':
      return `h('div', { style: { marginTop: 4 } },
        h('p', { style: { margin: 0, fontSize: 15, fontWeight: 700 } }, "How are you feeling today?"),
        h('p', { style: { margin: '6px 0 0', fontSize: 11, color: ${JSON.stringify(muted)} } }, '1 = drained · 5 = great'),
        h('div', { style: { display: 'flex', justifyContent: 'space-between', marginTop: 10, gap: 6 } },
          [1,2,3,4,5].map(function (n) {
            var on = n === 4;
            return h('div', { key: n, style: { flex: 1, height: 6, borderRadius: 3, background: on ? ${JSON.stringify(accent)} : ${JSON.stringify(card2)}, border: on ? 0 : '1px solid ' + ${JSON.stringify(border)} } });
          })
        ),
        h('p', { style: { margin: '8px 0 0', fontSize: 10, color: ${JSON.stringify(accent)}, fontWeight: 700 } }, 'Energy 4/5 — we will bias upper strength'),
        h('div', { style: { marginTop: 14, borderRadius: 18, background: ${JSON.stringify(card)}, border: '1px solid ' + ${JSON.stringify(border)}, padding: 14, boxShadow: '0 0 0 1px rgba(199,255,0,0.05)' } },
          h('p', { style: { margin: 0, fontSize: 9, color: ${JSON.stringify(muted)}, textTransform: 'uppercase' } }, 'AI session'),
          h('p', { style: { margin: '6px 0 0', fontSize: 16, fontWeight: 800 } }, 'Push · power'),
          h('p', { style: { margin: '4px 0 0', fontSize: 12, color: ${JSON.stringify(muted)} } }, '6 exercises · Chest, shoulders, triceps'),
          h('div', { style: { display: 'flex', gap: 12, marginTop: 8 } },
            h('p', { style: { margin: 0, fontSize: 13, fontWeight: 700, color: ${JSON.stringify(text)} } }, '~320 kcal'),
            h('p', { style: { margin: 0, fontSize: 13, fontWeight: 700, color: ${JSON.stringify(muted)} } }, '~45 min')
          )
        ),
        h('div', { style: { display: 'flex', gap: 8, marginTop: 14 } },
          h('button', { type: 'button', onClick: function () { void 0; }, style: { flex: 1, border: '1px solid ' + ${JSON.stringify(border)}, borderRadius: 14, padding: '12px 10px', background: 'transparent', color: ${JSON.stringify(muted)}, fontWeight: 600, fontSize: 13, cursor: 'pointer' } }, 'Regenerate'),
          h('button', { type: 'button', onClick: function () { onNavigate(${JSON.stringify(firstTarget || 'exercise-player')}); }, style: { flex: 1, border: 0, borderRadius: 14, padding: '12px 10px', background: ${JSON.stringify(accent)}, color: ${JSON.stringify(onAccent)}, fontWeight: 800, fontSize: 13, cursor: 'pointer', boxShadow: '0 4px 20px rgba(199,255,0,0.25)' } }, "Looks good")
        )
      )`;

    case 'exercise-player':
      return `h('div', { style: { marginTop: 8 } },
        h('p', { style: { margin: 0, color: ${JSON.stringify(muted)}, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.1 } }, 'Block · 3 of 6'),
        h('div', { style: { height: 4, borderRadius: 4, background: ${JSON.stringify(card2)}, marginTop: 6, overflow: 'hidden' } },
          h('div', { style: { width: '50%', height: '100%', background: ${JSON.stringify(accent)} } })
        ),
        h('p', { style: { margin: '14px 0 0', textAlign: 'center', fontSize: 42, fontWeight: 800, fontVariantNumeric: 'tabular-nums', letterSpacing: -1 } }, '24:12'),
        h('p', { style: { margin: '2px 0 0', textAlign: 'center', fontSize: 11, color: ${JSON.stringify(muted)} } }, 'overhead press · set 2 of 4'),
        h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 14 } },
          [ ['Pace', '5:38/km'], ['HR', '164'], ['Kcal', '312'], ['Elev', '42m'] ].map(function (pair) {
            return h('div', { key: pair[0], style: { borderRadius: ${JSON.stringify(radius)} + 'px', background: ${JSON.stringify(card)}, border: '1px solid ' + ${JSON.stringify(border)}, padding: 10, textAlign: 'center' } },
              h('p', { style: { margin: 0, fontSize: 16, fontWeight: 800 } }, pair[1]),
              h('p', { style: { margin: '4px 0 0', fontSize: 8, color: ${JSON.stringify(muted)}, textTransform: 'uppercase' } }, pair[0])
            );
          })
        )
      )`;

    case 'goal-beginner-summary':
    case 'goal-intermediate-summary':
    case 'goal-advanced-summary':
    case 'goal-athlete-summary':
      return `h('div', { style: { marginTop: 6 } },
        h('p', { style: { margin: 0, fontSize: 9, color: ${JSON.stringify(muted)}, textTransform: 'uppercase' } }, '8-week focus'),
        h('div', { style: { marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 } },
          [ 'Foundation + habit streak', '3× weekly full-body cadence', 'First session: movement prep + compounds' ].map(function (row, i) {
            return h('div', { key: i, style: { display: 'flex', alignItems: 'center', gap: 10, padding: 12, borderRadius: 14, background: ${JSON.stringify(card)}, border: '1px solid ' + ${JSON.stringify(border)} } },
              h('span', { style: { width: 22, height: 22, borderRadius: 999, background: 'rgba(199,255,0,0.15)', color: ${JSON.stringify(accent)}, fontSize: 12, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' } }, '✓'),
              h('span', { style: { fontSize: 13, color: ${JSON.stringify(text)} } }, row)
            );
          })
        )
      )`;

    case 'progress-dashboard':
    case 'analytics':
    case 'ai-insights':
      return `h('div', { style: { marginTop: 8 } },
        h('p', { style: { margin: 0, color: ${JSON.stringify(muted)}, fontSize: 10, textTransform: 'uppercase' } }, 'Monthly impact'),
        h('div', { style: { marginTop: 8, height: 72, borderRadius: ${JSON.stringify(radius)} + 'px', background: ${JSON.stringify(card)}, border: '1px solid ' + ${JSON.stringify(border)}, position: 'relative', overflow: 'hidden' } },
          h('div', { style: { position: 'absolute', left: 8, right: 8, bottom: 16, height: 40, background: 'linear-gradient(90deg, transparent, ' + ${JSON.stringify(accent)} + ' 40%, ' + ${JSON.stringify(accent)} + ' 70%, transparent)', opacity: 0.5, borderRadius: 4, clipPath: 'polygon(0% 80%, 15% 40%, 30% 55%, 45% 20%, 60% 35%, 75% 10%, 90% 50%, 100% 30%, 100% 100%, 0% 100%)' } })
        ),
        h('div', { style: { display: 'flex', gap: 8, marginTop: 10 } },
          h('div', { style: { flex: 1, borderRadius: ${JSON.stringify(radius)} + 'px', background: ${JSON.stringify(card)}, border: '1px solid ' + ${JSON.stringify(border)}, padding: 8, textAlign: 'center' } },
            h('p', { style: { margin: 0, fontSize: 18, fontWeight: 800, color: ${JSON.stringify(accent)} } }, '92%'),
            h('p', { style: { margin: '2px 0 0', fontSize: 8, color: ${JSON.stringify(muted)}, textTransform: 'uppercase' } }, 'goal')
          ),
          h('div', { style: { flex: 1, borderRadius: ${JSON.stringify(radius)} + 'px', background: ${JSON.stringify(card)}, border: '1px solid ' + ${JSON.stringify(border)}, padding: 8, textAlign: 'center' } },
            h('p', { style: { margin: 0, fontSize: 18, fontWeight: 800 } }, '−1.1kg'),
            h('p', { style: { margin: '2px 0 0', fontSize: 8, color: ${JSON.stringify(muted)}, textTransform: 'uppercase' } }, 'trend')
          )
        )
      )`;

    case 'log-pr':
    case 'workout-log':
      return `h('div', { style: { marginTop: 8 } },
        h('p', { style: { margin: 0, textAlign: 'center', fontSize: 18, letterSpacing: 2 } }, '🎉'),
        h('div', { style: { textAlign: 'center' } },
          h('span', { style: { display: 'inline-block', background: 'rgba(229,165,67,0.2)', color: ${JSON.stringify(gold)}, fontSize: 9, fontWeight: 800, padding: '4px 8px', borderRadius: 6, textTransform: 'uppercase' } }, 'New personal record')
        ),
        h('p', { style: { margin: '10px 0 0', textAlign: 'center', fontSize: 22, fontWeight: 800 } }, 'You crushed it'),
        h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, borderRadius: ${JSON.stringify(radiusLg)} + 'px', background: ${JSON.stringify(card)}, border: '1px solid ' + ${JSON.stringify(border)}, padding: 12, gap: 8 } },
          h('div', { style: { textAlign: 'center', flex: 1 } },
            h('p', { style: { margin: 0, color: ${JSON.stringify(muted)}, fontSize: 8, textTransform: 'uppercase' } }, 'Previous'),
            h('p', { style: { margin: '4px 0 0', fontSize: 18, fontWeight: 700, color: ${JSON.stringify(muted2)} } }, '115kg')
          ),
          h('p', { style: { margin: 0, color: ${JSON.stringify(success)}, fontSize: 20 } }, '→'),
          h('div', { style: { textAlign: 'center', flex: 1, borderLeft: '1px solid ' + ${JSON.stringify(border)} } },
            h('p', { style: { margin: 0, color: ${JSON.stringify(success)}, fontSize: 8, textTransform: 'uppercase' } }, 'New PR'),
            h('p', { style: { margin: '4px 0 0', fontSize: 20, fontWeight: 800, color: ${JSON.stringify(success)} } }, '127.5kg')
          )
        )
      )`;

    case 'nutrition-log':
    case 'ai-meals':
    case 'recipe-detail':
    case 'log-meal':
      return `h('div', { style: { marginTop: 8 } },
        h('div', { style: { display: 'flex', gap: 6, marginBottom: 8 } },
          [ 'P', 'C', 'F' ].map(function (x, i) {
            return h('div', { key: x, style: { flex: 1, height: 4, borderRadius: 2, background: i === 0 ? ${JSON.stringify(accent)} : i === 1 ? 'rgba(199,255,0,0.4)' : 'rgba(199,255,0,0.2)' } });
          })),
        h('div', { style: { display: 'flex', justifyContent: 'space-between', marginTop: 4 } },
          h('p', { style: { margin: 0, fontSize: 9, color: ${JSON.stringify(muted)}, textTransform: 'uppercase' } }, 'Calories left'),
          h('p', { style: { margin: 0, fontSize: 14, fontWeight: 800, color: ${JSON.stringify(accent)} } }, '520 kcal')
        ),
        h('p', { style: { margin: '10px 0 0', fontSize: 11, color: ${JSON.stringify(muted)} } }, 'Protein 142g · Carbs 186g · Fat 58g')
      )`;

    case 'share-workout':
      return `h('div', { style: { marginTop: 8 } },
        h('p', { style: { margin: 0, fontSize: 9, color: ${JSON.stringify(muted)}, textTransform: 'uppercase', letterSpacing: 0.8 } }, 'Share card'),
        h('p', { style: { margin: '8px 0 0', fontSize: 20, fontWeight: 800, letterSpacing: -0.3 } }, 'Session ready to post'),
        h('div', { style: { marginTop: 14, borderRadius: ${JSON.stringify(radiusLg)} + 'px', background: ${JSON.stringify(card)}, border: '1px solid ' + ${JSON.stringify(border)}, padding: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' } },
          h('p', { style: { margin: 0, fontSize: 11, color: ${JSON.stringify(muted)}, lineHeight: 1.45 } }, '42 min · 387 kcal · 5 exercises · 14-day streak'),
          h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 } },
            ['Instagram', 'Stories', 'Copy link'].map(function (label, i) {
              return h('button', { key: label, type: 'button', onClick: function () { void 0; }, style: { border: '1px solid ' + ${JSON.stringify(border)}, borderRadius: 10, padding: '8px 10px', background: i === 0 ? 'rgba(199,255,0,0.12)' : ${JSON.stringify(card2)}, color: ${JSON.stringify(text)}, fontSize: 11, fontWeight: 600, cursor: 'pointer' } } , label);
            })
          ),
          h('button', { type: 'button', onClick: function () { onNavigate(${JSON.stringify(firstTarget || 'workout-home')}); }, style: { width: '100%', marginTop: 14, border: 0, borderRadius: 14, padding: 13, background: ${JSON.stringify(accent)}, color: ${JSON.stringify(onAccent)}, fontWeight: 800, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 24px rgba(199,255,0,0.25)' } } , 'Done')
        )
      )`;

    default:
      return `h('div', { style: { marginTop: 6, height: 3, borderRadius: 2, background: 'linear-gradient(90deg, transparent, ' + ${JSON.stringify(accent)} + ', transparent)' } })`;
  }
}
