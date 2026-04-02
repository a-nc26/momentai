/**
 * Transpiles JSX component code to plain JS on the server.
 * Falls back to returning raw JSX if Babel is unavailable (client will handle it).
 */
export function transpileComponent(jsxCode: string): string {
  try {
    // Dynamic import to handle Vercel serverless edge cases
    const { transformSync } = require('@babel/core');
    const result = transformSync(jsxCode, {
      presets: [['@babel/preset-react', { runtime: 'classic' }]],
      filename: 'component.jsx',
    });
    if (!result?.code) throw new Error('Babel transpile returned empty output');
    return result.code;
  } catch (err: any) {
    // If Babel is unavailable (Vercel serverless edge case), return raw JSX
    // Client-side Babel in the iframe shell will handle transpilation
    if (err.code === 'MODULE_NOT_FOUND' || err.message?.includes('Cannot find module')) {
      console.warn('[transpile] Babel unavailable, sending raw JSX to client:', err.message);
      return jsxCode;
    }
    // Re-throw actual transpilation errors
    throw err;
  }
}
