import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import AdmZip from 'adm-zip';
import path from 'path';
import { normalizeRuntimeAppMap } from '@/lib/runtime';
import type { AppMap } from '@/lib/types';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Framework detection ──────────────────────────────────────────────────────

type Framework =
  | 'nextjs-app'
  | 'nextjs-pages'
  | 'react-native'
  | 'expo'
  | 'flutter'
  | 'vue'
  | 'angular'
  | 'react-spa'
  | 'unknown';

function detectFramework(fileTree: string, rawFiles: Map<string, string>): Framework {
  // File-tree signals (fast, no content needed)
  if (/\/app\/page\.[jt]sx?/.test(fileTree) || /\/app\/layout\.[jt]sx?/.test(fileTree)) return 'nextjs-app';
  if (/\/pages\/_app\.[jt]sx?/.test(fileTree) || /\/pages\/index\.[jt]sx?/.test(fileTree)) return 'nextjs-pages';
  if (fileTree.includes('pubspec.yaml') || fileTree.includes('.dart')) return 'flutter';

  // package.json content
  const pkgContent = rawFiles.get('package.json') ?? [...rawFiles.entries()].find(([k]) => k.endsWith('/package.json'))?.[1] ?? '';
  if (pkgContent) {
    if (pkgContent.includes('"next"')) {
      return fileTree.includes('/app/') ? 'nextjs-app' : 'nextjs-pages';
    }
    if (pkgContent.includes('"expo"')) return 'expo';
    if (pkgContent.includes('"react-native"')) return 'react-native';
    if (pkgContent.includes('"vue"') || pkgContent.includes('"@vue/')) return 'vue';
    if (pkgContent.includes('"@angular/core"')) return 'angular';
    if (pkgContent.includes('"react"')) return 'react-spa';
  }

  return 'unknown';
}

const FRAMEWORK_LABELS: Record<Framework, string> = {
  'nextjs-app': 'Next.js (App Router)',
  'nextjs-pages': 'Next.js (Pages Router)',
  'react-native': 'React Native',
  'expo': 'Expo (React Native)',
  'flutter': 'Flutter',
  'vue': 'Vue.js',
  'angular': 'Angular',
  'react-spa': 'React SPA',
  'unknown': 'Unknown framework',
};

// ─── Framework-specific screen file prioritization ───────────────────────────

