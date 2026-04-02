'use client';

import { EdgeProps, getBezierPath, EdgeLabelRenderer, BaseEdge } from '@xyflow/react';
import { FlowEdge } from '@/lib/types';

export default function DataFlowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
  style,
  selected,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const zoomLevel = (data?.zoomLevel as number) ?? 3;
  const edgeData = data as FlowEdge | undefined;
  const showDataFlow = zoomLevel >= 4 && (edgeData?.dataFlow || edgeData?.condition);

  // Determine color based on journey connection
  const isCrossJourney = style?.stroke === '#6366f1';
  const baseColor = isCrossJourney ? '#6366f1' : '#71717a';
  const edgeColor = selected ? '#60a5fa' : baseColor;
  const edgeOpacity = selected ? 1 : (isCrossJourney ? 0.5 : 0.3);

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: edgeColor,
          strokeWidth: selected ? 3 : (zoomLevel >= 3 ? 2 : 1.5),
          strokeOpacity: edgeOpacity,
        }}
      />
      
      {/* Animated flow indicator - only show at level 3+ and not when cluttered */}
      {zoomLevel >= 3 && selected && (
        <circle r="4" fill="#60a5fa" opacity="0.8">
          <animateMotion dur="1.5s" repeatCount="indefinite" path={edgePath} />
        </circle>
      )}
      
      {showDataFlow && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="flex flex-col gap-1 max-w-[180px]"
          >
            {edgeData?.condition && (
              <div className="bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[9px] px-2 py-1 rounded-md font-mono whitespace-nowrap">
                {edgeData.condition}
              </div>
            )}
            
            {edgeData?.dataFlow?.stateChanges && edgeData.dataFlow.stateChanges.length > 0 && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-md px-2 py-1 space-y-0.5">
                <p className="text-[8px] uppercase tracking-wider text-blue-400/60 font-semibold">State</p>
                {edgeData.dataFlow.stateChanges.slice(0, 3).map((change, i) => (
                  <div key={i} className="text-[9px] text-blue-400 font-mono">
                    {change}
                  </div>
                ))}
                {edgeData.dataFlow.stateChanges.length > 3 && (
                  <div className="text-[8px] text-blue-400/50">
                    +{edgeData.dataFlow.stateChanges.length - 3} more
                  </div>
                )}
              </div>
            )}
            
            {edgeData?.dataFlow?.apiCalls && edgeData.dataFlow.apiCalls.length > 0 && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-md px-2 py-1 space-y-0.5">
                <p className="text-[8px] uppercase tracking-wider text-emerald-400/60 font-semibold">API</p>
                {edgeData.dataFlow.apiCalls.slice(0, 2).map((call, i) => (
                  <div key={i} className="text-[9px] text-emerald-400 font-mono">
                    {call}
                  </div>
                ))}
              </div>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
