import { NextResponse } from 'next/server';
import { callStorageAPI } from '@src/utils/storage';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  const { id } = await params;

  const storageMeta = await callStorageAPI('GET', id);
  if (storageMeta.message !== 'success') {
    return NextResponse.json({ message: 'File not found' }, { status: 404 });
  }

  const upstream = await fetch(storageMeta.data.public_url, {
    method: 'GET',
    cache: 'no-store',
  });

  if (!upstream.ok) {
    return NextResponse.json(
      { message: 'Failed to fetch file for preview' },
      { status: 502 },
    );
  }

  const pdfBytes = await upstream.arrayBuffer();

  return new Response(pdfBytes, {
    status: 200,
    headers: {
      'content-type': 'application/pdf',
      'cache-control': 'public, max-age=300',
    },
  });
}
