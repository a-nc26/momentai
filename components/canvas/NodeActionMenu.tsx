'use client';

import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import MoveMomentMenu from './MoveMomentMenu';
import AddScreenPopover from './AddScreenPopover';
import DeleteMomentDialog from './DeleteMomentDialog';
import { useMomentaiStore } from '@/lib/store';

export default function NodeActionMenu({
  momentId,
  trigger,
}: {
  momentId: string;
  trigger: React.ReactNode;
}) {
  const { appMap, selectMoment, setActiveMomentId, addMoments, recordProjectRevision } =
    useMomentaiStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const moment = appMap?.moments.find((entry) => entry.id === momentId);

  const duplicate = () => {
    if (!appMap || !moment) return;
    const newId = `${moment.id}-copy-${Date.now().toString(36).slice(-4)}`;
    const duplicated = {
      ...moment,
      id: newId,
      label: `${moment.label} (copy)`,
      position: { x: moment.position.x + 60, y: moment.position.y + 60 },
      componentCode: moment.componentCode,
    };
    addMoments([duplicated], []);
    recordProjectRevision(`Duplicate "${moment.label}"`);
    selectMoment(newId);
    setActiveMomentId(newId);
  };

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onSelect={() => {
              selectMoment(momentId);
              setActiveMomentId(momentId);
            }}
          >
            Edit this screen
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              setMenuOpen(false);
              setAddOpen(true);
            }}
          >
            Add screen after
          </DropdownMenuItem>
          <MoveMomentMenu momentId={momentId} />
          <DropdownMenuItem onSelect={duplicate}>Duplicate</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={(event) => {
              event.preventDefault();
              setMenuOpen(false);
              setDeleteOpen(true);
            }}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Anchored Add popover is controlled so it can open after menu close */}
      <AddScreenPopover
        sourceMomentId={momentId}
        open={addOpen}
        onOpenChange={setAddOpen}
        trigger={<span className="hidden" />}
      />

      <DeleteMomentDialog
        momentId={momentId}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}
