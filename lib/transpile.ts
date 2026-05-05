/**
 * Validates that a JS string parses without syntax errors.
 * Runs on the server before sending code to the client so broken output
 * is caught early instead of silently crashing in the preview iframe.
 */
export function validateJsSyntax(code: string): void {
  try {
    new Function(code);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Generated code has a syntax error: ${msg}`);
  }
}

/**
 * Transpiles JSX component code to plain JS on the server.
 * Falls back to returning raw JSX if Babel is unavailable (client will handle it).
 * Always validates the output parses as JS before returning.
 */
export function transpileComponent(jsxCode: string): string {
  let code: string;
  try {
    const { transformSync } = require('@babel/core');
    const result = transformSync(jsxCode, {
      presets: [['@babel/preset-react', { runtime: 'classic' }]],
      filename: 'component.jsx',
    });
    if (!result?.code) throw new Error('Babel transpile returned empty output');
    code = result.code;
  } catch (err: any) {
    if (err.code === 'MODULE_NOT_FOUND' || err.message?.includes('Cannot find module')) {
      console.warn('[transpile] Babel unavailable, sending raw code to client:', err.message);
      code = jsxCode;
    } else {
      throw err;
    }
  }

  validateJsSyntax(code);
  return code;
}
