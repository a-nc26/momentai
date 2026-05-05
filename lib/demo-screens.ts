// Pre-rendered HTML screens for the Pulse demo (390px-wide iframes).
// Visual system: shared `PULSE_DEMO_IFRAME_BASE_CSS` — dark surfaces + lime accent (matches React demo).

import { PULSE_DEMO_IFRAME_BASE_CSS } from '@/lib/demo-pulse-chrome';

// ─────────────────────────────────────────────────────────────
// 1. WELCOME SCREEN
// ─────────────────────────────────────────────────────────────
export const WELCOME_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${PULSE_DEMO_IFRAME_BASE_CSS}
.w-hero{display:flex;flex-direction:column;align-items:center;padding:40px 28px 28px;text-align:center;}
.w-logo{width:88px;height:88px;border-radius:var(--p-radius-lg);background:var(--p-dim);border:1px solid var(--p-line);display:flex;align-items:center;justify-content:center;font-size:40px;margin-bottom:24px;box-shadow:var(--p-shadow);}
.w-title{font-size:40px;font-weight:900;letter-spacing:-1.2px;margin-bottom:8px;}
.w-title em{color:var(--p-accent);font-style:normal;}
.w-tag{font-size:16px;color:var(--p-muted);line-height:1.55;max-width:300px;}
.w-pills{display:flex;gap:8px;justify-content:center;margin-top:22px;flex-wrap:wrap;}
.w-pill{background:var(--p-card);border:1px solid var(--p-border);border-radius:100px;padding:6px 13px;font-size:11px;font-weight:600;color:var(--p-muted);}
.w-actions{padding:0 24px 44px;}
.w-terms{text-align:center;font-size:11px;color:var(--p-muted2);margin-top:16px;line-height:1.65;}
</style></head><body>
<div class="status"><span>9:41</span><div class="status-r"><span>●●●</span><span>WiFi</span><span style="font-size:13px;">🔋</span></div></div>
<div class="w-hero">
  <div class="w-logo">⚡</div>
  <div class="w-title">Pulse<em>.</em></div>
  <p class="w-tag">Your AI fitness coach that learns, adapts, and pushes you further — every single day.</p>
  <div class="w-pills"><span class="w-pill">AI-powered</span><span class="w-pill">Smart tracking</span><span class="w-pill">Adaptive plans</span></div>
</div>
<div class="w-actions">
  <button type="button" class="btn-pulse" style="margin-bottom:10px;">Get started — it's free</button>
  <button type="button" class="btn-quiet">I already have an account</button>
  <p class="w-terms">By continuing you agree to our Terms of Service<br>and Privacy Policy</p>
</div>
</body></html>`;

// ─────────────────────────────────────────────────────────────
// 2. CREATE ACCOUNT
// ─────────────────────────────────────────────────────────────
export const CREATE_ACCOUNT_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${PULSE_DEMO_IFRAME_BASE_CSS}
.pw-wrap{position:relative;}
.show-pw{position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:12px;color:var(--p-accent);font-weight:700;}
</style></head><body>
<div class="status"><span>9:41</span><div class="status-r"><span>●●●</span><span>WiFi</span><span style="font-size:13px;">🔋</span></div></div>
<div class="header-pad"><div class="back">←</div><span class="header-title">Create account</span></div>
<div class="content">
  <h1 class="page-h1" style="margin-bottom:6px;">Join Pulse</h1>
  <p class="subtle" style="margin-bottom:26px;">Start your AI-powered fitness journey today.</p>
  <div class="field"><label>Full name</label><input type="text" placeholder="Alex Johnson" value="Alex Johnson"></div>
  <div class="field"><label>Email</label><input type="email" placeholder="alex@email.com" value="alex@email.com"></div>
  <div class="field"><label>Password</label><div class="pw-wrap"><input type="password" placeholder="Min. 8 characters" value="••••••••••"><span class="show-pw">Show</span></div></div>
  <button type="button" class="btn-pulse" style="margin-top:6px;">Create account</button>
  <div class="divider"><span>or continue with</span></div>
  <button type="button" class="social-btn"><span>🍎</span> Continue with Apple</button>
  <button type="button" class="social-btn"><span>G</span> Continue with Google</button>
  <p class="link-muted">Already have an account? <a>Sign in</a></p>
</div>
</body></html>`;

// ─────────────────────────────────────────────────────────────
// 3. FITNESS ASSESSMENT
// ─────────────────────────────────────────────────────────────
export const FITNESS_ASSESSMENT_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${PULSE_DEMO_IFRAME_BASE_CSS}
.also-label{font-size:13px;font-weight:700;color:var(--p-text);margin:8px 0 12px;}
</style></head><body>
<div class="status"><span>9:41</span><div class="status-r"><span>●●●</span><span>WiFi</span><span style="font-size:13px;">🔋</span></div></div>
<div class="progress-bar"><i style="width:50%"></i></div>
<p class="kicker" style="padding:8px 22px 0;">Step 2 of 4</p>
<div class="content" style="padding-top:16px;">
  <h1 class="page-h1" style="margin-bottom:6px;">What's your fitness level?</h1>
  <p class="subtle" style="margin-bottom:22px;">We'll tailor your plan to match where you are right now.</p>
  <div class="option-grid" style="margin-top:0;">
    <div class="option"><div class="oi">🌱</div><div class="ol">Beginner</div><div class="od">Just starting out</div></div>
    <div class="option active"><div class="oi">⚡</div><div class="ol">Intermediate</div><div class="od">1–2 years training</div></div>
    <div class="option"><div class="oi">🔥</div><div class="ol">Advanced</div><div class="od">3+ years serious training</div></div>
    <div class="option"><div class="oi">🏆</div><div class="ol">Athlete</div><div class="od">Competitive sports</div></div>
  </div>
  <p class="also-label">Available equipment</p>
  <div class="tag-row">
    <span class="tag active">🏋️ Full gym</span>
    <span class="tag active">🏠 Home equipment</span>
    <span class="tag">🏃 No equipment</span>
    <span class="tag">🥊 Dumbbells only</span>
  </div>
  <button type="button" class="btn-pulse">Continue →</button>
</div>
</body></html>`;

// ─────────────────────────────────────────────────────────────
// 4. AI GOAL SETTING (showing results state)
// ─────────────────────────────────────────────────────────────
export const GOAL_SETTING_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${PULSE_DEMO_IFRAME_BASE_CSS}
.plan-hero{border-radius:var(--p-radius-lg);padding:20px;margin-bottom:14px;background:var(--p-card);border:1px solid var(--p-line);box-shadow:var(--p-shadow);}
.plan-hero h2{font-size:20px;font-weight:800;margin-bottom:6px;}
.plan-hero>p{font-size:13px;color:var(--p-muted);margin-bottom:16px;}
.ps{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;}
.ps>div{background:var(--p-card2);border:1px solid var(--p-border);border-radius:12px;padding:10px;text-align:center;}
.ps .v{font-size:20px;font-weight:800;color:var(--p-accent);}
.ps .l{font-size:10px;color:var(--p-muted);margin-top:4px;text-transform:uppercase;letter-spacing:0.04em;}
.ms{background:var(--p-card);border:1px solid var(--p-border);border-radius:var(--p-radius);padding:16px;margin-bottom:10px;display:flex;align-items:center;gap:12px;}
.mi{width:40px;height:40px;border-radius:12px;background:var(--p-dim);border:1px solid var(--p-border);display:flex;align-items:center;justify-content:center;font-size:18px;}
.mt h3{font-size:14px;font-weight:700;}
.mt p{font-size:12px;color:var(--p-muted);margin-top:2px;}
.md{margin-left:auto;font-size:11px;font-weight:800;color:var(--p-accent);}
.reason{background:var(--p-warn-bg);border:1px solid var(--p-line);border-radius:var(--p-radius);padding:14px;margin-bottom:18px;}
.reason .rl{font-size:10px;font-weight:800;color:var(--p-gold);letter-spacing:0.06em;margin-bottom:6px;}
.reason p{font-size:13px;color:var(--p-muted);line-height:1.55;}
</style></head><body>
<div class="status"><span>9:41</span><div class="status-r"><span>●●●</span><span>WiFi</span><span style="font-size:13px;">🔋</span></div></div>
<div class="content">
  <span class="ai-badge">✦ Pulse AI</span>
  <h1 class="page-h1" style="margin-bottom:6px;">Your plan is ready</h1>
  <p class="subtle" style="margin-bottom:18px;">Built around your assessment. Adapts weekly based on performance.</p>
  <div class="plan-hero">
    <h2>Strength & Conditioning</h2>
    <p>Intermediate 12-week progressive programme</p>
    <div class="ps">
      <div><div class="v">4×</div><div class="l">Per week</div></div>
      <div><div class="v">45m</div><div class="l">Per session</div></div>
      <div><div class="v">~450</div><div class="l">Kcal / session</div></div>
    </div>
  </div>
  <div class="reason"><div class="rl">Why this plan</div><p>Based on your intermediate level and full-gym access, a push/pull/legs split optimises strength gains with adequate recovery.</p></div>
  <div class="ms"><div class="mi">💪</div><div class="mt"><h3>First strength milestone</h3><p>Projected 15% strength increase</p></div><div class="md">Week 4</div></div>
  <div class="ms"><div class="mi">🏆</div><div class="mt"><h3>Programme completion</h3><p>Full transformation cycle</p></div><div class="md">Week 12</div></div>
  <div style="height:12px;"></div>
  <button type="button" class="btn-pulse">Start my journey →</button>
</div>
</body></html>`;

