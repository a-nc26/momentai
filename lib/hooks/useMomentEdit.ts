import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { requestEditMoment, requestPropagateBatch } from '@/lib/apply-moment-edit';
import { prefixEditChange, type EditScopeId } from '@/lib/edit-scope';
import { useMomentaiStore, type CascadeDecision, type PendingCascade } from '@/lib/store';
import { clearCascadeResolver, registerCascadeResolver } from '@/lib/cascade-bridge';
import { sessionLog } from '@/lib/session-log';
import type { Moment } from '@/lib/types';
import { markDemoEditConsumed } from '@/lib/demo-edit-session';

type ApplyMomentEditOptions = {
  moment: Moment;
  changeText: string;
  scope: EditScopeId | null;
  customScope?: string;
  resetAfterSuccess?: () => void;
  onError?: (message: string) => void;
  onCascadeState?: (state: { active: boolean; count: number }) => void;
};

type UseMomentEditResult = {
  applyEdit: (options: ApplyMomentEditOptions) => Promise<void>;
  cancelEdit: (momentId: string) => void;
  editingMoments: string[];
  isEditingMoment: (momentId: string) => boolean;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
};

async function logEditEvent(payload: Record<string, unknown>) {
  const action = typeof payload.action === 'string' ? payload.action : 'edit_event';
  sessionLog('edit', action, payload, 'debug');
  try {
    await fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        level: 'debug',
        tag: 'edit',
        message: 'moment-edit',
        data: payload,
      }),
    });
  } catch {
    // Never let telemetry fail the user flow.
  }
}

