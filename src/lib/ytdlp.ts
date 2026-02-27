import { spawn } from 'child_process';
import type { VideoInfo, VideoFormat } from '@/types';

const BIN = process.env.YTDLP_PATH ?? 'yt-dlp';
const TIMEOUT_MS = 30_000;

// ── Types returned by yt-dlp --dump-json ─────────────────────────────────────

interface RawFormat {
  format_id: string;
  url: string;
  ext: string;
  width?: number;
  height?: number;
  vcodec?: string;
  acodec?: string;
  filesize?: number;
  filesize_approx?: number;
}

interface RawInfo {
  id: string;
  title?: string;
  thumbnail?: string;
  duration?: number;
  uploader?: string;
  formats?: RawFormat[];
  url?: string;
  ext?: string;
}

// ── Format selection ──────────────────────────────────────────────────────────

function pickFormats(formats: RawFormat[]): VideoFormat[] {
  // Only consider formats that carry both video and audio in a single file
  const merged = formats.filter(
    (f) =>
      f.url &&
      f.ext === 'mp4' &&
      f.vcodec && f.vcodec !== 'none' &&
      f.acodec && f.acodec !== 'none' &&
      f.height,
  );

  // Fallback: any format with a URL
  const pool = merged.length > 0 ? merged : formats.filter((f) => f.url);

  // Sort highest resolution first
  pool.sort((a, b) => (b.height ?? 0) - (a.height ?? 0));

  const result: VideoFormat[] = [];

  if (pool[0]) {
    result.push(makeFormat('hd', pool[0]));
  }

  const sdCandidate = pool.find((f) => (f.height ?? 0) < (pool[0]?.height ?? 0));
  if (sdCandidate) {
    result.push(makeFormat('sd', sdCandidate));
  } else if (result.length === 1) {
    // Only one resolution — expose the same URL as "SD" so the UI always shows two buttons
    result.push({ ...result[0], quality: 'sd', label: 'SD' });
  }

  return result;
}

function makeFormat(quality: 'hd' | 'sd', f: RawFormat): VideoFormat {
  const label = quality === 'hd'
    ? `HD${f.height ? ` ${f.height}p` : ''}`
    : `SD${f.height ? ` ${f.height}p` : ''}`;
  return {
    quality,
    label,
    url: f.url,
    ext: f.ext ?? 'mp4',
    width: f.width,
    height: f.height,
    filesize: f.filesize ?? f.filesize_approx,
  };
}

// ── Error parsing ─────────────────────────────────────────────────────────────

function friendlyError(stderr: string): string {
  if (/private video/i.test(stderr)) return 'This video is private.';
  if (/not available/i.test(stderr))  return 'This video is not available.';
  if (/login required|LoginRequired/i.test(stderr))
    return 'This video requires a Facebook login. Only public videos are supported.';
  if (/404|not found/i.test(stderr))
    return 'Video not found. Please check the URL and try again.';
  if (/content isn.t available/i.test(stderr))
    return 'This content is not available in your region.';
  return 'Could not fetch video. Please check the URL and try again.';
}

// ── Main export ───────────────────────────────────────────────────────────────

export type ProgressStep = 'spawned' | 'receiving';

export async function extractVideoInfo(
  url: string,
  onProgress?: (step: ProgressStep) => void,
): Promise<VideoInfo> {
  return new Promise((resolve, reject) => {
    const args = [
      '--dump-json',
      '--no-playlist',
      '--no-warnings',
      '--socket-timeout', '15',
    ];

    if (process.env.YTDLP_COOKIES_PATH) {
      args.push('--cookies', process.env.YTDLP_COOKIES_PATH);
    }

    args.push(url);

    const proc = spawn(BIN, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    let firstChunk = true;

    // Fire 'spawned' as soon as the process is running
    onProgress?.('spawned');

    const timer = setTimeout(() => {
      proc.kill('SIGTERM');
      reject(new Error('Request timed out. Please try again.'));
    }, TIMEOUT_MS);

    proc.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString();
      // Fire 'receiving' once on the very first byte back from Facebook
      if (firstChunk) {
        firstChunk = false;
        onProgress?.('receiving');
      }
    });
    proc.stderr.on('data', (chunk: Buffer) => (stderr += chunk.toString()));

    proc.on('error', (err: NodeJS.ErrnoException) => {
      clearTimeout(timer);
      if (err.code === 'ENOENT') {
        reject(new Error('yt-dlp is not installed. Please contact support.'));
      } else {
        reject(new Error('Failed to process video. Please try again.'));
      }
    });

    proc.on('close', (code) => {
      clearTimeout(timer);

      if (code !== 0) {
        reject(new Error(friendlyError(stderr)));
        return;
      }

      try {
        const raw: RawInfo = JSON.parse(stdout.trim());

        const formats = raw.formats
          ? pickFormats(raw.formats)
          : raw.url
            ? [{ quality: 'hd' as const, label: 'Download', url: raw.url, ext: raw.ext ?? 'mp4' }]
            : [];

        if (formats.length === 0) {
          reject(new Error('No downloadable formats found for this video.'));
          return;
        }

        resolve({
          id: raw.id,
          title: raw.title ?? 'Facebook Video',
          thumbnail: raw.thumbnail ?? '',
          duration: raw.duration ?? 0,
          uploader: raw.uploader,
          formats,
        });
      } catch {
        reject(new Error('Failed to parse video information.'));
      }
    });
  });
}