// ─────────────────────────────────────────────────────────────
// 5. WORKOUT DASHBOARD (Home)
// ─────────────────────────────────────────────────────────────
export const WORKOUT_HOME_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${PULSE_DEMO_IFRAME_BASE_CSS}
.wh-top{padding:14px 22px 0;display:flex;justify-content:space-between;align-items:center;}
.wh-top h1{font-size:22px;font-weight:800;letter-spacing:-0.4px;}
.wh-top p{font-size:13px;color:var(--p-muted);margin-top:2px;}
.av{width:44px;height:44px;border-radius:14px;background:var(--p-dim);border:1px solid var(--p-line);display:flex;align-items:center;justify-content:center;font-size:20px;}
.sec{padding:14px 22px 8px;font-size:11px;font-weight:800;color:var(--p-muted);letter-spacing:0.08em;text-transform:uppercase;}
.today{margin:0 22px 14px;border-radius:var(--p-radius-lg);padding:20px;background:var(--p-card);border:1px solid var(--p-line);box-shadow:var(--p-shadow);}
.today .tl{font-size:10px;font-weight:800;color:var(--p-accent);letter-spacing:0.1em;margin-bottom:8px;}
.today h2{font-size:20px;font-weight:800;margin-bottom:4px;}
.today .tm{font-size:13px;color:var(--p-muted);margin-bottom:14px;}
.ttags{display:flex;gap:6px;margin-bottom:16px;flex-wrap:wrap;}
.ttags span{background:var(--p-card2);border:1px solid var(--p-border);border-radius:100px;padding:4px 10px;font-size:11px;font-weight:600;color:var(--p-muted);}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 22px 12px;}
.scard{background:var(--p-card);border:1px solid var(--p-border);border-radius:var(--p-radius);padding:14px;}
.scard .sv{font-size:22px;font-weight:800;color:var(--p-accent);}
.scard .sl{font-size:11px;color:var(--p-muted);margin-top:4px;}
.scard .sd{font-size:11px;color:var(--p-success);font-weight:700;margin-top:4px;}
.act{display:flex;align-items:center;gap:12px;padding:12px 22px;border-bottom:1px solid var(--p-border);}
.ac{width:40px;height:40px;border-radius:12px;background:var(--p-card2);display:flex;align-items:center;justify-content:center;font-size:18px;}
.ai h4{font-size:13px;font-weight:700;}
.ai p{font-size:12px;color:var(--p-muted);margin-top:2px;}
.ar{margin-left:auto;text-align:right;font-size:12px;font-weight:700;color:var(--p-accent);}
</style></head><body>
<div class="status"><span>9:41</span><div class="status-r"><span>●●●</span><span>WiFi</span><span style="font-size:13px;">🔋</span></div></div>
<div class="wh-top">
  <div><h1>Good morning, Alex 👋</h1><p>Thursday · Week 6 of 12</p></div>
  <div class="av">😊</div>
</div>
<div class="streak-banner">
  <div style="display:flex;align-items:center;gap:10px;"><span style="font-size:24px;">🔥</span><div><div style="font-size:14px;font-weight:700;">Day streak</div><div style="font-size:12px;color:var(--p-muted);">Keep it going</div></div></div>
  <div class="n">14</div>
</div>
<div class="today">
  <p class="tl">Today's workout</p>
  <h2>Push day — chest & shoulders</h2>
  <p class="tm">45 min · 6 exercises · ~430 kcal</p>
  <div class="ttags"><span>🏋️ Full gym</span><span>⚡ Intermediate</span><span>📈 Progressive</span></div>
  <button type="button" class="btn-pulse">Start workout →</button>
</div>
<p class="sec">This week</p>
<div class="grid2">
  <div class="scard"><div style="font-size:20px;margin-bottom:6px;">🏋️</div><div class="sv">3</div><div class="sl">Workouts done</div><div class="sd">▲ On track</div></div>
  <div class="scard"><div style="font-size:20px;margin-bottom:6px;">🔥</div><div class="sv">1,284</div><div class="sl">Kcal burned</div><div class="sd">▲ +12% vs last wk</div></div>
</div>
<p class="sec">Recent activity</p>
<div class="act"><div class="ac">🦵</div><div class="ai"><h4>Leg day — quads & glutes</h4><p>42 min · 387 kcal</p></div><div class="ar">Yesterday</div></div>
<div class="act"><div class="ac">🏃</div><div class="ai"><h4>Cardio conditioning</h4><p>28 min · 265 kcal</p></div><div class="ar">Tue</div></div>
<div style="height:80px;"></div>
<div class="bottom-nav">
  <div class="bn-i"><span style="font-size:22px;">⌂</span><span class="bn-l on">Home</span></div>
  <div class="bn-i"><span style="font-size:22px;opacity:0.35;">◈</span><span class="bn-l">Train</span></div>
  <div class="bn-i"><span style="font-size:22px;opacity:0.35;">▲</span><span class="bn-l">Progress</span></div>
  <div class="bn-i"><span style="font-size:22px;opacity:0.35;">◎</span><span class="bn-l">Nutrition</span></div>
  <div class="bn-i"><span style="font-size:22px;opacity:0.35;">◯</span><span class="bn-l">Profile</span></div>
</div>
</body></html>`;

// ─────────────────────────────────────────────────────────────
// 6. AI WORKOUT GENERATOR
// ─────────────────────────────────────────────────────────────
export const AI_WORKOUT_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${PULSE_DEMO_IFRAME_BASE_CSS}
.hdr-ai{padding:12px 22px;display:flex;align-items:center;gap:10px;}
.hdr-ai .ai-badge{margin-left:auto;margin-bottom:0;}
.ec{background:var(--p-card);border:1px solid var(--p-border);border-radius:var(--p-radius-lg);padding:18px;margin-bottom:14px;}
.ec h3{font-size:15px;font-weight:700;margin-bottom:4px;}
.ec>p{font-size:12px;color:var(--p-muted);margin-bottom:14px;}
.sl{display:flex;align-items:center;gap:10px;}
.st{flex:1;height:8px;background:var(--p-card2);border-radius:100px;position:relative;}
.sf{width:70%;height:100%;background:var(--p-accent);border-radius:100px;}
.sth{position:absolute;right:-6px;top:50%;transform:translateY(-50%);width:20px;height:20px;background:var(--p-card);border:2px solid var(--p-accent);border-radius:100%;}
.el{display:flex;justify-content:space-between;margin-top:8px;font-size:10px;color:var(--p-muted);font-weight:600;}
.es{text-align:center;margin-top:10px;font-size:18px;font-weight:800;color:var(--p-accent);}
.wp{background:var(--p-card);border:1px solid var(--p-border);border-radius:var(--p-radius-lg);padding:18px;margin-bottom:14px;}
.ph{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;}
.ph h3{font-size:17px;font-weight:800;}
.pbd{background:var(--p-dim);border:1px solid var(--p-line);border-radius:10px;padding:6px 10px;text-align:center;}
.pbd .pv{font-size:16px;font-weight:800;color:var(--p-accent);}
.pbd .pl{font-size:9px;color:var(--p-muted);}
.exl{display:flex;flex-direction:column;gap:8px;}
.ex{display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--p-card2);border-radius:12px;border:1px solid var(--p-border);}
.en{width:26px;height:26px;background:var(--p-accent);color:var(--p-on-accent);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;}
.ex h4{font-size:13px;font-weight:700;}
.ex p{font-size:11px;color:var(--p-muted);margin-top:2px;}
.eset{margin-left:auto;font-size:12px;font-weight:700;color:var(--p-text);}
.br{display:flex;gap:10px;}
.br .btn-quiet{flex:1;}
.br .btn-pulse{flex:2;}
</style></head><body>
<div class="status"><span>9:41</span><div class="status-r"><span>●●●</span><span>WiFi</span><span style="font-size:13px;">🔋</span></div></div>
<div class="hdr-ai"><div class="back">←</div><span class="header-title">Today's workout</span><span class="ai-badge">✦ AI</span></div>
<div class="content-tight">
  <div class="ec">
    <h3>How are you feeling today?</h3>
    <p>Pulse adapts your session to your energy.</p>
    <div class="sl"><span style="font-size:18px;">😴</span><div class="st"><div class="sf"><div class="sth"></div></div></div><span style="font-size:18px;">⚡</span></div>
    <div class="el"><span>Drained</span><span>OK</span><span>Great</span></div>
    <div class="es">4 / 5 — feeling good</div>
  </div>
  <div class="wp">
    <div class="ph"><div><h3>Push day — chest & shoulders</h3><p class="subtle" style="margin-top:4px;font-size:13px;">45 min · 6 exercises · ~430 kcal</p></div><div class="pbd"><div class="pv">430</div><div class="pl">kcal</div></div></div>
    <div class="exl">
      <div class="ex"><div class="en">1</div><div><h4>Barbell bench press</h4><p>Chest, triceps, anterior delt</p></div><div class="eset">4×8</div></div>
      <div class="ex"><div class="en">2</div><div><h4>Incline dumbbell press</h4><p>Upper chest, shoulders</p></div><div class="eset">3×10</div></div>
      <div class="ex"><div class="en">3</div><div><h4>Overhead press</h4><p>Shoulders, triceps</p></div><div class="eset">4×8</div></div>
      <div class="ex"><div class="en">4</div><div><h4>Cable lateral raises</h4><p>Medial delts</p></div><div class="eset">3×15</div></div>
      <div class="ex"><div class="en">5</div><div><h4>Chest flyes</h4><p>Pec major, minor</p></div><div class="eset">3×12</div></div>
      <div class="ex"><div class="en">6</div><div><h4>Tricep pushdown</h4><p>Triceps</p></div><div class="eset">3×15</div></div>
    </div>
  </div>
  <div class="br"><button type="button" class="btn-quiet btn-soft">↻ Regenerate</button><button type="button" class="btn-pulse" style="width:auto;">Let's go →</button></div>
</div>
</body></html>`;

