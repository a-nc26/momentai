'use client';

import { useMemo } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useMomentaiStore } from '@/lib/store';

export default function DeleteMomentDialog({
  momentId,
  open,
  onOpenChange,
}: {
  momentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { appMap, removeMoment, recordProjectRevision } = useMomentaiStore();

  const target = useMemo(
    () => (momentId ? appMap?.moments.find((moment) => moment.id === momentId) : null) ?? null,
    [appMap, momentId]
  );

  const incoming = useMemo(
    () => (target && appMap ? appMap.edges.filter((edge) => edge.target === target.id).length : 0),
    [appMap, target]
  );
  const outgoing = useMemo(
    () => (target && appMap ? appMap.edges.filter((edge) => edge.source === target.id).length : 0),
    [appMap, target]
  );

  if (!target) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete &quot;{target.label}&quot;?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove {incoming} incoming and {outgoing} outgoing edge
            {outgoing + incoming === 1 ? '' : 's'}. The screen&apos;s generated code and preview
            will be gone and cannot be restored without undo.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              removeMoment(target.id);
              recordProjectRevision(`Delete moment "${target.label}"`);
              onOpenChange(false);
            }}
          >
            Delete screen
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