export function useMomentEdit(): UseMomentEditResult {
  const [controllers, setControllers] = useState<Record<string, AbortController>>({});
  const {
    appMap,
    startEditingMoment,
    endEditingMoment,
    editingMomentIds,
    applyMomentEdit,
    flagMoments,
    clearFlags,
    batchUpdateMoments,
    addMoments,
    recordEditHistory,
    undoEdit,
    redoEdit,
    editHistory,
    editHistoryIndex,
    setPendingCascade,
  } = useMomentaiStore();

  const appMapRef = useRef(appMap);
  appMapRef.current = appMap;

  const applyEdit = useCallback(
    async ({
      moment,
      changeText,
      scope,
      customScope,
      resetAfterSuccess,
      onError,
      onCascadeState,
    }: ApplyMomentEditOptions) => {
      if (!appMapRef.current) return;
      const activeMap = appMapRef.current;
      const journey = activeMap.journeys.find((entry) => entry.id === moment.journeyId);
      if (!journey) {
        onError?.('Missing journey context for edit.');
        return;
      }
      if (!changeText.trim()) return;
      if (editingMomentIds.includes(moment.id)) return;

      const changed = prefixEditChange(scope, changeText, customScope);
      const buildPlaceholderMoment = (id: string): Moment => ({
        id,
        journeyId: journey.id,
        label: id
          .split('-')
          .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
          .join(' '),
        description: 'Planned downstream screen from the accepted cascade.',
        type: 'ui',
        preview: 'Generated during demo cascade.',
        position: {
          x: moment.position.x + 280,
          y: moment.position.y + 220,
        },
      });
      const editController = new AbortController();
      setControllers((prev) => ({ ...prev, [moment.id]: editController }));

      const beforeSnapshot: Record<string, Partial<Moment>> = {
        [moment.id]: {
          componentCode: moment.componentCode ?? '',
          screenSpec: moment.screenSpec,
          label: moment.label,
          description: moment.description,
          preview: moment.preview,
        },
      };

      startEditingMoment(moment.id);
      onCascadeState?.({ active: false, count: 0 });
      const progressToast = toast.loading('Applying edit…');
      const startedAt = Date.now();
      try {
        const result = await requestEditMoment({
          moment,
          change: changed,
          journey,
          appMap: activeMap,
          signal: editController.signal,
        });
        if (!result.ok) {
          toast.dismiss(progressToast);
          onError?.(result.error);
          toast.error(result.error, { description: result.suggestion });
          await logEditEvent({
            action: 'edit_failed',
            momentId: moment.id,
            durationMs: Date.now() - startedAt,
            code: result.code,
            retryable: result.retryable,
          });
          return;
        }

        applyMomentEdit(
          moment.id,
          {
            componentCode: result.componentCode,
            metadata: result.metadata,
          },
          { clearScreenSpec: true }
        );
        resetAfterSuccess?.();

        const currentAfterMoment = appMapRef.current?.moments.find((entry) => entry.id === moment.id);
        const afterSnapshot: Record<string, Partial<Moment>> = {
          [moment.id]: {
            componentCode: currentAfterMoment?.componentCode ?? result.componentCode,
            screenSpec: currentAfterMoment?.screenSpec,
            label: currentAfterMoment?.label ?? result.metadata?.label ?? moment.label,
            description:
              currentAfterMoment?.description ?? result.metadata?.description ?? moment.description,
            preview: currentAfterMoment?.preview ?? result.metadata?.preview ?? moment.preview,
          },
        };

        const affectedMoments = result.affectedMoments ?? {};
        const ids = Object.keys(affectedMoments);
        if (ids.length > 0) {
          flagMoments(affectedMoments);

          const cascadeId = `cascade-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
          const cascade: PendingCascade = {
            id: cascadeId,
            editedMomentId: moment.id,
            editedLabel: moment.label,
            changeSummary: changed.length > 120 ? `${changed.slice(0, 120)}…` : changed,
            items: ids
              .map((id) => {
                const target = activeMap.moments.find((entry) => entry.id === id);
                if (!target) {
                  return {
                    momentId: id,
                    label: id
                      .split('-')
                      .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
                      .join(' '),
                    reason: affectedMoments[id],
                    hasComponentCode: false,
                  };
                }
                return {
                  momentId: id,
                  label: target.label,
                  reason: affectedMoments[id],
                  hasComponentCode: !!target.componentCode,
                };
              })
              .filter((item): item is NonNullable<typeof item> => !!item),
          };

          const decision = await new Promise<CascadeDecision>((resolve) => {
            registerCascadeResolver(cascadeId, resolve);
            setPendingCascade(cascade);
          });
          setPendingCascade(null);
          clearCascadeResolver(cascadeId);

          if (decision.action === 'undo') {
            const rollbackMoment = beforeSnapshot[moment.id];
            applyMomentEdit(
              moment.id,
              {
                componentCode: rollbackMoment.componentCode ?? '',
                metadata: {
                  label: rollbackMoment.label,
                  description: rollbackMoment.description,
                  preview: rollbackMoment.preview,
                  screenSpec: rollbackMoment.screenSpec,
                },
              },
              { clearScreenSpec: false }
            );
            toast.dismiss(progressToast);
            toast.message('Edit reverted');
            return;
          }

          if (decision.action === 'skip' || decision.acceptedMomentIds.length === 0) {
            toast.dismiss(progressToast);
            toast.success('Edit applied', { description: 'Cascade skipped — connected screens still flagged.' });
            recordEditHistory({
              label: changed.length > 120 ? `${changed.slice(0, 120)}…` : changed,
              before: beforeSnapshot,
              after: afterSnapshot,
            });
            await logEditEvent({
              action: 'edit_success_skipped_cascade',
              momentId: moment.id,
              durationMs: Date.now() - startedAt,
              affectedCount: ids.length,
              propagatedCount: 0,
            });
            if (appMapRef.current?.demoMode) {
              markDemoEditConsumed();
            }
            return;
          }

          const acceptedIds = decision.acceptedMomentIds;
          onCascadeState?.({ active: true, count: acceptedIds.length });
          const propagateController = new AbortController();
          setControllers((prev) => ({ ...prev, [moment.id]: propagateController }));
          const batch = await requestPropagateBatch(
            {
              items: acceptedIds
                .map((id) => ({
                  moment:
                    activeMap.moments.find((entry) => entry.id === id) ??
                    buildPlaceholderMoment(id),
                  reason: affectedMoments[id],
                }))
                .filter((entry): entry is { moment: Moment; reason: string } => !!entry.moment),
              editChange: changed,
              editedMoment: moment,
              journey,
              appMap: activeMap,
            },
            propagateController.signal
          );

            const hasErrors = !!(batch.errors && Object.keys(batch.errors).length > 0);
            if (hasErrors) {
              // Atomic mode: rollback if propagation fails.
              const rollbackMoment = beforeSnapshot[moment.id];
              applyMomentEdit(
                moment.id,
                {
                  componentCode: rollbackMoment.componentCode ?? '',
                  metadata: {
                    label: rollbackMoment.label,
                    description: rollbackMoment.description,
                    preview: rollbackMoment.preview,
                    screenSpec: rollbackMoment.screenSpec,
                  },
                },
                { clearScreenSpec: false }
              );
              toast.dismiss(progressToast);
              toast.error('Propagation failed. Rolling back edit to keep state consistent.');
              await logEditEvent({
                action: 'edit_rollback',
                momentId: moment.id,
                durationMs: Date.now() - startedAt,
                affectedCount: ids.length,
                propagatedCount: 0,
              });
              return;
            }

          if (batch.updates && Object.keys(batch.updates).length > 0) {
            const beforeCascade: Record<string, Partial<Moment>> = {};
            for (const id of Object.keys(batch.updates)) {
              const existing = appMapRef.current?.moments.find((entry) => entry.id === id);
              if (!existing) continue;
              beforeCascade[id] = {
                label: existing.label,
                description: existing.description,
                preview: existing.preview,
                componentCode: existing.componentCode,
                screenSpec: existing.screenSpec,
              };
            }
            batchUpdateMoments(batch.updates);
            clearFlags(Object.keys(batch.updates));

            for (const [id, patch] of Object.entries(batch.updates)) {
              const existingAfter = appMapRef.current?.moments.find((entry) => entry.id === id);
              if (!existingAfter) continue;
              afterSnapshot[id] = {
                label: existingAfter.label,
                description: existingAfter.description,
                preview: existingAfter.preview,
                componentCode: existingAfter.componentCode,
                screenSpec: existingAfter.screenSpec,
              };
              if (!beforeSnapshot[id]) beforeSnapshot[id] = beforeCascade[id] ?? {};
              if (!afterSnapshot[id]) afterSnapshot[id] = patch;
            }
          }

          if (batch.additions && batch.additions.moments.length > 0) {
            addMoments(batch.additions.moments, batch.additions.edges);
            for (const added of batch.additions.moments) {
              beforeSnapshot[added.id] = {};
              afterSnapshot[added.id] = {
                label: added.label,
                description: added.description,
                preview: added.preview,
                componentCode: added.componentCode,
                screenSpec: added.screenSpec,
              };
            }
          }
        }

        recordEditHistory({
          label: changed.length > 120 ? `${changed.slice(0, 120)}…` : changed,
          before: beforeSnapshot,
          after: afterSnapshot,
        });
        if (appMapRef.current?.demoMode) {
          markDemoEditConsumed();
        }

        toast.dismiss(progressToast);
        toast.success('Edit applied', {
          description: ids.length > 0 ? `Updated ${ids.length} connected screen(s).` : 'Screen updated.',
        });
        await logEditEvent({
          action: 'edit_success',
          momentId: moment.id,
          durationMs: Date.now() - startedAt,
          affectedCount: ids.length,
          propagatedCount: ids.length,
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          toast.dismiss(progressToast);
          toast.message('Edit cancelled');
          return;
        }
        console.error(error);
        const message = error instanceof Error ? error.message : 'Edit failed';
        onError?.(message);
        toast.dismiss(progressToast);
        toast.error(message);
      } finally {
        endEditingMoment(moment.id);
        onCascadeState?.({ active: false, count: 0 });
        setControllers((prev) => {
          const next = { ...prev };
          delete next[moment.id];
          return next;
        });
      }
    },
    [
      applyMomentEdit,
      addMoments,
      batchUpdateMoments,
      clearFlags,
      editingMomentIds,
      endEditingMoment,
      flagMoments,
      recordEditHistory,
      setPendingCascade,
      startEditingMoment,
    ]
  );

  const cancelEdit = useCallback(
    (momentId: string) => {
      const controller = controllers[momentId];
      if (controller) {
        controller.abort();
      }
    },
    [controllers]
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const mac = navigator.platform.toLowerCase().includes('mac');
      if ((mac ? event.metaKey : event.ctrlKey) && event.key.toLowerCase() === 'z' && !event.shiftKey) {
        event.preventDefault();
        undoEdit();
      }
      if (
        (mac ? event.metaKey : event.ctrlKey) &&
        ((event.key.toLowerCase() === 'z' && event.shiftKey) || event.key.toLowerCase() === 'y')
      ) {
        event.preventDefault();
        redoEdit();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [redoEdit, undoEdit]);

  const isEditingMoment = useCallback(
    (momentId: string) => editingMomentIds.includes(momentId),
    [editingMomentIds]
  );

  const canUndo = useMemo(() => editHistoryIndex >= 0, [editHistoryIndex]);
  const canRedo = useMemo(
    () => editHistoryIndex < editHistory.length - 1,
    [editHistory.length, editHistoryIndex]
  );

  return {
    applyEdit,
    cancelEdit,
    editingMoments: editingMomentIds,
    isEditingMoment,
    canUndo,
    canRedo,
    undo: undoEdit,
    redo: redoEdit,
  };
}
