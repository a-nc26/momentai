/** Optional scope lines prefixed to edit-moment requests (UI chips). */
export type EditScopeId = 'amounts' | 'headlines' | 'buttons' | 'layout';

export const EDIT_SCOPE_PREFIXES: Record<EditScopeId, string> = {
  amounts: '[Scope: amounts / currency]\n',
  headlines: '[Scope: headlines / titles / eyebrow]\n',
  buttons: '[Scope: buttons / actions / CTAs]\n',
  layout: '[Scope: layout / spacing / hierarchy]\n',
};

export const EDIT_SCOPE_CHIPS: { id: EditScopeId; label: string }[] = [
  { id: 'amounts', label: 'Amounts / currency' },
  { id: 'headlines', label: 'Headlines' },
  { id: 'buttons', label: 'Buttons' },
  { id: 'layout', label: 'Layout' },
];

export function prefixEditChange(
  scope: EditScopeId | null,
  text: string,
  customScope?: string
): string {
  const t = text.trim();
  const customPrefix = customScope?.trim()
    ? `[Scope: ${customScope.trim()}]\n`
    : '';
  if (!scope) return `${customPrefix}${t}`.trim();
  return `${customPrefix}${EDIT_SCOPE_PREFIXES[scope]}${t}`.trim();
}
