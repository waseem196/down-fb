import { NextRequest } from 'next/server';
import { spawn } from 'child_process';
import { createReadStream, mkdtempSync } from 'fs';
import { readdir, rm, stat } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

export const runtime = 'nodejs';

const BIN = process.env.YTDLP_PATH ?? 'yt-dlp';

function isValidFacebookUrl(raw: string): boolean {
  try {
    const { hostname } = new URL(raw);
    return (
      hostname === 'facebook.com' ||
      hostname.endsWith('.facebook.com') ||
      hostname === 'fb.watch'
    );
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const fbUrl = request.nextUrl.searchParams.get('fbUrl');
  const maxHeight = request.nextUrl.searchParams.get('maxHeight');
  const filename = request.nextUrl.searchParams.get('filename') ?? 'video.mp4';
  const token = request.nextUrl.searchParams.get('token');

  if (!fbUrl || !isValidFacebookUrl(fbUrl)) {
    return new Response('Invalid or missing fbUrl', { status: 400 });
  }

  const tmpDir = mkdtempSync(join(tmpdir(), 'socio-dl-'));
  const cleanup = () => rm(tmpDir, { recursive: true, force: true }).catch(() => {});

  // Format selection strategy (tried in order):
  // 1. Best video + best audio merged into mp4 (requires ffmpeg)
  // 2. Best single format that already has both codecs (no ffmpeg needed)
  // 3. Absolute best single format (last resort — may be video-only)
  const heightFilter = maxHeight ? `[height<=${maxHeight}]` : '';
  const formatStr = [
    `bestvideo[ext=mp4]${heightFilter}+bestaudio[ext=m4a]`,
    `bestvideo${heightFilter}+bestaudio`,
    `best[vcodec!=none][acodec!=none][ext=mp4]${heightFilter}`,
    `best[vcodec!=none][acodec!=none]`,
    'best',
  ].join('/');

  const args = [
    '-f', formatStr,
    '--merge-output-format', 'mp4',
    '--no-playlist',
    '--no-warnings',
    '--socket-timeout', '30',
    '-o', join(tmpDir, 'video.%(ext)s'),
  ];

  if (process.env.FFMPEG_PATH) {
    args.push('--ffmpeg-location', process.env.FFMPEG_PATH);
  }

  if (process.env.YTDLP_COOKIES_PATH) {
    args.push('--cookies', process.env.YTDLP_COOKIES_PATH);
  }

  args.push(fbUrl);

  // Download to temp file — supports MP4 merging (requires seekable output)
  try {
    await new Promise<void>((resolve, reject) => {
      const proc = spawn(BIN, args, { stdio: ['ignore', 'pipe', 'pipe'] });
      let stderr = '';
      proc.stderr.on('data', (chunk: Buffer) => {
        stderr += chunk.toString();
        process.stderr.write(chunk);
      });
      proc.on('error', reject);
      proc.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(stderr.trim() || `yt-dlp exited with code ${code}`));
      });
    });
  } catch (err) {
    await cleanup();
    const msg = err instanceof Error ? err.message : 'Download failed';
    return new Response(msg, { status: 500 });
  }

  // Find output file (yt-dlp picks the extension, e.g. .mp4 or .webm)
  const files = await readdir(tmpDir).catch(() => [] as string[]);
  const outFile = files[0];
  if (!outFile) {
    await cleanup();
    return new Response('No output file produced', { status: 500 });
  }

  const outPath = join(tmpDir, outFile);
  const fileStat = await stat(outPath);
  const ext = outFile.split('.').pop() ?? 'mp4';
  const mimeType = ext === 'webm' ? 'video/webm' : 'video/mp4';
  const finalFilename = filename.replace(/\.[^.]+$/, `.${ext}`);

  const fileStream = createReadStream(outPath);

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      fileStream.on('data', (chunk: Buffer | string) => {
        controller.enqueue(Buffer.isBuffer(chunk) ? new Uint8Array(chunk) : Buffer.from(chunk));
      });
      fileStream.on('end', () => {
        controller.close();
        cleanup();
      });
      fileStream.on('error', (err) => {
        controller.error(err);
        cleanup();
      });
    },
    cancel() {
      fileStream.destroy();
      cleanup();
    },
  });

  const responseHeaders: Record<string, string> = {
    'Content-Type': mimeType,
    'Content-Length': String(fileStat.size),
    'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(finalFilename)}`,
    'Cache-Control': 'no-store',
  };

  // Signal the client that the file is ready — used to clear the loading spinner
  if (token) {
    responseHeaders['Set-Cookie'] = `dl-${token}=1; Path=/; Max-Age=60; SameSite=Lax`;
  }

  return new Response(stream, { headers: responseHeaders });
}
