import { NextRequest } from 'next/server';
import { getPublishedRuntimeApp } from '@/lib/runtime-backend';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const appId = searchParams.get('appId') ?? '';
    const publishToken = searchParams.get('publishToken') ?? '';

    if (!appId || !publishToken) {
      return Response.json({ error: 'appId and publishToken required' }, { status: 400 });
    }

    const appMap = await getPublishedRuntimeApp({ appId, publishToken });
    return Response.json({ appMap });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Published app load failed';
    const status = /invalid publish token/i.test(message) ? 401 : 500;
    return Response.json({ error: message }, { status });
  }
}
