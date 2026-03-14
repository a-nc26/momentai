'use client';

import { useState, useRef } from 'react';
import { useMomentaiStore } from '@/lib/store';
import { DEMO_MAP } from '@/lib/demo';

export default function PromptScreen() {
  const { setAppMap, setGenerating, isGenerating } = useMomentaiStore();
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleGenerate = async () => {
    const trimmed = text.trim();
    if (!trimmed || isGenerating) return;
    setError('');
    setGenerating(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: trimmed }),
      });
      if (!res.ok) {
        setError('Failed to generate — try again');
        return;
      }
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        return;
      }
      setAppMap(data);
    } catch {
      setError('Something went wrong — check your connection and try again');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl space-y-8">

        {/* Header */}
        <div className="space-y-3">
          <h1 className="text-5xl font-bold text-white tracking-tight leading-[1.1]">
            Every screen.<br />
            <span className="text-zinc-500">Every flow. One map.</span>
          </h1>
          <p className="text-zinc-500 text-lg leading-relaxed">
            Describe your app and get an interactive flow map of every screen — with live mockups you can edit with plain English.
          </p>
        </div>

        {/* Input */}
        <div className="space-y-3">
          <textarea
            ref={textareaRef}
            className="w-full bg-zinc-900 border border-zinc-700 focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 text-white placeholder:text-zinc-600 resize-none text-sm rounded-xl px-4 py-3.5 outline-none transition-all min-h-[120px]"
            placeholder="e.g. A fitness app where users track workouts, get AI-generated plans, and see progress over time. Includes social features and a nutrition tracker."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate();
            }}
            disabled={isGenerating}
          />

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            onClick={handleGenerate}
            disabled={!text.trim() || isGenerating}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white h-12 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2.5"
          >
            {isGenerating ? (
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

          <p className="text-zinc-700 text-xs text-center">⌘ + Enter to generate</p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-zinc-800" />
          <span className="text-zinc-700 text-xs">or try the demo</span>
          <div className="flex-1 h-px bg-zinc-800" />
        </div>

        {/* Demo CTA */}
        <button
          onClick={() => setAppMap(DEMO_MAP)}
          disabled={isGenerating}
          className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 disabled:opacity-40 text-zinc-300 h-12 text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2.5"
        >
          <span className="text-base">⚡</span>
          Pulse — AI Fitness Demo
          <span className="text-zinc-600 text-xs ml-1">15 screens · 4 journeys</span>
        </button>

      </div>
    </div>
  );
}
