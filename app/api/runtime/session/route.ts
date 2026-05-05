import { NextRequest } from 'next/server';
import { createRuntimeSession } from '@/lib/runtime-backend';

export async function POST(req: NextRequest) {
  try {
    const { appId, publishToken, guestId } = await req.json();
    if (!appId || !publishToken) {
      return Response.json({ error: 'appId and publishToken required' }, { status: 400 });
    }

    const session = await createRuntimeSession({ appId, publishToken, guestId });
    return Response.json(session);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Runtime session failed';
    const status = /invalid publish token/i.test(message) ? 401 : 500;
    return Response.json({ error: message }, { status });
  }
}