// ─────────────────────────────────────────────────────────────
// 7. EXERCISE PLAYER
// ─────────────────────────────────────────────────────────────
export const EXERCISE_PLAYER_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${PULSE_DEMO_IFRAME_BASE_CSS}
.tb{padding:10px 22px;display:flex;justify-content:space-between;align-items:center;}
.tb .tm{font-size:12px;color:var(--p-muted);font-weight:600;}
.tb .tt{font-size:12px;font-weight:800;color:var(--p-accent);}
.pt{margin:0 22px;height:3px;background:var(--p-card2);border-radius:100px;overflow:hidden;}
.pt>i{display:block;height:100%;width:33%;background:var(--p-accent);border-radius:100px;}
.vis{margin:16px 22px;height:200px;border-radius:var(--p-radius-lg);background:var(--p-card);border:1px solid var(--p-border);display:flex;align-items:center;justify-content:center;position:relative;box-shadow:var(--p-shadow);}
.vis span{font-size:72px;}
.bdg{position:absolute;top:12px;right:12px;background:var(--p-card2);border:1px solid var(--p-border);border-radius:8px;padding:5px 9px;font-size:11px;font-weight:800;}
.ei{padding:0 22px;}
.ei h2{font-size:26px;font-weight:800;margin-bottom:6px;}
.ei .et{font-size:13px;color:var(--p-muted);margin-bottom:16px;}
.sd{display:flex;gap:8px;align-items:center;justify-content:center;margin-bottom:16px;}
.sd i{width:8px;height:8px;border-radius:100px;background:var(--p-border);}
.sd i.on{background:var(--p-accent);}
.sd i.act{width:22px;background:var(--p-accent);}
.rp{text-align:center;margin-bottom:20px;}
.rp .rn{font-size:56px;font-weight:900;letter-spacing:-2px;line-height:1;color:var(--p-accent);}
.rp .rl{font-size:11px;color:var(--p-muted);font-weight:700;margin-top:4px;letter-spacing:0.08em;}
.wg{display:flex;align-items:center;justify-content:center;gap:14px;margin-bottom:20px;}
.wb{width:44px;height:44px;background:var(--p-card2);border:1px solid var(--p-border);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;color:var(--p-text);cursor:pointer;}
.skip{text-align:center;margin-top:12px;font-size:13px;color:var(--p-muted2);font-weight:600;}
</style></head><body>
<div class="status"><span>9:41</span><div class="status-r"><span>●●●</span><span>WiFi</span><span style="font-size:13px;">🔋</span></div></div>
<div class="tb"><span class="tm">Exercise 3 of 6</span><span class="tt">⏱ 23:14</span></div>
<div class="pt"><i></i></div>
<div class="vis"><span>🏋️</span><span class="bdg">Set 2 of 4</span></div>
<div class="ei">
  <h2>Overhead press</h2>
  <p class="et">Shoulders · Triceps · Core stability</p>
  <div class="sd"><i class="on"></i><i class="act"></i><i></i><i></i></div>
  <div class="rp"><div class="rn">8</div><div class="rl">Target reps</div></div>
  <div class="wg"><button type="button" class="wb">−</button><div><span style="font-size:21px;font-weight:800;">52.5</span> <span style="font-size:13px;color:var(--p-muted);">kg</span></div><button type="button" class="wb">+</button></div>
</div>
<button type="button" class="btn-pulse" style="margin:0 22px;width:calc(100% - 44px);">✓ Set complete</button>
<p class="skip">Skip exercise</p>
</body></html>`;

// ─────────────────────────────────────────────────────────────
// 8. WORKOUT COMPLETION & LOG
// ─────────────────────────────────────────────────────────────
export const WORKOUT_LOG_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${PULSE_DEMO_IFRAME_BASE_CSS}
.cx{padding:18px 22px 100px;text-align:center;}
.ce{font-size:64px;margin-bottom:12px;}
.cx h1{font-size:28px;font-weight:900;letter-spacing:-0.8px;margin-bottom:6px;}
.sg{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:18px 0;}
.sg>div{background:var(--p-card);border:1px solid var(--p-border);border-radius:var(--p-radius);padding:14px 8px;}
.sg .v{font-size:20px;font-weight:800;color:var(--p-accent);}
.sg .l{font-size:10px;color:var(--p-muted);margin-top:4px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;}
.prb{display:inline-flex;align-items:center;gap:8px;background:var(--p-warn-bg);border:1px solid var(--p-line);border-radius:var(--p-radius);padding:10px 16px;margin-bottom:16px;}
.prb span{font-size:13px;font-weight:800;color:var(--p-gold);}
.wk{background:var(--p-card);border:1px solid var(--p-border);border-radius:var(--p-radius-lg);padding:18px;margin-bottom:16px;text-align:left;}
.wk h3{font-size:14px;font-weight:700;margin-bottom:12px;}
.dr{display:flex;gap:6px;justify-content:center;}
.dc{width:36px;height:36px;border-radius:100px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:11px;font-weight:800;}
.dc.ok{background:var(--p-accent);color:var(--p-on-accent);}
.dc.today{background:var(--p-dim);border:1px solid var(--p-line);color:var(--p-accent);}
.dc.rest{background:var(--p-card2);color:var(--p-muted2);}
.br2{display:flex;gap:10px;}
</style></head><body>
<div class="status"><span>9:41</span><div class="status-r"><span>●●●</span><span>WiFi</span><span style="font-size:13px;">🔋</span></div></div>
<div class="cx">
  <div class="ce">🎉</div>
  <h1>Workout complete!</h1>
  <p class="subtle" style="margin-bottom:20px;">Push day — 42 min 18 sec</p>
  <div class="sg">
    <div><div class="v">42m</div><div class="l">Duration</div></div>
    <div><div class="v">387</div><div class="l">Kcal</div></div>
    <div><div class="v">6</div><div class="l">Exercises</div></div>
  </div>
  <div class="prb"><span>🏆</span><span>New PR: Bench 90kg × 8</span></div>
  <div class="wk">
    <h3>This week's progress</h3>
    <div class="dr">
      <div class="dc ok"><span>M</span><span style="font-size:8px;">✓</span></div>
      <div class="dc rest">T</div>
      <div class="dc ok"><span>W</span><span style="font-size:8px;">✓</span></div>
      <div class="dc today"><span>T</span><span style="font-size:8px;">✓</span></div>
      <div class="dc rest">F</div>
      <div class="dc rest">S</div>
      <div class="dc rest">S</div>
    </div>
  </div>
  <div class="br2"><button type="button" class="btn-quiet btn-soft" style="flex:1;">↗ Share</button><button type="button" class="btn-pulse" style="flex:2;width:auto;">Done →</button></div>
</div>
</body></html>`;

// ─────────────────────────────────────────────────────────────
// 9. PROGRESS DASHBOARD
// ─────────────────────────────────────────────────────────────
export const PROGRESS_DASHBOARD_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${PULSE_DEMO_IFRAME_BASE_CSS}
.ph2{padding:12px 22px 8px;display:flex;justify-content:space-between;align-items:center;}
.tabs{display:flex;gap:4px;background:var(--p-card2);border-radius:10px;padding:3px;border:1px solid var(--p-border);}
.tabs b{padding:6px 10px;border-radius:7px;font-size:11px;font-weight:800;color:var(--p-muted);cursor:pointer;}
.tabs b.on{background:var(--p-card);color:var(--p-accent);box-shadow:var(--p-shadow);}
.mc{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:0 22px 12px;}
.mz{background:var(--p-card);border:1px solid var(--p-border);border-radius:var(--p-radius);padding:12px;text-align:center;}
.mz .mv{font-size:20px;font-weight:800;color:var(--p-accent);}
.mz .ml{font-size:10px;color:var(--p-muted);margin-top:4px;font-weight:600;}
.mz .md{font-size:10px;font-weight:700;margin-top:4px;}
.ch{margin:0 22px 12px;background:var(--p-card);border:1px solid var(--p-border);border-radius:var(--p-radius-lg);padding:16px;}
.cht{display:flex;justify-content:space-between;margin-bottom:12px;}
.cht h3{font-size:14px;font-weight:700;}
.cht span{font-size:12px;color:var(--p-muted);}
.cbars{display:flex;align-items:flex-end;gap:5px;height:88px;}
.cbars i{flex:1;border-radius:3px 3px 0 0;background:var(--p-dim2);min-height:8px;}
.cbars i.hi{background:var(--p-accent);}
.cl{display:flex;justify-content:space-between;margin-top:8px;font-size:10px;color:var(--p-muted);}
.mu{margin:0 22px 12px;background:var(--p-card);border:1px solid var(--p-border);border-radius:var(--p-radius-lg);padding:16px;}
.mr{display:flex;align-items:center;gap:10px;margin-bottom:10px;}
.mr:last-child{margin-bottom:0;}
.ml2{font-size:12px;font-weight:600;width:72px;color:var(--p-muted);flex-shrink:0;}
.mt2{flex:1;height:7px;background:var(--p-card2);border-radius:100px;overflow:hidden;}
.mf{height:100%;background:var(--p-accent);border-radius:100px;}
.mc2{font-size:11px;font-weight:800;width:28px;text-align:right;color:var(--p-text);}
</style></head><body>
<div class="status"><span>9:41</span><div class="status-r"><span>●●●</span><span>WiFi</span><span style="font-size:13px;">🔋</span></div></div>
<div class="ph2"><h1 class="page-h1" style="font-size:24px;">Progress</h1><div class="tabs"><b>1W</b><b class="on">1M</b><b>3M</b><b>1Y</b></div></div>
<div class="mc">
  <div class="mz"><div class="mv">18</div><div class="ml">Workouts</div><div class="md" style="color:var(--p-success);">▲ +3</div></div>
  <div class="mz"><div class="mv">24.5k</div><div class="ml">Total vol.</div><div class="md" style="color:var(--p-success);">▲ 12%</div></div>
  <div class="mz"><div class="mv">41m</div><div class="ml">Avg. sess.</div><div class="md" style="color:var(--p-muted);">→ Same</div></div>
</div>
<div class="ch">
  <div class="cht"><h3>Workout frequency</h3><span>Past 30 days</span></div>
  <div class="cbars">
    <i style="height:40%"></i><i style="height:60%"></i><i class="hi" style="height:80%"></i><i style="height:50%"></i><i class="hi" style="height:90%"></i><i style="height:70%"></i><i class="hi" style="height:85%"></i><i style="height:55%"></i><i class="hi" style="height:100%"></i><i style="height:65%"></i><i class="hi" style="height:75%"></i><i style="height:45%"></i>
  </div>
  <div class="cl"><span>Mar 1</span><span>Mar 10</span><span>Mar 20</span><span>Mar 30</span></div>
</div>
<div class="mu">
  <h3 style="font-size:14px;font-weight:700;margin-bottom:12px;">Muscle group focus</h3>
  <div class="mr"><span class="ml2">Chest</span><div class="mt2"><div class="mf" style="width:85%"></div></div><span class="mc2">8×</span></div>
  <div class="mr"><span class="ml2">Legs</span><div class="mt2"><div class="mf" style="width:70%"></div></div><span class="mc2">6×</span></div>
  <div class="mr"><span class="ml2">Back</span><div class="mt2"><div class="mf" style="width:55%"></div></div><span class="mc2">5×</span></div>
  <div class="mr"><span class="ml2">Shoulders</span><div class="mt2"><div class="mf" style="width:40%"></div></div><span class="mc2">4×</span></div>
  <div class="mr"><span class="ml2">Arms</span><div class="mt2"><div class="mf" style="width:25%"></div></div><span class="mc2">2×</span></div>
