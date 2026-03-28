'use client';

import { useEffect, useState } from 'react';
import {
  AppMap,
  RuntimeActionSpec,
  RuntimeComponentSpec,
  RuntimeOption,
} from '@/lib/types';
import {
  applyActionToSession,
  createInitialRuntimeSession,
  getMomentById,
  isActionEnabled,
  resolveScreenSpec,
  resolveTemplatedValue,
  setSessionValue,
  toggleSessionArrayValue,
  type RuntimeSessionState,
} from '@/lib/runtime';
import { debugLog } from '@/lib/debug-log';
import { useSession } from '@/lib/useSession';

export default function MobileRuntime({
  appMap,
  startMomentId,
  phoneWidth = 250,
  maxHeight,
  onMomentChange,
  projectId,
}: {
  appMap: AppMap;
  startMomentId: string;
  phoneWidth?: number;
  maxHeight?: number;
  onMomentChange?: (momentId: string | null) => void;
  projectId?: string | null;
}) {
  const platform = appMap.appPlatform ?? 'mobile';
  const [session, setSession] = useState<RuntimeSessionState>(() =>
    createInitialRuntimeSession(appMap, startMomentId)
  );
  const [isSynced, setIsSynced] = useState(!projectId);
  const [aiRunning, setAiRunning] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const { saveState } = useSession({
    projectId: projectId ?? null,
    onStateLoaded: (savedState) => {
      setSession((current) => ({ ...current, values: { ...current.values, ...savedState } } as RuntimeSessionState));
      setIsSynced(true);
    },
  });

  // Mark synced immediately if no projectId (no DB needed)
  useEffect(() => {
    if (!projectId) setIsSynced(true);
  }, [projectId]);

  useEffect(() => {
    const initial = createInitialRuntimeSession(appMap, startMomentId);
    debugLog('Runtime', 'Session initialized', {
      startMomentId,
      values: initial.values,
      stateSchema: appMap.stateSchema,
    });
    setSession(initial);
  }, [appMap, startMomentId]);

  // Auto-run AI moments when navigated to
  useEffect(() => {
    if (!currentMoment || currentMoment.type !== 'ai' || !currentMoment.promptTemplate) return;
    const responseKey = currentMoment.responseKey ?? `${currentMoment.id}_response`;
    if (session.values[responseKey]) return; // already have a response

    setAiRunning(true);
    setAiError(null);

    fetch('/api/run-moment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ promptTemplate: currentMoment.promptTemplate, values: session.values }),
    })
      .then((r) => r.json())
      .then(({ response }) => {
        setSession((current) => {
          const next = { ...current, values: { ...current.values, [responseKey]: response } } as RuntimeSessionState;
          saveState(next.values as Record<string, unknown>);
          return next;
        });
      })
      .catch(() => setAiError('AI step failed — check your connection'))
      .finally(() => setAiRunning(false));
  }, [session.currentMomentId]);

  useEffect(() => {
    onMomentChange?.(session.currentMomentId);
    const moment = getMomentById(appMap, session.currentMomentId);
    debugLog('Runtime', `Screen: ${moment?.label ?? session.currentMomentId}`, {
      momentId: session.currentMomentId,
      type: moment?.type,
      values: session.values,
      history: session.history,
    });
  }, [session.currentMomentId]);

  const currentMoment = getMomentById(appMap, session.currentMomentId);
  const screenSpec = currentMoment ? resolveScreenSpec(currentMoment, appMap) : null;
  const phoneMetrics = getPhoneMetrics(phoneWidth, maxHeight);
  const webMetrics = getWebMetrics(phoneWidth);
  const metrics = platform === 'web' ? webMetrics : phoneMetrics;

  const screenContent = (
    <div
      className="absolute inset-0 origin-top-left"
      style={{
        width: platform === 'web' ? BASE_WEB_WIDTH : BASE_SCREEN_WIDTH,
        height: platform === 'web' ? BASE_WEB_HEIGHT : BASE_SCREEN_HEIGHT,
        transform: `scale(${metrics.scale})`,
        transformOrigin: 'top left',
      }}
    >
      {platform === 'web' ? (
        // Web layout: nav bar + centered content + inline actions
        <div className="h-full flex flex-col bg-[#f8f9fa]">
          {/* App top nav */}
          <div className="h-14 bg-white border-b border-zinc-200 flex items-center px-8 gap-4 shrink-0">
            <span className="text-[15px] font-semibold text-zinc-900">{appMap.appName}</span>
            <div className="flex-1" />
            {screenSpec?.eyebrow && (
              <span className="text-[12px] text-indigo-600 font-medium uppercase tracking-wider">
                {resolveTemplatedValue(screenSpec.eyebrow, session.values)}
              </span>
            )}
          </div>
          {/* Main content */}
          <div className="flex-1 overflow-y-auto px-8 py-8">
            <div className="max-w-2xl mx-auto">
              {screenSpec?.progress && (
                <div className="mb-6">
                  <div className="h-1.5 rounded-full bg-zinc-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-500"
                      style={{ width: `${(screenSpec.progress.current / Math.max(screenSpec.progress.total, 1)) * 100}%` }}
                    />
                  </div>
                  <p className="text-[12px] text-zinc-500 mt-1.5">Step {screenSpec.progress.current} of {screenSpec.progress.total}</p>
                </div>
              )}
              {screenSpec?.title && (
                <h1 className="text-[32px] leading-tight font-semibold tracking-tight text-zinc-950 mb-2">
                  {resolveTemplatedValue(screenSpec.title, session.values)}
                </h1>
              )}
              {screenSpec?.subtitle && (
                <p className="text-[16px] leading-relaxed text-zinc-500 mb-6">
                  {resolveTemplatedValue(screenSpec.subtitle, session.values)}
                </p>
              )}
              {screenSpec && (
                <div className="space-y-4">
                  {screenSpec.components.map((component) => (
                    <RuntimeComponentRenderer
                      key={component.id}
                      component={component}
                      session={session}
                      setSession={setSession}
                    />
                  ))}
                </div>
              )}
              {screenSpec && screenSpec.actions.length > 0 && (
                <div className="flex items-center gap-3 mt-8">
                  {screenSpec.actions.map((action) => (
                    <button
                      key={action.id}
                      type="button"
                      onClick={() => {
                        if (!isActionEnabled(action, session)) return;
                        debugLog('Runtime', `Action: ${action.label}`, { kind: action.kind, target: action.target, values: session.values });
                        setSession((current) => {
                          const next = applyActionToSession(current, action);
                          saveState(next.values as Record<string, unknown>);
                          return next;
                        });
                      }}
                      disabled={!isActionEnabled(action, session)}
                      className={actionButtonClassWeb(action)}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Mobile layout: status bar + scrollable content + fixed action bar
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between px-5 pt-4 pb-3 text-[11px] font-semibold text-zinc-900">
            <span>9:41</span>
            <div className="flex items-center gap-1 text-zinc-500">
              <span className="w-4 h-2 rounded-sm border border-zinc-500" />
              <span className="w-1 h-1 rounded-full bg-zinc-500" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-4">
            {screenSpec?.eyebrow && (
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-500 mb-2">
                {resolveTemplatedValue(screenSpec.eyebrow, session.values)}
              </p>
            )}
            {screenSpec?.progress && (
              <div className="mb-3">
                <div className="h-1.5 rounded-full bg-zinc-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500"
                    style={{ width: `${(screenSpec.progress.current / Math.max(screenSpec.progress.total, 1)) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">Step {screenSpec.progress.current} of {screenSpec.progress.total}</p>
              </div>
            )}
            {screenSpec?.title && (
              <h1 className="text-[28px] leading-[1.05] font-semibold tracking-tight text-zinc-950 mb-2">
                {resolveTemplatedValue(screenSpec.title, session.values)}
              </h1>
            )}
            {screenSpec?.subtitle && (
              <p className="text-[14px] leading-relaxed text-zinc-500 mb-4">
                {resolveTemplatedValue(screenSpec.subtitle, session.values)}
              </p>
            )}
            {screenSpec && (
              <div className="space-y-3">
                {screenSpec.components.map((component) => (
                  <RuntimeComponentRenderer
                    key={component.id}
                    component={component}
                    session={session}
                    setSession={setSession}
                  />
                ))}
              </div>
            )}
          </div>

          {screenSpec && (
            <div className="px-5 pb-5 pt-3 border-t border-zinc-200/70 bg-white/80 backdrop-blur-sm">
              <div className="space-y-2">
                {screenSpec.actions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => {
                      if (!isActionEnabled(action, session)) {
                        debugLog('Runtime', `Action blocked (requiredKeys not filled): ${action.label}`, { requiredKeys: action.requiredKeys, values: session.values }, 'warn');
                        return;
                      }
                      debugLog('Runtime', `Action: ${action.label}`, { kind: action.kind, target: action.target, effects: action.effects, values: session.values });
                      setSession((current) => {
                        const next = applyActionToSession(current, action);
                        saveState(next.values as Record<string, unknown>);
                        return next;
                      });
                    }}
                    disabled={!isActionEnabled(action, session)}
                    className={actionButtonClass(action)}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (!currentMoment || !screenSpec) {
    if (platform === 'web') {
      return (
        <div className="relative mx-auto overflow-hidden" style={{ width: webMetrics.shellWidth, borderRadius: 8, boxShadow: '0 0 0 1px #374151, 0 16px 40px rgba(0,0,0,0.4)' }}>
          <WebChrome appName={appMap.appName} scale={1} />
          <div className="bg-zinc-950 flex items-center justify-center text-zinc-500 text-xs" style={{ height: webMetrics.screenHeight }}>
            No runnable screen
          </div>
        </div>
      );
    }
    return (
      <div className="relative mx-auto" style={{ width: phoneMetrics.shellWidth, height: phoneMetrics.shellHeight }}>
        <div className="bg-zinc-900 p-[10px] shadow-[0_24px_60px_rgba(0,0,0,0.45)]"
          style={{ width: phoneMetrics.shellWidth, height: phoneMetrics.shellHeight, borderRadius: Math.round(36 * phoneMetrics.scale) }}>
          <div className="flex items-center justify-center bg-zinc-950 text-zinc-500"
            style={{ width: phoneMetrics.screenWidth, height: phoneMetrics.screenHeight, borderRadius: Math.round(28 * phoneMetrics.scale), fontSize: Math.max(11 * phoneMetrics.scale, 10) }}>
            No runnable screen
          </div>
        </div>
      </div>
    );
  }

  if (platform === 'web') {
    return (
      <div className="relative mx-auto overflow-hidden" style={{ width: webMetrics.shellWidth, borderRadius: 8, boxShadow: '0 0 0 1px #374151, 0 16px 40px rgba(0,0,0,0.4)', background: '#1a1d23' }}>
        {!isSynced && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <div className="w-5 h-5 rounded-full border-2 border-zinc-300 border-t-indigo-500 animate-spin" />
              <p className="text-zinc-500 text-[10px]">Loading your data…</p>
            </div>
          </div>
        )}
        <WebChrome appName={appMap.appName} scale={1} />
        <div className="relative overflow-hidden bg-[#f8f9fa]" style={{ width: webMetrics.screenWidth, height: webMetrics.screenHeight }}>
          {aiRunning && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-white/90 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-full border-2 border-violet-200 border-t-violet-500 animate-spin" />
              <p className="text-violet-600 text-sm font-medium">Claude is thinking…</p>
            </div>
          )}
          {aiError && !aiRunning && (
            <div className="absolute bottom-8 left-6 right-6 z-30 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-red-600 text-xs">{aiError}</p>
              <button onClick={() => setAiError(null)} className="text-red-400 text-xs underline mt-0.5">Dismiss</button>
            </div>
          )}
          {screenContent}
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto" style={{ width: phoneMetrics.shellWidth, height: phoneMetrics.shellHeight }}>
      {/* Syncing overlay — shown briefly on first load when DB state is being fetched */}
      {!isSynced && (
        <div className="absolute inset-0 z-50 flex items-center justify-center rounded-[34px] bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <div className="w-5 h-5 rounded-full border-2 border-zinc-300 border-t-indigo-500 animate-spin" />
            <p className="text-zinc-500 text-[10px]">Loading your data…</p>
          </div>
        </div>
      )}
      <div
        className="rounded-[34px] bg-zinc-900 p-[10px] shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
        style={{
          width: phoneMetrics.shellWidth,
          height: phoneMetrics.shellHeight,
          borderRadius: Math.round(36 * phoneMetrics.scale),
        }}
      >
        <div
          className="relative overflow-hidden bg-[#f6f7fb]"
          style={{
            width: phoneMetrics.screenWidth,
            height: phoneMetrics.screenHeight,
            borderRadius: Math.round(28 * phoneMetrics.scale),
          }}
        >
          <div
            className="absolute z-20 rounded-full bg-black"
            style={{
              width: Math.round(80 * phoneMetrics.scale),
              height: Math.round(24 * phoneMetrics.scale),
              top: Math.round(10 * phoneMetrics.scale),
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          />

          {/* AI running overlay */}
          {aiRunning && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-white/90 backdrop-blur-sm" style={{ borderRadius: Math.round(28 * phoneMetrics.scale) }}>
              <div className="w-8 h-8 rounded-full border-2 border-violet-200 border-t-violet-500 animate-spin" />
              <p className="text-violet-600 text-xs font-medium">Claude is thinking…</p>
            </div>
          )}

          {/* AI error */}
          {aiError && !aiRunning && (
            <div className="absolute bottom-20 left-4 right-4 z-30 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              <p className="text-red-600 text-[10px]">{aiError}</p>
              <button onClick={() => setAiError(null)} className="text-red-400 text-[10px] underline mt-0.5">Dismiss</button>
            </div>
          )}

          {screenContent}
        </div>
      </div>
    </div>
  );
}

// Safely convert any resolved template value to a renderable string
function toDisplay(val: unknown): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}

const BASE_SCREEN_WIDTH = 390;
const BASE_SCREEN_HEIGHT = 844;
const SHELL_PADDING = 10;

const BASE_WEB_WIDTH = 1280;
const BASE_WEB_HEIGHT = 800;
const WEB_CHROME_HEIGHT = 36;

function getWebMetrics(targetWidth: number) {
  const safeWidth = Math.max(200, targetWidth);
  const scale = safeWidth / BASE_WEB_WIDTH;
  const screenWidth = safeWidth;
  const screenHeight = Math.round(BASE_WEB_HEIGHT * scale);
  return { scale, screenWidth, screenHeight, shellWidth: safeWidth, shellHeight: screenHeight + WEB_CHROME_HEIGHT };
}

function WebChrome({ appName, scale: _scale }: { appName: string; scale: number }) {
  return (
    <div style={{ height: WEB_CHROME_HEIGHT, background: '#1e2128', borderBottom: '1px solid #2d3140', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8 }}>
      <div style={{ display: 'flex', gap: 5 }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', display: 'block' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b', display: 'block' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981', display: 'block' }} />
      </div>
      <div style={{ flex: 1, background: '#2d3140', borderRadius: 5, height: 20, display: 'flex', alignItems: 'center', paddingLeft: 10, gap: 6, overflow: 'hidden' }}>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ opacity: 0.4, flexShrink: 0 }}>
          <circle cx="5" cy="5" r="4" stroke="#9ca3af" strokeWidth="1.2"/>
          <path d="M3 5h4M5 3v4" stroke="#9ca3af" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
        <span style={{ fontSize: 10, color: '#6b7280', fontFamily: 'system-ui', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{appName.toLowerCase().replace(/\s+/g, '-')}.app</span>
      </div>
    </div>
  );
}

function getPhoneMetrics(targetScreenWidth: number, maxHeight?: number) {
  const safeTargetWidth = Math.max(120, targetScreenWidth);
  const widthScale = safeTargetWidth / BASE_SCREEN_WIDTH;
  const heightScale =
    maxHeight && maxHeight > SHELL_PADDING * 2
      ? (maxHeight - SHELL_PADDING * 2) / BASE_SCREEN_HEIGHT
      : Number.POSITIVE_INFINITY;
  const scale = Math.min(widthScale, heightScale, 1);
  const screenWidth = Math.round(BASE_SCREEN_WIDTH * scale);
  const screenHeight = Math.round(BASE_SCREEN_HEIGHT * scale);
  const shellWidth = screenWidth + SHELL_PADDING * 2;
  const shellHeight = screenHeight + SHELL_PADDING * 2;

  return {
    scale,
    screenWidth,
    screenHeight,
    shellWidth,
    shellHeight,
  };
}

function RuntimeComponentRenderer({
  component,
  session,
  setSession,
}: {
  component: RuntimeComponentSpec;
  session: RuntimeSessionState;
  setSession: React.Dispatch<React.SetStateAction<RuntimeSessionState>>;
}) {
  if (component.type === 'hero') {
    return (
      <div className={component.align === 'center' ? 'text-center' : ''}>
        {component.badge && (
          <span className="inline-flex items-center rounded-full bg-indigo-50 text-indigo-600 px-2.5 py-1 text-[10px] font-semibold mb-2">
            {resolveTemplatedValue(component.badge, session.values)}
          </span>
        )}
        <h2 className="text-[22px] font-semibold tracking-tight text-zinc-950">
          {resolveTemplatedValue(component.title, session.values)}
        </h2>
        {component.body && (
          <p className="text-[14px] leading-relaxed text-zinc-500 mt-1">
            {resolveTemplatedValue(component.body, session.values)}
          </p>
        )}
      </div>
    );
  }

  if (component.type === 'input') {
    const value = String(session.values[component.key] ?? '');
    return (
      <label className="block">
        <span className="block text-[13px] font-semibold text-zinc-700 mb-1.5">
          {resolveTemplatedValue(component.label, session.values)}
        </span>
        <input
          type={component.inputType ?? 'text'}
          value={value}
          placeholder={component.placeholder}
          onChange={(event) => {
            const nextValue =
              component.inputType === 'number' ? Number(event.target.value) : event.target.value;
            setSession((current) => setSessionValue(current, component.key, nextValue));
          }}
          className="w-full rounded-[14px] border border-zinc-200 bg-white px-4 py-3 text-[15px] text-zinc-950 shadow-[0_1px_2px_rgba(0,0,0,0.03)] outline-none focus:border-indigo-400"
        />
        {component.helperText && (
          <span className="block text-[11px] text-zinc-500 mt-1">
            {resolveTemplatedValue(component.helperText, session.values)}
          </span>
        )}
      </label>
    );
  }

  if (component.type === 'choice-cards') {
    const options = Array.isArray(component.options) ? component.options : [];
    const selected = Array.isArray(session.values[component.key])
      ? (session.values[component.key] as string[])
      : [String(session.values[component.key] ?? '')];

    return (
      <div>
        {component.label && (
          <p className="text-[13px] font-semibold text-zinc-700 mb-2">
            {resolveTemplatedValue(component.label, session.values)}
          </p>
        )}
        <div className="grid grid-cols-2 gap-3">
          {options.map((option) => (
            <ChoiceCard
              key={option.value}
              option={option}
              selected={selected.includes(option.value)}
              onClick={() => {
                if (component.selection === 'multiple') {
                  setSession((current) => toggleSessionArrayValue(current, component.key, option.value));
                  return;
                }
                setSession((current) => setSessionValue(current, component.key, option.value));
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (component.type === 'chip-group') {
    const options = Array.isArray(component.options) ? component.options : [];
    const selected = Array.isArray(session.values[component.key])
      ? (session.values[component.key] as string[])
      : [String(session.values[component.key] ?? '')];

    return (
      <div>
        {component.label && (
          <p className="text-[13px] font-semibold text-zinc-700 mb-2">
            {resolveTemplatedValue(component.label, session.values)}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {options.map((option) => {
            const isSelected = selected.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  if (component.selection === 'multiple') {
                    setSession((current) => toggleSessionArrayValue(current, component.key, option.value));
                    return;
                  }
                  setSession((current) => setSessionValue(current, component.key, option.value));
                }}
                className={`rounded-full border px-3 py-2 text-[12px] font-semibold transition-colors ${
                  isSelected
                    ? 'border-indigo-400 bg-indigo-50 text-indigo-600'
                    : 'border-zinc-200 bg-white text-zinc-600'
                }`}
              >
                {[option.icon, option.label].filter(Boolean).join(' ')}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (component.type === 'notice') {
    const toneClass =
      component.tone === 'success'
        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
        : component.tone === 'warning'
          ? 'bg-amber-50 border-amber-200 text-amber-700'
          : 'bg-sky-50 border-sky-200 text-sky-700';

    return (
      <div className={`rounded-[18px] border px-4 py-3 ${toneClass}`}>
        <p className="text-[13px] font-semibold">
          {resolveTemplatedValue(component.title, session.values)}
        </p>
        {component.body && (
          <p className="text-[12px] leading-relaxed mt-1 opacity-90">
            {resolveTemplatedValue(component.body, session.values)}
          </p>
        )}
      </div>
    );
  }

  if (component.type === 'summary-card') {
    const items = Array.isArray(component.items)
      ? resolveTemplatedValue(component.items, session.values)
      : [];
    return (
      <div className="rounded-[20px] border border-zinc-200 bg-white px-4 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h3 className="text-[17px] font-semibold text-zinc-950">
          {resolveTemplatedValue(component.title, session.values)}
        </h3>
        {component.body && (
          <p className="text-[13px] leading-relaxed text-zinc-500 mt-1">
            {resolveTemplatedValue(component.body, session.values)}
          </p>
        )}
        {Array.isArray(items) && items.length > 0 && (
          <div className="mt-3 space-y-2">
            {items.map((item, i) => (
              <div key={i} className="rounded-[14px] bg-zinc-50 px-3 py-2 text-[12px] text-zinc-700">
                {toDisplay(item)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (component.type === 'stats-grid') {
    const items = Array.isArray(component.items)
      ? resolveTemplatedValue(component.items, session.values)
      : [];
    return (
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div key={`${item.label}-${item.value}`} className="rounded-[18px] border border-zinc-200 bg-white px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-400 mb-2">
              {item.label}
            </p>
            <p className="text-[19px] font-semibold text-zinc-950">{toDisplay(item.value)}</p>
          </div>
        ))}
      </div>
    );
  }

  if (component.type === 'list') {
    const items = Array.isArray(component.items)
      ? resolveTemplatedValue(component.items, session.values)
      : [];
    return (
      <div className="rounded-[20px] border border-zinc-200 bg-white px-4 py-4">
        {component.title && (
          <h3 className="text-[16px] font-semibold text-zinc-950 mb-3">
            {resolveTemplatedValue(component.title, session.values)}
          </h3>
        )}
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="rounded-[14px] bg-zinc-50 px-3 py-2 text-[12px] text-zinc-700">
              {toDisplay(item)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const spacerHeight = component.size === 'lg' ? 24 : component.size === 'sm' ? 8 : 16;
  return <div style={{ height: spacerHeight }} />;
}

function ChoiceCard({
  option,
  selected,
  onClick,
}: {
  option: RuntimeOption;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[22px] border px-4 py-5 text-left min-h-[132px] transition-all ${
        selected
          ? 'border-indigo-400 bg-indigo-50 shadow-[0_12px_24px_rgba(99,102,241,0.14)]'
          : 'border-zinc-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]'
      }`}
    >
      {option.icon && <p className="text-[28px] mb-3">{option.icon}</p>}
      <p className={`text-[17px] font-semibold ${selected ? 'text-indigo-600' : 'text-zinc-900'}`}>
        {option.label}
      </p>
      {option.description && (
        <p className="text-[12px] leading-relaxed text-zinc-500 mt-1">{option.description}</p>
      )}
    </button>
  );
}

function actionButtonClassWeb(action: RuntimeActionSpec) {
  if (action.style === 'ghost') {
    return 'px-4 py-2 rounded-lg text-[14px] font-medium text-zinc-500 hover:text-zinc-700 bg-transparent transition-colors';
  }
  if (action.style === 'secondary') {
    return 'px-4 py-2 rounded-lg border border-zinc-300 bg-white text-[14px] font-medium text-zinc-700 hover:border-zinc-400 transition-colors disabled:opacity-50';
  }
  return 'px-6 py-2.5 rounded-lg bg-indigo-600 text-[14px] font-semibold text-white hover:bg-indigo-500 transition-colors shadow-sm disabled:opacity-50';
}

function actionButtonClass(action: RuntimeActionSpec) {
  if (action.style === 'ghost') {
    return 'w-full rounded-[16px] px-4 py-3 text-[14px] font-semibold text-zinc-600 bg-transparent';
  }

  if (action.style === 'secondary') {
    return 'w-full rounded-[16px] border border-zinc-200 bg-white px-4 py-3 text-[14px] font-semibold text-zinc-700 disabled:opacity-50';
  }

  return 'w-full rounded-[16px] bg-gradient-to-r from-indigo-600 to-fuchsia-500 px-4 py-3 text-[15px] font-semibold text-white shadow-[0_14px_32px_rgba(99,102,241,0.28)] disabled:opacity-50';
}
