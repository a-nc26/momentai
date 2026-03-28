export function buildSrcdoc(componentCode: string, state: Record<string, unknown>): string {
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