function screenScore(filePath: string, fw: Framework): number {
  const p = filePath.toLowerCase();

  if (fw === 'nextjs-app') {
    if (/\/app\/.*\/page\.[jt]sx?$/.test(p)) return 0;
    if (/\/app\/.*\/layout\.[jt]sx?$/.test(p)) return 1;
    if (/\/(components|lib|hooks)\//.test(p)) return 2;
    return 3;
  }
  if (fw === 'nextjs-pages') {
    if (/\/pages\//.test(p) && !/\/pages\/api\//.test(p)) return 0;
    if (/\/(components|lib|hooks)\//.test(p)) return 2;
    return 3;
  }
  if (fw === 'react-native' || fw === 'expo') {
    if (/\/(screens|navigation|navigators)\//.test(p)) return 0;
    if (/\/app\.[jt]sx?$/.test(p)) return 0;
    if (/\/(components|hooks|store|context)\//.test(p)) return 2;
    return 3;
  }
  if (fw === 'flutter') {
    if (/\/screens\/|\/pages\/|main\.dart$/.test(p)) return 0;
    if (/\/widgets\//.test(p)) return 2;
    return 3;
  }
  if (fw === 'vue') {
    if (/\/(views|pages)\//.test(p)) return 0;
    if (/router\.(ts|js)/.test(p)) return 0;
    if (/\/(components|store)\//.test(p)) return 2;
    return 3;
  }

  // Generic fallback
  if (/\/(pages|screens|views|routes)\//.test(p)) return 0;
  if (/\/(components|containers|features)\//.test(p)) return 1;
  if (/\/(lib|utils|hooks|store|context)\//.test(p)) return 2;
  return 3;
}

// ─── Structural extraction ────────────────────────────────────────────────────

// Patterns that indicate a line carries structural meaning
const STRUCTURAL_PATTERNS: RegExp[] = [
  // Imports
  /^import\s/,
  // Exports / declarations
  /^export\s+(default\s+)?(function|const|class|async)/,
  /^(function|class|async function)\s+\w/,
  /^const\s+\w+\s*[:=]/,
  // Navigation
  /\b(router\.(push|replace|navigate)|navigation\.(navigate|push|replace|reset)|navigate\(|Link\s|<Link|href=|<Route\s|Stack\.Screen|Tab\.Screen|Drawer\.Screen|<Redirect)/,
  // State
  /\b(useState|useReducer|useSelector|useStore|createSlice|createStore|atom\(|create\(|defineStore|useContext|createContext)/,
  // API / data
  /\b(fetch\(|axios\.(get|post|put|patch|delete)|supabase\.|prisma\.|useQuery|useMutation|trpc\.|\.from\(|getServerSideProps|getStaticProps|loader\(|action\()/,
  // Route definitions
  /\b(path\s*[:=]\s*['"`]|exact\s+path|<Route\s|app\.(get|post|put|delete|use)\s*\(|router\.(get|post|put|delete|use)\s*\()/,
  // Auth guards
  /\b(useAuth|getAuth|requireAuth|ProtectedRoute|isAuthenticated|session\.|currentUser|signIn|signOut|signUp|login\(|logout\()/,
  // Flutter screens
  /\b(MaterialPageRoute|Navigator\.(push|pop|pushNamed)|routes\s*[:=]|Widget\s+build)/,
];

function isStructuralLine(line: string): boolean {
  const t = line.trim();
  if (!t || t.startsWith('//') || t.startsWith('*') || t.startsWith('/*') || t.startsWith('#')) return false;
  // Skip pure JSX with only styling
  if (/^(className|style|tailwind|cx\(|clsx\()/.test(t)) return false;
  return STRUCTURAL_PATTERNS.some((re) => re.test(t));
}

function extractStructure(content: string, filePath: string): string {
  // For very short files, keep everything
  if (content.length < 600) return content;

  const lines = content.split('\n');
  const structural: string[] = [];
  const MAX_LINE = 140;

  for (const line of lines) {
    if (isStructuralLine(line)) {
      structural.push(line.trimEnd().slice(0, MAX_LINE));
    }
  }

  // If extraction left almost nothing, fall back to first 800 chars of raw content
  if (structural.length < 5) {
    return content.slice(0, 800) + (content.length > 800 ? '\n... (truncated)' : '');
  }

  return structural.join('\n');
}

// ─── File filtering ───────────────────────────────────────────────────────────

const IGNORE_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', '.next', '__pycache__',
  'coverage', '.cache', '.turbo', 'vendor', '.vercel', 'out', '.expo',
  'ios', 'android', '.gradle', 'Pods',
]);

const SOURCE_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.py', '.swift', '.kt', '.dart', '.vue', '.svelte',
]);

// Also include package.json for framework detection
const EXTRA_FILES = new Set(['package.json', 'pubspec.yaml']);

const IGNORE_PATTERNS: RegExp[] = [
  /\.test\.[jt]sx?$/,
  /\.spec\.[jt]sx?$/,
  /\.min\.[jt]s$/,
  /__tests__\//,
  /\.stories\.[jt]sx?$/,
  /\.config\.[jt]sx?$/,
  /next\.config/,
  /webpack\.config/,
  /vite\.config/,
  /tailwind\.config/,
  /jest\.config/,
  /eslint/,
  /\.d\.ts$/,
  /generated\//,
  /\.generated\./,
];

function shouldIncludeFile(entryPath: string): boolean {
  const parts = entryPath.split('/');
  const filename = parts[parts.length - 1];

  for (const part of parts.slice(0, -1)) {
    if (IGNORE_DIRS.has(part)) return false;
  }

  if (EXTRA_FILES.has(filename)) return true;

  const ext = path.extname(filename).toLowerCase();
  if (!SOURCE_EXTENSIONS.has(ext)) return false;

  for (const pattern of IGNORE_PATTERNS) {
    if (pattern.test(entryPath)) return false;
  }
  return true;
}

// ─── Snapshot builder ─────────────────────────────────────────────────────────

interface FileEntry {
  path: string;
  content: string;
  isScreen: boolean;
}

interface Snapshot {
  files: FileEntry[];
  fileTree: string;
  framework: Framework;
  totalSourceFiles: number;
}

function buildSnapshot(zipBuffer: Buffer): Snapshot {
  const zip = new AdmZip(zipBuffer);
  const entries = zip.getEntries();

  // First pass: collect raw content for framework detection + file tree
  const rawFiles = new Map<string, string>();
  const allSourcePaths: string[] = [];

  for (const entry of entries) {
    if (entry.isDirectory || !shouldIncludeFile(entry.entryName)) continue;
    allSourcePaths.push(entry.entryName);
    const filename = entry.entryName.split('/').pop() ?? '';
    if (EXTRA_FILES.has(filename)) {
      try {
        rawFiles.set(filename, entry.getData().toString('utf8').slice(0, 2000));
      } catch { /* skip */ }
    }
  }

  const fileTree = allSourcePaths.slice(0, 150).join('\n');
  const framework = detectFramework(fileTree, rawFiles);

  // Second pass: sort by screen relevance, extract structure
  const MAX_TOTAL_CHARS = 80_000; // structural content is much denser than raw
  const MAX_STRUCTURAL_CHARS = 2_000; // per file after extraction

  const sorted = entries
    .filter((e) => !e.isDirectory && shouldIncludeFile(e.entryName))
    .sort((a, b) => screenScore(a.entryName, framework) - screenScore(b.entryName, framework));

  const files: FileEntry[] = [];
  let totalChars = 0;

  for (const entry of sorted) {
    if (totalChars >= MAX_TOTAL_CHARS) break;
    try {
      const raw = entry.getData().toString('utf8');
      const structural = extractStructure(raw, entry.entryName);
      const capped = structural.length > MAX_STRUCTURAL_CHARS
        ? structural.slice(0, MAX_STRUCTURAL_CHARS) + '\n... (truncated)'
        : structural;

      const isScreen = screenScore(entry.entryName, framework) === 0;
      files.push({ path: entry.entryName, content: capped, isScreen });
      totalChars += capped.length;
    } catch { /* skip binary */ }
  }

  return { files, fileTree, framework, totalSourceFiles: allSourcePaths.length };
}

// ─── SSE helpers ─────────────────────────────────────────────────────────────

function makeStream() {
  const encoder = new TextEncoder();
  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
  const writer = writable.getWriter();
  const send = (payload: Record<string, unknown>) =>
    writer.write(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
  const close = () => writer.close();
  const response = new Response(readable, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
  });
  return { send, close, response };
}

// ─── Route ───────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'Missing ANTHROPIC_API_KEY' }, { status: 500 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return Response.json({ error: 'No file uploaded' }, { status: 400 });

  const { send, close, response } = makeStream();

  (async () => {
    try {
      send({ type: 'status', message: 'Reading zip file…' });
      const buffer = Buffer.from(await file.arrayBuffer());

      send({ type: 'status', message: 'Extracting source files…' });
      const snapshot = buildSnapshot(buffer);

      if (snapshot.files.length === 0) {
        throw new Error('No source files found. Make sure the zip contains .ts, .tsx, .js, .jsx, .dart, .kt, or .swift files.');
      }

      const fwLabel = FRAMEWORK_LABELS[snapshot.framework];
      const screenFiles = snapshot.files.filter((f) => f.isScreen).map((f) => f.path);
      const supportFiles = snapshot.files.filter((f) => !f.isScreen).map((f) => f.path);

      // Rich event — UI uses this to render the visual breakdown
      send({
        type: 'analysis',
        framework: snapshot.framework,
        frameworkLabel: fwLabel,
        screenFiles,
        supportFiles,
        totalSourceFiles: snapshot.totalSourceFiles,
      });

      send({ type: 'status', message: `Detected ${fwLabel} · ${screenFiles.length} screens · ${snapshot.files.length} files analyzed` });
      send({ type: 'status', message: 'Analyzing structure with Claude…' });
      const prompt = buildAnalyzePrompt(file.name, snapshot);

      let accumulated = '';
      let lastReportedChunk = 0;

      const stream = client.messages.stream({
        model: 'claude-sonnet-4-6',
        max_tokens: 8192,
        temperature: 0,
        messages: [{ role: 'user', content: prompt }],
      });

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          accumulated += event.delta.text;
          if (accumulated.length - lastReportedChunk >= 200) {
            lastReportedChunk = accumulated.length;
            send({ type: 'progress', chars: accumulated.length });
          }
        }
      }

      send({ type: 'status', message: 'Parsing journey map…' });

      const stripped = accumulated.trim().replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim();
      const first = stripped.indexOf('{');
      const last = stripped.lastIndexOf('}');

      let appMap: AppMap;
      try {
        appMap = JSON.parse(first !== -1 && last > first ? stripped.slice(first, last + 1) : stripped);
      } catch {
        throw new Error('Could not parse the generated map. Try a smaller or more focused zip.');
      }

      const normalized = normalizeRuntimeAppMap(appMap);

      // Emit mapping so UI can show file → moment connections
      send({
        type: 'mapping',
        moments: normalized.moments?.map((m) => ({ id: m.id, label: m.label, type: m.type, journeyId: m.journeyId })) ?? [],
        journeys: normalized.journeys?.map((j) => ({ id: j.id, name: j.name })) ?? [],
      });

      send({
        type: 'status',
        message: `Map ready — ${normalized.moments?.length ?? 0} moments across ${normalized.journeys?.length ?? 0} journeys`,
      });
      send({ type: 'result', appMap: normalized });
    } catch (err) {
      send({ type: 'error', message: err instanceof Error ? err.message : 'Analysis failed.' });
    } finally {
      close();
    }
  })();

  return response;
}

// ─── Prompt ──────────────────────────────────────────────────────────────────

function buildFrameworkHints(fw: Framework): string {
  switch (fw) {
    case 'nextjs-app':
      return `Framework: Next.js App Router
- Each folder under app/ with a page.tsx is a distinct screen/route
- layout.tsx files define persistent UI wrapping child routes
- Route groups (app/(auth)/login) indicate journey groupings
- Server Actions and API routes under app/api/ are data/auth moments`;

    case 'nextjs-pages':
      return `Framework: Next.js Pages Router
- Each file under pages/ (except _app, _document, api/) is a screen
- pages/api/ files are data/auth moments
- getServerSideProps / getStaticProps indicate data-fetching moments`;

    case 'react-native':
    case 'expo':
      return `Framework: ${fw === 'expo' ? 'Expo' : 'React Native'}
- Stack.Screen / Tab.Screen / Drawer.Screen declarations are the real screens
- navigation.navigate('ScreenName') calls define edges between moments
- Expo Router: app/ directory structure maps directly to routes (same as Next.js App Router)
- useAuth / auth state checks indicate auth moments`;

    case 'flutter':
      return `Framework: Flutter
- MaterialPageRoute / CupertinoPageRoute targets are distinct screens
- Navigator.pushNamed route names are the real route IDs
- routes: {} map in MaterialApp lists all screens
- Scaffold widgets define the top-level screen structure`;

    case 'vue':
      return `Framework: Vue.js
- Files under views/ or pages/ are screen moments
- router/index.ts (or routes.js) contains the definitive route list — use it as the source of truth
- router.push() / <router-link to=""> calls define navigation edges
- Pinia stores / Vuex modules define state`;

    case 'angular':
      return `Framework: Angular
- app-routing.module.ts contains the definitive route list — use it as the source of truth
- Each component with its own route entry is a screen moment
- RouterLink / router.navigate() calls define edges`;

    default:
      return `Framework: React SPA or unknown
- Infer screens from component names, route strings, and navigation calls
- Look for react-router Route/Switch/Routes declarations for the real routes`;
  }
}

function buildAnalyzePrompt(filename: string, snapshot: Snapshot): string {
  const { files, fileTree, framework } = snapshot;
  const fwHints = buildFrameworkHints(framework);

  // Separate screen files from supporting files for clarity
  const screenFiles = files.filter((f) => f.isScreen);
  const supportFiles = files.filter((f) => !f.isScreen);

  const renderFiles = (list: FileEntry[]) =>
    list.map((f) => `=== ${f.path} ===\n${f.content}`).join('\n\n');

  return `You are reverse-engineering a real codebase into a Journey Map for Momentum, a visual app builder.
Your output must reflect the ACTUAL screens, routes, and navigation in the code — not generic guesses.

Codebase: "${filename}"

${fwHints}

FILE TREE (all source files):
${fileTree}

SCREEN / ROUTE FILES (highest priority — these become moments):
${renderFiles(screenFiles)}

SUPPORTING FILES (state, navigation config, components):
${renderFiles(supportFiles)}

Generate a Journey Map as JSON. Return ONLY valid JSON, no markdown fences:
{
  "appName": "Real app name from code (package.json name, app title, brand name)",
  "appDescription": "One sentence describing what this app actually does",
  "appPlatform": "mobile",
  "runtimeVersion": 1,
  "stateSchema": [
    { "key": "actualStateKey", "label": "Human label", "type": "string", "defaultValue": "" }
  ],
  "initialState": { "actualStateKey": "" },
  "journeys": [
    { "id": "journey-id", "name": "Journey Name", "description": "What this flow accomplishes" }
  ],
  "moments": [
    {
      "id": "moment-id-matching-route-or-screen-name",
      "journeyId": "journey-id",
      "label": "Real screen name from code",
      "description": "What this screen does — grounded in the actual code logic",
      "type": "ui",
      "preview": "What the user sees and can interact with",
      "position": { "x": 0, "y": 0 },
      "screenSpec": {
        "title": "Screen title",
        "subtitle": "Supporting copy",
        "components": [],
        "actions": []
      }
    }
  ],
  "edges": [
    { "id": "edge-id", "source": "moment-id", "target": "moment-id", "label": "navigation action" }
  ]
}

Rules:
- One moment per real screen/route — use the ACTUAL route path or component name as the moment ID
- Group moments into 2-5 journeys that reflect real user flows found in the nav structure (onboarding, core features, settings, etc.)
- Extract real state keys from useState/Zustand/Redux/Context/Pinia — add them to stateSchema
- Moment types: "ui" (screens/pages), "ai" (any call to OpenAI/Anthropic/LLM APIs), "data" (REST/GraphQL/DB calls), "auth" (login/signup/auth guards)
- Build screenSpec components from the actual UI: inputs match real form fields, choice-cards match real selection UIs
- Use ONLY these component types: "hero", "input", "choice-cards", "chip-group", "notice", "summary-card", "stats-grid", "list", "spacer"
- Use ONLY these action kinds: "navigate", "branch", "back"
- Create edges for every navigation call found in the code — if screen A calls navigate('B'), add an edge A→B
- Position: journeys on separate rows (y: 0, 320, 640…), moments 280px apart (x: 0, 280, 560…)
- All IDs: unique, lowercase, hyphens only
- Return ONLY valid JSON`;
}
