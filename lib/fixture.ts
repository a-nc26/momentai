import { AppMap } from './types';

// Pre-built fixture for rapid testing — loads instantly with no API calls.
// Covers: canvas zoom/click, runtime iframe, edit panel, AI node panel.
export const FIXTURE_MAP: AppMap = {
  appName: 'ParkPals',
  appDescription: 'Dog park check-in app where owners check in, see who\'s at the park, and chat',
  appPlatform: 'mobile',
  initialState: { checkedIn: false, userName: 'Alex', dogName: 'Biscuit' },
  journeys: [
    { id: 'j1', name: 'Check-In', description: 'User checks in to the dog park' },
    { id: 'j2', name: 'Park View', description: 'See who is currently at the park' },
    { id: 'j3', name: 'Chat', description: 'Chat with other dog owners' },
  ],
  moments: [
    {
      id: 'm1',
      journeyId: 'j1',
      label: 'Welcome',
      description: 'Landing screen welcoming the user and showing check-in button',
      type: 'ui',
      preview: 'Check in to the park',
      position: { x: 80, y: 80 },
      buildStatus: 'done',
      componentCode: `
window.__SCREEN_COMPONENT__ = function WelcomeScreen({ state, onNavigate, onStateChange }) {
  const { Button, Card, CardContent, Badge } = window.UI;
  const [checking, setChecking] = React.useState(false);

  function handleCheckIn() {
    setChecking(true);
    setTimeout(() => {
      onStateChange('checkedIn', true);
      onNavigate('m2');
    }, 800);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex flex-col">
      <div className="px-6 pt-12 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🐾</span>
          <span className="text-emerald-600 font-bold text-lg">ParkPals</span>
        </div>
        <p className="text-zinc-400 text-sm">Riverside Dog Park</p>
      </div>

      <div className="flex-1 px-6 flex flex-col justify-center gap-6">
        <div className="text-center">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-5xl">
            🌳
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">Good morning, {state.userName}!</h1>
          <p className="text-zinc-500 text-sm mt-1">{state.dogName} is excited for the park</p>
        </div>

        <Card className="border-emerald-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-zinc-700">Currently at park</span>
              <Badge variant="success" className="bg-emerald-100 text-emerald-700 border-emerald-200">Open</Badge>
            </div>
            <div className="flex gap-2">
              {['🐕', '🦮', '🐩', '🐶'].map((dog, i) => (
                <div key={i} className="w-9 h-9 bg-zinc-100 rounded-full flex items-center justify-center text-lg border-2 border-white shadow-sm">
                  {dog}
                </div>
              ))}
              <div className="w-9 h-9 bg-zinc-100 rounded-full flex items-center justify-center text-xs text-zinc-500 font-medium border-2 border-white shadow-sm">
                +8
              </div>
            </div>
          </CardContent>
        </Card>

        <button
          onClick={handleCheckIn}
          disabled={checking}
          className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-2xl text-base shadow-lg shadow-emerald-200 transition-all active:scale-95 disabled:opacity-70"
        >
          {checking ? '⏳ Checking in...' : '🐾 Check In'}
        </button>

        <button onClick={() => onNavigate('m2')} className="text-center text-sm text-emerald-600 font-medium">
          Browse park →
        </button>
      </div>
    </div>
  );
};`,
    },
    {
      id: 'm2',
      journeyId: 'j2',
      label: 'Who\'s at the Park',
      description: 'Live view of all dogs currently checked in at the park',
      type: 'ui',
      preview: 'See who is at the park right now',
      position: { x: 380, y: 80 },
      buildStatus: 'done',
      componentCode: `
window.__SCREEN_COMPONENT__ = function ParkViewScreen({ state, onNavigate, onStateChange }) {
  const { Badge, Card, CardContent } = window.UI;
  const [filter, setFilter] = React.useState('all');

  const dogs = [
    { name: 'Max', breed: 'Golden Retriever', owner: 'Sarah K.', emoji: '🦮', size: 'large', mood: 'Playful' },
    { name: 'Luna', breed: 'French Bulldog', owner: 'Mike R.', emoji: '🐶', size: 'small', mood: 'Calm' },
    { name: 'Biscuit', breed: 'Labrador', owner: 'Alex (You)', emoji: '🐕', size: 'large', mood: 'Excited', isYou: true },
    { name: 'Coco', breed: 'Poodle', owner: 'Jamie L.', emoji: '🐩', size: 'small', mood: 'Friendly' },
    { name: 'Bear', breed: 'Husky', owner: 'Tom W.', emoji: '🐺', size: 'large', mood: 'Energetic' },
  ];

  const filtered = filter === 'all' ? dogs : dogs.filter(d => d.size === filter);

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <div className="bg-white px-5 pt-10 pb-4 border-b border-zinc-100">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => onNavigate('m1')} className="text-zinc-400 text-sm">← Back</button>
          <h1 className="text-base font-bold text-zinc-900">At the Park</h1>
          <button onClick={() => onNavigate('m3')} className="text-emerald-600 text-sm font-medium">Chat</button>
        </div>
        <div className="flex gap-2">
          {['all', 'small', 'large'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={\`px-3 py-1 rounded-full text-xs font-medium transition-all \${
                filter === f ? 'bg-emerald-500 text-white' : 'bg-zinc-100 text-zinc-600'
              }\`}
            >
              {f === 'all' ? 'All dogs' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 py-4 space-y-3 overflow-y-auto">
        {filtered.map((dog, i) => (
          <Card key={i} className={\`\${dog.isYou ? 'border-emerald-200 bg-emerald-50' : 'border-zinc-100'}\`}>
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl border border-zinc-100 shadow-sm">
                  {dog.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-zinc-900">{dog.name}</span>
                    {dog.isYou && <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px]">You</Badge>}
                  </div>
                  <p className="text-xs text-zinc-500">{dog.breed} · {dog.owner}</p>
                </div>
                <div className="text-right">
                  <div className={\`w-2 h-2 rounded-full bg-emerald-400 ml-auto mb-1\`} />
                  <span className="text-[10px] text-zinc-400">{dog.mood}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="p-4 bg-white border-t border-zinc-100">
        <button
          onClick={() => { onStateChange('checkedIn', false); onNavigate('m1'); }}
          className="w-full py-3 border border-zinc-200 text-zinc-600 font-medium rounded-xl text-sm"
        >
          Check Out
        </button>
      </div>
    </div>
  );
};`,
    },
    {
      id: 'm3',
      journeyId: 'j3',
      label: 'Park Chat',
      description: 'Group chat with all owners currently at the dog park',
      type: 'ai',
      preview: 'Chat with other dog owners',
      position: { x: 680, y: 80 },
      promptTemplate: 'Given the current park attendees and their dogs, generate friendly conversation starters and chat suggestions for {{userName}} and {{dogName}}.',
      buildStatus: 'done',
      componentCode: `
window.__SCREEN_COMPONENT__ = function ChatScreen({ state, onNavigate, onStateChange }) {
  const { Input } = window.UI;
  const [message, setMessage] = React.useState('');
  const [messages, setMessages] = React.useState([
    { id: 1, author: 'Sarah K.', dog: 'Max', text: 'Max is loving the new agility section! 🐾', time: '9:41', avatar: '🦮' },
    { id: 2, author: 'Mike R.', dog: 'Luna', text: 'Anyone know if the water station is filled today?', time: '9:44', avatar: '🐶' },
    { id: 3, author: 'Tom W.', dog: 'Bear', text: 'Yes! Just refilled it 👍', time: '9:45', avatar: '🐺' },
    { id: 4, author: 'Jamie L.', dog: 'Coco', text: 'Coco wants to meet Biscuit! Coming your way 😄', time: '9:47', avatar: '🐩' },
  ]);

  function send() {
    if (!message.trim()) return;
    setMessages(prev => [...prev, {
      id: prev.length + 1,
      author: state.userName + ' (You)',
      dog: state.dogName,
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatar: '🐕',
      isYou: true,
    }]);
    setMessage('');
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <div className="bg-white px-5 pt-10 pb-4 border-b border-zinc-100">
        <div className="flex items-center justify-between">
          <button onClick={() => onNavigate('m2')} className="text-zinc-400 text-sm">← Back</button>
          <div className="text-center">
            <h1 className="text-base font-bold text-zinc-900">Park Chat</h1>
            <p className="text-xs text-emerald-500">12 owners active</p>
          </div>
          <div className="w-8" />
        </div>
      </div>

      <div className="flex-1 px-4 py-3 space-y-3 overflow-y-auto">
        <div className="text-center text-[10px] text-zinc-400 py-2">Today · Riverside Dog Park</div>
        {messages.map((msg) => (
          <div key={msg.id} className={\`flex gap-2 \${msg.isYou ? 'flex-row-reverse' : ''}\`}>
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-lg border border-zinc-100 shadow-sm shrink-0">
              {msg.avatar}
            </div>
            <div className={\`max-w-[75%] \${msg.isYou ? 'items-end' : 'items-start'} flex flex-col gap-0.5\`}>
              {!msg.isYou && <span className="text-[10px] text-zinc-400 px-1">{msg.author}</span>}
              <div className={\`rounded-2xl px-3 py-2 text-sm \${msg.isYou ? 'bg-emerald-500 text-white rounded-tr-sm' : 'bg-white text-zinc-800 border border-zinc-100 rounded-tl-sm'}\`}>
                {msg.text}
              </div>
              <span className="text-[10px] text-zinc-400 px-1">{msg.time}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 bg-white border-t border-zinc-100 flex gap-2 items-center">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
          placeholder="Message the park..."
          className="flex-1 rounded-full bg-zinc-50"
        />
        <button
          onClick={send}
          className="w-9 h-9 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm shrink-0"
        >
          →
        </button>
      </div>
    </div>
  );
};`,
    },
  ],
  edges: [
    { id: 'e1', source: 'm1', target: 'm2', label: 'Check In' },
    { id: 'e2', source: 'm2', target: 'm3', label: 'Open Chat' },
    { id: 'e3', source: 'm3', target: 'm2', label: 'Back' },
    { id: 'e4', source: 'm2', target: 'm1', label: 'Check Out' },
  ],
};
