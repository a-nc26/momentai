import { NextRequest } from 'next/server';
import { loadRuntimeState } from '@/lib/runtime-backend';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const appId = searchParams.get('appId') ?? '';
    const publishToken = searchParams.get('publishToken') ?? '';
    const guestId = searchParams.get('guestId') ?? '';

    if (!appId || !publishToken || !guestId) {
      return Response.json(
        { error: 'appId, publishToken and guestId required' },
        { status: 400 }
      );
    }

    const state = await loadRuntimeState({ appId, publishToken, guestId });
    return Response.json({ state });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Runtime state failed';
    const status = /invalid publish token/i.test(message) ? 401 : 500;
    return Response.json({ error: message }, { status });
  }
}
