// Pre-rendered HTML screens for the Pulse demo
// Each screen is a complete, self-contained HTML document at 390px width

const STATUS_BAR = `
  <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 22px 8px;font-size:15px;font-weight:600;">
    <span>9:41</span>
    <div style="display:flex;align-items:center;gap:6px;font-size:12px;">
      <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor"><rect x="0" y="3" width="3" height="8" rx="1"/><rect x="4.5" y="2" width="3" height="9" rx="1"/><rect x="9" y="1" width="3" height="10" rx="1"/><rect x="13.5" y="0" width="3" height="11" rx="1"/></svg>
      <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor"><path d="M8 1.5C5.5 1.5 3.2 2.5 1.5 4.2L3 5.7C4.3 4.4 6 3.5 8 3.5s3.7.9 5 2.2l1.5-1.5C12.8 2.5 10.5 1.5 8 1.5zm0 3.5C6.3 5 4.8 5.7 3.7 6.8L5 8.1C5.9 7.2 6.9 6.8 8 6.8s2.1.4 3 1.3l1.3-1.3C11.2 5.7 9.7 5 8 5zm0 3.5c-.8 0-1.5.3-2 .8L8 11l2-1.2c-.5-.5-1.2-.8-2-.8z"/></svg>
      <svg width="26" height="12" viewBox="0 0 26 12" fill="none"><rect x=".5" y=".5" width="22" height="11" rx="3.5" stroke="currentColor" stroke-opacity=".35"/><rect x="23.5" y="3.5" width="2" height="5" rx="1" fill="currentColor" fill-opacity=".4"/><rect x="2" y="2" width="18" height="8" rx="2" fill="currentColor"/></svg>
    </div>
  </div>`;

const BOTTOM_NAV = (active: string) => `
  <div style="position:fixed;bottom:0;left:0;width:390px;background:white;border-top:1px solid #F3F4F6;padding:8px 0 24px;display:flex;justify-content:space-around;align-items:center;z-index:10;">
    ${[
      { id: 'home', icon: '⌂', label: 'Home' },
      { id: 'workout', icon: '◈', label: 'Workout' },
      { id: 'progress', icon: '▲', label: 'Progress' },
      { id: 'nutrition', icon: '◎', label: 'Nutrition' },
      { id: 'profile', icon: '◯', label: 'Profile' },
    ]
      .map(
        (n) => `
      <div style="display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;">
        <span style="font-size:20px;${n.id === active ? 'filter:none;opacity:1;' : 'opacity:0.35;'}">${n.icon}</span>
        <span style="font-size:10px;font-weight:${n.id === active ? '700' : '500'};color:${n.id === active ? '#7C3AED' : '#9CA3AF'};">${n.label}</span>
      </div>`
      )
      .join('')}
  </div>`;

const BASE_STYLE = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif; width: 390px; min-height: 720px; overflow-x: hidden; }
  .card { background: white; border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04); padding: 18px; }`;

// ─────────────────────────────────────────────────────────────
// 1. WELCOME SCREEN
// ─────────────────────────────────────────────────────────────
export const WELCOME_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif; width:390px; min-height:720px; background:linear-gradient(160deg,#1b0640 0%,#0d021f 50%,#1b0640 100%); color:white; overflow:hidden; }
.status { display:flex; justify-content:space-between; align-items:center; padding:14px 22px 0; font-size:15px; font-weight:600; }
.hero { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:48px 32px 32px; text-align:center; }
.logo { width:88px; height:88px; background:linear-gradient(135deg,#7C3AED,#A855F7); border-radius:26px; display:flex; align-items:center; justify-content:center; font-size:40px; margin-bottom:28px; box-shadow:0 24px 60px rgba(124,58,237,0.55); }
.app-name { font-size:42px; font-weight:800; letter-spacing:-1.5px; margin-bottom:10px; }
.app-name em { color:#A78BFA; font-style:normal; }
.tagline { font-size:17px; color:rgba(255,255,255,0.55); line-height:1.6; max-width:280px; }
.pills { display:flex; gap:8px; justify-content:center; margin-top:24px; flex-wrap:wrap; }
.pill { background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.12); border-radius:100px; padding:6px 14px; font-size:12px; color:rgba(255,255,255,0.6); }
.actions { padding:0 28px 50px; }
.btn-primary { display:block; width:100%; padding:17px; background:linear-gradient(135deg,#7C3AED,#A855F7); color:white; border:none; border-radius:16px; font-size:17px; font-weight:700; margin-bottom:12px; cursor:pointer; text-align:center; box-shadow:0 10px 35px rgba(124,58,237,0.45); letter-spacing:-0.3px; }
.btn-ghost { display:block; width:100%; padding:17px; background:rgba(255,255,255,0.07); color:rgba(255,255,255,0.75); border:1.5px solid rgba(255,255,255,0.12); border-radius:16px; font-size:16px; font-weight:500; cursor:pointer; text-align:center; }
.terms { text-align:center; font-size:11.5px; color:rgba(255,255,255,0.25); margin-top:18px; line-height:1.7; }
</style></head><body>
<div class="status"><span>9:41</span><div style="display:flex;align-items:center;gap:5px;"><span style="font-size:11px;">●●●</span><span style="font-size:11px;">WiFi</span><span style="font-size:13px;">🔋</span></div></div>
<div class="hero">
  <div class="logo">⚡</div>
  <div class="app-name">Pulse<em>.</em></div>
  <p class="tagline">Your AI fitness coach that learns, adapts, and pushes you further — every single day.</p>
  <div class="pills"><span class="pill">🤖 AI-Powered</span><span class="pill">📊 Smart Tracking</span><span class="pill">🔥 Adaptive Plans</span></div>
</div>
<div class="actions">
  <button class="btn-primary">Get Started — It's Free</button>
  <button class="btn-ghost">I already have an account</button>
  <p class="terms">By continuing you agree to our Terms of Service<br>and Privacy Policy</p>
</div>
</body></html>`;