</div>
<div style="height:80px;"></div>
<div class="bottom-nav">
  <div class="bn-i"><span style="font-size:22px;opacity:0.35;">⌂</span><span class="bn-l">Home</span></div>
  <div class="bn-i"><span style="font-size:22px;opacity:0.35;">◈</span><span class="bn-l">Train</span></div>
  <div class="bn-i"><span style="font-size:22px;">▲</span><span class="bn-l on">Progress</span></div>
  <div class="bn-i"><span style="font-size:22px;opacity:0.35;">◎</span><span class="bn-l">Nutrition</span></div>
  <div class="bn-i"><span style="font-size:22px;opacity:0.35;">◯</span><span class="bn-l">Profile</span></div>
</div>
</body></html>`;

// ─────────────────────────────────────────────────────────────
// 10. STRENGTH ANALYTICS
// ─────────────────────────────────────────────────────────────
export const ANALYTICS_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${PULSE_DEMO_IFRAME_BASE_CSS}
.lt{display:flex;gap:6px;padding:0 22px 12px;overflow-x:auto;}
.lc{margin:0 22px 12px;background:var(--p-card);border:1px solid var(--p-border);border-radius:var(--p-radius-lg);padding:16px;}
.lc h2{font-size:14px;font-weight:700;margin-bottom:4px;}
.lc .ls{font-size:12px;color:var(--p-muted);margin-bottom:12px;}
.ln{position:relative;height:110px;border-bottom:1px solid var(--p-border);margin-bottom:8px;}
.cbd{display:flex;align-items:center;gap:10px;background:var(--p-dim);border:1px solid var(--p-line);border-radius:12px;padding:10px 14px;margin-top:10px;}
.cbd .cv{font-size:20px;font-weight:800;color:var(--p-accent);}
.cbd .cl{font-size:11px;color:var(--p-muted);}
.ptb{background:var(--p-card);border:1px solid var(--p-border);border-radius:var(--p-radius-lg);margin:0 22px 14px;overflow:hidden;}
.pth{padding:12px 14px;background:var(--p-card2);border-bottom:1px solid var(--p-border);display:flex;}
.pth span{font-size:10px;font-weight:800;color:var(--p-muted);letter-spacing:0.06em;}
.pr{display:flex;align-items:center;padding:12px 14px;border-bottom:1px solid var(--p-border);}
.pr:last-child{border-bottom:none;}
.pnw{background:rgba(74,222,128,0.15);color:var(--p-success);border-radius:6px;padding:2px 7px;font-size:9px;font-weight:800;margin-left:8px;}
</style></head><body>
<div class="status"><span>9:41</span><div class="status-r"><span>●●●</span><span>WiFi</span><span style="font-size:13px;">🔋</span></div></div>
<div class="header-pad"><div class="back">←</div><span class="header-title">Strength analytics</span></div>
<div class="lt"><span class="lift-tab on">Bench press</span><span class="lift-tab">Squat</span><span class="lift-tab">Deadlift</span><span class="lift-tab">OHP</span></div>
<div class="lc">
  <h2>Bench press — estimated 1RM</h2>
  <p class="ls">12-week progression</p>
  <div class="ln">
    <svg viewBox="0 0 300 110" fill="none" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;">
      <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#C7FF00" stop-opacity="0.2"/><stop offset="100%" stop-color="#C7FF00" stop-opacity="0"/></linearGradient></defs>
      <path d="M0,90 L25,85 L50,80 L75,75 L100,70 L125,65 L150,60 L175,55 L200,48 L225,40 L250,32 L275,22 L300,15 L300,110 L0,110 Z" fill="url(#g1)"/>
      <path d="M0,90 L25,85 L50,80 L75,75 L100,70 L125,65 L150,60 L175,55 L200,48 L225,40 L250,32 L275,22 L300,15" stroke="#C7FF00" stroke-width="2.2" stroke-linecap="round"/>
      <circle cx="300" cy="15" r="4" fill="#C7FF00"/>
    </svg>
  </div>
  <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--p-muted);"><span>Jan</span><span>Feb</span><span>Mar</span></div>
  <div class="cbd"><div><div class="cv">102.5 kg</div><div class="cl">Current est. 1RM · ▲ +17.5 kg since start</div></div></div>
</div>
<div class="ptb">
  <div class="pth"><span style="flex:1;">Type</span><span>Weight</span><span style="width:64px;text-align:right;">Date</span></div>
  <div class="pr"><span style="flex:1;font-size:12px;font-weight:700;">1 rep max</span><span style="font-size:14px;font-weight:800;">102.5 kg</span><span style="font-size:11px;color:var(--p-muted);width:56px;text-align:right;">Today</span><span class="pnw">NEW</span></div>
  <div class="pr"><span style="flex:1;font-size:12px;font-weight:700;">3 rep max</span><span style="font-size:14px;font-weight:800;">92.5 kg</span><span style="font-size:11px;color:var(--p-muted);width:56px;text-align:right;">Mar 2</span></div>
  <div class="pr"><span style="flex:1;font-size:12px;font-weight:700;">5 rep max</span><span style="font-size:14px;font-weight:800;">87.5 kg</span><span style="font-size:11px;color:var(--p-muted);width:56px;text-align:right;">Feb 24</span></div>
  <div class="pr"><span style="flex:1;font-size:12px;font-weight:700;">8 rep max</span><span style="font-size:14px;font-weight:800;">80 kg</span><span style="font-size:11px;color:var(--p-muted);width:56px;text-align:right;">Feb 16</span></div>
</div>
</body></html>`;

// ─────────────────────────────────────────────────────────────
// 11. AI COACHING INSIGHTS
// ─────────────────────────────────────────────────────────────
export const AI_INSIGHTS_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${PULSE_DEMO_IFRAME_BASE_CSS}
.wk-ban{margin:0 22px 14px;border-radius:var(--p-radius-lg);padding:18px;background:var(--p-card);border:1px solid var(--p-line);box-shadow:var(--p-shadow);}
.wk-h{display:flex;align-items:center;gap:12px;margin-bottom:12px;}
.wk-av{width:44px;height:44px;border-radius:14px;background:var(--p-dim);border:1px solid var(--p-line);display:flex;align-items:center;justify-content:center;font-size:22px;}
.wk-tx{font-size:14px;line-height:1.55;color:var(--p-text);margin-bottom:12px;}
.wk-stats{display:flex;gap:8px;flex-wrap:wrap;}
.wk-stats>div{background:var(--p-card2);border:1px solid var(--p-border);border-radius:10px;padding:8px 11px;}
.wk-stats .v{font-size:15px;font-weight:800;color:var(--p-accent);}
.wk-stats .l{font-size:9px;color:var(--p-muted);margin-top:2px;text-transform:uppercase;letter-spacing:0.05em;}
.ic{background:var(--p-card);border:1px solid var(--p-border);border-radius:var(--p-radius-lg);padding:16px;margin-bottom:10px;}
.ich{display:flex;align-items:flex-start;gap:12px;margin-bottom:8px;}
.ii{width:40px;height:40px;border-radius:12px;background:var(--p-dim);border:1px solid var(--p-border);display:flex;align-items:center;justify-content:center;font-size:18px;}
.it{font-size:14px;font-weight:700;}
.ib{font-size:12px;color:var(--p-muted);line-height:1.55;}
.ia{margin-top:10px;font-size:12px;font-weight:800;color:var(--p-accent);}
.tagx{font-size:9px;font-weight:800;padding:3px 8px;border-radius:6px;background:var(--p-warn-bg);color:var(--p-gold);border:1px solid var(--p-line);}
.tagb{font-size:9px;font-weight:800;padding:3px 8px;border-radius:6px;background:var(--p-dim);color:var(--p-accent);border:1px solid var(--p-line);}
.tagg{font-size:9px;font-weight:800;padding:3px 8px;border-radius:6px;background:rgba(74,222,128,0.12);color:var(--p-success);border:1px solid var(--p-border);}
</style></head><body>
<div class="status"><span>9:41</span><div class="status-r"><span>●●●</span><span>WiFi</span><span style="font-size:13px;">🔋</span></div></div>
<div class="header-pad"><div class="back">←</div><span class="header-title">AI coaching insights</span></div>
<div class="content-tight">
  <div class="wk-ban">
    <div class="wk-h"><div class="wk-av">🤖</div><div><div style="font-size:14px;font-weight:800;">Pulse AI Coach</div><div style="font-size:12px;color:var(--p-muted);margin-top:2px;">Weekly analysis · Mar 6, 2026</div></div></div>
    <p class="wk-tx">Your squat volume increased 23% this week — excellent progression. Consider a deload next week before your peak phase.</p>
    <div class="wk-stats">
      <div><div class="v">+23%</div><div class="l">Volume</div></div>
      <div><div class="v">14 days</div><div class="l">Streak</div></div>
      <div><div class="v">4.2/5</div><div class="l">Recovery</div></div>
    </div>
  </div>
  <div class="ic">
    <div class="ich"><div class="ii">⚡</div><div style="flex:1;display:flex;justify-content:space-between;align-items:flex-start;gap:8px;"><div class="it">Recovery alert</div><span class="tagx">Action</span></div></div>
    <p class="ib">HRV suggests mild fatigue. Reduce intensity ~15% Friday or swap in active recovery.</p>
    <span class="ia">View recovery plan →</span>
  </div>
  <div class="ic">
    <div class="ich"><div class="ii">📊</div><div style="flex:1;display:flex;justify-content:space-between;align-items:flex-start;gap:8px;"><div class="it">Bench plateau detected</div><span class="tagb">Tip</span></div></div>
    <p class="ib">Bench flat at 90kg for 3 sessions. Pause reps or close-grip work are queued for next week.</p>
    <span class="ia">See updated plan →</span>
  </div>
  <div class="ic">
    <div class="ich"><div class="ii">🥗</div><div style="flex:1;display:flex;justify-content:space-between;align-items:flex-start;gap:8px;"><div class="it">Protein under target</div><span class="tagg">Fuel</span></div></div>
    <p class="ib">Averaging 118g vs 175g target — muscle repair may lag. High-protein meals are pinned in Nutrition.</p>
    <span class="ia">View meal suggestions →</span>
  </div>
