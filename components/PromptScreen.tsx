'use client';

import { useState, useRef, useEffect } from 'react';
import { useMomentaiStore } from '@/lib/store';
import { createFreshDemoMap } from '@/lib/demo';
import { createProject } from '@/lib/projects';
import { AppMap } from '@/lib/types';
import { tryLogBuildUsageFromSsePayload } from '@/lib/build-usage-log';
import { clearDemoEditConsumed } from '@/lib/demo-edit-session';

interface LogEntry {
  type: 'status' | 'progress' | 'error' | 'warning';
  message: string;
  /** Server error detail when a fallback (compact / scaffold) runs */
  detail?: string;
}

interface AnalysisData {
  framework: string;
  frameworkLabel: string;
  screenFiles: string[];
  supportFiles: string[];
  totalSourceFiles: number;
}

interface MappingData {
  moments: { id: string; label: string; type: string; journeyId: string }[];
  journeys: { id: string; name: string }[];
}

const DEMO_DESCRIPTION =
  'An AI-powered fitness app called Pulse. Users complete a short fitness assessment to get a personalised training plan (Beginner, Intermediate, Advanced, or Athlete). Daily workouts are AI-generated based on energy and recovery. Progress is tracked with strength analytics and AI coaching insights. A nutrition module lets users log meals, get AI meal suggestions, and view recipes.';

const DEMO_LOG_STEPS: { delay: number; msg: string }[] = [
  { delay: 0,    msg: 'Analysing app description…' },
  { delay: 1100, msg: 'Identifying user journeys…' },
  { delay: 2400, msg: 'Mapping onboarding & fitness assessment flow…' },
  { delay: 3800, msg: 'Mapping daily workout journey…' },
  { delay: 5100, msg: 'Mapping progress & analytics journey…' },
  { delay: 6200, msg: 'Mapping nutrition journey…' },
  { delay: 7300, msg: 'Generating moment graph…' },
  { delay: 8500, msg: 'Map generated — 30 moments across 4 journeys' },
];

const FRAMEWORK_ICONS: Record<string, string> = {
  'nextjs-app': 'N',
  'nextjs-pages': 'N',
  'react-native': 'R',
  'expo': 'E',
  'flutter': 'F',
  'vue': 'V',
  'angular': 'A',
  'react-spa': 'R',
  'unknown': '?',
};

const MOMENT_TYPE_COLORS: Record<string, string> = {
  ui: 'text-indigo-400',
  ai: 'text-violet-400',
  data: 'text-sky-400',
  auth: 'text-emerald-400',
};

