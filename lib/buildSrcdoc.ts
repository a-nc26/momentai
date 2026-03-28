export function buildSrcdoc(componentCode: string, state: Record<string, unknown>): string {
  const escapedCode = componentCode
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$');

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
  .err-box { padding: 24px; font-family: monospace; font-size: 12px; color: #ef4444; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; margin: 16px; white-space: pre-wrap; word-break: break-all; }
</style>
</head>
<body>
<div id="root"></div>
<script>
(function() {
  var h = React.createElement;

  function Button(props) {
    var children = props.children, variant = props.variant, size = props.size, className = props.className, onClick = props.onClick, disabled = props.disabled;
    var base = 'ui-btn';
    var v = variant === 'secondary' ? 'ui-btn-secondary'
      : variant === 'ghost' ? 'ui-btn-ghost'
      : variant === 'destructive' ? 'ui-btn-destructive'
      : 'ui-btn-primary';
    var s = size === 'sm' ? 'text-xs px-3 py-1.5' : size === 'lg' ? 'text-base px-6 py-3' : '';
    return h('button', { className: [base, v, s, className].filter(Boolean).join(' '), onClick: onClick, disabled: disabled }, children);
  }

  function Card(props) { return h('div', { className: ['ui-card', props.className].filter(Boolean).join(' ') }, props.children); }
  function CardHeader(props) { return h('div', { className: ['p-4 pb-2', props.className].filter(Boolean).join(' ') }, props.children); }
  function CardContent(props) { return h('div', { className: ['p-4 pt-0', props.className].filter(Boolean).join(' ') }, props.children); }
  function CardTitle(props) { return h('h3', { className: ['text-lg font-semibold', props.className].filter(Boolean).join(' ') }, props.children); }
  function CardDescription(props) { return h('p', { className: ['text-sm text-gray-500', props.className].filter(Boolean).join(' ') }, props.children); }
  function CardFooter(props) { return h('div', { className: ['p-4 pt-0 flex items-center', props.className].filter(Boolean).join(' ') }, props.children); }

  function Input(props) {
    var rest = Object.assign({}, props);
    delete rest.className;
    return h('input', Object.assign({ type: props.type || 'text', className: ['ui-input', props.className].filter(Boolean).join(' ') }, rest));
  }

  function Textarea(props) {
    var rest = Object.assign({}, props);
    delete rest.className;
    return h('textarea', Object.assign({ className: ['ui-textarea', props.className].filter(Boolean).join(' ') }, rest));
  }

  function Badge(props) {
    var cls = props.variant === 'destructive' ? 'bg-red-50 text-red-700 border-red-200'
      : props.variant === 'success' ? 'bg-green-50 text-green-700 border-green-200'
      : props.variant === 'outline' ? 'bg-transparent'
      : '';
    return h('span', { className: ['ui-badge', cls, props.className].filter(Boolean).join(' ') }, props.children);
  }

  function Avatar(props) {
    if (props.src) return h('img', { src: props.src, className: ['ui-avatar', props.className].filter(Boolean).join(' ') });
    return h('div', { className: ['ui-avatar', props.className].filter(Boolean).join(' ') }, props.children);
  }
  function AvatarFallback(props) { return h('span', { className: props.className || '' }, props.children); }
  function Separator(props) { return h('div', { className: ['ui-separator', props.className].filter(Boolean).join(' ') }); }
  function Label(props) { return h('label', { className: ['ui-label', props.className].filter(Boolean).join(' '), htmlFor: props.htmlFor }, props.children); }

  function Switch(props) {
    return h('div', {
      className: ['ui-switch', props.checked ? 'ui-switch-on' : 'ui-switch-off', props.className].filter(Boolean).join(' '),
      onClick: function() { props.onCheckedChange && props.onCheckedChange(!props.checked); }
    }, h('div', { className: 'ui-switch-thumb', style: { transform: props.checked ? 'translateX(1.25rem)' : 'translateX(0)' } }));
  }

  function Tabs(props) {
    return h('div', { className: props.className || '' },
      React.Children.map(props.children, function(child) {
        if (!child) return null;
        return React.cloneElement(child, { _activeTab: props.value, _onTabChange: props.onValueChange });
      })
    );
  }
  function TabsList(props) {
    return h('div', { className: ['ui-tabs-list', props.className].filter(Boolean).join(' ') },
      React.Children.map(props.children, function(child) {
        if (!child) return null;
        return React.cloneElement(child, { _activeTab: props._activeTab, _onTabChange: props._onTabChange });
      })
    );
  }
  function TabsTrigger(props) {
    var active = props._activeTab === props.value;
    return h('button', {
      className: ['ui-tab', active ? 'ui-tab-active' : '', props.className].filter(Boolean).join(' '),
      onClick: function() { props._onTabChange && props._onTabChange(props.value); }
    }, props.children);
  }
  function TabsContent(props) {
    if (props._activeTab !== props.value) return null;
    return h('div', { className: props.className || '' }, props.children);
  }

  function Select(props) {
    return h('select', {
      className: 'ui-select',
      value: props.value || '',
      onChange: function(e) { props.onValueChange && props.onValueChange(e.target.value); }
    }, props.children);
  }
  function SelectTrigger(props) { return props.children; }
  function SelectValue(props) { return h('option', { value: '', disabled: true }, props.placeholder); }
  function SelectContent(props) { return props.children; }
  function SelectItem(props) { return h('option', { value: props.value }, props.children); }

  function Sheet(props) { return h(React.Fragment, null, props.children); }
  function SheetContent(props) { return h('div', { className: ['fixed inset-y-0 right-0 w-80 bg-white shadow-xl z-50 p-6', props.className].filter(Boolean).join(' ') }, props.children); }
  function SheetHeader(props) { return h('div', { className: ['mb-4', props.className].filter(Boolean).join(' ') }, props.children); }
  function SheetTitle(props) { return h('h2', { className: ['text-lg font-semibold', props.className].filter(Boolean).join(' ') }, props.children); }

  function Dialog(props) { if (!props.open) return null; return h(React.Fragment, null, props.children); }
  function DialogContent(props) {
    return h('div', { className: 'fixed inset-0 z-50 flex items-center justify-center bg-black/50' },
      h('div', { className: ['bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl', props.className].filter(Boolean).join(' ') }, props.children)
    );
  }
  function DialogHeader(props) { return h('div', { className: ['mb-4', props.className].filter(Boolean).join(' ') }, props.children); }
  function DialogTitle(props) { return h('h2', { className: ['text-lg font-semibold', props.className].filter(Boolean).join(' ') }, props.children); }

  window.UI = {
    Button: Button, Card: Card, CardHeader: CardHeader, CardContent: CardContent, CardTitle: CardTitle, CardDescription: CardDescription, CardFooter: CardFooter,
    Input: Input, Textarea: Textarea, Badge: Badge, Avatar: Avatar, AvatarFallback: AvatarFallback, Separator: Separator, Label: Label, Switch: Switch,
    Tabs: Tabs, TabsList: TabsList, TabsTrigger: TabsTrigger, TabsContent: TabsContent,
    Select: Select, SelectTrigger: SelectTrigger, SelectValue: SelectValue, SelectContent: SelectContent, SelectItem: SelectItem,
    Sheet: Sheet, SheetContent: SheetContent, SheetHeader: SheetHeader, SheetTitle: SheetTitle,
    Dialog: Dialog, DialogContent: DialogContent, DialogHeader: DialogHeader, DialogTitle: DialogTitle,
  };

  window.useState = React.useState;
  window.useEffect = React.useEffect;
  window.useCallback = React.useCallback;
  window.useMemo = React.useMemo;
  window.useRef = React.useRef;
})();
<\/script>
<script>
(function() {
  var root = document.getElementById('root');
  var initialState = ${JSON.stringify(state)};

  function showError(msg) {
    root.innerHTML = '<div class="err-box">' + msg + '<\\/div>';
  }

  if (typeof Babel === 'undefined') {
    showError('Babel failed to load. Check your internet connection and refresh.');
    return;
  }

  var componentCode = \`${escapedCode}\`;
  var transpiled;
  try {
    transpiled = Babel.transform(componentCode, { presets: ['react'] }).code;
  } catch (e) {
    showError('Babel transpile error:\\n' + (e.message || e));
    return;
  }

  try {
    new Function(transpiled)();
  } catch (e) {
    showError('Component init error:\\n' + (e.message || e));
    return;
  }

  var Comp = window.__SCREEN_COMPONENT__;
  if (!Comp) {
    showError('Component did not register. Make sure the code sets window.__SCREEN_COMPONENT__.');
    return;
  }

  function RuntimeBridge() {
    var _state = React.useState(initialState);
    var appState = _state[0];
    var setAppState = _state[1];

    React.useEffect(function() {
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

    try {
      return React.createElement(Comp, { state: appState, onNavigate: onNavigate, onStateChange: onStateChange });
    } catch(e) {
      return React.createElement('div', { className: 'err-box' }, 'Render error: ' + (e.message || e));
    }
  }

  try {
    ReactDOM.createRoot(root).render(React.createElement(RuntimeBridge));
  } catch (e) {
    showError('React render error:\\n' + (e.message || e));
  }
})();
<\/script>
</body>
</html>`;
}
