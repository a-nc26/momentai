import { transformSync } from '@babel/core';

/**
 * Transpiles JSX component code to plain JS on the server so the preview
 * iframe never needs to download or run Babel (~2MB saved per preview).
 */
export function transpileComponent(jsxCode: string): string {
  const result = transformSync(jsxCode, {
    presets: [['@babel/preset-react', { runtime: 'classic' }]],
    filename: 'component.jsx',
  });
  if (!result?.code) throw new Error('Babel transpile returned empty output');
  return result.code;
}
