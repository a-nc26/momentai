import { NextRequest } from 'next/server';
import { rotatePublishToken } from '@/lib/runtime-backend';

export async function POST(req: NextRequest) {
  try {
    const { appId, publishToken } = await req.json();
    if (!appId || !publishToken) {
      return Response.json({ error: 'appId and publishToken required' }, { status: 400 });
    }

    const rotated = await rotatePublishToken({ appId, publishToken });
    return Response.json({
      ...rotated,
      backend: {
        appId: rotated.appId,
        publishToken: rotated.publishToken,
        tokenVersion: rotated.tokenVersion,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Rotate token failed';
    const status = /invalid publish token/i.test(message) ? 401 : 500;
    return Response.json({ error: message }, { status });
  }
}