// ─────────────────────────────────────────────────────────────
// 2. CREATE ACCOUNT
// ─────────────────────────────────────────────────────────────
export const CREATE_ACCOUNT_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif; width:390px; min-height:720px; background:#FAFAFA; color:#111827; }
.status { display:flex; justify-content:space-between; align-items:center; padding:14px 22px 0; font-size:15px; font-weight:600; }
.header { padding:20px 24px 8px; display:flex; align-items:center; gap:12px; }
.back { width:36px; height:36px; background:#F3F4F6; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:18px; color:#374151; }
.header-title { font-size:17px; font-weight:700; color:#111827; }
.content { padding:8px 24px 40px; }
h1 { font-size:28px; font-weight:800; letter-spacing:-0.8px; margin-bottom:6px; }
.subtitle { font-size:15px; color:#6B7280; margin-bottom:28px; line-height:1.5; }
.field { margin-bottom:16px; }
label { display:block; font-size:13px; font-weight:600; color:#374151; margin-bottom:6px; }
input { width:100%; padding:13px 15px; border:1.5px solid #E5E7EB; border-radius:12px; font-size:15px; background:white; color:#111827; outline:none; }
.input-focused { border-color:#7C3AED; box-shadow:0 0 0 3px rgba(124,58,237,0.1); }
.password-row { position:relative; }
.show-pw { position:absolute; right:14px; top:50%; transform:translateY(-50%); font-size:13px; color:#7C3AED; font-weight:600; }
.divider { display:flex; align-items:center; gap:12px; margin:20px 0; }
.divider-line { flex:1; height:1px; background:#E5E7EB; }
.divider span { font-size:13px; color:#9CA3AF; font-weight:500; }
.social-btn { display:flex; align-items:center; justify-content:center; gap:10px; width:100%; padding:13px; border:1.5px solid #E5E7EB; border-radius:12px; background:white; font-size:15px; font-weight:600; color:#374151; margin-bottom:10px; cursor:pointer; }
.btn-primary { display:block; width:100%; padding:15px; background:linear-gradient(135deg,#7C3AED,#A855F7); color:white; border:none; border-radius:14px; font-size:16px; font-weight:700; cursor:pointer; text-align:center; margin-top:4px; box-shadow:0 6px 24px rgba(124,58,237,0.3); }
.signin-link { text-align:center; margin-top:18px; font-size:14px; color:#6B7280; }
.signin-link a { color:#7C3AED; font-weight:600; }
</style></head><body>
<div class="status" style="color:#111827;"><span>9:41</span><div style="display:flex;align-items:center;gap:5px;font-size:11px;"><span>●●●</span><span>WiFi</span><span style="font-size:13px;">🔋</span></div></div>
<div class="header"><div class="back">←</div><span class="header-title">Create Account</span></div>
<div class="content">
  <h1>Join Pulse</h1>
  <p class="subtitle">Start your AI-powered fitness journey today.</p>
  <div class="field"><label>Full Name</label><input type="text" placeholder="Alex Johnson" value="Alex Johnson"></div>
  <div class="field"><label>Email Address</label><input type="email" placeholder="alex@email.com" class="input-focused" value="alex@email.com" style="border-color:#7C3AED;box-shadow:0 0 0 3px rgba(124,58,237,0.1);"></div>
  <div class="field"><label>Password</label><div class="password-row"><input type="password" placeholder="Min. 8 characters" value="••••••••••"><span class="show-pw">Show</span></div></div>
  <button class="btn-primary">Create Account</button>
  <div class="divider"><div class="divider-line"></div><span>or continue with</span><div class="divider-line"></div></div>
  <div class="social-btn"><span>🍎</span>Continue with Apple</div>
  <div class="social-btn"><span style="font-size:18px;font-weight:700;background:linear-gradient(135deg,#4285F4,#EA4335,#FBBC04,#34A853);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">G</span>Continue with Google</div>
  <p class="signin-link">Already have an account? <a>Sign in</a></p>
</div>
</body></html>`;

// ─────────────────────────────────────────────────────────────
// 3. FITNESS ASSESSMENT
// ─────────────────────────────────────────────────────────────
export const FITNESS_ASSESSMENT_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif; width:390px; min-height:720px; background:#FAFAFA; color:#111827; }
.status { display:flex; justify-content:space-between; align-items:center; padding:14px 22px 0; font-size:15px; font-weight:600; }
.progress-bar { margin:16px 22px 0; background:#F3F4F6; border-radius:100px; height:4px; }
.progress-fill { width:50%; height:100%; background:linear-gradient(90deg,#7C3AED,#A855F7); border-radius:100px; }
.step-label { padding:8px 22px 0; font-size:12px; color:#9CA3AF; font-weight:600; letter-spacing:0.5px; }
.content { padding:20px 22px 40px; }
h1 { font-size:26px; font-weight:800; letter-spacing:-0.7px; margin-bottom:6px; }
.subtitle { font-size:15px; color:#6B7280; margin-bottom:28px; }
.option-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:24px; }
.option { background:white; border:2px solid #E5E7EB; border-radius:16px; padding:20px 16px; text-align:center; cursor:pointer; transition:all 0.15s; }
.option.active { border-color:#7C3AED; background:#F5F3FF; }
.option-icon { font-size:32px; margin-bottom:10px; }
.option-label { font-size:14px; font-weight:700; color:#111827; margin-bottom:4px; }
.option-desc { font-size:12px; color:#9CA3AF; line-height:1.4; }
.option.active .option-label { color:#7C3AED; }
.also-label { font-size:14px; font-weight:600; color:#374151; margin-bottom:12px; }
.tag-row { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:28px; }
.tag { padding:8px 14px; border:1.5px solid #E5E7EB; border-radius:100px; font-size:13px; font-weight:600; color:#374151; background:white; cursor:pointer; }
.tag.active { border-color:#7C3AED; background:#F5F3FF; color:#7C3AED; }
.btn-primary { display:block; width:100%; padding:15px; background:linear-gradient(135deg,#7C3AED,#A855F7); color:white; border:none; border-radius:14px; font-size:16px; font-weight:700; text-align:center; cursor:pointer; box-shadow:0 6px 24px rgba(124,58,237,0.3); }
</style></head><body>
<div class="status" style="color:#111827;"><span>9:41</span><div style="display:flex;align-items:center;gap:5px;font-size:11px;"><span>●●●</span><span>WiFi</span><span style="font-size:13px;">🔋</span></div></div>
<div class="progress-bar"><div class="progress-fill"></div></div>
<p class="step-label">STEP 2 OF 4</p>
<div class="content">
  <h1>What's your fitness level?</h1>
  <p class="subtitle">We'll tailor your plan to match where you are right now.</p>
  <div class="option-grid">
    <div class="option"><div class="option-icon">🌱</div><div class="option-label">Beginner</div><div class="option-desc">Just starting out</div></div>
    <div class="option active"><div class="option-icon">⚡</div><div class="option-label">Intermediate</div><div class="option-desc">1–2 years training</div></div>
    <div class="option"><div class="option-icon">🔥</div><div class="option-label">Advanced</div><div class="option-desc">3+ years serious training</div></div>
    <div class="option"><div class="option-icon">🏆</div><div class="option-label">Athlete</div><div class="option-desc">Competitive sports</div></div>
  </div>
  <p class="also-label">Available equipment</p>
  <div class="tag-row">
    <span class="tag active">🏋️ Full Gym</span>
    <span class="tag active">🏠 Home Equipment</span>
    <span class="tag">🏃 No Equipment</span>
    <span class="tag">🥊 Dumbbells Only</span>
  </div>
  <button class="btn-primary">Continue →</button>
</div>
</body></html>`;

// ─────────────────────────────────────────────────────────────
// 4. AI GOAL SETTING (showing results state)
// ─────────────────────────────────────────────────────────────
export const GOAL_SETTING_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif; width:390px; min-height:720px; background:#FAFAFA; color:#111827; }
.status { display:flex; justify-content:space-between; align-items:center; padding:14px 22px 0; font-size:15px; font-weight:600; }
.content { padding:20px 22px 100px; }
.ai-badge { display:inline-flex; align-items:center; gap:6px; background:#F5F3FF; border:1px solid #DDD6FE; border-radius:100px; padding:6px 14px; font-size:12px; font-weight:700; color:#7C3AED; margin-bottom:20px; }
h1 { font-size:26px; font-weight:800; letter-spacing:-0.7px; margin-bottom:6px; }
.subtitle { font-size:15px; color:#6B7280; margin-bottom:24px; }
.plan-card { background:linear-gradient(135deg,#7C3AED,#A855F7); border-radius:20px; padding:22px; margin-bottom:16px; color:white; }
.plan-card h2 { font-size:20px; font-weight:800; margin-bottom:6px; }
.plan-card p { font-size:14px; opacity:0.8; margin-bottom:18px; }
.plan-stats { display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; }
.plan-stat { background:rgba(255,255,255,0.15); border-radius:12px; padding:10px; text-align:center; }
.plan-stat-val { font-size:22px; font-weight:800; }
.plan-stat-label { font-size:11px; opacity:0.7; margin-top:2px; }
.milestone-card { background:white; border-radius:16px; padding:18px; margin-bottom:12px; box-shadow:0 1px 3px rgba(0,0,0,0.07); }
.milestone-row { display:flex; align-items:center; gap:12px; }
.milestone-icon { width:40px; height:40px; border-radius:12px; background:#F5F3FF; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
.milestone-text h3 { font-size:15px; font-weight:700; margin-bottom:3px; }
.milestone-text p { font-size:13px; color:#6B7280; }
.milestone-date { margin-left:auto; font-size:12px; font-weight:700; color:#7C3AED; }
.reasoning { background:#FFFBEB; border:1px solid #FDE68A; border-radius:14px; padding:14px; margin-bottom:20px; }
.reasoning-label { font-size:11px; font-weight:700; color:#92400E; letter-spacing:0.5px; margin-bottom:6px; }
.reasoning p { font-size:13px; color:#78350F; line-height:1.6; }
.btn-primary { display:block; width:100%; padding:15px; background:linear-gradient(135deg,#7C3AED,#A855F7); color:white; border:none; border-radius:14px; font-size:16px; font-weight:700; text-align:center; cursor:pointer; box-shadow:0 6px 24px rgba(124,58,237,0.3); }
</style></head><body>
<div class="status" style="color:#111827;"><span>9:41</span><div style="display:flex;align-items:center;gap:5px;font-size:11px;"><span>●●●</span><span>WiFi</span><span style="font-size:13px;">🔋</span></div></div>
<div class="content">
  <div class="ai-badge">✦ Pulse AI</div>
  <h1>Your plan is ready</h1>
  <p class="subtitle">Built around your assessment. Adapts weekly based on performance.</p>
  <div class="plan-card">
    <h2>Strength & Conditioning</h2>
    <p>Intermediate 12-week progressive programme</p>
    <div class="plan-stats">
      <div class="plan-stat"><div class="plan-stat-val">4×</div><div class="plan-stat-label">Per week</div></div>
      <div class="plan-stat"><div class="plan-stat-val">45m</div><div class="plan-stat-label">Per session</div></div>
      <div class="plan-stat"><div class="plan-stat-val">~450</div><div class="plan-stat-label">Kcal/session</div></div>
    </div>
  </div>
  <div class="reasoning"><div class="reasoning-label">WHY THIS PLAN</div><p>"Based on your intermediate level and full-gym access, I've selected a push/pull/legs split optimised for strength gains with adequate recovery time."</p></div>
  <div class="milestone-card"><div class="milestone-row"><div class="milestone-icon">💪</div><div class="milestone-text"><h3>First strength milestone</h3><p>Projected 15% strength increase</p></div><div class="milestone-date">Week 4</div></div></div>
  <div class="milestone-card"><div class="milestone-row"><div class="milestone-icon">🏆</div><div class="milestone-text"><h3>Programme completion</h3><p>Full transformation cycle</p></div><div class="milestone-date">Week 12</div></div></div>
  <div style="height:16px;"></div>
  <button class="btn-primary">Start My Journey →</button>
</div>
</body></html>`;

// ─────────────────────────────────────────────────────────────
// 5. WORKOUT DASHBOARD (Home)
// ─────────────────────────────────────────────────────────────
export const WORKOUT_HOME_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif; width:390px; min-height:720px; background:#F8F9FA; color:#111827; }
.status { display:flex; justify-content:space-between; align-items:center; padding:14px 22px 0; font-size:15px; font-weight:600; }
.header { padding:16px 22px 0; display:flex; justify-content:space-between; align-items:center; }
.greeting h1 { font-size:24px; font-weight:800; letter-spacing:-0.5px; }
.greeting p { font-size:14px; color:#6B7280; margin-top:2px; }
.avatar { width:44px; height:44px; border-radius:14px; background:linear-gradient(135deg,#7C3AED,#A855F7); display:flex; align-items:center; justify-content:center; font-size:20px; }
.streak-bar { margin:14px 22px; background:linear-gradient(135deg,#FF6B35,#FF8C42); border-radius:14px; padding:14px 16px; display:flex; align-items:center; justify-content:space-between; color:white; }
.streak-left { display:flex; align-items:center; gap:10px; }
.streak-icon { font-size:26px; }
.streak-text h3 { font-size:15px; font-weight:700; }
.streak-text p { font-size:12px; opacity:0.8; }
.streak-count { font-size:36px; font-weight:900; letter-spacing:-1px; }
.section-title { padding:16px 22px 10px; font-size:13px; font-weight:700; color:#9CA3AF; letter-spacing:0.5px; text-transform:uppercase; }
.today-card { margin:0 22px; background:linear-gradient(135deg,#1b0640,#2D1B69); border-radius:20px; padding:22px; color:white; margin-bottom:16px; }
.today-label { font-size:12px; font-weight:700; opacity:0.6; letter-spacing:0.5px; margin-bottom:8px; }
.today-name { font-size:22px; font-weight:800; letter-spacing:-0.5px; margin-bottom:4px; }
.today-meta { font-size:13px; opacity:0.65; margin-bottom:18px; }
.today-tags { display:flex; gap:8px; margin-bottom:20px; flex-wrap:wrap; }
.today-tag { background:rgba(255,255,255,0.12); border-radius:100px; padding:5px 12px; font-size:12px; font-weight:600; }
.btn-start { background:white; color:#7C3AED; border:none; border-radius:12px; padding:13px 0; font-size:15px; font-weight:700; width:100%; cursor:pointer; }
.stats-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin:0 22px 14px; }
.stat-card { background:white; border-radius:16px; padding:16px; box-shadow:0 1px 3px rgba(0,0,0,0.06); }
.stat-icon { font-size:22px; margin-bottom:8px; }
.stat-val { font-size:24px; font-weight:800; letter-spacing:-0.5px; }
.stat-label { font-size:12px; color:#9CA3AF; margin-top:2px; }
.stat-delta { font-size:12px; color:#10B981; font-weight:700; margin-top:4px; }
.activity-item { display:flex; align-items:center; gap:12px; padding:13px 22px; border-bottom:1px solid #F3F4F6; }
.act-icon { width:40px; height:40px; background:#F5F3FF; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
.act-info h4 { font-size:14px; font-weight:700; }
.act-info p { font-size:12px; color:#6B7280; margin-top:2px; }
.act-right { margin-left:auto; text-align:right; }
.act-right span { font-size:13px; font-weight:700; color:#7C3AED; }
.act-right p { font-size:11px; color:#9CA3AF; margin-top:2px; }
.bottom-nav { position:fixed; bottom:0; left:0; width:390px; background:white; border-top:1px solid #F3F4F6; padding:8px 0 22px; display:flex; justify-content:space-around; }
.nav-item { display:flex; flex-direction:column; align-items:center; gap:3px; }
.nav-icon { font-size:22px; }
.nav-label { font-size:10px; font-weight:600; }
</style></head><body>
<div class="status"><span>9:41</span><div style="display:flex;align-items:center;gap:5px;font-size:11px;"><span>●●●</span><span>WiFi</span><span style="font-size:13px;">🔋</span></div></div>
<div class="header">
  <div class="greeting"><h1>Good morning, Alex 👋</h1><p>Thursday · Week 6 of 12</p></div>
  <div class="avatar">😊</div>
</div>
<div class="streak-bar">
  <div class="streak-left"><span class="streak-icon">🔥</span><div class="streak-text"><h3>Day Streak</h3><p>Keep it going!</p></div></div>
  <div class="streak-count">14</div>
</div>
<div class="today-card">
  <p class="today-label">TODAY'S WORKOUT</p>
  <h2 class="today-name">Push Day — Chest & Shoulders</h2>
  <p class="today-meta">45 min · 6 exercises · ~430 kcal</p>
  <div class="today-tags"><span class="today-tag">🏋️ Full Gym</span><span class="today-tag">⚡ Intermediate</span><span class="today-tag">📈 Progressive</span></div>
  <button class="btn-start">Start Workout →</button>
</div>
<p class="section-title">This Week</p>
<div class="stats-row">
  <div class="stat-card"><div class="stat-icon">🏋️</div><div class="stat-val">3</div><div class="stat-label">Workouts Done</div><div class="stat-delta">▲ On track</div></div>
  <div class="stat-card"><div class="stat-icon">🔥</div><div class="stat-val">1,284</div><div class="stat-label">Kcal Burned</div><div class="stat-delta">▲ +12% vs last wk</div></div>
</div>
<p class="section-title">Recent Activity</p>
<div class="activity-item"><div class="act-icon">🦵</div><div class="act-info"><h4>Leg Day — Quads & Glutes</h4><p>42 min · 387 kcal</p></div><div class="act-right"><span>Yesterday</span></div></div>
<div class="activity-item"><div class="act-icon">🏃</div><div class="act-info"><h4>Cardio Conditioning</h4><p>28 min · 265 kcal</p></div><div class="act-right"><span>Tue</span></div></div>
<div style="height:80px;"></div>
<div class="bottom-nav">
  <div class="nav-item"><span class="nav-icon">⌂</span><span class="nav-label" style="color:#7C3AED;">Home</span></div>
  <div class="nav-item"><span class="nav-icon" style="opacity:0.4;">◈</span><span class="nav-label" style="color:#9CA3AF;">Workout</span></div>
  <div class="nav-item"><span class="nav-icon" style="opacity:0.4;">▲</span><span class="nav-label" style="color:#9CA3AF;">Progress</span></div>
  <div class="nav-item"><span class="nav-icon" style="opacity:0.4;">◎</span><span class="nav-label" style="color:#9CA3AF;">Nutrition</span></div>
  <div class="nav-item"><span class="nav-icon" style="opacity:0.4;">◯</span><span class="nav-label" style="color:#9CA3AF;">Profile</span></div>
</div>
</body></html>`;

// ─────────────────────────────────────────────────────────────
// 6. AI WORKOUT GENERATOR
// ─────────────────────────────────────────────────────────────
export const AI_WORKOUT_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif; width:390px; min-height:720px; background:#FAFAFA; color:#111827; }
.status { display:flex; justify-content:space-between; align-items:center; padding:14px 22px 0; font-size:15px; font-weight:600; }
.header { padding:14px 22px; display:flex; align-items:center; gap:12px; }
.back { width:36px; height:36px; background:#F3F4F6; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:18px; }
.ai-badge { margin-left:auto; display:inline-flex; align-items:center; gap:5px; background:#F5F3FF; border:1px solid #DDD6FE; border-radius:100px; padding:5px 12px; font-size:12px; font-weight:700; color:#7C3AED; }
.content { padding:0 22px 100px; }
h1 { font-size:26px; font-weight:800; letter-spacing:-0.7px; margin-bottom:6px; }
.subtitle { font-size:15px; color:#6B7280; margin-bottom:24px; }
.energy-card { background:white; border-radius:18px; padding:20px; box-shadow:0 1px 3px rgba(0,0,0,0.07); margin-bottom:16px; }
.energy-card h3 { font-size:16px; font-weight:700; margin-bottom:4px; }
.energy-card p { font-size:13px; color:#6B7280; margin-bottom:16px; }
.slider-row { display:flex; justify-content:space-between; align-items:center; gap:10px; }
.slider-track { flex:1; height:8px; background:#F3F4F6; border-radius:100px; position:relative; }
.slider-fill { width:70%; height:100%; background:linear-gradient(90deg,#7C3AED,#A855F7); border-radius:100px; position:relative; }
.slider-thumb { position:absolute; right:-8px; top:-8px; width:24px; height:24px; background:white; border:3px solid #7C3AED; border-radius:100px; box-shadow:0 2px 8px rgba(0,0,0,0.15); }
.energy-labels { display:flex; justify-content:space-between; margin-top:10px; }
.energy-labels span { font-size:11px; color:#9CA3AF; font-weight:600; }
.energy-selected { text-align:center; margin-top:10px; font-size:22px; font-weight:800; color:#7C3AED; }
.workout-preview { background:white; border-radius:18px; padding:20px; box-shadow:0 1px 3px rgba(0,0,0,0.07); margin-bottom:16px; }
.preview-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px; }
.preview-header h3 { font-size:18px; font-weight:800; letter-spacing:-0.3px; }
.preview-meta { font-size:13px; color:#6B7280; margin-top:3px; }
.preview-badge { background:#F5F3FF; border-radius:8px; padding:6px 10px; text-align:center; }
.preview-badge-val { font-size:18px; font-weight:800; color:#7C3AED; }
.preview-badge-label { font-size:10px; color:#9CA3AF; }
.exercise-list { display:flex; flex-direction:column; gap:10px; }
.exercise-item { display:flex; align-items:center; gap:12px; padding:12px 14px; background:#FAFAFA; border-radius:12px; }
.exercise-num { width:28px; height:28px; background:linear-gradient(135deg,#7C3AED,#A855F7); border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; color:white; flex-shrink:0; }
.exercise-info h4 { font-size:14px; font-weight:700; }
.exercise-info p { font-size:12px; color:#9CA3AF; margin-top:2px; }
.exercise-sets { margin-left:auto; font-size:13px; font-weight:700; color:#374151; }
.btn-row { display:flex; gap:10px; margin-top:4px; }
.btn-regen { flex:1; padding:14px; background:#F5F3FF; color:#7C3AED; border:none; border-radius:13px; font-size:15px; font-weight:700; cursor:pointer; }
.btn-primary { flex:2; padding:14px; background:linear-gradient(135deg,#7C3AED,#A855F7); color:white; border:none; border-radius:13px; font-size:15px; font-weight:700; cursor:pointer; box-shadow:0 6px 20px rgba(124,58,237,0.3); }
</style></head><body>
<div class="status"><span>9:41</span><div style="display:flex;align-items:center;gap:5px;font-size:11px;"><span>●●●</span><span>WiFi</span><span style="font-size:13px;">🔋</span></div></div>
<div class="header"><div class="back">←</div><span style="font-size:17px;font-weight:700;">Today's Workout</span><div class="ai-badge">✦ AI Generated</div></div>
<div class="content">
  <div class="energy-card">
    <h3>How are you feeling today?</h3>
    <p>Pulse adapts your workout to your energy level.</p>
    <div class="slider-row">
      <span style="font-size:20px;">😴</span>
      <div class="slider-track"><div class="slider-fill"><div class="slider-thumb"></div></div></div>
      <span style="font-size:20px;">⚡</span>
    </div>
    <div class="energy-labels"><span>Exhausted</span><span>Moderate</span><span>Energised</span></div>
    <div class="energy-selected">4 / 5 — Feeling Good!</div>
  </div>
  <div class="workout-preview">
    <div class="preview-header">
      <div><h3>Push Day — Chest & Shoulders</h3><p class="preview-meta">45 min · 6 exercises · ~430 kcal</p></div>
      <div class="preview-badge"><div class="preview-badge-val">430</div><div class="preview-badge-label">kcal</div></div>
    </div>
    <div class="exercise-list">
      <div class="exercise-item"><div class="exercise-num">1</div><div class="exercise-info"><h4>Barbell Bench Press</h4><p>Chest, Triceps, Anterior Delt</p></div><div class="exercise-sets">4×8</div></div>
      <div class="exercise-item"><div class="exercise-num">2</div><div class="exercise-info"><h4>Incline Dumbbell Press</h4><p>Upper Chest, Shoulders</p></div><div class="exercise-sets">3×10</div></div>
      <div class="exercise-item"><div class="exercise-num">3</div><div class="exercise-info"><h4>Overhead Press</h4><p>Shoulders, Triceps</p></div><div class="exercise-sets">4×8</div></div>
      <div class="exercise-item"><div class="exercise-num">4</div><div class="exercise-info"><h4>Cable Lateral Raises</h4><p>Medial Delts</p></div><div class="exercise-sets">3×15</div></div>
      <div class="exercise-item"><div class="exercise-num">5</div><div class="exercise-info"><h4>Chest Flyes</h4><p>Pec Major, Minor</p></div><div class="exercise-sets">3×12</div></div>
      <div class="exercise-item"><div class="exercise-num">6</div><div class="exercise-info"><h4>Tricep Pushdown</h4><p>Triceps Brachii</p></div><div class="exercise-sets">3×15</div></div>
    </div>
  </div>
  <div class="btn-row"><button class="btn-regen">↻ Regenerate</button><button class="btn-primary">Let's Go! →</button></div>
</div>
</body></html>`;

// ─────────────────────────────────────────────────────────────
// 7. EXERCISE PLAYER
// ─────────────────────────────────────────────────────────────
export const EXERCISE_PLAYER_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif; width:390px; min-height:720px; background:#111827; color:white; }
.status { display:flex; justify-content:space-between; align-items:center; padding:14px 22px 0; font-size:15px; font-weight:600; }
.top-bar { padding:12px 22px; display:flex; align-items:center; justify-content:space-between; }
.ex-progress { font-size:13px; opacity:0.6; font-weight:600; }
.timer { font-size:13px; font-weight:700; color:#A78BFA; }
.progress-track { margin:0 22px; height:3px; background:rgba(255,255,255,0.1); border-radius:100px; }
.progress-fill { width:33%; height:100%; background:linear-gradient(90deg,#7C3AED,#A855F7); border-radius:100px; }
.exercise-visual { margin:20px 22px; background:linear-gradient(135deg,#1b0640,#2D1B69); border-radius:24px; height:220px; display:flex; align-items:center; justify-content:center; position:relative; }
.exercise-anim { font-size:80px; }
.ex-badge { position:absolute; top:14px; right:14px; background:rgba(255,255,255,0.1); border-radius:8px; padding:6px 10px; font-size:12px; font-weight:700; }
.exercise-info { padding:0 22px; }
.ex-name { font-size:28px; font-weight:800; letter-spacing:-0.8px; margin-bottom:6px; }
.ex-target { font-size:14px; color:rgba(255,255,255,0.5); margin-bottom:20px; }
.set-counter { display:flex; gap:10px; align-items:center; justify-content:center; margin-bottom:20px; }
.set-dot { width:10px; height:10px; border-radius:100px; background:rgba(255,255,255,0.15); }
.set-dot.done { background:#A855F7; }
.set-dot.active { background:white; width:28px; }
.reps-display { text-align:center; margin-bottom:24px; }
.reps-num { font-size:64px; font-weight:900; letter-spacing:-3px; line-height:1; }
.reps-label { font-size:14px; color:rgba(255,255,255,0.4); font-weight:600; margin-top:4px; }
.weight-row { display:flex; align-items:center; justify-content:center; gap:16px; margin-bottom:24px; }
.weight-btn { width:44px; height:44px; background:rgba(255,255,255,0.08); border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:20px; border:none; color:white; cursor:pointer; }
.weight-val { font-size:22px; font-weight:800; }
.weight-unit { font-size:14px; color:rgba(255,255,255,0.4); }
.btn-done { display:block; width:100%; margin:0 22px; width:calc(100% - 44px); padding:17px; background:linear-gradient(135deg,#7C3AED,#A855F7); color:white; border:none; border-radius:16px; font-size:17px; font-weight:700; cursor:pointer; box-shadow:0 10px 30px rgba(124,58,237,0.4); text-align:center; }
.skip-btn { text-align:center; margin-top:14px; font-size:14px; color:rgba(255,255,255,0.35); font-weight:600; }
</style></head><body>
<div class="status"><span>9:41</span><div style="display:flex;align-items:center;gap:5px;font-size:11px;opacity:0.7;"><span>●●●</span><span>WiFi</span><span style="font-size:13px;">🔋</span></div></div>
<div class="top-bar"><span class="ex-progress">Exercise 3 of 6</span><span class="timer">⏱ 23:14</span></div>
<div class="progress-track"><div class="progress-fill"></div></div>
<div class="exercise-visual">
  <div class="exercise-anim">🏋️</div>
  <span class="ex-badge">Set 2 of 4</span>
</div>
<div class="exercise-info">
  <h2 class="ex-name">Overhead Press</h2>
  <p class="ex-target">Shoulders · Triceps · Core Stability</p>
  <div class="set-counter">
    <div class="set-dot done"></div>
    <div class="set-dot active"></div>
    <div class="set-dot"></div>
    <div class="set-dot"></div>
  </div>
  <div class="reps-display">
    <div class="reps-num">8</div>
    <div class="reps-label">TARGET REPS</div>
  </div>
  <div class="weight-row">
    <button class="weight-btn">−</button>
    <div><span class="weight-val">52.5</span> <span class="weight-unit">kg</span></div>
    <button class="weight-btn">+</button>
  </div>
</div>
<button class="btn-done">✓ Set Complete</button>
<p class="skip-btn">Skip exercise</p>
</body></html>`;

// ─────────────────────────────────────────────────────────────
// 8. WORKOUT COMPLETION & LOG
// ─────────────────────────────────────────────────────────────
export const WORKOUT_LOG_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif; width:390px; min-height:720px; background:#FAFAFA; color:#111827; }
.status { display:flex; justify-content:space-between; align-items:center; padding:14px 22px 0; font-size:15px; font-weight:600; }
.content { padding:20px 22px 100px; text-align:center; }
.celebration { font-size:70px; margin-bottom:16px; }
.title { font-size:30px; font-weight:900; letter-spacing:-1px; margin-bottom:6px; }
.subtitle { font-size:15px; color:#6B7280; margin-bottom:28px; }
.stats-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-bottom:20px; }
.stat { background:white; border-radius:16px; padding:16px 10px; box-shadow:0 1px 3px rgba(0,0,0,0.07); }
.stat-val { font-size:22px; font-weight:800; color:#111827; }
.stat-label { font-size:11px; color:#9CA3AF; margin-top:4px; font-weight:600; text-transform:uppercase; letter-spacing:0.3px; }
.pr-badge { display:inline-flex; align-items:center; gap:8px; background:linear-gradient(135deg,#F59E0B,#FCD34D); border-radius:14px; padding:12px 18px; margin-bottom:20px; }
.pr-badge span { font-size:15px; font-weight:800; color:#78350F; }
.week-ring-section { background:white; border-radius:18px; padding:20px; box-shadow:0 1px 3px rgba(0,0,0,0.07); margin-bottom:20px; text-align:left; }
.week-ring-section h3 { font-size:15px; font-weight:700; margin-bottom:14px; }
.days-row { display:flex; gap:8px; justify-content:center; }
.day-circle { width:38px; height:38px; border-radius:100px; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; flex-direction:column; }
.day-circle.done { background:linear-gradient(135deg,#7C3AED,#A855F7); color:white; }
.day-circle.today { background:linear-gradient(135deg,#10B981,#34D399); color:white; }
.day-circle.rest { background:#F3F4F6; color:#9CA3AF; }
.day-label { font-size:9px; margin-top:2px; }
.btn-row { display:flex; gap:10px; }
.btn-share { flex:1; padding:14px; background:#F5F3FF; color:#7C3AED; border:none; border-radius:13px; font-size:15px; font-weight:700; cursor:pointer; }
.btn-done { flex:2; padding:14px; background:linear-gradient(135deg,#7C3AED,#A855F7); color:white; border:none; border-radius:13px; font-size:15px; font-weight:700; cursor:pointer; }
</style></head><body>
<div class="status"><span>9:41</span><div style="display:flex;align-items:center;gap:5px;font-size:11px;"><span>●●●</span><span>WiFi</span><span style="font-size:13px;">🔋</span></div></div>
<div class="content">
  <div class="celebration">🎉</div>
  <h1 class="title">Workout Complete!</h1>
  <p class="subtitle">Push Day — 42 min 18 sec</p>
  <div class="stats-grid">
    <div class="stat"><div class="stat-val">42m</div><div class="stat-label">Duration</div></div>
    <div class="stat"><div class="stat-val">387</div><div class="stat-label">Kcal</div></div>
    <div class="stat"><div class="stat-val">6</div><div class="stat-label">Exercises</div></div>
  </div>
  <div class="pr-badge"><span>🏆</span><span>New PR: Bench Press — 90kg × 8</span></div>
  <div class="week-ring-section">
    <h3>This Week's Progress</h3>
    <div class="days-row">
      <div class="day-circle done"><span>M</span><span class="day-label">✓</span></div>
      <div class="day-circle rest"><span>T</span></div>
      <div class="day-circle done"><span>W</span><span class="day-label">✓</span></div>
      <div class="day-circle today"><span>T</span><span class="day-label">✓</span></div>
      <div class="day-circle rest"><span>F</span></div>
      <div class="day-circle rest"><span>S</span></div>
      <div class="day-circle rest"><span>S</span></div>
    </div>
  </div>
  <div class="btn-row"><button class="btn-share">↗ Share</button><button class="btn-done">Done →</button></div>
</div>
</body></html>`;

// ─────────────────────────────────────────────────────────────
// 9. PROGRESS DASHBOARD
// ─────────────────────────────────────────────────────────────
export const PROGRESS_DASHBOARD_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif; width:390px; min-height:720px; background:#F8F9FA; color:#111827; }
.status { display:flex; justify-content:space-between; align-items:center; padding:14px 22px 0; font-size:15px; font-weight:600; }
.header { padding:14px 22px 8px; display:flex; justify-content:space-between; align-items:center; }
.header h1 { font-size:26px; font-weight:800; letter-spacing:-0.7px; }
.period-tabs { display:flex; gap:4px; background:#F3F4F6; border-radius:10px; padding:3px; }
.tab { padding:6px 12px; border-radius:7px; font-size:12px; font-weight:700; color:#9CA3AF; cursor:pointer; }
.tab.active { background:white; color:#111827; box-shadow:0 1px 3px rgba(0,0,0,0.08); }
.metric-cards { display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin:0 22px 14px; }
.metric { background:white; border-radius:14px; padding:14px; box-shadow:0 1px 3px rgba(0,0,0,0.06); text-align:center; }
.metric-val { font-size:22px; font-weight:800; color:#111827; }
.metric-label { font-size:11px; color:#9CA3AF; margin-top:3px; font-weight:600; }
.metric-delta { font-size:11px; font-weight:700; margin-top:4px; }
.chart-card { margin:0 22px 14px; background:white; border-radius:18px; padding:18px; box-shadow:0 1px 3px rgba(0,0,0,0.06); }
.chart-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; }
.chart-header h3 { font-size:15px; font-weight:700; }
.chart-header span { font-size:13px; color:#9CA3AF; }
.chart { position:relative; height:90px; }
.chart-line { position:absolute; bottom:0; left:0; right:0; }
.chart-bars { display:flex; align-items:flex-end; gap:6px; height:90px; }
.chart-bar { flex:1; border-radius:4px 4px 0 0; }
.chart-labels { display:flex; justify-content:space-between; margin-top:8px; }
.chart-labels span { font-size:10px; color:#9CA3AF; }
.muscle-card { margin:0 22px 14px; background:white; border-radius:18px; padding:18px; box-shadow:0 1px 3px rgba(0,0,0,0.06); }
.muscle-row { display:flex; align-items:center; gap:10px; margin-bottom:10px; }
.muscle-label { font-size:13px; font-weight:600; color:#374151; width:80px; flex-shrink:0; }
.muscle-bar-track { flex:1; height:8px; background:#F3F4F6; border-radius:100px; }
.muscle-bar-fill { height:100%; border-radius:100px; }
.muscle-count { font-size:12px; font-weight:700; color:#374151; width:30px; text-align:right; }
.bottom-nav { position:fixed; bottom:0; left:0; width:390px; background:white; border-top:1px solid #F3F4F6; padding:8px 0 22px; display:flex; justify-content:space-around; }
.nav-item { display:flex; flex-direction:column; align-items:center; gap:3px; }
</style></head><body>
<div class="status"><span>9:41</span><div style="display:flex;align-items:center;gap:5px;font-size:11px;"><span>●●●</span><span>WiFi</span><span style="font-size:13px;">🔋</span></div></div>
<div class="header">
  <h1>Progress</h1>
  <div class="period-tabs"><div class="tab">1W</div><div class="tab active">1M</div><div class="tab">3M</div><div class="tab">1Y</div></div>
</div>
<div class="metric-cards">
  <div class="metric"><div class="metric-val">18</div><div class="metric-label">Workouts</div><div class="metric-delta" style="color:#10B981;">▲ +3</div></div>
  <div class="metric"><div class="metric-val">24.5k</div><div class="metric-label">Total Vol.</div><div class="metric-delta" style="color:#10B981;">▲ 12%</div></div>
  <div class="metric"><div class="metric-val">41m</div><div class="metric-label">Avg. Sess.</div><div class="metric-delta" style="color:#6B7280;">→ Same</div></div>
</div>
<div class="chart-card">
  <div class="chart-header"><h3>Workout Frequency</h3><span>Past 30 days</span></div>
  <div class="chart-bars">
    <div class="chart-bar" style="height:40%;background:#DDD6FE;"></div>
    <div class="chart-bar" style="height:60%;background:#DDD6FE;"></div>
    <div class="chart-bar" style="height:80%;background:#7C3AED;"></div>
    <div class="chart-bar" style="height:50%;background:#DDD6FE;"></div>
    <div class="chart-bar" style="height:90%;background:#7C3AED;"></div>
    <div class="chart-bar" style="height:70%;background:#DDD6FE;"></div>
    <div class="chart-bar" style="height:85%;background:#7C3AED;"></div>
    <div class="chart-bar" style="height:55%;background:#DDD6FE;"></div>
    <div class="chart-bar" style="height:100%;background:#7C3AED;"></div>
    <div class="chart-bar" style="height:65%;background:#DDD6FE;"></div>
    <div class="chart-bar" style="height:75%;background:#7C3AED;"></div>
    <div class="chart-bar" style="height:45%;background:#DDD6FE;"></div>
  </div>
  <div class="chart-labels"><span>Mar 1</span><span>Mar 10</span><span>Mar 20</span><span>Mar 30</span></div>
</div>
<div class="muscle-card">
  <h3 style="font-size:15px;font-weight:700;margin-bottom:14px;">Muscle Group Focus</h3>
  <div class="muscle-row"><span class="muscle-label">Chest</span><div class="muscle-bar-track"><div class="muscle-bar-fill" style="width:85%;background:linear-gradient(90deg,#7C3AED,#A855F7);"></div></div><span class="muscle-count">8×</span></div>
  <div class="muscle-row"><span class="muscle-label">Legs</span><div class="muscle-bar-track"><div class="muscle-bar-fill" style="width:70%;background:linear-gradient(90deg,#7C3AED,#A855F7);"></div></div><span class="muscle-count">6×</span></div>
  <div class="muscle-row"><span class="muscle-label">Back</span><div class="muscle-bar-track"><div class="muscle-bar-fill" style="width:55%;background:linear-gradient(90deg,#7C3AED,#A855F7);"></div></div><span class="muscle-count">5×</span></div>
  <div class="muscle-row"><span class="muscle-label">Shoulders</span><div class="muscle-bar-track"><div class="muscle-bar-fill" style="width:40%;background:linear-gradient(90deg,#7C3AED,#A855F7);"></div></div><span class="muscle-count">4×</span></div>
  <div class="muscle-row" style="margin-bottom:0;"><span class="muscle-label">Arms</span><div class="muscle-bar-track"><div class="muscle-bar-fill" style="width:25%;background:linear-gradient(90deg,#7C3AED,#A855F7);"></div></div><span class="muscle-count">2×</span></div>
</div>
<div style="height:80px;"></div>
<div class="bottom-nav">
  <div class="nav-item"><span style="font-size:22px;opacity:0.4;">⌂</span><span style="font-size:10px;font-weight:600;color:#9CA3AF;">Home</span></div>
  <div class="nav-item"><span style="font-size:22px;opacity:0.4;">◈</span><span style="font-size:10px;font-weight:600;color:#9CA3AF;">Workout</span></div>
  <div class="nav-item"><span style="font-size:22px;">▲</span><span style="font-size:10px;font-weight:700;color:#7C3AED;">Progress</span></div>
  <div class="nav-item"><span style="font-size:22px;opacity:0.4;">◎</span><span style="font-size:10px;font-weight:600;color:#9CA3AF;">Nutrition</span></div>
  <div class="nav-item"><span style="font-size:22px;opacity:0.4;">◯</span><span style="font-size:10px;font-weight:600;color:#9CA3AF;">Profile</span></div>
</div>
</body></html>`;

// ─────────────────────────────────────────────────────────────
// 10. STRENGTH ANALYTICS
// ─────────────────────────────────────────────────────────────
export const ANALYTICS_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif; width:390px; min-height:720px; background:#FAFAFA; color:#111827; }
.status { display:flex; justify-content:space-between; align-items:center; padding:14px 22px 0; font-size:15px; font-weight:600; }
.header { padding:14px 22px; display:flex; align-items:center; gap:12px; }
.back { width:36px; height:36px; background:#F3F4F6; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:18px; }
.lift-tabs { display:flex; gap:6px; padding:0 22px 14px; overflow-x:auto; }
.lift-tab { padding:8px 16px; border-radius:100px; font-size:13px; font-weight:700; white-space:nowrap; cursor:pointer; }
.lift-tab.active { background:#7C3AED; color:white; }
.lift-tab:not(.active) { background:#F3F4F6; color:#6B7280; }
.chart-card { margin:0 22px 14px; background:white; border-radius:18px; padding:18px; box-shadow:0 1px 3px rgba(0,0,0,0.06); }
.chart-title { font-size:15px; font-weight:700; margin-bottom:4px; }
.chart-subtitle { font-size:13px; color:#6B7280; margin-bottom:16px; }
.line-chart { position:relative; height:120px; border-bottom:1.5px solid #F3F4F6; margin-bottom:8px; }
.line-svg { position:absolute; inset:0; width:100%; height:100%; }
.chart-x-labels { display:flex; justify-content:space-between; }
.chart-x-labels span { font-size:10px; color:#9CA3AF; }
.current-badge { display:inline-flex; align-items:center; gap:8px; background:#F5F3FF; border:1px solid #DDD6FE; border-radius:12px; padding:10px 14px; margin:14px 0; }
.current-badge-val { font-size:22px; font-weight:800; color:#7C3AED; }
.current-badge-label { font-size:12px; color:#6B7280; }
.pr-table { background:white; border-radius:18px; margin:0 22px 14px; box-shadow:0 1px 3px rgba(0,0,0,0.06); overflow:hidden; }
.pr-table-header { padding:14px 16px; background:#F9FAFB; border-bottom:1px solid #F3F4F6; display:flex; }
.pr-table-header span { font-size:11px; font-weight:700; color:#9CA3AF; text-transform:uppercase; letter-spacing:0.5px; }
.pr-row { display:flex; align-items:center; padding:13px 16px; border-bottom:1px solid #F9FAFB; }
.pr-row:last-child { border-bottom:none; }
.pr-row-type { font-size:13px; font-weight:700; color:#374151; flex:1; }
.pr-row-weight { font-size:15px; font-weight:800; color:#111827; }
.pr-row-date { font-size:12px; color:#9CA3AF; margin-left:10px; }
.pr-badge-new { background:#DCFCE7; color:#16A34A; border-radius:6px; padding:2px 7px; font-size:10px; font-weight:800; margin-left:8px; }
</style></head><body>
<div class="status"><span>9:41</span><div style="display:flex;align-items:center;gap:5px;font-size:11px;"><span>●●●</span><span>WiFi</span><span style="font-size:13px;">🔋</span></div></div>
<div class="header"><div class="back">←</div><span style="font-size:17px;font-weight:700;">Strength Analytics</span></div>
<div class="lift-tabs"><div class="lift-tab active">Bench Press</div><div class="lift-tab">Squat</div><div class="lift-tab">Deadlift</div><div class="lift-tab">OHP</div></div>
<div class="chart-card">
  <div class="chart-title">Bench Press — Estimated 1RM</div>
  <div class="chart-subtitle">12-week progression</div>
  <div class="line-chart">
    <svg class="line-svg" viewBox="0 0 300 120" fill="none" preserveAspectRatio="none">
      <defs><linearGradient id="grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#7C3AED" stop-opacity="0.15"/><stop offset="100%" stop-color="#7C3AED" stop-opacity="0"/></linearGradient></defs>
      <path d="M0,90 L25,85 L50,80 L75,75 L100,70 L125,65 L150,60 L175,55 L200,48 L225,40 L250,32 L275,22 L300,15" stroke="#7C3AED" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M0,90 L25,85 L50,80 L75,75 L100,70 L125,65 L150,60 L175,55 L200,48 L225,40 L250,32 L275,22 L300,15 L300,120 L0,120 Z" fill="url(#grad)"/>
      <circle cx="300" cy="15" r="5" fill="#7C3AED"/>
    </svg>
  </div>
  <div class="chart-x-labels"><span>Jan</span><span>Feb</span><span>Mar</span></div>
  <div class="current-badge"><div class="current-badge-val">102.5 kg</div><div class="current-badge-label">Current Est. 1RM · ▲ +17.5kg since start</div></div>
</div>
<div class="pr-table">
  <div class="pr-table-header"><span style="flex:1;">TYPE</span><span>WEIGHT</span><span style="width:70px;text-align:right;">DATE</span></div>
  <div class="pr-row"><span class="pr-row-type">1 Rep Max</span><span class="pr-row-weight">102.5 kg</span><span class="pr-row-date">Today</span><span class="pr-badge-new">NEW</span></div>
  <div class="pr-row"><span class="pr-row-type">3 Rep Max</span><span class="pr-row-weight">92.5 kg</span><span class="pr-row-date">Mar 2</span></div>
  <div class="pr-row"><span class="pr-row-type">5 Rep Max</span><span class="pr-row-weight">87.5 kg</span><span class="pr-row-date">Feb 24</span></div>
  <div class="pr-row"><span class="pr-row-type">8 Rep Max</span><span class="pr-row-weight">80 kg</span><span class="pr-row-date">Feb 16</span></div>
</div>
</body></html>`;

// ─────────────────────────────────────────────────────────────
// 11. AI COACHING INSIGHTS
// ─────────────────────────────────────────────────────────────
export const AI_INSIGHTS_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif; width:390px; min-height:720px; background:#FAFAFA; color:#111827; }
.status { display:flex; justify-content:space-between; align-items:center; padding:14px 22px 0; font-size:15px; font-weight:600; }
.header { padding:14px 22px; display:flex; align-items:center; gap:12px; }
.back { width:36px; height:36px; background:#F3F4F6; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:18px; }
.content { padding:0 22px 40px; }
.weekly-insight { background:linear-gradient(135deg,#1b0640,#2D1B69); border-radius:20px; padding:20px; margin-bottom:16px; color:white; }
.insight-header { display:flex; align-items:center; gap:12px; margin-bottom:14px; }
.coach-avatar { width:44px; height:44px; background:linear-gradient(135deg,#7C3AED,#A855F7); border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:22px; }
.coach-info h3 { font-size:14px; font-weight:700; }
.coach-info p { font-size:12px; opacity:0.6; margin-top:2px; }
.insight-text { font-size:15px; line-height:1.6; opacity:0.9; margin-bottom:14px; }
.insight-stat { display:flex; gap:10px; }
.stat-chip { background:rgba(255,255,255,0.12); border-radius:10px; padding:8px 12px; }
.stat-chip-val { font-size:16px; font-weight:800; }
.stat-chip-label { font-size:10px; opacity:0.65; margin-top:2px; }
.insight-card { background:white; border-radius:18px; padding:18px; box-shadow:0 1px 3px rgba(0,0,0,0.07); margin-bottom:12px; }
.insight-card-header { display:flex; align-items:flex-start; gap:12px; margin-bottom:10px; }
.insight-icon { width:40px; height:40px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
.insight-card-title { font-size:15px; font-weight:700; margin-bottom:4px; }
.insight-card-body { font-size:13px; color:#6B7280; line-height:1.6; }
.insight-action { display:inline-flex; align-items:center; gap:6px; margin-top:12px; font-size:13px; font-weight:700; color:#7C3AED; }
.badge { border-radius:6px; padding:3px 8px; font-size:10px; font-weight:800; margin-left:auto; }
</style></head><body>
<div class="status"><span>9:41</span><div style="display:flex;align-items:center;gap:5px;font-size:11px;"><span>●●●</span><span>WiFi</span><span style="font-size:13px;">🔋</span></div></div>
<div class="header"><div class="back">←</div><span style="font-size:17px;font-weight:700;">AI Coaching Insights</span></div>
<div class="content">
  <div class="weekly-insight">
    <div class="insight-header">
      <div class="coach-avatar">🤖</div>
      <div class="coach-info"><h3>Pulse AI Coach</h3><p>Weekly Analysis · Mar 6, 2026</p></div>
    </div>
    <p class="insight-text">"Your squat volume increased 23% this week — excellent progression. I'd recommend a deload next week to ensure full recovery before your peak phase."</p>
    <div class="insight-stat">
      <div class="stat-chip"><div class="stat-chip-val">+23%</div><div class="stat-chip-label">Volume ↑</div></div>
      <div class="stat-chip"><div class="stat-chip-val">14 days</div><div class="stat-chip-label">Streak</div></div>
      <div class="stat-chip"><div class="stat-chip-val">4.2/5</div><div class="stat-chip-label">Recovery</div></div>
    </div>
  </div>
  <div class="insight-card">
    <div class="insight-card-header">
      <div class="insight-icon" style="background:#FEF3C7;">⚡</div>
      <div style="flex:1;"><div class="insight-card-title">Recovery Alert</div><span class="badge" style="background:#FEF3C7;color:#92400E;float:right;">Action Needed</span></div>
    </div>
    <p class="insight-card-body">Your heart rate variability data suggests mild fatigue accumulation. Consider reducing workout intensity by 15% this Friday or substituting with active recovery.</p>
    <span class="insight-action">View Recovery Plan →</span>
  </div>
  <div class="insight-card">
    <div class="insight-card-header">
      <div class="insight-icon" style="background:#F5F3FF;">📊</div>
      <div style="flex:1;"><div class="insight-card-title">Bench Press Plateau Detected</div><span class="badge" style="background:#DBEAFE;color:#1E40AF;float:right;">Tip</span></div>
    </div>
    <p class="insight-card-body">Your bench has stalled at 90kg for 3 sessions. Adding pause reps or close-grip variations will break through this plateau — I've updated your next session.</p>
    <span class="insight-action">See Updated Plan →</span>
  </div>
  <div class="insight-card">
    <div class="insight-card-header">
      <div class="insight-icon" style="background:#DCFCE7;">🥗</div>
      <div style="flex:1;"><div class="insight-card-title">Protein Target Consistently Missed</div><span class="badge" style="background:#DCFCE7;color:#166534;float:right;">Nutrition</span></div>
    </div>
    <p class="insight-card-body">You're averaging 118g protein/day vs your 175g target. This is limiting muscle repair. I've added high-protein meal suggestions to your Nutrition tab.</p>
    <span class="insight-action">View Meal Suggestions →</span>
  </div>
</div>
</body></html>`;

// ─────────────────────────────────────────────────────────────
// 12. NUTRITION DASHBOARD
// ─────────────────────────────────────────────────────────────
export const NUTRITION_LOG_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif; width:390px; min-height:720px; background:#F8F9FA; color:#111827; }
.status { display:flex; justify-content:space-between; align-items:center; padding:14px 22px 0; font-size:15px; font-weight:600; }
.header { padding:14px 22px 8px; display:flex; justify-content:space-between; align-items:center; }
.header h1 { font-size:26px; font-weight:800; letter-spacing:-0.7px; }
.header-date { font-size:13px; color:#9CA3AF; font-weight:600; }
.calorie-card { margin:0 22px 14px; background:linear-gradient(135deg,#059669,#10B981); border-radius:20px; padding:20px; color:white; }
.calorie-row { display:flex; align-items:center; gap:16px; }
.calorie-ring { width:90px; height:90px; flex-shrink:0; }
.calorie-info h2 { font-size:32px; font-weight:900; letter-spacing:-1px; }
.calorie-info p { font-size:13px; opacity:0.75; margin-top:2px; }
.calorie-remaining { background:rgba(255,255,255,0.15); border-radius:10px; padding:8px 12px; margin-top:10px; display:inline-block; }
.calorie-remaining span { font-size:13px; font-weight:700; }
.macros-row { display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin:0 22px 14px; }
.macro-card { background:white; border-radius:14px; padding:14px; box-shadow:0 1px 3px rgba(0,0,0,0.06); }
.macro-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
.macro-name { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; }
.macro-pct { font-size:11px; font-weight:700; }
.macro-track { height:6px; background:#F3F4F6; border-radius:100px; margin-bottom:8px; }
.macro-fill { height:100%; border-radius:100px; }
.macro-val { font-size:16px; font-weight:800; }
.macro-target { font-size:11px; color:#9CA3AF; }
.meal-section { margin:0 22px; }
.meal-header { display:flex; justify-content:space-between; align-items:center; padding:12px 0 8px; }
.meal-header h3 { font-size:15px; font-weight:700; }
.meal-header span { font-size:13px; color:#9CA3AF; }
.food-item { display:flex; align-items:center; gap:12px; padding:12px 0; border-bottom:1px solid #F3F4F6; }
.food-icon { width:38px; height:38px; background:#F3F4F6; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
.food-info h4 { font-size:14px; font-weight:600; }
.food-info p { font-size:12px; color:#9CA3AF; margin-top:2px; }
.food-cal { margin-left:auto; font-size:14px; font-weight:700; }
.fab { position:fixed; bottom:30px; right:22px; width:56px; height:56px; background:linear-gradient(135deg,#059669,#10B981); border-radius:18px; display:flex; align-items:center; justify-content:center; font-size:28px; color:white; box-shadow:0 8px 24px rgba(5,150,105,0.4); cursor:pointer; }
.bottom-nav { position:fixed; bottom:0; left:0; width:390px; background:white; border-top:1px solid #F3F4F6; padding:8px 0 22px; display:flex; justify-content:space-around; }
</style></head><body>
<div class="status"><span>9:41</span><div style="display:flex;align-items:center;gap:5px;font-size:11px;"><span>●●●</span><span>WiFi</span><span style="font-size:13px;">🔋</span></div></div>
<div class="header"><h1>Nutrition</h1><span class="header-date">Thu, Mar 6</span></div>
<div class="calorie-card">
  <div class="calorie-row">
    <svg class="calorie-ring" viewBox="0 0 90 90"><circle cx="45" cy="45" r="38" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="8"/><circle cx="45" cy="45" r="38" fill="none" stroke="white" stroke-width="8" stroke-linecap="round" stroke-dasharray="239" stroke-dashoffset="71" transform="rotate(-90 45 45)"/></svg>
    <div><div class="calorie-info"><h2>1,840</h2><p>of 2,400 kcal consumed</p></div><div class="calorie-remaining"><span>560 kcal remaining</span></div></div>
  </div>
</div>
<div class="macros-row">
  <div class="macro-card"><div class="macro-top"><span class="macro-name" style="color:#EF4444;">Protein</span><span class="macro-pct" style="color:#EF4444;">81%</span></div><div class="macro-track"><div class="macro-fill" style="width:81%;background:#EF4444;"></div></div><div class="macro-val">142g</div><div class="macro-target">of 175g</div></div>
  <div class="macro-card"><div class="macro-top"><span class="macro-name" style="color:#F59E0B;">Carbs</span><span class="macro-pct" style="color:#F59E0B;">73%</span></div><div class="macro-track"><div class="macro-fill" style="width:73%;background:#F59E0B;"></div></div><div class="macro-val">186g</div><div class="macro-target">of 255g</div></div>
  <div class="macro-card"><div class="macro-top"><span class="macro-name" style="color:#3B82F6;">Fat</span><span class="macro-pct" style="color:#3B82F6;">96%</span></div><div class="macro-track"><div class="macro-fill" style="width:96%;background:#3B82F6;"></div></div><div class="macro-val">58g</div><div class="macro-target">of 60g</div></div>
</div>
<div class="meal-section">
  <div class="meal-header"><h3>🌅 Breakfast</h3><span>542 kcal</span></div>
  <div class="food-item"><div class="food-icon">🍳</div><div class="food-info"><h4>3 Whole Eggs, Scrambled</h4><p>23g protein · 210 kcal</p></div><div class="food-cal">210</div></div>
  <div class="food-item"><div class="food-icon">🥣</div><div class="food-info"><h4>Oats with Blueberries</h4><p>8g protein · 332 kcal</p></div><div class="food-cal">332</div></div>
  <div class="meal-header"><h3>☀️ Lunch</h3><span>698 kcal</span></div>
  <div class="food-item"><div class="food-icon">🍗</div><div class="food-info"><h4>Grilled Chicken Breast (200g)</h4><p>48g protein · 330 kcal</p></div><div class="food-cal">330</div></div>
  <div class="food-item"><div class="food-icon">🍚</div><div class="food-info"><h4>Brown Rice (150g cooked)</h4><p>5g protein · 368 kcal</p></div><div class="food-cal">368</div></div>
</div>
<div style="height:90px;"></div>
<div class="fab">+</div>
<div class="bottom-nav">
  <div style="display:flex;flex-direction:column;align-items:center;gap:3px;"><span style="font-size:22px;opacity:0.4;">⌂</span><span style="font-size:10px;font-weight:600;color:#9CA3AF;">Home</span></div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:3px;"><span style="font-size:22px;opacity:0.4;">◈</span><span style="font-size:10px;font-weight:600;color:#9CA3AF;">Workout</span></div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:3px;"><span style="font-size:22px;opacity:0.4;">▲</span><span style="font-size:10px;font-weight:600;color:#9CA3AF;">Progress</span></div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:3px;"><span style="font-size:22px;">◎</span><span style="font-size:10px;font-weight:700;color:#059669;">Nutrition</span></div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:3px;"><span style="font-size:22px;opacity:0.4;">◯</span><span style="font-size:10px;font-weight:600;color:#9CA3AF;">Profile</span></div>
</div>
</body></html>`;

// ─────────────────────────────────────────────────────────────
// 13. AI MEAL SUGGESTIONS
// ─────────────────────────────────────────────────────────────
export const AI_MEALS_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif; width:390px; min-height:720px; background:#FAFAFA; color:#111827; }
.status { display:flex; justify-content:space-between; align-items:center; padding:14px 22px 0; font-size:15px; font-weight:600; }
.header { padding:14px 22px; display:flex; align-items:center; gap:12px; }
.back { width:36px; height:36px; background:#F3F4F6; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:18px; }
.content { padding:0 22px 40px; }
.ai-banner { background:#F5F3FF; border:1px solid #DDD6FE; border-radius:16px; padding:14px 16px; margin-bottom:18px; display:flex; align-items:center; gap:10px; }
.ai-banner-icon { font-size:22px; }
.ai-banner-text h3 { font-size:14px; font-weight:700; color:#5B21B6; }
.ai-banner-text p { font-size:12px; color:#7C3AED; margin-top:2px; }
.filter-row { display:flex; gap:8px; margin-bottom:16px; overflow-x:auto; padding-bottom:4px; }
.filter { padding:7px 14px; border-radius:100px; font-size:13px; font-weight:700; cursor:pointer; white-space:nowrap; }
.filter.active { background:#7C3AED; color:white; }
.filter:not(.active) { background:#F3F4F6; color:#6B7280; }
.meal-card { background:white; border-radius:18px; padding:18px; box-shadow:0 1px 3px rgba(0,0,0,0.07); margin-bottom:12px; }
.meal-img { width:100%; height:130px; background:linear-gradient(135deg,#F3F4F6,#E5E7EB); border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:48px; margin-bottom:14px; }
.meal-top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px; }
.meal-name { font-size:17px; font-weight:800; letter-spacing:-0.3px; flex:1; }
.meal-time { font-size:12px; color:#9CA3AF; font-weight:600; }
.macro-chips { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:12px; }
.macro-chip { background:#F3F4F6; border-radius:100px; padding:4px 10px; font-size:12px; font-weight:700; color:#374151; }
.macro-chip.protein { background:#FEE2E2; color:#DC2626; }
.meal-bottom { display:flex; justify-content:space-between; align-items:center; }
.meal-cal { font-size:13px; color:#6B7280; }
.btn-add { background:linear-gradient(135deg,#7C3AED,#A855F7); color:white; border:none; border-radius:10px; padding:8px 16px; font-size:13px; font-weight:700; cursor:pointer; }
</style></head><body>
<div class="status"><span>9:41</span><div style="display:flex;align-items:center;gap:5px;font-size:11px;"><span>●●●</span><span>WiFi</span><span style="font-size:13px;">🔋</span></div></div>
<div class="header"><div class="back">←</div><span style="font-size:17px;font-weight:700;">AI Meal Suggestions</span></div>
<div class="content">
  <div class="ai-banner"><span class="ai-banner-icon">✦</span><div class="ai-banner-text"><h3>33g protein gap remaining today</h3><p>These meals will hit your targets</p></div></div>
  <div class="filter-row"><div class="filter active">All</div><div class="filter">High Protein</div><div class="filter">Low Carb</div><div class="filter">Quick &lt;30m</div><div class="filter">Vegan</div></div>
  <div class="meal-card"><div class="meal-img">🍣</div><div class="meal-top"><div class="meal-name">Salmon & Quinoa Bowl</div><span class="meal-time">⏱ 25 min</span></div><div class="macro-chips"><span class="macro-chip protein">48g protein</span><span class="macro-chip">42g carbs</span><span class="macro-chip">14g fat</span></div><div class="meal-bottom"><span class="meal-cal">520 kcal · Best match ✦</span><button class="btn-add">+ Add to Plan</button></div></div>
  <div class="meal-card"><div class="meal-img">🥚</div><div class="meal-top"><div class="meal-name">Greek Omelette with Feta</div><span class="meal-time">⏱ 10 min</span></div><div class="macro-chips"><span class="macro-chip protein">38g protein</span><span class="macro-chip">8g carbs</span><span class="macro-chip">22g fat</span></div><div class="meal-bottom"><span class="meal-cal">382 kcal</span><button class="btn-add">+ Add to Plan</button></div></div>
  <div class="meal-card"><div class="meal-img">🍗</div><div class="meal-top"><div class="meal-name">Teriyaki Chicken Stir-Fry</div><span class="meal-time">⏱ 20 min</span></div><div class="macro-chips"><span class="macro-chip protein">44g protein</span><span class="macro-chip">36g carbs</span><span class="macro-chip">8g fat</span></div><div class="meal-bottom"><span class="meal-cal">396 kcal</span><button class="btn-add">+ Add to Plan</button></div></div>
</div>
</body></html>`;

// ─────────────────────────────────────────────────────────────
// 14. RECIPE DETAIL
// ─────────────────────────────────────────────────────────────
export const RECIPE_DETAIL_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif; width:390px; min-height:720px; background:#FAFAFA; color:#111827; }
.status { display:flex; justify-content:space-between; align-items:center; padding:14px 22px 0; font-size:15px; font-weight:600; position:absolute; top:0; left:0; width:100%; z-index:2; color:white; }
.hero { width:100%; height:220px; background:linear-gradient(135deg,#065F46,#059669); display:flex; align-items:center; justify-content:center; font-size:80px; position:relative; }
.hero-overlay { position:absolute; bottom:0; left:0; right:0; height:60px; background:linear-gradient(to top,#FAFAFA,transparent); }
.back-btn { position:absolute; top:56px; left:16px; width:36px; height:36px; background:rgba(0,0,0,0.25); border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:18px; color:white; z-index:3; }
.content { padding:16px 22px 100px; }
.recipe-name { font-size:26px; font-weight:800; letter-spacing:-0.7px; margin-bottom:10px; }
.macro-row { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:16px; }
.macro-chip { background:#F3F4F6; border-radius:100px; padding:6px 12px; font-size:13px; font-weight:700; }
.macro-chip.kcal { background:#FEF3C7; color:#92400E; }
.macro-chip.protein { background:#FEE2E2; color:#DC2626; }
.meta-row { display:flex; gap:16px; margin-bottom:20px; }
.meta-item { display:flex; align-items:center; gap:6px; font-size:13px; color:#6B7280; font-weight:600; }
.section-tabs { display:flex; gap:0; background:#F3F4F6; border-radius:12px; padding:3px; margin-bottom:18px; }
.section-tab { flex:1; padding:9px; text-align:center; border-radius:9px; font-size:14px; font-weight:700; cursor:pointer; }
.section-tab.active { background:white; color:#111827; box-shadow:0 1px 3px rgba(0,0,0,0.08); }
.section-tab:not(.active) { color:#9CA3AF; }
.ingredient-item { display:flex; align-items:center; justify-content:space-between; padding:12px 0; border-bottom:1px solid #F3F4F6; }
.ingredient-item:last-child { border-bottom:none; }
.ingredient-name { font-size:14px; font-weight:600; }
.ingredient-amount { font-size:14px; color:#6B7280; font-weight:600; }
.sticky-footer { position:fixed; bottom:0; left:0; width:390px; background:white; border-top:1px solid #F3F4F6; padding:14px 22px 30px; }
.btn-log { width:100%; padding:15px; background:linear-gradient(135deg,#059669,#10B981); color:white; border:none; border-radius:14px; font-size:16px; font-weight:700; cursor:pointer; box-shadow:0 6px 20px rgba(5,150,105,0.3); }
</style></head><body>
<div class="status"><span>9:41</span><div style="display:flex;align-items:center;gap:5px;font-size:11px;opacity:0.9;"><span>●●●</span><span>WiFi</span><span style="font-size:13px;">🔋</span></div></div>
<div class="hero"><span>🍣</span><div class="hero-overlay"></div></div>
<div class="back-btn">←</div>
<div class="content">
  <h1 class="recipe-name">Salmon & Quinoa Bowl</h1>
  <div class="macro-row">
    <span class="macro-chip kcal">520 kcal</span>
    <span class="macro-chip protein">48g protein</span>
    <span class="macro-chip">42g carbs</span>
    <span class="macro-chip">14g fat</span>
  </div>
  <div class="meta-row">
    <span class="meta-item">⏱ 25 min</span>
    <span class="meta-item">👤 1 serving</span>
    <span class="meta-item">⚡ Easy</span>
  </div>
  <div class="section-tabs"><div class="section-tab active">Ingredients</div><div class="section-tab">Instructions</div></div>
  <div class="ingredient-item"><span class="ingredient-name">Salmon fillet</span><span class="ingredient-amount">180g</span></div>
  <div class="ingredient-item"><span class="ingredient-name">Quinoa (dry)</span><span class="ingredient-amount">80g</span></div>
  <div class="ingredient-item"><span class="ingredient-name">Edamame</span><span class="ingredient-amount">60g</span></div>
  <div class="ingredient-item"><span class="ingredient-name">Cucumber</span><span class="ingredient-amount">½ medium</span></div>
  <div class="ingredient-item"><span class="ingredient-name">Avocado</span><span class="ingredient-amount">¼ medium</span></div>
  <div class="ingredient-item"><span class="ingredient-name">Soy sauce</span><span class="ingredient-amount">1 tbsp</span></div>
  <div class="ingredient-item"><span class="ingredient-name">Sesame oil</span><span class="ingredient-amount">1 tsp</span></div>
  <div class="ingredient-item"><span class="ingredient-name">Sesame seeds</span><span class="ingredient-amount">1 tsp</span></div>
</div>
<div class="sticky-footer"><button class="btn-log">Log This Meal</button></div>
</body></html>`;

// ─────────────────────────────────────────────────────────────
// 15. LOG MEAL
// ─────────────────────────────────────────────────────────────
export const LOG_MEAL_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif; width:390px; min-height:720px; background:#FAFAFA; color:#111827; }
.status { display:flex; justify-content:space-between; align-items:center; padding:14px 22px 0; font-size:15px; font-weight:600; }
.header { padding:14px 22px; display:flex; align-items:center; justify-content:space-between; }
.header-title { font-size:17px; font-weight:700; }
.cancel { font-size:15px; color:#7C3AED; font-weight:600; }
.content { padding:0 22px 100px; }
.food-summary { background:white; border-radius:18px; padding:18px; box-shadow:0 1px 3px rgba(0,0,0,0.07); margin-bottom:16px; display:flex; align-items:center; gap:14px; }
.food-emoji { font-size:40px; width:56px; height:56px; background:#F3F4F6; border-radius:16px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.food-detail h3 { font-size:17px; font-weight:800; letter-spacing:-0.3px; }
.food-detail p { font-size:13px; color:#6B7280; margin-top:3px; }
.portion-card { background:white; border-radius:18px; padding:20px; box-shadow:0 1px 3px rgba(0,0,0,0.07); margin-bottom:16px; }
.portion-label { font-size:14px; font-weight:700; color:#374151; margin-bottom:14px; }
.portion-stepper { display:flex; align-items:center; justify-content:space-between; background:#F8F9FA; border-radius:14px; padding:4px; }
.portion-btn { width:52px; height:52px; background:white; border-radius:11px; border:none; font-size:24px; font-weight:300; color:#374151; cursor:pointer; box-shadow:0 1px 3px rgba(0,0,0,0.08); }
.portion-values { text-align:center; }
.portion-num { font-size:32px; font-weight:900; color:#111827; letter-spacing:-1px; }
.portion-unit { font-size:13px; color:#9CA3AF; margin-top:2px; }
.live-macros { display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:8px; margin-bottom:16px; }
.live-macro { background:white; border-radius:12px; padding:12px 8px; box-shadow:0 1px 3px rgba(0,0,0,0.06); text-align:center; }
.live-macro-val { font-size:16px; font-weight:800; }
.live-macro-label { font-size:10px; color:#9CA3AF; margin-top:2px; font-weight:600; }
.meal-type-card { background:white; border-radius:18px; padding:18px; box-shadow:0 1px 3px rgba(0,0,0,0.07); margin-bottom:16px; }
.meal-type-label { font-size:14px; font-weight:700; margin-bottom:12px; }
.meal-type-options { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
.meal-type-opt { padding:11px; border-radius:12px; border:2px solid #E5E7EB; font-size:13px; font-weight:700; text-align:center; cursor:pointer; }
.meal-type-opt.active { border-color:#7C3AED; background:#F5F3FF; color:#7C3AED; }
.btn-save { display:block; width:100%; padding:16px; background:linear-gradient(135deg,#059669,#10B981); color:white; border:none; border-radius:14px; font-size:16px; font-weight:700; cursor:pointer; box-shadow:0 6px 20px rgba(5,150,105,0.3); text-align:center; }
.auto-time { text-align:center; font-size:13px; color:#9CA3AF; margin-top:10px; }
</style></head><body>
<div class="status"><span>9:41</span><div style="display:flex;align-items:center;gap:5px;font-size:11px;"><span>●●●</span><span>WiFi</span><span style="font-size:13px;">🔋</span></div></div>
<div class="header"><span class="cancel">Cancel</span><span class="header-title">Log Meal</span><div style="width:52px;"></div></div>
<div class="content">
  <div class="food-summary"><div class="food-emoji">🍣</div><div class="food-detail"><h3>Salmon & Quinoa Bowl</h3><p>520 kcal per serving</p></div></div>
  <div class="portion-card">
    <p class="portion-label">Portion size</p>
    <div class="portion-stepper">
      <button class="portion-btn">−</button>
      <div class="portion-values"><div class="portion-num">1×</div><div class="portion-unit">1 serving (approx. 350g)</div></div>
      <button class="portion-btn">+</button>
    </div>
  </div>
  <div class="live-macros">
    <div class="live-macro"><div class="live-macro-val" style="color:#374151;">520</div><div class="live-macro-label">KCAL</div></div>
    <div class="live-macro"><div class="live-macro-val" style="color:#EF4444;">48g</div><div class="live-macro-label">PROTEIN</div></div>
    <div class="live-macro"><div class="live-macro-val" style="color:#F59E0B;">42g</div><div class="live-macro-label">CARBS</div></div>
    <div class="live-macro"><div class="live-macro-val" style="color:#3B82F6;">14g</div><div class="live-macro-label">FAT</div></div>
  </div>
  <div class="meal-type-card">
    <p class="meal-type-label">Meal type</p>
    <div class="meal-type-options">
      <div class="meal-type-opt">🌅 Breakfast</div>
      <div class="meal-type-opt">☀️ Lunch</div>
      <div class="meal-type-opt active">🌆 Dinner</div>
      <div class="meal-type-opt">🍎 Snack</div>
    </div>
  </div>
  <button class="btn-save">Save to Log</button>
  <p class="auto-time">Logged at 9:41 PM · Thursday, Mar 6</p>
</div>
</body></html>`;

// ─────────────────────────────────────────────────────────────
// BRANCH SCREENS — Completion & Log branches
// ─────────────────────────────────────────────────────────────

export const LOG_PR_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif; width:390px; min-height:720px; background:linear-gradient(160deg,#0a1628 0%,#0d2137 60%,#0a1628 100%); color:white; overflow:hidden; }
.status { display:flex; justify-content:space-between; align-items:center; padding:14px 22px 0; font-size:15px; font-weight:600; }
.confetti-row { display:flex; justify-content:center; gap:8px; padding:20px 0 4px; font-size:28px; }
.hero { text-align:center; padding:8px 32px 24px; }
.badge { display:inline-block; background:linear-gradient(135deg,#F59E0B,#FBBF24); color:#78350F; font-size:11px; font-weight:800; padding:5px 14px; border-radius:20px; text-transform:uppercase; letter-spacing:0.8px; margin-bottom:14px; }
.headline { font-size:30px; font-weight:900; letter-spacing:-1px; margin-bottom:6px; }
.sub { font-size:15px; color:rgba(255,255,255,0.55); }
.pr-card { margin:0 22px; background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.12); border-radius:20px; padding:24px; }
.lift-name { font-size:18px; font-weight:800; color:#FBBF24; margin-bottom:18px; }
.compare-row { display:flex; align-items:center; gap:12px; margin-bottom:8px; }
.pr-old { flex:1; text-align:center; background:rgba(255,255,255,0.05); border-radius:14px; padding:14px; }
.pr-old-val { font-size:28px; font-weight:800; color:rgba(255,255,255,0.4); }
.pr-old-label { font-size:11px; color:rgba(255,255,255,0.3); margin-top:4px; text-transform:uppercase; letter-spacing:0.4px; }
.arrow { font-size:24px; color:#10B981; flex-shrink:0; }
.pr-new { flex:1; text-align:center; background:linear-gradient(135deg,rgba(16,185,129,0.2),rgba(5,150,105,0.15)); border-radius:14px; padding:14px; border:1px solid rgba(16,185,129,0.3); }
.pr-new-val { font-size:32px; font-weight:900; color:#34D399; }
.pr-new-label { font-size:11px; color:#6EE7B7; margin-top:4px; text-transform:uppercase; letter-spacing:0.4px; }
.delta { text-align:center; margin-top:14px; font-size:13px; color:#6EE7B7; font-weight:600; }
.stats-row { display:flex; gap:12px; margin:16px 22px 0; }
.stat { flex:1; background:rgba(255,255,255,0.05); border-radius:14px; padding:14px; text-align:center; }
.stat-val { font-size:20px; font-weight:800; }
.stat-label { font-size:11px; color:rgba(255,255,255,0.4); margin-top:3px; text-transform:uppercase; letter-spacing:0.3px; }
.cta { position:fixed; bottom:0; left:0; width:390px; padding:16px 22px 36px; background:linear-gradient(transparent,rgba(10,22,40,0.98)); }
.share-btn { width:100%; background:linear-gradient(135deg,#F59E0B,#D97706); color:#78350F; border:none; border-radius:14px; padding:16px; font-size:16px; font-weight:800; cursor:pointer; }
.done-btn { width:100%; background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.7); border:none; border-radius:14px; padding:14px; font-size:15px; font-weight:600; cursor:pointer; margin-top:10px; }
</style></head><body>
<div class="status"><span>9:41</span><div style="display:flex;gap:5px;font-size:12px;color:rgba(255,255,255,0.7);">▲▲▲ WiFi 🔋</div></div>
<div class="confetti-row">🎉 🏆 🎉 🥇 🎉 🏆 🎉</div>
<div class="hero"><div class="badge">New Personal Record</div><div class="headline">You crushed it.</div><div class="sub">A new all-time best on Deadlift</div></div>
<div class="pr-card">
  <div class="lift-name">🏋️ Deadlift — 1 Rep Max</div>
  <div class="compare-row">
    <div class="pr-old"><div class="pr-old-val">115<span style="font-size:16px;">kg</span></div><div class="pr-old-label">Previous PR</div></div>
    <div class="arrow">→</div>
    <div class="pr-new"><div class="pr-new-val">127.5<span style="font-size:18px;">kg</span></div><div class="pr-new-label">New PR ✓</div></div>
  </div>
  <div class="delta">+12.5 kg · +10.9% improvement</div>
</div>
<div class="stats-row">
  <div class="stat"><div class="stat-val">4</div><div class="stat-label">PRs This Month</div></div>
  <div class="stat"><div class="stat-val">Top 8%</div><div class="stat-label">For Your Level</div></div>
  <div class="stat"><div class="stat-val">42 wk</div><div class="stat-label">Training Age</div></div>
</div>
<div style="height:120px;"></div>
<div class="cta"><button class="share-btn">Share This PR 🏆</button><button class="done-btn">Save & Continue</button></div>
</body></html>`;

export const SHARE_WORKOUT_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif; width:390px; min-height:720px; background:#F8F9FA; color:#111827; }
.status { display:flex; justify-content:space-between; align-items:center; padding:14px 22px 0; font-size:15px; font-weight:600; }
.header { padding:14px 22px; display:flex; align-items:center; gap:12px; }
.back { font-size:15px; color:#7C3AED; font-weight:600; }
.header-title { font-size:17px; font-weight:800; }
.share-card { margin:8px 22px; background:linear-gradient(135deg,#1b0640,#2d1a6b); border-radius:24px; padding:28px; color:white; }
.card-logo { font-size:12px; font-weight:800; color:rgba(255,255,255,0.4); letter-spacing:1px; text-transform:uppercase; margin-bottom:20px; }
.card-name { font-size:22px; font-weight:900; letter-spacing:-0.5px; margin-bottom:4px; }
.card-date { font-size:13px; color:rgba(255,255,255,0.5); margin-bottom:24px; }
.card-stats { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:20px; }
.card-stat { background:rgba(255,255,255,0.08); border-radius:14px; padding:14px; }
.card-stat-val { font-size:26px; font-weight:900; }
.card-stat-label { font-size:11px; color:rgba(255,255,255,0.5); margin-top:3px; text-transform:uppercase; letter-spacing:0.4px; }
.card-badge { display:inline-flex; align-items:center; gap:6px; background:rgba(251,191,36,0.15); border:1px solid rgba(251,191,36,0.3); color:#FBBF24; font-size:12px; font-weight:700; padding:6px 12px; border-radius:20px; }
.section-title { font-size:12px; font-weight:700; color:#9CA3AF; text-transform:uppercase; letter-spacing:0.6px; padding:16px 22px 10px; }
.share-options { display:grid; grid-template-columns:1fr 1fr; gap:10px; padding:0 22px; margin-bottom:16px; }
.share-opt { display:flex; align-items:center; gap:10px; background:white; border-radius:14px; padding:14px; box-shadow:0 1px 3px rgba(0,0,0,0.07); cursor:pointer; }
.share-icon { width:38px; height:38px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
.share-opt-label { font-size:14px; font-weight:700; color:#111; }
.share-opt-sub { font-size:11px; color:#9CA3AF; margin-top:1px; }
.copy-btn { margin:0 22px; background:#7C3AED; color:white; border:none; border-radius:14px; padding:15px; font-size:15px; font-weight:700; cursor:pointer; width:calc(100% - 44px); }
</style></head><body>
<div class="status"><span>9:41</span><div style="display:flex;align-items:center;gap:5px;font-size:11px;">●●● WiFi 🔋</div></div>
<div class="header"><span class="back">←</span><span class="header-title">Share Workout</span></div>
<div class="share-card">
  <div class="card-logo">PULSE · AI FITNESS</div>
  <div class="card-name">Upper Body Power</div>
  <div class="card-date">Thursday, March 6 · 42 min</div>
  <div class="card-stats">
    <div class="card-stat"><div class="card-stat-val">387</div><div class="card-stat-label">Calories</div></div>
    <div class="card-stat"><div class="card-stat-val">5</div><div class="card-stat-label">Exercises</div></div>
    <div class="card-stat"><div class="card-stat-val">14</div><div class="card-stat-label">Day Streak</div></div>
    <div class="card-stat"><div class="card-stat-val">4,820</div><div class="card-stat-label">Total Vol (kg)</div></div>
  </div>
  <div class="card-badge">🏆 New PR: Deadlift 127.5kg</div>
</div>
<div class="section-title">Share to</div>
<div class="share-options">
  <div class="share-opt"><div class="share-icon" style="background:#000;">📸</div><div><div class="share-opt-label">Instagram</div><div class="share-opt-sub">Story or post</div></div></div>
  <div class="share-opt"><div class="share-icon" style="background:#EFF6FF;">🐦</div><div><div class="share-opt-label">Twitter / X</div><div class="share-opt-sub">Tweet it</div></div></div>
  <div class="share-opt"><div class="share-icon" style="background:#ECFDF5;">💬</div><div><div class="share-opt-label">WhatsApp</div><div class="share-opt-sub">Send to friends</div></div></div>
  <div class="share-opt"><div class="share-icon" style="background:#F3F4F6;">📁</div><div><div class="share-opt-label">Save Image</div><div class="share-opt-sub">Camera roll</div></div></div>
</div>
<button class="copy-btn">🔗 Copy Share Link</button>
</body></html>`;

export const AI_DEBRIEF_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif; width:390px; min-height:720px; background:#F8F9FA; color:#111827; }
.status { display:flex; justify-content:space-between; align-items:center; padding:14px 22px 0; font-size:15px; font-weight:600; }
.header { padding:14px 22px 12px; display:flex; align-items:center; justify-content:space-between; }
.back { font-size:15px; color:#7C3AED; font-weight:600; }
.header-title { font-size:17px; font-weight:800; }
.coach-banner { margin:4px 22px 0; background:linear-gradient(135deg,#1b0640,#4C1D95); border-radius:18px; padding:18px; display:flex; align-items:center; gap:14px; color:white; }
.coach-avatar { width:50px; height:50px; border-radius:16px; background:linear-gradient(135deg,#7C3AED,#A855F7); display:flex; align-items:center; justify-content:center; font-size:22px; flex-shrink:0; }
.coach-label { font-size:11px; font-weight:700; color:rgba(255,255,255,0.5); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:3px; }
.coach-headline { font-size:15px; font-weight:700; line-height:1.4; }
.section-title { font-size:12px; font-weight:700; color:#9CA3AF; text-transform:uppercase; letter-spacing:0.6px; padding:16px 22px 8px; }
.insight-card { margin:0 22px 10px; background:white; border-radius:16px; padding:16px; box-shadow:0 1px 3px rgba(0,0,0,0.06); display:flex; gap:12px; align-items:flex-start; }
.insight-icon { width:40px; height:40px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
.insight-title { font-size:14px; font-weight:700; color:#111; margin-bottom:3px; }
.insight-body { font-size:13px; color:#6B7280; line-height:1.5; }
.insight-tag { display:inline-block; font-size:10px; font-weight:700; padding:3px 8px; border-radius:6px; margin-top:6px; text-transform:uppercase; letter-spacing:0.4px; }
.next-session { margin:0 22px; background:white; border-radius:16px; padding:18px; box-shadow:0 1px 3px rgba(0,0,0,0.06); }
.next-label { font-size:12px; font-weight:700; color:#9CA3AF; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:10px; }
.next-title { font-size:16px; font-weight:800; margin-bottom:4px; }
.next-sub { font-size:13px; color:#6B7280; margin-bottom:12px; }
.chip { display:inline-block; font-size:12px; font-weight:600; padding:5px 10px; border-radius:8px; background:#F3F4F6; color:#374151; margin:0 4px 4px 0; }
</style></head><body>
<div class="status"><span>9:41</span><div style="display:flex;align-items:center;gap:5px;font-size:11px;">●●● WiFi 🔋</div></div>
<div class="header"><span class="back">←</span><span class="header-title">AI Debrief</span><div></div></div>
<div class="coach-banner">
  <div class="coach-avatar">🤖</div>
  <div><div class="coach-label">Pulse AI Coach</div><div class="coach-headline">Strong session. Here's what I noticed from your performance data.</div></div>
</div>
<div class="section-title">Performance Insights</div>
<div class="insight-card">
  <div class="insight-icon" style="background:#FEF3C7;">⚡</div>
  <div><div class="insight-title">Deadlift Volume Spike</div><div class="insight-body">Your deadlift tonnage increased 18% vs last week. Consider a slight deload next Thursday to protect your lower back.</div><div class="insight-tag" style="background:#FEF3C7;color:#92400E;">Recovery Alert</div></div>
</div>
<div class="insight-card">
  <div class="insight-icon" style="background:#ECFDF5;">📈</div>
  <div><div class="insight-title">Bench Press Plateau Broken</div><div class="insight-body">After 3 weeks flat, you added 2.5kg to bench. Switching to RPE-based loading is working — keep it.</div><div class="insight-tag" style="background:#ECFDF5;color:#065F46;">Strength Gain</div></div>
</div>
<div class="insight-card">
  <div class="insight-icon" style="background:#F5F3FF;">🎯</div>
  <div><div class="insight-title">Rest Periods Too Short</div><div class="insight-body">Avg rest was 68s between heavy sets. For max strength work, aim for 2–3 min to fully recover ATP.</div><div class="insight-tag" style="background:#F5F3FF;color:#5B21B6;">Form Tip</div></div>
</div>
<div class="section-title">Next Session</div>
<div class="next-session">
  <div class="next-label">Friday · Tomorrow</div>
  <div class="next-title">Lower Body — Squat Focus</div>
  <div class="next-sub">Moderate volume, RPE 7–8, focus on quad depth</div>
  <span class="chip">Back Squat</span><span class="chip">Romanian DL</span><span class="chip">Leg Press</span><span class="chip">Calf Raises</span>
</div>
</body></html>`;

// ─────────────────────────────────────────────────────────────
// BRANCH SCREENS — Fitness Assessment → Goal Setting variants
// ─────────────────────────────────────────────────────────────

const GOAL_BRANCH_STYLES = `
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif; width:390px; min-height:720px; background:#F8F9FA; color:#111; }
.status { display:flex; justify-content:space-between; align-items:center; padding:14px 22px 0; font-size:15px; font-weight:600; }
.header { padding:16px 22px 14px; background:white; border-bottom:1px solid #F3F4F6; }
.back { font-size:15px; color:#7C3AED; font-weight:500; margin-bottom:10px; }
.plan-card { margin:20px 22px 0; border-radius:20px; padding:24px; color:white; }
.plan-title { font-size:23px; font-weight:900; letter-spacing:-0.5px; margin-bottom:4px; }
.plan-sub { font-size:13px; opacity:0.82; margin-bottom:22px; line-height:1.5; }
.plan-stats { display:flex; gap:0; }
.plan-stat { flex:1; text-align:center; }
.plan-stat-val { font-size:22px; font-weight:800; }
.plan-stat-label { font-size:10px; opacity:0.75; margin-top:3px; text-transform:uppercase; letter-spacing:0.3px; }
.plan-stat + .plan-stat { border-left:1px solid rgba(255,255,255,0.2); }
.section { margin:20px 22px 0; }
.section-title { font-size:12px; font-weight:700; color:#9CA3AF; text-transform:uppercase; letter-spacing:0.6px; margin-bottom:12px; }
.week-grid { display:flex; gap:6px; }
.day { flex:1; text-align:center; padding:10px 2px; border-radius:12px; font-size:11px; font-weight:700; }
.day-on { background:#7C3AED; color:white; }
.day-off { background:white; color:#D1D5DB; border:1.5px solid #F3F4F6; }
.milestone { display:flex; align-items:center; gap:12px; padding:13px 0; border-bottom:1px solid #F3F4F6; }
.m-icon { width:38px; height:38px; border-radius:11px; display:flex; align-items:center; justify-content:center; font-size:17px; flex-shrink:0; }
.m-label { font-size:14px; font-weight:600; color:#111; }
.m-date { font-size:12px; color:#9CA3AF; margin-top:2px; }
.ai-reasoning { margin:20px 22px 0; background:#F5F3FF; border-radius:16px; padding:16px; border-left:3px solid #7C3AED; }
.ai-label { font-size:11px; font-weight:700; color:#7C3AED; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px; }
.ai-text { font-size:13px; color:#4B5563; line-height:1.6; }
.cta { position:fixed; bottom:0; left:0; width:390px; background:white; padding:16px 22px 36px; border-top:1px solid #F3F4F6; }
.cta-btn { width:100%; background:#7C3AED; color:white; border:none; border-radius:14px; padding:16px; font-size:16px; font-weight:700; cursor:pointer; }`;

export const GOAL_BEGINNER_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${GOAL_BRANCH_STYLES}</style></head><body>
<div class="status"><span>9:41</span><div style="display:flex;align-items:center;gap:5px;font-size:11px;"><span>●●●</span><span>WiFi</span><span style="font-size:13px;">🔋</span></div></div>
<div class="header"><div class="back">← Assessment</div><div style="font-size:21px;font-weight:800;">Your Plan is Ready</div><div style="font-size:13px;color:#6B7280;margin-top:3px;">Tailored for Beginner · AI-generated</div></div>
<div class="plan-card" style="background:linear-gradient(135deg,#7C3AED,#A78BFA);">
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
<div class="cta"><button class="cta-btn">Start My Plan →</button></div>
</body></html>`;

export const GOAL_INTERMEDIATE_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${GOAL_BRANCH_STYLES}</style></head><body>
<div class="status"><span>9:41</span><div style="display:flex;align-items:center;gap:5px;font-size:11px;"><span>●●●</span><span>WiFi</span><span style="font-size:13px;">🔋</span></div></div>
<div class="header"><div class="back">← Assessment</div><div style="font-size:21px;font-weight:800;">Your Plan is Ready</div><div style="font-size:13px;color:#6B7280;margin-top:3px;">Tailored for Intermediate · AI-generated</div></div>
<div class="plan-card" style="background:linear-gradient(135deg,#0369A1,#38BDF8);">
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
    <div class="day day-on" style="background:#0369A1;">Mon<br>Upper<br>Push</div>
    <div class="day day-off">Tue<br>Rest</div>
    <div class="day day-on" style="background:#0369A1;">Wed<br>Lower<br>Squat</div>
    <div class="day day-off">Thu<br>Rest</div>
    <div class="day day-on" style="background:#0369A1;">Fri<br>Upper<br>Pull</div>
    <div class="day day-on" style="background:#0369A1;">Sat<br>Lower<br>Hinge</div>
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
<div class="cta"><button class="cta-btn">Start My Plan →</button></div>
</body></html>`;

export const GOAL_ADVANCED_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${GOAL_BRANCH_STYLES}</style></head><body>
<div class="status"><span>9:41</span><div style="display:flex;align-items:center;gap:5px;font-size:11px;"><span>●●●</span><span>WiFi</span><span style="font-size:13px;">🔋</span></div></div>
<div class="header"><div class="back">← Assessment</div><div style="font-size:21px;font-weight:800;">Your Plan is Ready</div><div style="font-size:13px;color:#6B7280;margin-top:3px;">Tailored for Advanced · AI-generated</div></div>
<div class="plan-card" style="background:linear-gradient(135deg,#B45309,#F59E0B);">
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
    <div class="day day-on" style="background:#B45309;">Mon<br>Push<br>Heavy</div>
    <div class="day day-on" style="background:#B45309;">Tue<br>Pull<br>Heavy</div>
    <div class="day day-on" style="background:#B45309;">Wed<br>Legs<br>Squat</div>
    <div class="day day-off">Thu<br>Rest</div>
    <div class="day day-on" style="background:#B45309;">Fri<br>Push<br>Volume</div>
    <div class="day day-on" style="background:#B45309;">Sat<br>Pull+<br>Legs</div>
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
<div class="cta"><button class="cta-btn">Start My Plan →</button></div>
</body></html>`;

export const GOAL_ATHLETE_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${GOAL_BRANCH_STYLES}</style></head><body>
<div class="status"><span>9:41</span><div style="display:flex;align-items:center;gap:5px;font-size:11px;"><span>●●●</span><span>WiFi</span><span style="font-size:13px;">🔋</span></div></div>
<div class="header"><div class="back">← Assessment</div><div style="font-size:21px;font-weight:800;">Your Plan is Ready</div><div style="font-size:13px;color:#6B7280;margin-top:3px;">Tailored for Athlete · AI-generated</div></div>
<div class="plan-card" style="background:linear-gradient(135deg,#065F46,#10B981);">
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
    <div class="day day-on" style="background:#065F46;">Mon<br>Max<br>Strength</div>
    <div class="day day-on" style="background:#065F46;">Tue<br>Speed<br>Power</div>
    <div class="day day-on" style="background:#065F46;">Wed<br>Olympic<br>Lift</div>
    <div class="day day-on" style="background:#065F46;">Thu<br>Condi-<br>tioning</div>
    <div class="day day-on" style="background:#065F46;">Fri<br>Max<br>Effort</div>
    <div class="day day-on" style="background:#065F46;">Sat<br>Sport<br>Skill</div>
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
<div class="cta"><button class="cta-btn">Start My Plan →</button></div>
</body></html>`;
