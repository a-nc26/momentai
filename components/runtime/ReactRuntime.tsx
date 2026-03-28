'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { AppMap } from '@/lib/types';
import { useMomentaiStore } from '@/lib/store';

function buildSrcdoc(componentCode: string, state: Record<string, unknown>): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<script src="https://cdn.tailwindcss.com"><\/script>
<script src="https://unpkg.com/react@18/umd/react.production.min.js"><\/script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"><\/script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #fff; overflow-x: hidden; }
  .ui-btn { display: inline-flex; align-items: center; justify-content: center; border-radius: 0.5rem; font-weight: 500; transition: all 150ms; cursor: pointer; border: none; font-size: 0.875rem; line-height: 1.25rem; }
  .ui-btn-primary { background: #6366f1; color: #fff; padding: 0.625rem 1rem; }
  .ui-btn-primary:hover { background: #4f46e5; }
  .ui-btn-secondary { background: #f4f4f5; color: #18181b; padding: 0.625rem 1rem; border: 1px solid #e4e4e7; }
  .ui-btn-secondary:hover { background: #e4e4e7; }
  .ui-btn-ghost { background: transparent; color: #71717a; padding: 0.5rem 0.75rem; }
  .ui-btn-ghost:hover { background: #f4f4f5; color: #18181b; }
  .ui-btn-destructive { background: #ef4444; color: #fff; padding: 0.625rem 1rem; }
  .ui-btn-destructive:hover { background: #dc2626; }
  .ui-card { border-radius: 0.75rem; border: 1px solid #e4e4e7; background: #fff; overflow: hidden; }
  .ui-input { width: 100%; border-radius: 0.5rem; border: 1px solid #e4e4e7; padding: 0.5rem 0.75rem; font-size: 0.875rem; outline: none; transition: border-color 150ms; background: #fff; }
  .ui-input:focus { border-color: #6366f1; box-shadow: 0 0 0 2px rgba(99,102,241,0.1); }
  .ui-badge { display: inline-flex; align-items: center; border-radius: 9999px; padding: 0.125rem 0.625rem; font-size: 0.75rem; font-weight: 500; border: 1px solid #e4e4e7; background: #f4f4f5; color: #18181b; }
  .ui-separator { height: 1px; background: #e4e4e7; width: 100%; }
  .ui-avatar { display: inline-flex; align-items: center; justify-content: center; border-radius: 9999px; background: #f4f4f5; overflow: hidden; width: 2.5rem; height: 2.5rem; font-size: 0.875rem; font-weight: 500; color: #71717a; }
  .ui-label { font-size: 0.875rem; font-weight: 500; color: #18181b; }
  .ui-switch { position: relative; width: 2.75rem; height: 1.5rem; border-radius: 9999px; cursor: pointer; transition: background 150ms; }
  .ui-switch-on { background: #6366f1; }
  .ui-switch-off { background: #e4e4e7; }
  .ui-switch-thumb { position: absolute; top: 2px; width: 1.25rem; height: 1.25rem; border-radius: 9999px; background: #fff; transition: transform 150ms; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
  .ui-textarea { width: 100%; border-radius: 0.5rem; border: 1px solid #e4e4e7; padding: 0.5rem 0.75rem; font-size: 0.875rem; outline: none; resize: vertical; min-height: 80px; font-family: inherit; }
  .ui-textarea:focus { border-color: #6366f1; box-shadow: 0 0 0 2px rgba(99,102,241,0.1); }
  .ui-tabs-list { display: flex; gap: 0.25rem; background: #f4f4f5; border-radius: 0.5rem; padding: 0.25rem; }
  .ui-tab { padding: 0.375rem 0.75rem; border-radius: 0.375rem; font-size: 0.875rem; font-weight: 500; cursor: pointer; border: none; background: transparent; color: #71717a; transition: all 150ms; }
  .ui-tab-active { background: #fff; color: #18181b; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
  .ui-select { width: 100%; border-radius: 0.5rem; border: 1px solid #e4e4e7; padding: 0.5rem 0.75rem; font-size: 0.875rem; outline: none; background: #fff; cursor: pointer; appearance: none; }
  .ui-select:focus { border-color: #6366f1; }
</style>
</head>
<body>
<div id="root"></div>
<script>
// UI component library on window
(function() {
  const h = React.createElement;

  function Button({ children, variant, size, className, onClick, disabled, ...props }) {
    const base = 'ui-btn';
    const v = variant === 'secondary' ? 'ui-btn-secondary'
      : variant === 'ghost' ? 'ui-btn-ghost'
      : variant === 'destructive' ? 'ui-btn-destructive'
      : 'ui-btn-primary';
    const s = size === 'sm' ? 'text-xs px-3 py-1.5' : size === 'lg' ? 'text-base px-6 py-3' : '';
    return h('button', { className: [base, v, s, className].filter(Boolean).join(' '), onClick, disabled, ...props }, children);
  }

  function Card({ children, className, ...props }) {
    return h('div', { className: ['ui-card', className].filter(Boolean).join(' '), ...props }, children);
  }
  function CardHeader({ children, className }) { return h('div', { className: ['p-4 pb-2', className].filter(Boolean).join(' ') }, children); }
  function CardContent({ children, className }) { return h('div', { className: ['p-4 pt-0', className].filter(Boolean).join(' ') }, children); }
  function CardTitle({ children, className }) { return h('h3', { className: ['text-lg font-semibold', className].filter(Boolean).join(' ') }, children); }
  function CardDescription({ children, className }) { return h('p', { className: ['text-sm text-gray-500', className].filter(Boolean).join(' ') }, children); }
  function CardFooter({ children, className }) { return h('div', { className: ['p-4 pt-0 flex items-center', className].filter(Boolean).join(' ') }, children); }

  function Input({ className, type, ...props }) {
    return h('input', { type: type || 'text', className: ['ui-input', className].filter(Boolean).join(' '), ...props });
  }

  function Textarea({ className, ...props }) {
    return h('textarea', { className: ['ui-textarea', className].filter(Boolean).join(' '), ...props });
  }

  function Badge({ children, variant, className }) {
    const cls = variant === 'destructive' ? 'bg-red-50 text-red-700 border-red-200'
      : variant === 'success' ? 'bg-green-50 text-green-700 border-green-200'
      : variant === 'outline' ? 'bg-transparent'
      : '';
    return h('span', { className: ['ui-badge', cls, className].filter(Boolean).join(' ') }, children);
  }

  function Avatar({ children, className, src }) {
    if (src) return h('img', { src, className: ['ui-avatar', className].filter(Boolean).join(' ') });
    return h('div', { className: ['ui-avatar', className].filter(Boolean).join(' ') }, children);
  }
  function AvatarFallback({ children, className }) { return h('span', { className: className || '' }, children); }

  function Separator({ className }) { return h('div', { className: ['ui-separator', className].filter(Boolean).join(' ') }); }

  function Label({ children, className, htmlFor }) { return h('label', { className: ['ui-label', className].filter(Boolean).join(' '), htmlFor }, children); }

  function Switch({ checked, onCheckedChange, className }) {
    return h('div', {
      className: ['ui-switch', checked ? 'ui-switch-on' : 'ui-switch-off', className].filter(Boolean).join(' '),
      onClick: function() { onCheckedChange && onCheckedChange(!checked); }
    }, h('div', { className: 'ui-switch-thumb', style: { transform: checked ? 'translateX(1.25rem)' : 'translateX(0)' } }));
  }

  function Tabs({ children, value, onValueChange, className }) {
    return h('div', { className: className || '' },
      React.Children.map(children, function(child) {
        if (!child) return null;
        return React.cloneElement(child, { _activeTab: value, _onTabChange: onValueChange });
      })
    );
  }
  function TabsList({ children, className, _activeTab, _onTabChange }) {
    return h('div', { className: ['ui-tabs-list', className].filter(Boolean).join(' ') },
      React.Children.map(children, function(child) {
        if (!child) return null;
        return React.cloneElement(child, { _activeTab, _onTabChange });
      })
    );
  }
  function TabsTrigger({ children, value, className, _activeTab, _onTabChange }) {
    const active = _activeTab === value;
    return h('button', {
      className: ['ui-tab', active ? 'ui-tab-active' : '', className].filter(Boolean).join(' '),
      onClick: function() { _onTabChange && _onTabChange(value); }
    }, children);
  }
  function TabsContent({ children, value, className, _activeTab }) {
    if (_activeTab !== value) return null;
    return h('div', { className: className || '' }, children);
  }

  function Select({ children, value, onValueChange }) {
    return h('select', {
      className: 'ui-select',
      value: value || '',
      onChange: function(e) { onValueChange && onValueChange(e.target.value); }
    }, children);
  }
  function SelectTrigger({ children }) { return children; }
  function SelectValue({ placeholder }) { return h('option', { value: '', disabled: true }, placeholder); }
  function SelectContent({ children }) { return children; }
  function SelectItem({ children, value }) { return h('option', { value: value }, children); }

  function Sheet({ children }) { return h(React.Fragment, null, children); }
  function SheetContent({ children, className }) { return h('div', { className: ['fixed inset-y-0 right-0 w-80 bg-white shadow-xl z-50 p-6', className].filter(Boolean).join(' ') }, children); }
  function SheetHeader({ children, className }) { return h('div', { className: ['mb-4', className].filter(Boolean).join(' ') }, children); }
  function SheetTitle({ children, className }) { return h('h2', { className: ['text-lg font-semibold', className].filter(Boolean).join(' ') }, children); }

  function Dialog({ children, open }) { if (!open) return null; return h(React.Fragment, null, children); }
  function DialogContent({ children, className }) {
    return h('div', { className: 'fixed inset-0 z-50 flex items-center justify-center bg-black/50' },
      h('div', { className: ['bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl', className].filter(Boolean).join(' ') }, children)
    );
  }
  function DialogHeader({ children, className }) { return h('div', { className: ['mb-4', className].filter(Boolean).join(' ') }, children); }
  function DialogTitle({ children, className }) { return h('h2', { className: ['text-lg font-semibold', className].filter(Boolean).join(' ') }, children); }

  window.UI = {
    Button, Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter,
    Input, Textarea, Badge, Avatar, AvatarFallback, Separator, Label, Switch,
    Tabs, TabsList, TabsTrigger, TabsContent,
    Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
    Sheet, SheetContent, SheetHeader, SheetTitle,
    Dialog, DialogContent, DialogHeader, DialogTitle,
  };

  window.useState = React.useState;
  window.useEffect = React.useEffect;
  window.useCallback = React.useCallback;
  window.useMemo = React.useMemo;
  window.useRef = React.useRef;
})();
<\/script>
<script type="text/babel">
${componentCode}

(function() {
  const Comp = window.__SCREEN_COMPONENT__;
  if (!Comp) {
    document.getElementById('root').innerHTML = '<p style="padding:20px;color:#999;">Component not found</p>';
    return;
  }

  const initialState = ${JSON.stringify(state)};

  function RuntimeBridge() {
    const [appState, setAppState] = React.useState(initialState);

    React.useEffect(() => {
      function handler(e) {
        if (!e.data) return;
        if (e.data.type === 'updateState') {
          setAppState(function(prev) { return Object.assign({}, prev, e.data.state); });
        }
      }
      window.addEventListener('message', handler);
      return function() { window.removeEventListener('message', handler); };
    }, []);

    function onNavigate(momentId) {
      window.parent.postMessage({ type: 'navigate', momentId: momentId }, '*');
    }

    function onStateChange(key, value) {
      setAppState(function(prev) {
        var next = Object.assign({}, prev);
        next[key] = value;
        return next;
      });
      window.parent.postMessage({ type: 'stateChange', key: key, value: value }, '*');
    }

    return React.createElement(Comp, { state: appState, onNavigate: onNavigate, onStateChange: onStateChange });
  }

  ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(RuntimeBridge));
})();
<\/script>
</body>
</html>`;
}

export default function ReactRuntime({
  appMap,
  phoneWidth = 320,
}: {
  appMap: AppMap;
  phoneWidth?: number;
}) {
  const platform = appMap.appPlatform ?? 'mobile';
  const { activeMomentId, setActiveMomentId } = useMomentaiStore();

  const [currentMomentId, setCurrentMomentId] = useState<string>(
    () => activeMomentId ?? appMap.moments[0]?.id ?? ''
  );
  const [sharedState, setSharedState] = useState<Record<string, unknown>>(
    () => (appMap.initialState as Record<string, unknown>) ?? {}
  );

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const suppressSyncRef = useRef(false);

  const currentMoment = useMemo(
    () => appMap.moments.find((m) => m.id === currentMomentId),
    [appMap.moments, currentMomentId]
  );

  // Sync from Zustand activeMomentId → local currentMomentId
  useEffect(() => {
    if (activeMomentId && activeMomentId !== currentMomentId) {
      const exists = appMap.moments.some((m) => m.id === activeMomentId);
      if (exists) {
        suppressSyncRef.current = true;
        setCurrentMomentId(activeMomentId);
      }
    }
  }, [activeMomentId, appMap.moments]);

  // Sync from local currentMomentId → Zustand activeMomentId
  useEffect(() => {
    if (suppressSyncRef.current) {
      suppressSyncRef.current = false;
      return;
    }
    if (currentMomentId !== activeMomentId) {
      setActiveMomentId(currentMomentId);
    }
  }, [currentMomentId]);

  // Listen for postMessage from iframe
  useEffect(() => {
    function handler(e: MessageEvent) {
      if (!e.data) return;
      if (e.data.type === 'navigate' && e.data.momentId) {
        setCurrentMomentId(e.data.momentId);
      }
      if (e.data.type === 'stateChange' && e.data.key) {
        setSharedState((prev) => ({ ...prev, [e.data.key]: e.data.value }));
      }
    }
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const srcdoc = useMemo(() => {
    if (!currentMoment?.componentCode) return null;
    return buildSrcdoc(currentMoment.componentCode, sharedState);
  }, [currentMoment?.componentCode, sharedState]);

  const hasCode = appMap.moments.some((m) => m.componentCode);
  const isBuilding = currentMoment?.buildStatus === 'building';

  if (!hasCode) {
    return platform === 'web' ? (
      <WebEmptyState isBuilding={false} />
    ) : (
      <MobileEmptyState isBuilding={false} phoneWidth={phoneWidth} />
    );
  }

  if (platform === 'web') {
    return (
      <div className="flex-[3] min-w-0 border-l border-zinc-800 flex flex-col bg-zinc-950">
        <div className="h-9 bg-zinc-900 border-b border-zinc-800 flex items-center px-3 gap-2 shrink-0">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
          </div>
          <div className="flex-1 bg-zinc-800 rounded-md h-5 flex items-center px-2 mx-2">
            <span className="text-zinc-600 text-[10px] font-mono truncate">
              {appMap.appName.toLowerCase().replace(/\s+/g, '-')}.momentai.app
            </span>
          </div>
        </div>
        <div className="flex-1 relative">
          {isBuilding || !srcdoc ? (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-950">
              <div className="flex flex-col items-center gap-3">
                <span className="w-5 h-5 rounded-full border-2 border-zinc-700 border-t-indigo-400 animate-spin" />
                <p className="text-zinc-500 text-xs">
                  {isBuilding ? 'Building screen…' : 'No component code yet'}
                </p>
              </div>
            </div>
          ) : (
            <iframe
              ref={iframeRef}
              key={currentMomentId}
              srcDoc={srcdoc}
              className="w-full h-full border-0 bg-white"
              sandbox="allow-scripts"
              title="App Runtime"
            />
          )}
        </div>
      </div>
    );
  }

  // Mobile
  return (
    <div className="w-[420px] shrink-0 border-l border-zinc-800 flex items-center justify-center bg-zinc-950 py-6">
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div
            className="bg-zinc-900 rounded-[40px] border-[3px] border-zinc-700 shadow-2xl overflow-hidden"
            style={{ width: phoneWidth }}
          >
            <div className="h-8 bg-zinc-900 flex items-center justify-center">
              <div className="w-20 h-4 bg-zinc-800 rounded-b-xl" />
            </div>
            <div
              className="bg-white overflow-hidden relative"
              style={{ height: Math.round(phoneWidth * 1.875) }}
            >
              {isBuilding || !srcdoc ? (
                <div className="w-full h-full flex items-center justify-center bg-zinc-950">
                  <div className="flex flex-col items-center gap-3 px-6">
                    <span className="w-5 h-5 rounded-full border-2 border-zinc-700 border-t-indigo-400 animate-spin" />
                    <p className="text-zinc-500 text-xs text-center">
                      {isBuilding ? 'Building screen…' : 'No component code yet'}
                    </p>
                  </div>
                </div>
              ) : (
                <iframe
                  ref={iframeRef}
                  key={currentMomentId}
                  srcDoc={srcdoc}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts"
                  title="App Runtime"
                  style={{
                    transform: 'scale(0.82)',
                    transformOrigin: 'top left',
                    width: '122%',
                    height: '122%',
                  }}
                />
              )}
            </div>
            <div className="h-6 bg-zinc-900 flex items-center justify-center">
              <div className="w-24 h-1 bg-zinc-600 rounded-full" />
            </div>
          </div>
        </div>

        {/* Screen name label */}
        {currentMoment && (
          <p className="text-zinc-500 text-xs text-center truncate max-w-[280px]">
            {currentMoment.label}
          </p>
        )}
      </div>
    </div>
  );
}

function MobileEmptyState({ isBuilding, phoneWidth }: { isBuilding: boolean; phoneWidth: number }) {
  return (
    <div className="w-[420px] shrink-0 border-l border-zinc-800 flex items-center justify-center bg-zinc-950 py-6">
      <div
        className="bg-zinc-900 rounded-[40px] border-[3px] border-zinc-800 overflow-hidden"
        style={{ width: phoneWidth }}
      >
        <div className="h-8 bg-zinc-900 flex items-center justify-center">
          <div className="w-20 h-4 bg-zinc-800 rounded-b-xl" />
        </div>
        <div
          className="bg-zinc-950 flex flex-col items-center justify-center gap-4 px-8"
          style={{ height: Math.round(phoneWidth * 1.875) }}
        >
          {isBuilding ? (
            <>
              <span className="w-6 h-6 rounded-full border-2 border-zinc-700 border-t-indigo-400 animate-spin" />
              <p className="text-zinc-400 text-sm font-medium">Building your app…</p>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-2xl bg-zinc-900 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect x="1.5" y="1.5" width="6" height="6" rx="1" stroke="#52525b" strokeWidth="1.4"/>
                  <rect x="10.5" y="1.5" width="6" height="6" rx="1" stroke="#52525b" strokeWidth="1.4"/>
                  <rect x="1.5" y="10.5" width="6" height="6" rx="1" stroke="#52525b" strokeWidth="1.4"/>
                  <rect x="10.5" y="10.5" width="6" height="6" rx="1" stroke="#52525b" strokeWidth="1.4"/>
                </svg>
              </div>
              <p className="text-zinc-600 text-xs text-center">Click Build & Share to generate screens</p>
            </>
          )}
        </div>
        <div className="h-6 bg-zinc-900 flex items-center justify-center">
          <div className="w-24 h-1 bg-zinc-800 rounded-full" />
        </div>
      </div>
    </div>
  );
}

function WebEmptyState({ isBuilding }: { isBuilding: boolean }) {
  return (
    <div className="flex-[3] min-w-0 border-l border-zinc-800 flex flex-col bg-zinc-950">
      <div className="h-9 bg-zinc-900 border-b border-zinc-800 flex items-center px-3 gap-2 shrink-0">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        {isBuilding ? (
          <div className="flex flex-col items-center gap-3">
            <span className="w-6 h-6 rounded-full border-2 border-zinc-700 border-t-indigo-400 animate-spin" />
            <p className="text-zinc-400 text-sm font-medium">Building your app…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="1.5" y="1.5" width="6" height="6" rx="1" stroke="#52525b" strokeWidth="1.4"/>
                <rect x="10.5" y="1.5" width="6" height="6" rx="1" stroke="#52525b" strokeWidth="1.4"/>
                <rect x="1.5" y="10.5" width="6" height="6" rx="1" stroke="#52525b" strokeWidth="1.4"/>
                <rect x="10.5" y="10.5" width="6" height="6" rx="1" stroke="#52525b" strokeWidth="1.4"/>
              </svg>
            </div>
            <p className="text-zinc-600 text-xs">Click Build & Share to generate screens</p>
          </div>
        )}
      </div>
    </div>
  );
}
