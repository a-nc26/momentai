'use client';

import { Handle, Position, NodeProps } from '@xyflow/react';
import { Moment } from '@/lib/types';
import { getMomentNodeDimensions } from '@/lib/canvasLayout';
import NodeActionMenu from './canvas/NodeActionMenu';

const TYPE_ICONS: Record<string, string> = {
  ui: '🖥',
  ai: '✦',
  data: '⬡',
  auth: '⬡',
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
  editing?: boolean;
  buildStatus?: 'idle' | 'building' | 'done' | 'error';
  viewMode?: 1 | 2 | 3 | 4;
  zoomLevel?: 1 | 2 | 3 | 4;
};

function collectStateKeys(moment: Moment): string[] {
  const keys = new Set<string>();
  const comps = moment.screenSpec?.components ?? [];
  for (const c of comps as { key?: string }[]) {
    if (c.key) keys.add(c.key);
  }
  for (const a of moment.screenSpec?.actions ?? []) {
    if (a.requiredKeys) a.requiredKeys.forEach((k) => keys.add(k));
  }
  return [...keys].slice(0, 12);
}

function CardChrome({
  children,
  className,
  style,
  selected,
}: {
  children: React.ReactNode;
  className?: string;
  style: React.CSSProperties;
  selected?: boolean;
}) {
  const h =
    '!border-zinc-500 !w-1.5 !h-1.5 !bg-zinc-600 opacity-80 hover:opacity-100 transition-opacity';
  return (
    <div
      className={`relative rounded-xl cursor-pointer select-none transition-all duration-300 ease-out hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.45)] hover:ring-1 hover:ring-zinc-500/30 ${selected ? 'shadow-[0_0_28px_-6px_rgba(99,102,241,0.35)]' : ''} ${className ?? ''}`}
      style={style}
    >
      {/* Spatial handles: edges pick sides from relative node positions (see lib/edge-spatial). */}
      <Handle id="in-top" type="target" position={Position.Top} className={h} style={{ left: '38%' }} />
      <Handle id="out-top" type="source" position={Position.Top} className={h} style={{ left: '62%' }} />
      <Handle id="in-right" type="target" position={Position.Right} className={h} style={{ top: '38%' }} />
      <Handle id="out-right" type="source" position={Position.Right} className={h} style={{ top: '62%' }} />
      <Handle id="in-bottom" type="target" position={Position.Bottom} className={h} style={{ left: '38%' }} />
      <Handle id="out-bottom" type="source" position={Position.Bottom} className={h} style={{ left: '62%' }} />
      <Handle id="in-left" type="target" position={Position.Left} className={h} style={{ top: '38%' }} />
      <Handle id="out-left" type="source" position={Position.Left} className={h} style={{ top: '62%' }} />
      {children}
    </div>
  );
}

/** Journey — compact scan */
function MomentNodeJourney({
  moment,
  color,
  journeyName,
  flagged,
  active,
  selected,
}: {
  moment: Moment;
  color: string;
  journeyName: string;
  flagged?: boolean;
  active?: boolean;
  selected?: boolean;
}) {
  const isActive = active && !selected;
  return (
    <CardChrome
      className="w-[142px] bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800/80 shadow-lg"
      selected={selected}
      style={{
        borderLeft: `3px solid ${flagged ? '#f59e0b' : color}`,
        outline: selected ? `2px solid ${color}` : isActive ? `1px solid ${color}` : '1px solid transparent',
        outlineOffset: '1px',
        transform: selected ? 'scale(1.02)' : undefined,
      }}
    >
      <div className="px-2 py-2">
        <p className="text-[7px] font-semibold uppercase tracking-wider truncate mb-1" style={{ color: flagged ? '#f59e0b' : color }}>
          {journeyName}
        </p>
        <div className="flex items-start gap-1">
          <span className="text-sm shrink-0 leading-none">{TYPE_ICONS[moment.type] ?? '◆'}</span>
          <h3 className="text-white font-semibold text-[10px] leading-tight line-clamp-3">{moment.label}</h3>
        </div>
      </div>
    </CardChrome>
  );
}

