import {
  MAX_NOTE_BYTES,
  NOTE_MIME_TYPE,
  noteIdSchema,
} from '@src/utils/noteFile';
import { callStorageAPI } from '@src/utils/storage';

const errorResponse = (message: string, status: number) =>
  new Response(message, {
    status,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-store',
    },
  });

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const parsed = noteIdSchema.safeParse((await params).id);
  if (!parsed.success) return errorResponse('File not found.', 404);

  if (!process.env.NEBULA_API_STORAGE_BUCKET)
    return errorResponse('File storage is unavailable.', 503);

  try {
    const meta = await callStorageAPI('GET', parsed.data);
    if (
      meta.message !== 'success' ||
      meta.data.content_type !== NOTE_MIME_TYPE
    ) {
      return errorResponse(
        'This note has no valid PDF. Please upload it again.',
        404,
      );
    }

    // Ignore legacy publicUrl values and never follow redirects to other sites.
    const upstream = await fetch(meta.data.public_url, {
      redirect: 'error',
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    });
    const contentType = upstream.headers
      .get('content-type')
      ?.split(';')[0]
      ?.trim();
    if (!upstream.ok || contentType !== NOTE_MIME_TYPE || !upstream.body) {
      await upstream.body?.cancel();
      return errorResponse(
        'This note has no valid PDF. Please upload it again.',
        404,
      );
    }

    // Bound memory even if the storage response omits or lies about its length.
    const reader = upstream.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_NOTE_BYTES) {
        await reader.cancel();
        return errorResponse('This note exceeds the file size limit.', 413);
      }
      chunks.push(value);
    }

    const pdf = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      pdf.set(chunk, offset);
      offset += chunk.byteLength;
    }
    if (new TextDecoder().decode(pdf.subarray(0, 5)) !== '%PDF-') {
      return errorResponse(
        'This note has no valid PDF. Please upload it again.',
        415,
      );
    }

    // Stream the validated bytes so files near 5 MB work on serverless hosts.
    let sent = 0;
    const body = new ReadableStream<Uint8Array>({
      pull(controller) {
        if (sent >= pdf.byteLength) {
          controller.close();
          return;
        }
        const end = Math.min(sent + 64 * 1024, pdf.byteLength);
        controller.enqueue(pdf.subarray(sent, end));
        sent = end;
      },
    });
    return new Response(body, {
      headers: {
        'Content-Type': NOTE_MIME_TYPE,
        'Content-Disposition': `inline; filename="${parsed.data}.pdf"`,
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return errorResponse('The PDF is temporarily unavailable.', 502);
  }
}
