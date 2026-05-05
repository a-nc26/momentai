/**
 * Detects JSX/HTML-like angle-bracket tags in generated code (strings stripped)
 * so we can reject LLM output that would fail Babel or violate createElement-only policy.
 */
export function stripQuotedStrings(code: string): string {
  return code
    .replace(/'(?:\\.|[^'])*'/g, "''")
    .replace(/"(?:\\.|[^"])*"/g, '""')
    .replace(/`(?:\\.|[^`])*`/g, '``');
}

const JSX_LOOKS_LIKE =
  /<\s*\/?\s*(div|span|p|button|form|section|main|header|footer|Fragment|svg|path|Card|Button|Input|Select|Badge|Label|Textarea|Avatar|Tabs|Dialog|Sheet|Separator)\b/i;

export function likelyContainsJsx(code: string): boolean {
  return JSX_LOOKS_LIKE.test(stripQuotedStrings(code));
}
