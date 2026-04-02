'use client';

import { Handle, Position, NodeProps } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';
import { Moment } from '@/lib/types';

const TYPE_ICONS: Record<string, string> = {
  ui: '🖥',
  ai: '✦',
  data: '⬡',
  auth: '⬡',
};

const TYPE_LABELS: Record<string, string> = {
  ui: 'UI',
  ai: 'AI',
  data: 'Data',
  auth: 'Auth',
};

type MomentNodeData = {
  moment: Moment;
  color: string;
  journeyName: string;
  flagged?: boolean;
  flagReason?: string;
  hasSubflow?: boolean;
  subflowCount?: number;
  branchCount?: number;
  active?: boolean;
  buildStatus?: 'idle' | 'building' | 'done' | 'error';
  zoomLevel?: 1 | 2 | 3 | 4;
};

export default function MomentNode({ data, selected }: NodeProps) {
  const { moment, color, journeyName, flagged, flagReason, hasSubflow, subflowCount, branchCount, active, buildStatus, zoomLevel = 3 } = data as MomentNodeData;

  const isActive = active && !selected;

  // Compact mode for level 2
  if (zoomLevel === 2) {
    return (
      <div
        className="w-[120px] rounded-lg bg-zinc-900 shadow-lg transition-all duration-200 cursor-pointer select-none"
        style={{
          borderLeft: `2px solid ${flagged ? '#f59e0b' : color}`,
          outline: selected ? `2px solid ${color}` : '2px solid transparent',
          outlineOffset: '2px',
        }}
      >
        <Handle type="target" position={Position.Left} className="!bg-zinc-600 !border-zinc-500 !w-1.5 !h-1.5" />
        <div className="p-2">
          <div className="flex items-center gap-1">
            <span className="text-xs shrink-0">{TYPE_ICONS[moment.type] ?? '◆'}</span>
            <h3 className="text-white font-semibold text-[10px] leading-tight truncate flex-1">{moment.label}</h3>
            {flagged && <div className="w-1 h-1 rounded-full bg-amber-400 shrink-0" />}
          </div>
        </div>
        <Handle type="source" position={Position.Right} className="!bg-zinc-600 !border-zinc-500 !w-1.5 !h-1.5" />
      </div>
    );
  }

  // Expanded mode for level 4 - MORE COMPACT
  if (zoomLevel === 4) {
    const stateReads = moment.screenSpec?.components?.filter((c: any) => c.key).map((c: any) => c.key).slice(0, 3) ?? [];
    const hasCode = !!moment.componentCode;

    return (
      <div
        className="w-[200px] rounded-lg bg-zinc-900 shadow-xl transition-all duration-150 cursor-pointer select-none"
        style={{
          borderLeft: `2px solid ${flagged ? '#f59e0b' : color}`,
          outline: flagged ? '1px solid #f59e0b' : selected ? `1px solid ${color}` : isActive ? `1px solid ${color}` : '1px solid transparent',
          outlineOffset: '1px',
          transform: selected ? 'scale(1.01)' : undefined,
        }}
      >
        <Handle type="target" position={Position.Left} className="!bg-zinc-600 !border-zinc-500 !w-1.5 !h-1.5" />

        <div className="p-2.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-medium uppercase tracking-wider" style={{ color: flagged ? '#f59e0b' : color }}>{journeyName}</span>
            {buildStatus === 'building' ? (
              <span className="w-2 h-2 rounded-full border border-indigo-400/40 border-t-indigo-400 animate-spin" />
            ) : buildStatus === 'done' ? (
              <span className="text-[8px] text-emerald-400">✓</span>
            ) : buildStatus === 'error' ? (
              <span className="text-[8px] text-red-400">!</span>
            ) : flagged ? (
              <span className="text-[8px] text-amber-400">!</span>
            ) : isActive ? (
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: color }} />
            ) : null}
          </div>

          {flagged && flagReason && (
            <div className="text-[8px] text-amber-500/80 leading-snug bg-amber-500/5 border border-amber-500/10 rounded px-1.5 py-1 line-clamp-2">
              {flagReason}
            </div>
          )}

          <div className="flex items-start gap-1">
            <span className="text-xs mt-0.5 shrink-0">{TYPE_ICONS[moment.type] ?? '◆'}</span>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-[11px] leading-tight mb-0.5">{moment.label}</h3>
              <p className="text-zinc-500 text-[9px] leading-snug line-clamp-2">{moment.description}</p>
            </div>
          </div>

          {stateReads.length > 0 && (
            <div className="border-t border-zinc-800 pt-1">
              <div className="flex flex-wrap gap-0.5">
                {stateReads.map((key) => (
                  <span key={key} className="text-[7px] bg-blue-500/10 text-blue-400 border border-blue-500/15 px-1 py-0.5 rounded font-mono">{key}</span>
                ))}
              </div>
            </div>
          )}

          {hasCode && (
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-emerald-500" />
              <span className="text-[7px] text-zinc-500 uppercase tracking-wider">Built</span>
            </div>
          )}
        </div>

        <Handle type="source" position={Position.Right} className="!bg-zinc-600 !border-zinc-500 !w-1.5 !h-1.5" />
      </div>
    );
  }

  // Level 3 - MORE COMPACT
  return (
    <div
      className="w-[160px] rounded-lg bg-zinc-900 shadow-xl transition-all duration-150 cursor-pointer select-none"
      style={{
        borderLeft: `2px solid ${flagged ? '#f59e0b' : color}`,
        outline: flagged ? '1px solid #f59e0b' : selected ? `1px solid ${color}` : isActive ? `1px solid ${color}` : '1px solid transparent',
        outlineOffset: '1px',
        transform: selected ? 'scale(1.01)' : undefined,
      }}
    >
      <Handle type="target" position={Position.Left} className="!bg-zinc-600 !border-zinc-500 !w-1.5 !h-1.5" />

      <div className="p-2.5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[8px] font-medium uppercase tracking-wider" style={{ color: flagged ? '#f59e0b' : color }}>{journeyName}</span>
          {buildStatus === 'building' ? (
            <span className="w-2 h-2 rounded-full border border-indigo-400/40 border-t-indigo-400 animate-spin" />
          ) : buildStatus === 'done' ? (
            <span className="text-[8px] text-emerald-400">✓</span>
          ) : buildStatus === 'error' ? (
            <span className="text-[8px] text-red-400">!</span>
          ) : flagged ? (
            <span className="text-[8px] text-amber-400">!</span>
          ) : isActive ? (
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: color }} />
          ) : null}
        </div>

        {flagged && flagReason && (
          <div className="mb-1.5 text-[8px] text-amber-500/80 leading-snug line-clamp-2 bg-amber-500/5 border border-amber-500/10 rounded px-1.5 py-1">
            {flagReason}
          </div>
        )}

        <div className="flex items-start gap-1">
          <span className="text-xs mt-0.5 shrink-0">{TYPE_ICONS[moment.type] ?? '◆'}</span>
          <div>
            <h3 className="text-white font-semibold text-[11px] leading-tight mb-0.5">{moment.label}</h3>
            <p className="text-zinc-500 text-[9px] leading-snug line-clamp-2">{moment.description}</p>
            {hasSubflow && (
              <div className="mt-1 inline-flex items-center gap-0.5 rounded-full border border-zinc-700 bg-zinc-950/80 px-1 py-0.5 text-[8px] uppercase tracking-wider text-zinc-400">
                <span className="w-1 h-1 rounded-full" style={{ backgroundColor: color }} />
                {subflowCount}
              </div>
            )}
            {(branchCount ?? 0) > 0 && (
              <div className="mt-1 inline-flex items-center gap-0.5 rounded-full border border-zinc-700 bg-zinc-950/80 px-1 py-0.5 text-[8px] uppercase tracking-wider text-zinc-400">
                <svg width="7" height="7" viewBox="0 0 10 10" fill="none">
                  <path d="M5 1v4M2 8l3-3 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {branchCount}
              </div>
            )}
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Right" className="!bg-zinc-600 !border-zinc-500 !w-1.5 !h-1.5" />
    </div>
  );
}
