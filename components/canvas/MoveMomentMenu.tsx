'use client';

import { useMemo } from 'react';
import {
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { useMomentaiStore } from '@/lib/store';

export default function MoveMomentMenu({ momentId }: { momentId: string }) {
  const { appMap, moveMomentToJourney, recordProjectRevision } = useMomentaiStore();

  const current = useMemo(
    () => appMap?.moments.find((moment) => moment.id === momentId) ?? null,
    [appMap, momentId]
  );

  if (!appMap || !current) return null;

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>Move to journey</DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuLabel>Journeys</DropdownMenuLabel>
        {appMap.journeys.map((journey) => {
          const isCurrent = journey.id === current.journeyId;
          return (
            <DropdownMenuItem
              key={journey.id}
              disabled={isCurrent}
              onSelect={() => {
                if (isCurrent) return;
                moveMomentToJourney(momentId, journey.id);
                recordProjectRevision(`Move "${current.label}" to ${journey.name}`);
              }}
            >
              <span className="flex-1 truncate">{journey.name}</span>
              {isCurrent && <span className="ml-2 text-[10px] text-zinc-500">current</span>}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
