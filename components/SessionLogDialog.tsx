'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  clearSessionLog,
  formatSessionLogText,
  getSessionLogEntries,
  startConsoleCapture,
} from '@/lib/session-log';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function SessionLogDialog({ open, onOpenChange }: Props) {
  const [text, setText] = useState('');
  const [verbose, setVerbose] = useState(false);
  const [copied, setCopied] = useState(false);

  const refresh = useCallback(() => {
    setText(formatSessionLogText());
  }, []);

  useEffect(() => {
    if (!open) return;
    refresh();
    const id = setInterval(refresh, 2000);
    return () => clearInterval(id);
  }, [open, refresh]);

  useEffect(() => {
    if (verbose && open) {
      startConsoleCapture();
    }
  }, [verbose, open]);

  const copy = useCallback(() => {
    const payload = formatSessionLogText();
    void navigator.clipboard.writeText(payload).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  const download = useCallback(() => {
    const blob = new Blob([formatSessionLogText()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `momentai-session-log-${new Date().toISOString().slice(0, 19)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const clear = useCallback(() => {
    clearSessionLog();
    refresh();
  }, [refresh]);

  const lineCount = getSessionLogEntries().length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col gap-3">
        <DialogHeader>
          <DialogTitle>Session log</DialogTitle>
          <DialogDescription>
            Copy this text when reporting an issue ({lineCount} entries). Errors, failed edits, and
            build token usage (per screen and total) are captured automatically. Verbose mode also
            mirrors the browser console (noisy).
          </DialogDescription>
        </DialogHeader>

        <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer select-none">
          <input
            type="checkbox"
            className="rounded border-zinc-600"
            checked={verbose}
            onChange={(e) => setVerbose(e.target.checked)}
          />
          Include console output (verbose)
        </label>

        <textarea
          readOnly
          className="flex-1 min-h-[240px] max-h-[50vh] w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-[11px] font-mono text-zinc-300 leading-relaxed resize-y"
          value={text}
          spellCheck={false}
        />

        <div className="flex flex-wrap gap-2 justify-end">
          <button
            type="button"
            onClick={refresh}
            className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-zinc-200"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={clear}
            className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-zinc-200"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={download}
            className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-300 hover:text-white"
          >
            Download .txt
          </button>
          <button
            type="button"
            onClick={copy}
            className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            {copied ? 'Copied' : 'Copy all'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