</div>
</body></html>`;

// ─────────────────────────────────────────────────────────────
// 12. NUTRITION DASHBOARD
// ─────────────────────────────────────────────────────────────
export const NUTRITION_LOG_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${PULSE_DEMO_IFRAME_BASE_CSS}
.nh{padding:12px 22px 10px;display:flex;justify-content:space-between;align-items:center;}
.nh h1{font-size:24px;font-weight:800;}
.nd{font-size:12px;color:var(--p-muted);font-weight:600;}
.cal{margin:0 22px 12px;border-radius:var(--p-radius-lg);padding:18px;background:var(--p-card);border:1px solid var(--p-line);box-shadow:var(--p-shadow);}
.cr{display:flex;align-items:center;gap:14px;}
.cr h2{font-size:30px;font-weight:900;letter-spacing:-0.5px;}
.cr>p{font-size:12px;color:var(--p-muted);margin-top:2px;}
.rem{display:inline-block;margin-top:8px;padding:6px 11px;background:var(--p-dim);border:1px solid var(--p-line);border-radius:10px;font-size:12px;font-weight:700;color:var(--p-accent);}
.m3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:0 22px 12px;}
.mc3{background:var(--p-card);border:1px solid var(--p-border);border-radius:var(--p-radius);padding:12px;}
.mc3 .mt{display:flex;justify-content:space-between;margin-bottom:6px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.04em;}
.mc3 .tr{height:5px;background:var(--p-card2);border-radius:100px;margin-bottom:6px;overflow:hidden;}
.mc3 .tf{height:100%;border-radius:100px;}
.mc3 .mv{font-size:15px;font-weight:800;}
.mc3 .mtg{font-size:10px;color:var(--p-muted);}
.ms{margin:0 22px;}
.mh{display:flex;justify-content:space-between;padding:12px 0 6px;}
.mh h3{font-size:14px;font-weight:700;}
.mh span{font-size:12px;color:var(--p-muted);}
.fi{display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid var(--p-border);}
.fi:last-child{border-bottom:none;}
.fic{width:36px;height:36px;border-radius:10px;background:var(--p-card2);display:flex;align-items:center;justify-content:center;font-size:17px;}
.fi h4{font-size:13px;font-weight:600;}
.fi p{font-size:11px;color:var(--p-muted);margin-top:2px;}
.fcal{margin-left:auto;font-size:13px;font-weight:800;color:var(--p-accent);}
.fab2{position:fixed;bottom:88px;right:22px;width:52px;height:52px;background:var(--p-accent);color:var(--p-on-accent);border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:300;box-shadow:var(--p-glow);border:none;cursor:pointer;}
</style></head><body>
<div class="status"><span>9:41</span><div class="status-r"><span>●●●</span><span>WiFi</span><span style="font-size:13px;">🔋</span></div></div>
<div class="nh"><h1>Nutrition</h1><span class="nd">Thu, Mar 6</span></div>
<div class="cal">
  <div class="cr">
    <svg width="88" height="88" viewBox="0 0 90 90"><circle cx="45" cy="45" r="38" fill="none" stroke="#2a2f3a" stroke-width="8"/><circle cx="45" cy="45" r="38" fill="none" stroke="#C7FF00" stroke-width="8" stroke-linecap="round" stroke-dasharray="239" stroke-dashoffset="71" transform="rotate(-90 45 45)"/></svg>
    <div><h2>1,840</h2><p>of 2,400 kcal consumed</p><span class="rem">560 kcal left</span></div>
  </div>
</div>
<div class="m3">
  <div class="mc3"><div class="mt"><span style="color:#f87171;">Protein</span><span style="color:#f87171;">81%</span></div><div class="tr"><div class="tf" style="width:81%;background:#f87171;"></div></div><div class="mv">142g</div><div class="mtg">of 175g</div></div>
  <div class="mc3"><div class="mt"><span style="color:var(--p-gold);">Carbs</span><span style="color:var(--p-gold);">73%</span></div><div class="tr"><div class="tf" style="width:73%;background:var(--p-gold);"></div></div><div class="mv">186g</div><div class="mtg">of 255g</div></div>
  <div class="mc3"><div class="mt"><span style="color:#60a5fa;">Fat</span><span style="color:#60a5fa;">96%</span></div><div class="tr"><div class="tf" style="width:96%;background:#60a5fa;"></div></div><div class="mv">58g</div><div class="mtg">of 60g</div></div>
</div>
<div class="ms">
  <div class="mh"><h3>🌅 Breakfast</h3><span>542 kcal</span></div>
  <div class="fi"><div class="fic">🍳</div><div><h4>3 whole eggs, scrambled</h4><p>23g protein · 210 kcal</p></div><div class="fcal">210</div></div>
  <div class="fi"><div class="fic">🥣</div><div><h4>Oats with blueberries</h4><p>8g protein · 332 kcal</p></div><div class="fcal">332</div></div>
  <div class="mh"><h3>☀️ Lunch</h3><span>698 kcal</span></div>
  <div class="fi"><div class="fic">🍗</div><div><h4>Grilled chicken (200g)</h4><p>48g protein · 330 kcal</p></div><div class="fcal">330</div></div>
  <div class="fi"><div class="fic">🍚</div><div><h4>Brown rice (150g cooked)</h4><p>5g protein · 368 kcal</p></div><div class="fcal">368</div></div>
</div>
<div style="height:90px;"></div>
<button type="button" class="fab2">+</button>
<div class="bottom-nav">
  <div class="bn-i"><span style="font-size:22px;opacity:0.35;">⌂</span><span class="bn-l">Home</span></div>
  <div class="bn-i"><span style="font-size:22px;opacity:0.35;">◈</span><span class="bn-l">Train</span></div>
  <div class="bn-i"><span style="font-size:22px;opacity:0.35;">▲</span><span class="bn-l">Progress</span></div>
  <div class="bn-i"><span style="font-size:22px;">◎</span><span class="bn-l on">Nutrition</span></div>
  <div class="bn-i"><span style="font-size:22px;opacity:0.35;">◯</span><span class="bn-l">Profile</span></div>
</div>
</body></html>`;