export default function PromptScreen() {
  const {
    setAppMap,
    setGenerating,
    isGenerating,
    setActiveProjectId,
    setBuiltAppUrl,
    setBuiltHtml,
    setBuildingApp,
    setMomentComponentCode,
    setMomentBuildStatus,
  } = useMomentaiStore();
  const [activeTab, setActiveTab] = useState<'describe' | 'upload'>('describe');
  const [platform, setPlatform] = useState<'mobile' | 'web'>('mobile');
  const [text, setText] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [charsGenerated, setCharsGenerated] = useState(0);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [mappingData, setMappingData] = useState<MappingData | null>(null);
  /** Two-phase create: model returns follow-up questions before /api/generate. */
  const [clarifyQuestions, setClarifyQuestions] = useState<string[] | null>(null);
  const [clarifyAnswers, setClarifyAnswers] = useState<string[]>([]);
  const [isClarifyLoading, setIsClarifyLoading] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  /** Same pipeline as Build & Share: `/api/build-app` streams SSE, not JSON. */
  const triggerBuild = async (appMap: AppMap) => {
    const screens = appMap.moments.filter((m) => !m.parentMomentId);
    setBuildingApp(true);
    for (const m of screens) {
      setMomentBuildStatus(m.id, 'building');
    }
    try {
      const res = await fetch('/api/build-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appMap }),
      });
      if (!res.ok || !res.body) return;

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (value) {
          buffer += decoder.decode(value, { stream: true });
        }
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const payload = JSON.parse(line.slice(6)) as Record<string, unknown>;
            if (payload.status === 'usage') {
              tryLogBuildUsageFromSsePayload(payload);
            } else if (payload.status === 'done' && payload.componentCode && payload.momentId) {
              setMomentComponentCode(String(payload.momentId), String(payload.componentCode));
            } else if (payload.status === 'error' && payload.momentId) {
              setMomentBuildStatus(String(payload.momentId), 'error');
            }
          } catch {
            /* skip malformed line */
          }
        }
        if (done) {
          buffer += decoder.decode();
          const tail = buffer.trim();
          if (tail) {
            for (const line of tail.split('\n')) {
              if (!line.startsWith('data: ')) continue;
              try {
                const payload = JSON.parse(line.slice(6)) as Record<string, unknown>;
                if (payload.status === 'usage') {
                  tryLogBuildUsageFromSsePayload(payload);
                } else if (payload.status === 'done' && payload.componentCode && payload.momentId) {
                  setMomentComponentCode(String(payload.momentId), String(payload.componentCode));
                } else if (payload.status === 'error' && payload.momentId) {
                  setMomentBuildStatus(String(payload.momentId), 'error');
                }
              } catch {
                /* skip */
              }
            }
          }
          break;
        }
      }
    } catch {
      /* user can run Build & Share from the workspace */
    } finally {
      setBuildingApp(false);
      const { appMap, setMomentBuildStatus: setStatus } = useMomentaiStore.getState();
      if (appMap) {
        for (const m of appMap.moments) {
          if (m.buildStatus === 'building') setStatus(m.id, 'error');
        }
      }
    }
  };

  const saveNewProject = (appMap: AppMap) => {
    const project = createProject(appMap);
    setActiveProjectId(project.id);
  };

  const addLog = (entry: LogEntry) => {
    setLogs((prev) => [...prev, entry]);
  };

  const handleDemoFlow = async () => {
    if (isGenerating) return;
    setText(DEMO_DESCRIPTION);
    setError('');
    setLogs([]);
    setCharsGenerated(0);
    setGenerating(true);

    let prev = 0;
    for (const step of DEMO_LOG_STEPS) {
      await new Promise<void>((r) => setTimeout(r, step.delay - prev));
      prev = step.delay;
      setLogs((l) => [...l, { type: 'status', message: step.msg }]);
    }

    const fresh = createFreshDemoMap();
    clearDemoEditConsumed();
    setAppMap(fresh);
    saveNewProject(fresh);
    setGenerating(false);
  };

  // ── Stream reader (shared between describe + upload) ──────────────────────
  async function readStream(res: Response) {
    if (!res.ok || !res.body) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? 'Request failed — try again');
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let gotResult = false;
    let gotError = false;

    const handleEvent = (event: Record<string, unknown>) => {
      if (event.type === 'status') {
        addLog({ type: 'status', message: String(event.message ?? '') });
      } else if (event.type === 'warning') {
        addLog({
          type: 'warning',
          message: typeof event.message === 'string' ? event.message : 'Warning',
          detail: typeof event.detail === 'string' ? event.detail : undefined,
        });
      } else if (event.type === 'progress') {
        setCharsGenerated(typeof event.chars === 'number' ? event.chars : 0);
      } else if (event.type === 'analysis') {
        setAnalysisData(event as unknown as AnalysisData);
      } else if (event.type === 'mapping') {
        setMappingData(event as unknown as MappingData);
      } else if (event.type === 'error') {
        gotError = true;
        const msg = typeof event.message === 'string' ? event.message : 'Generation failed';
        setError(msg);
        addLog({ type: 'error', message: msg });
      } else if (event.type === 'result') {
        const appMap = event.appMap as AppMap | undefined;
        if (!appMap?.moments || !appMap.journeys) {
          gotError = true;
          setError('Invalid map from server — try again');
          addLog({ type: 'error', message: 'Server sent an incomplete app map.' });
          return;
        }
        gotResult = true;
        addLog({
          type: 'status',
          message: `Map generated — ${appMap.moments.length} moments across ${appMap.journeys.length} journeys`,
        });
        setAppMap(appMap);
        saveNewProject(appMap);
        triggerBuild(appMap);
      }
    };

    const processLine = (line: string) => {
      const t = line.trim();
      if (!t.startsWith('data:')) return;
      const json = t.slice(5).replace(/^\s*/, '');
      if (!json) return;
      try {
        handleEvent(JSON.parse(json) as Record<string, unknown>);
      } catch {
        addLog({ type: 'error', message: 'Could not parse a server message (truncated stream?).' });
      }
    };

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (value) {
          buffer += decoder.decode(value, { stream: true });
        }
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          processLine(line);
        }
        if (done) {
          buffer += decoder.decode();
          const tail = buffer.trim();
          if (tail) {
            for (const line of tail.split('\n')) {
              processLine(line);
            }
          }
          break;
        }
      }
    } catch {
      setError('Stream interrupted — check your connection');
      addLog({ type: 'error', message: 'Stream interrupted.' });
      gotError = true;
    }

    if (!gotResult && !gotError) {
      setError('No app map was received. Try generating again.');
      addLog({
        type: 'error',
        message:
          'Connection closed before the map arrived — nothing was saved. If this keeps happening, try a shorter description.',
      });
    }
  }

  function buildEnrichedDescription(base: string, questions: string[], answers: string[]): string {
    const lines = [base.trim()];
    const blocks = questions
      .map((q, i) => {
        const a = (answers[i] ?? '').trim();
        return a ? `• ${q}\n  ${a}` : null;
      })
      .filter((b): b is string => !!b);
    if (blocks.length > 0) {
      lines.push('', 'Clarifications:', ...blocks);
    }
    return lines.join('\n');
  }

  const runGenerateWithDescription = async (descriptionToGenerate: string) => {
    setGenerating(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: descriptionToGenerate, platform }),
      });
      await readStream(res);
    } catch {
      setError('Something went wrong — check your connection and try again');
    } finally {
      setGenerating(false);
    }
  };

  // ── Describe → optional clarify → generate ────────────────────────────────
  const handleGenerate = async () => {
    const trimmed = text.trim();
    if (!trimmed || isGenerating || isClarifyLoading || clarifyQuestions) return;
    setError('');
    setLogs([]);
    setCharsGenerated(0);

    setIsClarifyLoading(true);
    try {
      const res = await fetch('/api/clarify-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: trimmed, platform }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(typeof data?.error === 'string' ? data.error : 'Could not review your brief — try again.');
        return;
      }
      if (data?.needsInput === true && Array.isArray(data.questions) && data.questions.length > 0) {
        setClarifyQuestions(data.questions);
        setClarifyAnswers(data.questions.map(() => ''));
        addLog({
          type: 'status',
          message: 'A few quick questions will help us build a stronger map for you.',
        });
        return;
      }
      const brief = typeof data?.brief === 'string' && data.brief.trim() ? data.brief.trim() : trimmed;
      await runGenerateWithDescription(brief);
    } catch {
      setError('Something went wrong — check your connection and try again');
    } finally {
      setIsClarifyLoading(false);
    }
  };

  const handleClarifyContinue = async () => {
    if (!clarifyQuestions || clarifyQuestions.length === 0) return;
    const trimmed = text.trim();
    const enriched = buildEnrichedDescription(trimmed, clarifyQuestions, clarifyAnswers);
    setClarifyQuestions(null);
    setClarifyAnswers([]);
    setError('');
    setLogs([]);
    setCharsGenerated(0);
    addLog({ type: 'status', message: 'Generating your app map with your answers…' });
    await runGenerateWithDescription(enriched);
  };

  const handleClarifyCancel = () => {
    setClarifyQuestions(null);
    setClarifyAnswers([]);
    setError('');
  };

  // ── Upload → analyze ──────────────────────────────────────────────────────
  const handleAnalyze = async () => {
    if (!uploadFile || isGenerating) return;
    setError('');
    setLogs([]);
    setCharsGenerated(0);
    setAnalysisData(null);
    setMappingData(null);
    setGenerating(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      const res = await fetch('/api/analyze-codebase', { method: 'POST', body: formData });
      await readStream(res);
    } catch {
      setError('Something went wrong — check your connection and try again');
    } finally {
      setGenerating(false);
    }
  };

  // ── Drag & drop ───────────────────────────────────────────────────────────
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && f.name.endsWith('.zip')) {
      setUploadFile(f);
      setError('');
    } else {
      setError('Please upload a .zip file');
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setUploadFile(f);
      setError('');
    }
  };

  const formatBytes = (b: number) =>
    b < 1024 ? `${b} B` : b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 overflow-y-auto">
      <div className="w-full max-w-2xl space-y-8">

        {/* Header */}
        <div className="space-y-3">
          <h1 className="text-5xl font-bold text-white tracking-tight leading-[1.1]">
            Every screen.<br />
            <span className="text-zinc-500">Every flow. One map.</span>
          </h1>
          <p className="text-zinc-500 text-lg leading-relaxed">
            Describe your app or upload a codebase to get an interactive flow map — with live mockups you can edit with plain English.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1 w-fit">
          <button
            onClick={() => { setActiveTab('describe'); setError(''); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'describe'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Describe app
          </button>
          <button
            onClick={() => { setActiveTab('upload'); setError(''); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'upload'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v7M2.5 4.5L6 1l3.5 3.5M1 10h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Upload codebase
          </button>
        </div>

        {/* ── Describe tab ── */}
        {activeTab === 'describe' && (
          <div className="space-y-3">
            <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-fit">
              {(['mobile', 'web'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                    platform === p ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {p === 'mobile' ? (
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><rect x="2" y="0.5" width="8" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="6" cy="9.5" r="0.8" fill="currentColor"/></svg>
                  ) : (
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><rect x="0.5" y="1.5" width="11" height="7.5" rx="1" stroke="currentColor" strokeWidth="1.3"/><path d="M4 11h4M6 9v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                  )}
                  {p === 'mobile' ? 'Mobile' : 'Web'}
                </button>
              ))}
            </div>

            <textarea
              className="w-full bg-zinc-900 border border-zinc-700 focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 text-white placeholder:text-zinc-600 resize-none text-sm rounded-xl px-4 py-3.5 outline-none transition-all min-h-[120px]"
              placeholder="e.g. A fitness app where users track workouts, get AI-generated plans, and see progress over time. Includes social features and a nutrition tracker."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !clarifyQuestions) {
                  handleGenerate();
                }
              }}
              disabled={isGenerating || isClarifyLoading}
            />

            {clarifyQuestions && clarifyQuestions.length > 0 && (
              <div className="space-y-3 rounded-xl border border-indigo-500/25 bg-indigo-500/5 px-4 py-3">
                <p className="text-indigo-200/90 text-xs font-medium">
                  A few details help us build a stronger map:
                </p>
                {clarifyQuestions.map((q, i) => (
                  <div key={i} className="space-y-1">
                    <label className="text-zinc-400 text-xs block">{q}</label>
                    <input
                      type="text"
                      value={clarifyAnswers[i] ?? ''}
                      onChange={(e) => {
                        const next = [...clarifyAnswers];
                        next[i] = e.target.value;
                        setClarifyAnswers(next);
                      }}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-indigo-500/50"
                      placeholder="Your answer"
                      disabled={isGenerating}
                    />
                  </div>
                ))}
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleClarifyContinue}
                    disabled={isGenerating}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white h-10 text-sm font-semibold rounded-lg"
                  >
                    Generate with your answers
                  </button>
                  <button
                    type="button"
                    onClick={handleClarifyCancel}
                    disabled={isGenerating}
                    className="px-4 h-10 text-sm text-zinc-400 border border-zinc-700 rounded-lg hover:border-zinc-500"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}

            {error && <p className="text-red-400 text-sm">{error}</p>}

            {!clarifyQuestions && (
              <button
                onClick={handleGenerate}
                disabled={!text.trim() || isGenerating || isClarifyLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white h-12 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2.5"
              >
                {isClarifyLoading ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Reviewing your brief…
                  </>
                ) : isGenerating ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Generating your app map…
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                    Generate Journey Map
                  </>
                )}
              </button>
            )}
            {!clarifyQuestions && (
              <p className="text-zinc-700 text-xs text-center">⌘ + Enter to generate</p>
            )}
          </div>
        )}

        {/* ── Upload tab ── */}
        {activeTab === 'upload' && (
          <div className="space-y-3">
            <div className="inline-flex items-center rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
              Supports any JS / TS / Python / Swift / Kotlin codebase
            </div>

            {/* Dropzone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => !uploadFile && fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl transition-all cursor-pointer ${
                isDragging
                  ? 'border-indigo-500/60 bg-indigo-500/5'
                  : uploadFile
                  ? 'border-emerald-500/40 bg-emerald-500/5 cursor-default'
                  : 'border-zinc-700 hover:border-zinc-600 bg-zinc-900/60 hover:bg-zinc-900'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".zip"
                className="hidden"
                onChange={handleFileInput}
              />

              {uploadFile ? (
                <div className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 3.5A1.5 1.5 0 013.5 2h4.086a1.5 1.5 0 011.06.44l2.915 2.914A1.5 1.5 0 0112 6.414V10.5A1.5 1.5 0 0110.5 12h-7A1.5 1.5 0 012 10.5v-7z" stroke="#10b981" strokeWidth="1.2"/>
                        <path d="M7.5 2.25V5.5a.5.5 0 00.5.5h3.25" stroke="#10b981" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium truncate max-w-[280px]">{uploadFile.name}</p>
                      <p className="text-zinc-500 text-xs">{formatBytes(uploadFile.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setUploadFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                    className="text-zinc-600 hover:text-zinc-300 transition-colors p-1"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M9 2v10M4.5 6.5L9 2l4.5 4.5M2 15h14" stroke="#71717a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-zinc-300 text-sm font-medium">Drop your zip here</p>
                    <p className="text-zinc-600 text-xs mt-0.5">or click to browse</p>
                  </div>
                  <p className="text-zinc-700 text-[11px]">.zip files only · max ~50MB</p>
                </div>
              )}
            </div>

            {/* What gets analyzed */}
            {!uploadFile && (
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 space-y-1.5">
                <p className="text-zinc-500 text-[11px] uppercase tracking-wider font-medium">Claude reads</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {[
                    'Routes & screen files', 'Navigation logic',
                    'State management', 'API & data calls',
                    'Auth flows', 'Component hierarchy',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-indigo-500/60 shrink-0" />
                      <span className="text-zinc-500 text-xs">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              onClick={handleAnalyze}
              disabled={!uploadFile || isGenerating}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white h-12 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2.5"
            >
              {isGenerating ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Analyzing codebase…
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.6"/>
                    <path d="M4.5 7h5M9.5 7L7.5 5M9.5 7L7.5 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Analyze & Map Codebase
                </>
              )}
            </button>
          </div>
        )}

        {/* Visual analysis breakdown — upload only */}
        {activeTab === 'upload' && analysisData && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
            {/* Framework header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <span className="text-indigo-400 text-[11px] font-bold">{FRAMEWORK_ICONS[analysisData.framework] ?? '?'}</span>
              </div>
              <div>
                <p className="text-white text-xs font-semibold">{analysisData.frameworkLabel}</p>
                <p className="text-zinc-500 text-[10px]">
                  {analysisData.screenFiles.length} screens · {analysisData.supportFiles.length} support files · {analysisData.totalSourceFiles} total
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 divide-x divide-zinc-800">
              {/* Screen files */}
              <div className="px-3 py-3">
                <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium mb-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />
                  Screens ({analysisData.screenFiles.length})
                </p>
                <div className="space-y-1 max-h-36 overflow-y-auto">
                  {analysisData.screenFiles.map((f) => (
                    <p key={f} className="text-zinc-400 text-[10px] font-mono truncate" title={f}>
                      {f.split('/').pop()}
                      <span className="text-zinc-600 ml-1 hidden group-hover:inline">{f}</span>
                    </p>
                  ))}
                </div>
              </div>

              {/* Support files */}
              <div className="px-3 py-3">
                <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium mb-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 inline-block" />
                  Support ({analysisData.supportFiles.length})
                </p>
                <div className="space-y-1 max-h-36 overflow-y-auto">
                  {analysisData.supportFiles.map((f) => (
                    <p key={f} className="text-zinc-600 text-[10px] font-mono truncate" title={f}>
                      {f.split('/').pop()}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Mapping result */}
            {mappingData && (
              <div className="border-t border-zinc-800 px-4 py-3">
                <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium mb-2">
                  Mapped to {mappingData.moments.length} moments
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {mappingData.journeys.map((j) => {
                    const jMoments = mappingData.moments.filter((m) => m.journeyId === j.id);
                    return (
                      <div key={j.id} className="flex flex-col gap-1">
                        <p className="text-zinc-600 text-[9px] uppercase tracking-wider px-1">{j.name}</p>
                        {jMoments.map((m) => (
                          <span
                            key={m.id}
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 ${MOMENT_TYPE_COLORS[m.type] ?? 'text-zinc-400'}`}
                          >
                            {m.label}
                          </span>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Live log panel — shared */}
        {(isGenerating || logs.length > 0) && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800">
              <span className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                {activeTab === 'upload' ? 'Analysis log' : 'Generation log'}
              </span>
              {isGenerating && charsGenerated > 0 && (
                <span className="text-[11px] text-zinc-600 font-mono">{charsGenerated.toLocaleString()} chars</span>
              )}
            </div>
            <div className="px-4 py-3 space-y-1.5 max-h-64 overflow-y-auto font-mono text-xs">
              {logs.map((log, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className={
                    log.type === 'error' ? 'text-red-500' :
                    log.type === 'warning' ? 'text-amber-500' :
                    i === logs.length - 1 && isGenerating ? 'text-indigo-400' :
                    'text-emerald-500'
                  }>
                    {log.type === 'error' ? '✗' : log.type === 'warning' ? '!' : i === logs.length - 1 && isGenerating ? '›' : '✓'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className={
                      log.type === 'error' ? 'text-red-400' :
                      log.type === 'warning' ? 'text-amber-200/90' :
                      i === logs.length - 1 && isGenerating ? 'text-zinc-300' :
                      'text-zinc-500'
                    }>
                      {log.message}
                    </span>
                    {log.detail && (
                      <p className="mt-1 text-[10px] leading-snug text-zinc-500 whitespace-pre-wrap break-words pl-0 border-l border-zinc-700 pl-2">
                        {log.detail}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {isGenerating && charsGenerated > 0 && (
                <div className="flex items-start gap-2">
                  <span className="text-indigo-400">›</span>
                  <span className="text-zinc-400">
                    Claude writing… {charsGenerated.toLocaleString()} chars<span className="animate-pulse">_</span>
                  </span>
                </div>
              )}
              <div ref={logsEndRef} />
            </div>
          </div>
        )}

        {/* Demo button */}
        {!isGenerating && logs.length === 0 && (
          <>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-zinc-800" />
              <span className="text-zinc-700 text-xs">or try the demo</span>
              <div className="flex-1 h-px bg-zinc-800" />
            </div>

            <button
              onClick={handleDemoFlow}
              disabled={isGenerating}
              className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 disabled:opacity-40 text-zinc-300 h-12 text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2.5"
            >
              <span className="text-base">⚡</span>
              Pulse — AI Fitness Demo
              <span className="text-zinc-600 text-xs ml-1">30 moments · 4 journeys</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
