import { NextResponse } from 'next/server';
import { execSync } from 'child_process';

export async function GET() {
  let ytdlpVersion: string | null = null;
  let ytdlpOk = false;

  try {
    ytdlpVersion = execSync('yt-dlp --version', { timeout: 5000 }).toString().trim();
    ytdlpOk = true;
  } catch {
    ytdlpOk = false;
  }

  return NextResponse.json({
    status: ytdlpOk ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    ytdlp: { available: ytdlpOk, version: ytdlpVersion },
  });
}
