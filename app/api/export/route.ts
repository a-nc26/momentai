import { NextRequest, NextResponse } from 'next/server';
import AdmZip from 'adm-zip';
import { generateNextjsExport } from '@/lib/export-nextjs';
import { AppMap } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { appMap } = (await req.json()) as { appMap: AppMap };
    if (!appMap?.moments?.length) {
      return NextResponse.json({ error: 'Invalid appMap' }, { status: 400 });
    }

    const files = generateNextjsExport(appMap);

    const zip = new AdmZip();
    for (const file of files) {
      zip.addFile(file.path, Buffer.from(file.content, 'utf8'));
    }

    const buffer = zip.toBuffer();
    const slug = appMap.appName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'my-app';

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${slug}.zip"`,
      },
    });
  } catch (err) {
    console.error('[export] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Export failed' },
      { status: 500 }
    );
  }
}