/** Screens + optional Data flow block in one card */
function MomentNodeScreens({
  moment,
  color,
  journeyName,
  flagged,
  flagReason,
  hasSubflow,
  subflowCount,
  branchCount,
  active,
  editing,
  buildStatus,
  selected,
  dataFlowMode,
  viewMode,
}: {
  moment: Moment;
  color: string;
  journeyName: string;
  flagged?: boolean;
  flagReason?: string;
  hasSubflow?: boolean;
  subflowCount?: number;
  branchCount?: number;
  active?: boolean;
  editing?: boolean;
  buildStatus?: 'idle' | 'building' | 'done' | 'error';
  selected?: boolean;
  dataFlowMode?: boolean;
  viewMode: 1 | 2 | 3 | 4;
}) {
  const isActive = active && !selected;
  const components = moment.screenSpec?.components ?? [];
  const hasCode = !!moment.componentCode;
  const stateKeys = collectStateKeys(moment);
  const actions = moment.screenSpec?.actions ?? [];
  const { h: maxCardHeight } = getMomentNodeDimensions(viewMode);

  return (
    <CardChrome
      className={`w-[220px] border shadow-xl ${
        dataFlowMode
          ? 'bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 border-indigo-500/25 ring-1 ring-indigo-500/10'
          : 'bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 border-zinc-800/90'
      }`}
      selected={selected}
      style={{
        borderLeft: `3px solid ${flagged ? '#f59e0b' : color}`,
        outline: flagged ? '1px solid #f59e0b' : selected ? `2px solid ${color}` : isActive ? `1px solid ${color}` : '1px solid transparent',
        outlineOffset: '1px',
        transform: selected ? 'scale(1.01)' : undefined,
        maxHeight: maxCardHeight,
        overflow: 'hidden',
      }}
    >
      <div
        className="group p-2.5 space-y-1.5 overflow-y-auto overflow-x-hidden overscroll-contain relative"
        style={{ maxHeight: maxCardHeight }}
      >
        <div className="flex items-center justify-between gap-1">
          <span className="text-[8px] font-medium uppercase tracking-wider truncate" style={{ color: flagged ? '#f59e0b' : color }}>
            {journeyName}
          </span>
          <span className="text-[8px] text-zinc-500 shrink-0 font-mono">{TYPE_ICONS[moment.type] ?? '◆'} {moment.type}</span>
        </div>

        <div
          className={`absolute right-2 top-2 flex items-center transition-opacity ${
            selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <NodeActionMenu
            momentId={moment.id}
            trigger={
              <button
                type="button"
                onClick={(event) => event.stopPropagation()}
                className="rounded-md border border-zinc-700 bg-zinc-900/90 text-zinc-300 hover:text-white hover:border-zinc-500 px-1.5 py-0.5 text-[10px] leading-none"
                aria-label="Screen actions"
              >
                ⋯
              </button>
            }
          />
        </div>

        {editing && (
          <div className="flex items-center gap-1 text-[8px] text-indigo-300">
            <span className="w-2 h-2 rounded-full border border-indigo-300/40 border-t-indigo-300 animate-spin" />
            Editing…
          </div>
        )}

        {buildStatus === 'building' ? (
          <div className="flex items-center gap-1 text-[8px] text-indigo-400">
            <span className="w-2 h-2 rounded-full border border-indigo-400/40 border-t-indigo-400 animate-spin" />
            Building…
          </div>
        ) : buildStatus === 'done' ? (
          <div className="text-[8px] text-emerald-400">Built ✓</div>
        ) : buildStatus === 'error' ? (
          <div className="text-[8px] text-red-400">Build failed</div>
        ) : null}

        {flagged && flagReason && (
          <div className="text-[8px] text-amber-500/90 leading-snug bg-amber-500/5 border border-amber-500/15 rounded px-1.5 py-1">
            {flagReason}
          </div>
        )}

        <div>
          <h3 className="text-white font-semibold text-[12px] leading-tight mb-1">{moment.label}</h3>
          <p className="text-zinc-400 text-[9px] leading-snug line-clamp-4">{moment.description}</p>
        </div>

        <div className="flex flex-wrap gap-1">
          {hasSubflow && (
            <span className="inline-flex items-center gap-0.5 rounded-full border border-zinc-700 bg-zinc-950/80 px-1.5 py-0.5 text-[8px] text-zinc-400">
              <span className="w-1 h-1 rounded-full" style={{ backgroundColor: color }} />
              Sub {subflowCount}
            </span>
          )}
          {(branchCount ?? 0) > 0 && (
            <span className="inline-flex items-center gap-0.5 rounded-full border border-zinc-700 bg-zinc-950/80 px-1.5 py-0.5 text-[8px] text-zinc-400">
              Branches {branchCount}
            </span>
          )}
          {hasCode && (
            <span
              title="Generated UI code is built for this screen and shown in the live preview."
              className="inline-flex items-center gap-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[8px] text-emerald-400"
            >
              Live preview
            </span>
          )}
        </div>

        {components.length > 0 && (
          <div className="border-t border-zinc-800 pt-1.5">
            <p className="text-[7px] uppercase tracking-wider text-zinc-500 mb-1">Screen structure</p>
            <div className="flex flex-wrap gap-0.5">
              {components.slice(0, 8).map((c, i) => (
                <span
                  key={c.id ?? i}
                  className="text-[7px] bg-zinc-800/80 text-zinc-300 px-1 py-0.5 rounded border border-zinc-700/80"
                >
                  {c.type}
                </span>
              ))}
              {components.length > 8 && <span className="text-[7px] text-zinc-500">+{components.length - 8}</span>}
            </div>
          </div>
        )}

        {dataFlowMode && (
          <div className="border-t border-indigo-500/25 pt-1.5 space-y-1 mt-0.5 rounded-b-lg">
            <p className="text-[7px] uppercase tracking-wider text-indigo-400 font-semibold">Data flow</p>
            {stateKeys.length > 0 && (
              <div>
                <p className="text-[7px] text-zinc-500 mb-0.5">State keys</p>
                <div className="flex flex-wrap gap-0.5">
                  {stateKeys.map((key) => (
                    <span
                      key={key}
                      className="text-[7px] bg-blue-500/15 text-blue-300 border border-blue-500/25 px-1 py-0.5 rounded font-mono"
                    >
                      {key}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {actions.length > 0 && (
              <div>
                <p className="text-[7px] text-zinc-500 mb-0.5">Actions</p>
                <ul className="text-[8px] text-zinc-400 space-y-1">
                  {actions.slice(0, 6).map((a) => (
                    <li key={a.id} className="leading-snug break-words">
                      <span className="text-zinc-300">{a.label}</span>
                      {a.target && <span className="text-zinc-500"> → {a.target}</span>}
                      {a.kind && <span className="text-zinc-600"> · {a.kind}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {stateKeys.length === 0 && actions.length === 0 && (
              <p className="text-[8px] text-zinc-500">No structured flow metadata on this screen yet.</p>
            )}
          </div>
        )}
      </div>
    </CardChrome>
  );
}

export default function MomentNode({ data, selected }: NodeProps) {
  const d = data as MomentNodeData;
  const viewMode = d.viewMode ?? d.zoomLevel ?? 3;

  const common = {
    moment: d.moment,
    color: d.color,
    journeyName: d.journeyName,
    flagged: d.flagged,
    flagReason: d.flagReason,
    hasSubflow: d.hasSubflow,
    subflowCount: d.subflowCount,
    branchCount: d.branchCount,
    active: d.active,
    editing: d.editing,
    buildStatus: d.buildStatus,
    selected,
  };

  if (viewMode === 2) {
    return <MomentNodeJourney {...common} />;
  }

  return (
    <MomentNodeScreens {...common} dataFlowMode={viewMode === 4} viewMode={viewMode} />
  );
}
