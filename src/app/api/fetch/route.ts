import { NextRequest, NextResponse } from 'next/server';
import { extractVideoInfo } from '@/lib/ytdlp';
import { rateLimit } from '@/lib/rateLimit';
import { urlSchema } from '@/lib/validators';

function getIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    '127.0.0.1'
  );
}

// SSE event encoder
const enc = new TextEncoder();
const sse = (data: object) => enc.encode(`data: ${JSON.stringify(data)}\n\n`);

export async function POST(req: NextRequest) {
  // ── Rate limiting — return plain JSON before opening the stream ──────────
  const rl = rateLimit(getIp(req));
  if (!rl.success) {
    const retryAfter = Math.ceil((rl.reset - Date.now()) / 1000);
    return NextResponse.json(
      { success: false, error: `Too many requests. Please wait ${retryAfter} seconds.` },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    );
  }

  // ── Validation — also return plain JSON ──────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = urlSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid URL.' },
      { status: 400 },
    );
  }

  const { url } = parsed.data;

  // ── SSE stream ───────────────────────────────────────────────────────────
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Step 1 – URL validated (fires immediately)
        controller.enqueue(sse({ type: 'step', step: 1 }));

        const data = await extractVideoInfo(url, (progressStep) => {
          if (progressStep === 'spawned') {
            // Step 2 – yt-dlp process is running, sending request to Facebook
            controller.enqueue(sse({ type: 'step', step: 2 }));
          } else if (progressStep === 'receiving') {
            // Step 3 – first bytes received back from Facebook
            controller.enqueue(sse({ type: 'step', step: 3 }));
          }
        });

        // Step 4 – JSON parsed, formats selected
        controller.enqueue(sse({ type: 'step', step: 4 }));

        // Done – send full video info
        controller.enqueue(sse({ type: 'done', data }));
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Something went wrong.';
        controller.enqueue(sse({ type: 'error', error }));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // prevent nginx from buffering the stream
    },
  });
}
