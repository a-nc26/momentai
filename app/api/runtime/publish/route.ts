import { NextRequest } from 'next/server';
import { publishGeneratedApp } from '@/lib/runtime-backend';
import type { AppMap } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { appMap } = (await req.json()) as { appMap?: AppMap };
    if (!appMap?.appName || !Array.isArray(appMap.moments) || !Array.isArray(appMap.edges)) {
      return Response.json({ error: 'Valid appMap required' }, { status: 400 });
    }

    const published = await publishGeneratedApp(appMap);
    return Response.json({
      ...published,
      backend: {
        appId: published.appId,
        publishToken: published.publishToken,
        tokenVersion: published.tokenVersion,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Publish failed';
    return Response.json({ error: message }, { status: 500 });
  }
}
