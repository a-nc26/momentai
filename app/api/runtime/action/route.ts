import { NextRequest } from 'next/server';
import { executeRuntimeAction } from '@/lib/runtime-backend';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      appId,
      publishToken,
      guestId,
      operation,
      namespace,
      key,
      value,
      resultKey,
    } = body;

    if (!appId || !publishToken || !guestId || !operation || !key) {
      return Response.json(
        { error: 'appId, publishToken, guestId, operation and key required' },
        { status: 400 }
      );
    }

    const result = await executeRuntimeAction({
      appId,
      publishToken,
      guestId,
      operation,
      namespace,
      key,
      value,
      resultKey,
    });

    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Runtime action failed';
    const status = /invalid publish token/i.test(message) ? 401 : 500;
    return Response.json({ error: message }, { status });
  }
}
