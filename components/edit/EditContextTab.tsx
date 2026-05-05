'use client';

import { useMomentaiStore } from '@/lib/store';
import type { Moment } from '@/lib/types';

export default function EditContextTab({ moment }: { moment: Moment }) {
  const { appMap, updateMoment } = useMomentaiStore();
  const journey = appMap?.journeys.find((entry) => entry.id === moment.journeyId);
  const incoming = (appMap?.edges ?? [])
    .filter((edge) => edge.target === moment.id)
    .map((edge) => appMap?.moments.find((entry) => entry.id === edge.source))
    .filter(Boolean) as Moment[];
  const outgoing = (appMap?.edges ?? [])
    .filter((edge) => edge.source === moment.id)
    .map((edge) => appMap?.moments.find((entry) => entry.id === edge.target))
    .filter(Boolean) as Moment[];

  return (
    <div className="space-y-4">
      <section>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
          Journey
        </p>
        <p className="text-zinc-300 text-xs">{journey?.name ?? '—'}</p>
      </section>

      <section>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
          Description
        </p>
        <p className="text-zinc-300 text-xs leading-relaxed">{moment.description}</p>
      </section>

      <section>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
          Flow
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-[10px] text-zinc-500">Comes from</p>
            {incoming.length === 0 ? (
              <p className="text-[11px] text-zinc-600">—</p>
            ) : (
              <ul className="mt-1 space-y-1">
                {incoming.map((entry) => (
                  <li
                    key={entry.id}
                    className="rounded-md border border-zinc-800 bg-zinc-900/60 px-2 py-1 text-[11px] text-zinc-300 truncate"
                  >
                    {entry.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <p className="text-[10px] text-zinc-500">Goes to</p>
            {outgoing.length === 0 ? (
              <p className="text-[11px] text-zinc-600">—</p>
            ) : (
              <ul className="mt-1 space-y-1">
                {outgoing.map((entry) => (
                  <li
                    key={entry.id}
                    className="rounded-md border border-zinc-800 bg-zinc-900/60 px-2 py-1 text-[11px] text-zinc-300 truncate"
                  >
                    {entry.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {(moment.type === 'ai' || !!moment.promptTemplate) && (
        <section>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-400 mb-1">
            AI prompt template
          </p>
          <AIPromptEditor moment={moment} onSave={(value) => updateMoment(moment.id, { promptTemplate: value })} />
        </section>
      )}
    </div>
  );
}

function AIPromptEditor({
  moment,
  onSave,
}: {
  moment: Moment;
  onSave: (value: string) => void;
}) {
  return <AIPromptEditorControlled initial={moment.promptTemplate ?? ''} onSave={onSave} />;
}

function AIPromptEditorControlled({
  initial,
  onSave,
}: {
  initial: string;
  onSave: (value: string) => void;
}) {
  const key = initial.length; // rerender when moment changes
  return <AIPromptEditorBody key={key} initial={initial} onSave={onSave} />;
}

import { useState } from 'react';

function AIPromptEditorBody({
  initial,
  onSave,
}: {
  initial: string;
  onSave: (value: string) => void;
}) {
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(false);
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-2">
      <textarea
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          setSaved(false);
        }}
        className="w-full bg-zinc-950 border border-zinc-800 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 text-zinc-200 text-[11px] font-mono leading-relaxed rounded-md px-2 py-1.5 resize-none outline-none min-h-[88px]"
        placeholder="You are a helpful assistant. Given {{userGoal}}, generate …"
      />
      <div className="mt-2 flex items-center justify-between">
        <span
          className={`text-[10px] transition-opacity ${saved ? 'text-emerald-400' : 'opacity-0'}`}
        >
          Saved
        </span>
        <button
          type="button"
          onClick={() => {
            onSave(value);
            setSaved(true);
          }}
          disabled={!value.trim()}
          className="rounded-md border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 px-2 py-0.5 text-[10px] text-violet-200 disabled:opacity-40"
        >
          Save prompt
        </button>
      </div>
    </div>
  );
}