// ─────────────────────────────────────────────────────────────
// 13. AI MEAL SUGGESTIONS
// ─────────────────────────────────────────────────────────────
export const AI_MEALS_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${PULSE_DEMO_IFRAME_BASE_CSS}
.ban{margin:0 22px 14px;border-radius:var(--p-radius);padding:14px;background:var(--p-dim);border:1px solid var(--p-line);display:flex;gap:10px;align-items:center;}
.ban h3{font-size:13px;font-weight:800;}
.ban p{font-size:11px;color:var(--p-muted);margin-top:2px;}
.filt{display:flex;gap:6px;margin:0 22px 14px;overflow-x:auto;padding-bottom:4px;}
.filt span{padding:7px 13px;border-radius:100px;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;background:var(--p-card2);border:1px solid var(--p-border);color:var(--p-muted);}
.filt span.on{background:var(--p-accent);color:var(--p-on-accent);border-color:var(--p-accent);}
.mcard{background:var(--p-card);border:1px solid var(--p-border);border-radius:var(--p-radius-lg);padding:16px;margin:0 22px 10px;box-shadow:var(--p-shadow);}
.mimg{width:100%;height:120px;border-radius:12px;background:var(--p-card2);border:1px solid var(--p-border);display:flex;align-items:center;justify-content:center;font-size:44px;margin-bottom:12px;}
.mtop{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;}
.mnm{font-size:16px;font-weight:800;flex:1;}
.mtm{font-size:11px;color:var(--p-muted);font-weight:600;}
.chp{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px;}
.chp i{font-size:11px;font-weight:700;padding:4px 9px;border-radius:100px;background:var(--p-card2);border:1px solid var(--p-border);}
.chp i.p{border-color:rgba(248,113,113,0.4);color:#f87171;}
.mbot{display:flex;justify-content:space-between;align-items:center;}
.mbot span{font-size:12px;color:var(--p-muted);}
.mbot button{padding:8px 14px;border-radius:10px;border:none;background:var(--p-accent);color:var(--p-on-accent);font-size:12px;font-weight:800;cursor:pointer;}
</style></head><body>
<div class="status"><span>9:41</span><div class="status-r"><span>●●●</span><span>WiFi</span><span style="font-size:13px;">🔋</span></div></div>
<div class="header-pad"><div class="back">←</div><span class="header-title">AI meal suggestions</span></div>
<div class="content-tight">
  <div class="ban"><span style="font-size:20px;">✦</span><div><h3>33g protein gap left today</h3><p>These meals close the loop</p></div></div>
  <div class="filt"><span class="on">All</span><span>High protein</span><span>Low carb</span><span>Quick &lt;30m</span><span>Vegan</span></div>
  <div class="mcard"><div class="mimg">🍣</div><div class="mtop"><div class="mnm">Salmon & quinoa bowl</div><span class="mtm">⏱ 25 min</span></div><div class="chp"><i class="p">48g protein</i><i>42g carbs</i><i>14g fat</i></div><div class="mbot"><span>520 kcal · Best match ✦</span><button type="button">+ Add</button></div></div>
  <div class="mcard"><div class="mimg">🥚</div><div class="mtop"><div class="mnm">Greek omelette & feta</div><span class="mtm">⏱ 10 min</span></div><div class="chp"><i class="p">38g protein</i><i>8g carbs</i><i>22g fat</i></div><div class="mbot"><span>382 kcal</span><button type="button">+ Add</button></div></div>
  <div class="mcard"><div class="mimg">🍗</div><div class="mtop"><div class="mnm">Teriyaki chicken stir-fry</div><span class="mtm">⏱ 20 min</span></div><div class="chp"><i class="p">44g protein</i><i>36g carbs</i><i>8g fat</i></div><div class="mbot"><span>396 kcal</span><button type="button">+ Add</button></div></div>
</div>
</body></html>`;

// ─────────────────────────────────────────────────────────────
// 14. RECIPE DETAIL
// ─────────────────────────────────────────────────────────────
export const RECIPE_DETAIL_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${PULSE_DEMO_IFRAME_BASE_CSS}
.rh{width:100%;height:200px;background:var(--p-card);border-bottom:1px solid var(--p-border);display:flex;align-items:center;justify-content:center;font-size:72px;position:relative;}
.rb{position:absolute;top:48px;left:16px;width:36px;height:36px;background:var(--p-card2);border:1px solid var(--p-border);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;z-index:2;}
.st0{position:absolute;top:0;left:0;width:100%;padding:12px 22px 0;display:flex;justify-content:space-between;z-index:3;font-size:13px;font-weight:600;}
.rc{padding:16px 22px 100px;}
.rch{display:flex;gap:6px;flex-wrap:wrap;margin:12px 0 14px;}
.rch span{padding:5px 11px;border-radius:100px;font-size:12px;font-weight:700;background:var(--p-card2);border:1px solid var(--p-border);}
.rch span.hi{border-color:var(--p-line);color:var(--p-accent);}
.meta{display:flex;gap:14px;margin-bottom:16px;font-size:12px;color:var(--p-muted);font-weight:600;}
.tabs2{display:flex;background:var(--p-card2);border-radius:12px;padding:3px;border:1px solid var(--p-border);margin-bottom:14px;}
.tabs2 b{flex:1;text-align:center;padding:8px;border-radius:9px;font-size:13px;font-weight:700;cursor:pointer;color:var(--p-muted);}
.tabs2 b.on{background:var(--p-card);color:var(--p-accent);}
.ing{display:flex;justify-content:space-between;padding:11px 0;border-bottom:1px solid var(--p-border);font-size:13px;}
.ing:last-child{border-bottom:none;}
.sf2{position:fixed;bottom:0;left:0;width:390px;background:rgba(5,5,8,0.96);border-top:1px solid var(--p-border);padding:12px 22px 28px;backdrop-filter:blur(10px);}
</style></head><body>
<div class="rh"><div class="st0"><span>9:41</span><div class="status-r"><span>●●●</span><span>WiFi</span><span style="font-size:13px;">🔋</span></div></div><span>🍣</span><div class="rb">←</div></div>
<div class="rc">
  <h1 class="page-h1" style="font-size:24px;">Salmon & quinoa bowl</h1>
  <div class="rch"><span class="hi">520 kcal</span><span>48g protein</span><span>42g carbs</span><span>14g fat</span></div>
  <div class="meta"><span>⏱ 25 min</span><span>👤 1 serving</span><span>⚡ Easy</span></div>
  <div class="tabs2"><b class="on">Ingredients</b><b>Instructions</b></div>
  <div class="ing"><span>Salmon fillet</span><span style="color:var(--p-muted);">180g</span></div>
  <div class="ing"><span>Quinoa (dry)</span><span style="color:var(--p-muted);">80g</span></div>
  <div class="ing"><span>Edamame</span><span style="color:var(--p-muted);">60g</span></div>
  <div class="ing"><span>Cucumber</span><span style="color:var(--p-muted);">½ medium</span></div>
  <div class="ing"><span>Avocado</span><span style="color:var(--p-muted);">¼ medium</span></div>
  <div class="ing"><span>Soy sauce</span><span style="color:var(--p-muted);">1 tbsp</span></div>
  <div class="ing"><span>Sesame oil</span><span style="color:var(--p-muted);">1 tsp</span></div>
  <div class="ing"><span>Sesame seeds</span><span style="color:var(--p-muted);">1 tsp</span></div>
</div>
<div class="sf2"><button type="button" class="btn-pulse">Log this meal</button></div>
</body></html>`;

// ─────────────────────────────────────────────────────────────
// 15. LOG MEAL
// ─────────────────────────────────────────────────────────────
export const LOG_MEAL_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${PULSE_DEMO_IFRAME_BASE_CSS}
.h3bar{padding:12px 22px;display:flex;align-items:center;justify-content:space-between;}
.fs{background:var(--p-card);border:1px solid var(--p-border);border-radius:var(--p-radius-lg);padding:16px;margin-bottom:14px;display:flex;gap:12px;align-items:center;}
.fe{font-size:36px;width:52px;height:52px;border-radius:14px;background:var(--p-card2);display:flex;align-items:center;justify-content:center;}
.pc{background:var(--p-card);border:1px solid var(--p-border);border-radius:var(--p-radius-lg);padding:16px;margin-bottom:14px;}
.ps{display:flex;align-items:center;justify-content:space-between;background:var(--p-card2);border-radius:12px;padding:4px;border:1px solid var(--p-border);}
.pb{width:48px;height:48px;background:var(--p-card);border:1px solid var(--p-border);border-radius:10px;font-size:22px;color:var(--p-text);cursor:pointer;}
.pn{font-size:28px;font-weight:900;color:var(--p-accent);}
.lm{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:14px;}
.lm>div{background:var(--p-card);border:1px solid var(--p-border);border-radius:10px;padding:10px 6px;text-align:center;}
.lm .v{font-size:14px;font-weight:800;}
.lm .l{font-size:9px;color:var(--p-muted);margin-top:2px;font-weight:700;}
.mto{background:var(--p-card);border:1px solid var(--p-border);border-radius:var(--p-radius-lg);padding:16px;margin-bottom:14px;}
.mog{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
.mog>div{padding:10px;border-radius:12px;border:1px solid var(--p-border);font-size:12px;font-weight:700;text-align:center;cursor:pointer;color:var(--p-muted);}
.mog>div.on{border-color:var(--p-line);background:var(--p-dim);color:var(--p-accent);}
</style></head><body>
<div class="status"><span>9:41</span><div class="status-r"><span>●●●</span><span>WiFi</span><span style="font-size:13px;">🔋</span></div></div>
<div class="h3bar"><span class="back-tap">Cancel</span><span class="header-title">Log meal</span><span style="width:48px;"></span></div>
<div class="content-tight">
  <div class="fs"><div class="fe">🍣</div><div><h3 style="font-size:16px;font-weight:800;">Salmon & quinoa bowl</h3><p class="subtle" style="font-size:12px;margin-top:4px;">520 kcal per serving</p></div></div>
  <div class="pc"><p style="font-size:13px;font-weight:700;margin-bottom:12px;">Portion</p><div class="ps"><button type="button" class="pb">−</button><div style="text-align:center;"><div class="pn">1×</div><p class="subtle" style="font-size:11px;margin-top:2px;">~350g serving</p></div><button type="button" class="pb">+</button></div></div>
  <div class="lm">
    <div><div class="v">520</div><div class="l">Kcal</div></div>
    <div><div class="v" style="color:#f87171;">48g</div><div class="l">Protein</div></div>
    <div><div class="v" style="color:var(--p-gold);">42g</div><div class="l">Carbs</div></div>
    <div><div class="v" style="color:#60a5fa;">14g</div><div class="l">Fat</div></div>
  </div>
  <div class="mto"><p style="font-size:13px;font-weight:700;margin-bottom:10px;">Meal type</p><div class="mog"><div>🌅 Breakfast</div><div>☀️ Lunch</div><div class="on">🌆 Dinner</div><div>🍎 Snack</div></div></div>
  <button type="button" class="btn-pulse">Save to log</button>
  <p class="link-muted" style="margin-top:12px;">Logged at 9:41 PM · Thu, Mar 6</p>
</div>
</body></html>`;

// ─────────────────────────────────────────────────────────────
// BRANCH SCREENS — Completion & Log branches
// ─────────────────────────────────────────────────────────────

export const LOG_PR_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${PULSE_DEMO_IFRAME_BASE_CSS}
.cf{display:flex;justify-content:center;gap:6px;padding:16px 0 4px;font-size:24px;}
.hx{text-align:center;padding:6px 28px 20px;}
.bd{display:inline-block;background:var(--p-warn-bg);border:1px solid var(--p-line);color:var(--p-gold);font-size:10px;font-weight:800;padding:5px 12px;border-radius:20px;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px;}
.hx h2{font-size:28px;font-weight:900;letter-spacing:-0.5px;margin-bottom:6px;}
.prx{margin:0 22px;background:var(--p-card);border:1px solid var(--p-border);border-radius:var(--p-radius-lg);padding:20px;}
.ln{font-size:16px;font-weight:800;color:var(--p-gold);margin-bottom:14px;}
.cr{display:flex;align-items:center;gap:10px;}
.po{flex:1;text-align:center;background:var(--p-card2);border:1px solid var(--p-border);border-radius:14px;padding:12px;}
.po .pv{font-size:24px;font-weight:800;color:var(--p-muted);}
.pn2{flex:1;text-align:center;background:rgba(74,222,128,0.08);border:1px solid rgba(74,222,128,0.35);border-radius:14px;padding:12px;}
.pn2 .pv{font-size:28px;font-weight:900;color:var(--p-success);}
.dl{text-align:center;margin-top:12px;font-size:12px;color:var(--p-success);font-weight:600;}
.sx{display:flex;gap:10px;margin:14px 22px 0;}
.sx>div{flex:1;background:var(--p-card);border:1px solid var(--p-border);border-radius:14px;padding:12px;text-align:center;}
.sx .v{font-size:18px;font-weight:800;color:var(--p-accent);}
.sx .l{font-size:9px;color:var(--p-muted);margin-top:4px;text-transform:uppercase;}
.fx{position:fixed;bottom:0;left:0;width:390px;padding:14px 22px 32px;background:linear-gradient(transparent,rgba(5,5,8,0.97));}
</style></head><body>
<div class="status"><span>9:41</span><div class="status-r">▲▲▲ WiFi 🔋</div></div>
<div class="cf">🎉 🏆 🎉 🥇 🎉</div>
<div class="hx"><div class="bd">New PR</div><h2>You crushed it</h2><p class="subtle">All-time best on deadlift</p></div>
<div class="prx">
  <div class="ln">🏋️ Deadlift — 1RM</div>
  <div class="cr">
    <div class="po"><div class="pv">115<small style="font-size:14px;">kg</small></div><div style="font-size:10px;color:var(--p-muted2);margin-top:4px;">Previous</div></div>
    <div style="font-size:20px;color:var(--p-success);">→</div>
    <div class="pn2"><div class="pv">127.5<small style="font-size:15px;">kg</small></div><div style="font-size:10px;color:var(--p-success);margin-top:4px;">New PR</div></div>
  </div>
  <div class="dl">+12.5 kg · +10.9%</div>
</div>
<div class="sx"><div><div class="v">4</div><div class="l">PRs / mo</div></div><div><div class="v">Top 8%</div><div class="l">Level</div></div><div><div class="v">42 wk</div><div class="l">Training</div></div></div>
<div style="height:120px;"></div>
<div class="fx"><button type="button" class="btn-pulse" style="background:var(--p-gold);color:var(--p-on-accent);box-shadow:none;">Share this PR 🏆</button><button type="button" class="btn-quiet" style="margin-top:10px;">Save & continue</button></div>
</body></html>`;

export const SHARE_WORKOUT_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${PULSE_DEMO_IFRAME_BASE_CSS}
.scard{margin:8px 22px;border-radius:var(--p-radius-lg);padding:22px;background:var(--p-card);border:1px solid var(--p-line);box-shadow:var(--p-shadow);}
.slg{font-size:10px;font-weight:800;color:var(--p-muted);letter-spacing:0.12em;margin-bottom:14px;}
.snm{font-size:21px;font-weight:900;margin-bottom:4px;}
.sdt{font-size:12px;color:var(--p-muted);margin-bottom:18px;}
.sg{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;}
.sg>div{background:var(--p-card2);border:1px solid var(--p-border);border-radius:14px;padding:12px;}
.sg .v{font-size:24px;font-weight:900;color:var(--p-accent);}
.sg .l{font-size:10px;color:var(--p-muted);margin-top:4px;text-transform:uppercase;letter-spacing:0.04em;}
.sbd{display:inline-flex;align-items:center;gap:6px;background:var(--p-warn-bg);border:1px solid var(--p-line);color:var(--p-gold);font-size:11px;font-weight:700;padding:6px 11px;border-radius:20px;}
.so{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:0 22px 14px;}
.so>div{display:flex;align-items:center;gap:10px;background:var(--p-card);border:1px solid var(--p-border);border-radius:14px;padding:12px;}
.si{width:36px;height:36px;border-radius:10px;background:var(--p-card2);border:1px solid var(--p-border);display:flex;align-items:center;justify-content:center;font-size:16px;}
.st{font-size:13px;font-weight:700;}
.ss{font-size:10px;color:var(--p-muted);margin-top:2px;}
</style></head><body>
<div class="status"><span>9:41</span><div class="status-r">●●● WiFi 🔋</div></div>
<div class="header-pad"><span class="back-tap">←</span><span class="header-title">Share workout</span></div>
<div class="scard">
  <div class="slg">PULSE · SHARE CARD</div>
  <div class="snm">Upper body power</div>
  <div class="sdt">Thursday, Mar 6 · 42 min</div>
  <div class="sg">
    <div><div class="v">387</div><div class="l">Calories</div></div>
    <div><div class="v">5</div><div class="l">Exercises</div></div>
    <div><div class="v">14</div><div class="l">Streak</div></div>
    <div><div class="v">4,820</div><div class="l">Vol kg</div></div>
  </div>
  <div class="sbd">🏆 New PR: Deadlift 127.5kg</div>
</div>
<p class="kicker" style="padding:12px 22px 8px;">Share to</p>
<div class="so">
  <div><div class="si">📸</div><div><div class="st">Instagram</div><div class="ss">Story</div></div></div>
  <div><div class="si">🐦</div><div><div class="st">Twitter / X</div><div class="ss">Post</div></div></div>
  <div><div class="si">💬</div><div><div class="st">WhatsApp</div><div class="ss">Send</div></div></div>
  <div><div class="si">📁</div><div><div class="st">Save image</div><div class="ss">Camera roll</div></div></div>
</div>
<button type="button" class="btn-pulse" style="margin:0 22px;width:calc(100% - 44px);">🔗 Copy link</button>
</body></html>`;

export const AI_DEBRIEF_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${PULSE_DEMO_IFRAME_BASE_CSS}
.bn{margin:4px 22px 12px;border-radius:var(--p-radius-lg);padding:16px;background:var(--p-card);border:1px solid var(--p-line);display:flex;gap:12px;align-items:center;}
.ba{width:48px;height:48px;border-radius:14px;background:var(--p-dim);border:1px solid var(--p-line);display:flex;align-items:center;justify-content:center;font-size:22px;}
.ic2{margin:0 22px 10px;background:var(--p-card);border:1px solid var(--p-border);border-radius:var(--p-radius);padding:14px;display:flex;gap:12px;}
.ii2{width:38px;height:38px;border-radius:11px;background:var(--p-card2);border:1px solid var(--p-border);display:flex;align-items:center;justify-content:center;font-size:16px;}
.ns{margin:0 22px;background:var(--p-card);border:1px solid var(--p-border);border-radius:var(--p-radius);padding:16px;}
.cp{display:inline-block;font-size:11px;font-weight:700;padding:4px 9px;border-radius:8px;background:var(--p-card2);border:1px solid var(--p-border);margin:3px 4px 0 0;}
</style></head><body>
<div class="status"><span>9:41</span><div class="status-r">●●● WiFi 🔋</div></div>
<div class="header-bar"><span class="back-tap">←</span><span class="header-title">AI debrief</span><span></span></div>
<div class="bn">
  <div class="ba">🤖</div>
  <div><div class="kicker" style="margin-bottom:4px;">Pulse AI Coach</div><div style="font-size:14px;font-weight:700;line-height:1.4;">Strong session — here's what stood out in your data.</div></div>
</div>
<p class="kicker" style="padding:8px 22px;">Performance insights</p>
<div class="ic2"><div class="ii2">⚡</div><div><div style="font-size:13px;font-weight:800;margin-bottom:4px;">Deadlift volume spike</div><p class="subtle" style="font-size:12px;">Tonnage +18% vs last week. Light deload Thursday to protect the low back.</p><span class="tagx" style="margin-top:6px;display:inline-block;">Recovery</span></div></div>
<div class="ic2"><div class="ii2">📈</div><div><div style="font-size:13px;font-weight:800;margin-bottom:4px;">Bench plateau broken</div><p class="subtle" style="font-size:12px;">+2.5kg after 3 flat weeks. RPE-based loading stays.</p><span class="tagg" style="margin-top:6px;display:inline-block;">Strength</span></div></div>
<div class="ic2"><div class="ii2">🎯</div><div><div style="font-size:13px;font-weight:800;margin-bottom:4px;">Rest periods short</div><p class="subtle" style="font-size:12px;">Avg 68s on heavy sets — target 2–3 min for ATP recovery.</p><span class="tagb" style="margin-top:6px;display:inline-block;">Tip</span></div></div>
<p class="kicker" style="padding:8px 22px;">Next session</p>
<div class="ns">
  <div class="kicker" style="margin-bottom:8px;">Friday · tomorrow</div>
  <div style="font-size:15px;font-weight:800;margin-bottom:4px;">Lower body — squat focus</div>
  <p class="subtle" style="font-size:12px;margin-bottom:10px;">Moderate volume · RPE 7–8 · depth first</p>
  <span class="cp">Back squat</span><span class="cp">RDL</span><span class="cp">Leg press</span><span class="cp">Calves</span>
</div>
</body></html>`;

// ─────────────────────────────────────────────────────────────
// BRANCH SCREENS — Fitness Assessment → Goal Setting variants
// ─────────────────────────────────────────────────────────────

const GOAL_BRANCH_STYLES = `${PULSE_DEMO_IFRAME_BASE_CSS}
.goal-top{padding:16px 22px 14px;background:var(--p-card);border-bottom:1px solid var(--p-border);}
.goal-top .back-tap{display:inline-block;margin-bottom:8px;}
.goal-h1{font-size:21px;font-weight:800;}
.goal-sub{font-size:13px;color:var(--p-muted);margin-top:4px;line-height:1.45;}
.plan-card{margin:18px 22px 0;border-radius:var(--p-radius-lg);padding:22px;background:var(--p-card);border:1px solid var(--p-line);box-shadow:var(--p-shadow);}
.plan-title{font-size:22px;font-weight:900;letter-spacing:-0.4px;margin-bottom:6px;}
.plan-card>.plan-sub{font-size:13px;color:var(--p-muted);margin-bottom:18px;line-height:1.5;}
.plan-stats{display:flex;border-top:1px solid var(--p-border);padding-top:14px;}
.plan-stat{flex:1;text-align:center;}
.plan-stat-val{font-size:20px;font-weight:800;color:var(--p-accent);}
.plan-stat-label{font-size:9px;color:var(--p-muted);margin-top:4px;text-transform:uppercase;letter-spacing:0.05em;}
.plan-stat+.plan-stat{border-left:1px solid var(--p-border);}
.section{margin:18px 22px 0;}
.section-title{font-size:11px;font-weight:800;color:var(--p-muted);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;}
.week-grid{display:flex;gap:5px;}
.day{flex:1;text-align:center;padding:9px 2px;border-radius:12px;font-size:10px;font-weight:700;line-height:1.25;}
.day-on{background:var(--p-accent);color:var(--p-on-accent);}
.day-off{background:var(--p-card2);color:var(--p-muted2);border:1px solid var(--p-border);}
.milestone{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--p-border);}
.m-icon{width:36px;height:36px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:16px;background:var(--p-dim);border:1px solid var(--p-border);flex-shrink:0;}
.m-label{font-size:13px;font-weight:600;}
.m-date{font-size:11px;color:var(--p-muted);margin-top:2px;}
.ai-reasoning{margin:18px 22px 0;background:var(--p-card2);border-radius:var(--p-radius);padding:16px;border:1px solid var(--p-border);border-left:3px solid var(--p-accent);}
.ai-label{font-size:10px;font-weight:800;color:var(--p-accent);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;}
.ai-text{font-size:13px;color:var(--p-muted);line-height:1.55;}
.cta{position:fixed;bottom:0;left:0;width:390px;background:rgba(5,5,8,0.96);padding:14px 22px 34px;border-top:1px solid var(--p-border);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);}
.cta-btn{width:100%;background:var(--p-accent);color:var(--p-on-accent);border:none;border-radius:14px;padding:15px;font-size:15px;font-weight:800;cursor:pointer;box-shadow:var(--p-glow);}`;

export const GOAL_BEGINNER_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${GOAL_BRANCH_STYLES}</style></head><body>
<div class="status"><span>9:41</span><div style="display:flex;align-items:center;gap:5px;font-size:11px;"><span>●●●</span><span>WiFi</span><span style="font-size:13px;">🔋</span></div></div>
<div class="goal-top"><span class="back-tap">← Assessment</span><div class="goal-h1">Your plan is ready</div><div class="goal-sub">Tailored for Beginner · AI-generated</div></div>
<div class="plan-card">
  <div class="plan-title">Foundation Builder</div>
  <div class="plan-sub">Build a lasting habit and develop proper form before adding intensity.</div>
  <div class="plan-stats">
    <div class="plan-stat"><div class="plan-stat-val">3</div><div class="plan-stat-label">Days / week</div></div>
    <div class="plan-stat"><div class="plan-stat-val">30–40</div><div class="plan-stat-label">Min / session</div></div>
    <div class="plan-stat"><div class="plan-stat-val">8 wk</div><div class="plan-stat-label">Program</div></div>
  </div>
</div>
<div class="section">
  <div class="section-title">Weekly Schedule</div>
  <div class="week-grid">
    <div class="day day-on">Mon<br>Full<br>Body</div>
    <div class="day day-off">Tue<br>Rest</div>
    <div class="day day-on">Wed<br>Cardio<br>Core</div>
    <div class="day day-off">Thu<br>Rest</div>
    <div class="day day-on">Fri<br>Full<br>Body</div>
    <div class="day day-off">Sat<br>Walk</div>
    <div class="day day-off">Sun<br>Rest</div>
  </div>
</div>
<div class="section">
  <div class="section-title">Milestones</div>
  <div class="milestone"><div class="m-icon" style="background:#F3EFFE;">🎯</div><div><div class="m-label">Complete first workout</div><div class="m-date">Day 1 · Mar 8</div></div></div>
  <div class="milestone"><div class="m-icon" style="background:#FEF3C7;">🔥</div><div><div class="m-label">7-day streak unlocked</div><div class="m-date">Week 2 · Mar 15</div></div></div>
  <div class="milestone"><div class="m-icon" style="background:#ECFDF5;">💪</div><div><div class="m-label">Bodyweight squat mastered</div><div class="m-date">Week 4 · Mar 29</div></div></div>
</div>
<div class="ai-reasoning"><div class="ai-label">✦ Why this plan</div><div class="ai-text">Starting with 3 full-body days keeps recovery manageable and builds a strong movement foundation — the #1 predictor of long-term success.</div></div>
<div style="height:100px;"></div>
<div class="cta"><button type="button" class="cta-btn">Start My Plan →</button></div>
<script>(function(){var b=document.querySelector(".cta-btn");if(b)b.addEventListener("click",function(){try{window.parent.postMessage({type:"navigate",momentId:"goal-beginner-foundation"},"*");}catch(e){}});})();</script>
</body></html>`;

export const GOAL_INTERMEDIATE_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${GOAL_BRANCH_STYLES}</style></head><body>
<div class="status"><span>9:41</span><div style="display:flex;align-items:center;gap:5px;font-size:11px;"><span>●●●</span><span>WiFi</span><span style="font-size:13px;">🔋</span></div></div>
<div class="goal-top"><span class="back-tap">← Assessment</span><div class="goal-h1">Your plan is ready</div><div class="goal-sub">Tailored for Intermediate · AI-generated</div></div>
<div class="plan-card">
  <div class="plan-title">Strength & Conditioning</div>
  <div class="plan-sub">Build real strength with an upper/lower split and progressive overload.</div>
  <div class="plan-stats">
    <div class="plan-stat"><div class="plan-stat-val">4</div><div class="plan-stat-label">Days / week</div></div>
    <div class="plan-stat"><div class="plan-stat-val">45–55</div><div class="plan-stat-label">Min / session</div></div>
    <div class="plan-stat"><div class="plan-stat-val">12 wk</div><div class="plan-stat-label">Program</div></div>
  </div>
</div>
<div class="section">
  <div class="section-title">Weekly Schedule</div>
  <div class="week-grid">
    <div class="day day-on">Mon<br>Upper<br>Push</div>
    <div class="day day-off">Tue<br>Rest</div>
    <div class="day day-on">Wed<br>Lower<br>Squat</div>
    <div class="day day-off">Thu<br>Rest</div>
    <div class="day day-on">Fri<br>Upper<br>Pull</div>
    <div class="day day-on">Sat<br>Lower<br>Hinge</div>
    <div class="day day-off">Sun<br>Rest</div>
  </div>
</div>
<div class="section">
  <div class="section-title">Milestones</div>
  <div class="milestone"><div class="m-icon" style="background:#EFF6FF;">🏋️</div><div><div class="m-label">First 1RM estimate recorded</div><div class="m-date">Week 2 · Mar 15</div></div></div>
  <div class="milestone"><div class="m-icon" style="background:#FEF3C7;">📈</div><div><div class="m-label">+10% squat strength</div><div class="m-date">Week 6 · Apr 12</div></div></div>
  <div class="milestone"><div class="m-icon" style="background:#ECFDF5;">🥇</div><div><div class="m-label">Bodyweight bench achieved</div><div class="m-date">Week 10 · May 3</div></div></div>
</div>
<div class="ai-reasoning"><div class="ai-label">✦ Why this plan</div><div class="ai-text">An upper/lower split at 4 days gives your muscles 48h recovery between sessions — the sweet spot for hypertrophy and strength gains at your level.</div></div>
<div style="height:100px;"></div>
<div class="cta"><button type="button" class="cta-btn">Start My Plan →</button></div>
<script>(function(){var b=document.querySelector(".cta-btn");if(b)b.addEventListener("click",function(){try{window.parent.postMessage({type:"navigate",momentId:"goal-intermediate-split"},"*");}catch(e){}});})();</script>
</body></html>`;

export const GOAL_ADVANCED_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${GOAL_BRANCH_STYLES}</style></head><body>
<div class="status"><span>9:41</span><div style="display:flex;align-items:center;gap:5px;font-size:11px;"><span>●●●</span><span>WiFi</span><span style="font-size:13px;">🔋</span></div></div>
<div class="goal-top"><span class="back-tap">← Assessment</span><div class="goal-h1">Your plan is ready</div><div class="goal-sub">Tailored for Advanced · AI-generated</div></div>
<div class="plan-card">
  <div class="plan-title">Power & Hypertrophy</div>
  <div class="plan-sub">Push your limits with a PPL split, high volume, and periodisation.</div>
  <div class="plan-stats">
    <div class="plan-stat"><div class="plan-stat-val">5</div><div class="plan-stat-label">Days / week</div></div>
    <div class="plan-stat"><div class="plan-stat-val">55–70</div><div class="plan-stat-label">Min / session</div></div>
    <div class="plan-stat"><div class="plan-stat-val">16 wk</div><div class="plan-stat-label">Program</div></div>
  </div>
</div>
<div class="section">
  <div class="section-title">Weekly Schedule</div>
  <div class="week-grid">
    <div class="day day-on">Mon<br>Push<br>Heavy</div>
    <div class="day day-on">Tue<br>Pull<br>Heavy</div>
    <div class="day day-on">Wed<br>Legs<br>Squat</div>
    <div class="day day-off">Thu<br>Rest</div>
    <div class="day day-on">Fri<br>Push<br>Volume</div>
    <div class="day day-on">Sat<br>Pull+<br>Legs</div>
    <div class="day day-off">Sun<br>Rest</div>
  </div>
</div>
<div class="section">
  <div class="section-title">Milestones</div>
  <div class="milestone"><div class="m-icon" style="background:#FFF7ED;">🔥</div><div><div class="m-label">Complete first deload week</div><div class="m-date">Week 4 · Mar 29</div></div></div>
  <div class="milestone"><div class="m-icon" style="background:#FEF3C7;">⚡</div><div><div class="m-label">2× bodyweight deadlift</div><div class="m-date">Week 8 · Apr 26</div></div></div>
  <div class="milestone"><div class="m-icon" style="background:#F5F3FF;">🏆</div><div><div class="m-label">Peak week + personal record</div><div class="m-date">Week 16 · Jun 21</div></div></div>
</div>
<div class="ai-reasoning"><div class="ai-label">✦ Why this plan</div><div class="ai-text">PPL with undulating periodisation is optimal for advanced lifters — alternating heavy and volume days prevents accommodation and drives continued progress.</div></div>
<div style="height:100px;"></div>
<div class="cta"><button type="button" class="cta-btn">Start My Plan →</button></div>
<script>(function(){var b=document.querySelector(".cta-btn");if(b)b.addEventListener("click",function(){try{window.parent.postMessage({type:"navigate",momentId:"goal-advanced-split"},"*");}catch(e){}});})();</script>
</body></html>`;

export const GOAL_ATHLETE_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${GOAL_BRANCH_STYLES}</style></head><body>
<div class="status"><span>9:41</span><div style="display:flex;align-items:center;gap:5px;font-size:11px;"><span>●●●</span><span>WiFi</span><span style="font-size:13px;">🔋</span></div></div>
<div class="goal-top"><span class="back-tap">← Assessment</span><div class="goal-h1">Your plan is ready</div><div class="goal-sub">Tailored for Athlete · AI-generated</div></div>
<div class="plan-card">
  <div class="plan-title">Elite Performance</div>
  <div class="plan-sub">Competition-grade programming: max strength, speed, and conditioning.</div>
  <div class="plan-stats">
    <div class="plan-stat"><div class="plan-stat-val">6</div><div class="plan-stat-label">Days / week</div></div>
    <div class="plan-stat"><div class="plan-stat-val">75–90</div><div class="plan-stat-label">Min / session</div></div>
    <div class="plan-stat"><div class="plan-stat-val">20 wk</div><div class="plan-stat-label">Program</div></div>
  </div>
</div>
<div class="section">
  <div class="section-title">Weekly Schedule</div>
  <div class="week-grid">
    <div class="day day-on">Mon<br>Max<br>Strength</div>
    <div class="day day-on">Tue<br>Speed<br>Power</div>
    <div class="day day-on">Wed<br>Olympic<br>Lift</div>
    <div class="day day-on">Thu<br>Condi-<br>tioning</div>
    <div class="day day-on">Fri<br>Max<br>Effort</div>
    <div class="day day-on">Sat<br>Sport<br>Skill</div>
    <div class="day day-off">Sun<br>Rest</div>
  </div>
</div>
<div class="section">
  <div class="section-title">Milestones</div>
  <div class="milestone"><div class="m-icon" style="background:#ECFDF5;">🧪</div><div><div class="m-label">Baseline testing complete</div><div class="m-date">Day 3 · Mar 10</div></div></div>
  <div class="milestone"><div class="m-icon" style="background:#FEF3C7;">🎖️</div><div><div class="m-label">Competition simulation day</div><div class="m-date">Week 8 · Apr 26</div></div></div>
  <div class="milestone"><div class="m-icon" style="background:#F5F3FF;">🏅</div><div><div class="m-label">Peak performance test</div><div class="m-date">Week 20 · Jul 19</div></div></div>
</div>
<div class="ai-reasoning"><div class="ai-label">✦ Why this plan</div><div class="ai-text">At athlete level, periodisation is non-negotiable. This plan uses 4-week mesocycles with deload weeks to maximise peak output and minimise injury risk.</div></div>
<div style="height:100px;"></div>
<div class="cta"><button type="button" class="cta-btn">Start My Plan →</button></div>
<script>(function(){var b=document.querySelector(".cta-btn");if(b)b.addEventListener("click",function(){try{window.parent.postMessage({type:"navigate",momentId:"goal-athlete-mesocycles"},"*");}catch(e){}});})();</script>
</body></html>`;
