import { NextRequest, NextResponse } from 'next/server';
import type { AppMap, FlowEdge, Moment, MomentType } from '@/lib/types';
import { buildFallbackScreenSpec } from '@/lib/runtime';
import { requireBuildCredits } from '@/lib/build-access-server';
import { CREDIT_DEFAULT } from '@/lib/credit-costs';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 28);
}

function placeNewMoment(appMap: AppMap, journeyId: string, source?: Moment) {
  const siblings = appMap.moments.filter(
    (moment) => moment.journeyId === journeyId && !moment.parentMomentId && !moment.branchOf
  );
  if (siblings.length === 0) {
    return { x: source?.position.x ?? 240, y: source?.position.y ?? 160 };
  }
  const lane = siblings.reduce(
    (acc, moment) => ({
      maxX: Math.max(acc.maxX, moment.position.x),
      avgY: acc.avgY + moment.position.y,
    }),
    { maxX: -Infinity, avgY: 0 }
  );
  const avgY = lane.avgY / siblings.length;
  const x = lane.maxX + 280;
  const y = source ? source.position.y : avgY;
  return { x, y };
}

export async function POST(req: NextRequest) {
  const denied = await requireBuildCredits(req, CREDIT_DEFAULT);
  if (denied) return denied;
  try {
    const {
      appMap,
      journeyId,
      sourceMomentId,
      label,
      type,
    }: {
      appMap: AppMap;
      journeyId: string;
      sourceMomentId?: string;
      label?: string;
      type?: MomentType;
    } = await req.json();

    const journey = appMap.journeys.find((entry) => entry.id === journeyId);
    if (!journey) {
      return NextResponse.json(
        { error: 'Journey not found', code: 'JOURNEY_NOT_FOUND', retryable: false },
        { status: 400 }
      );
    }

    const source = sourceMomentId
      ? appMap.moments.find((entry) => entry.id === sourceMomentId)
      : undefined;
    const baseId = slugify(label?.trim() || 'new-screen') || 'new-screen';
    const uniqueId = `${baseId}-${Date.now().toString(36).slice(-5)}`;
    const momentType: MomentType = type ?? 'ui';
    const position = placeNewMoment(appMap, journeyId, source);
    const newMoment: Moment = {
      id: uniqueId,
      journeyId,
      label: label?.trim() || 'New Screen',
      description: 'Describe this screen, then use the Compose tab to shape it.',
      type: momentType,
      preview: 'A fresh screen has been added to this journey.',
      position,
      buildStatus: 'idle',
    };
    newMoment.screenSpec = buildFallbackScreenSpec(newMoment, {
      ...appMap,
      moments: [...appMap.moments, newMoment],
      edges: appMap.edges,
    });

    const edge: FlowEdge | null = source
      ? {
          id: `edge-${source.id}-${newMoment.id}`,
          source: source.id,
          target: newMoment.id,
          label: 'Continue',
        }
      : null;

    return NextResponse.json({ moment: newMoment, edge });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to add moment',
        code: 'ADD_MOMENT_FAILED',
        retryable: true,
      },
      { status: 500 }
    );
  }
}
