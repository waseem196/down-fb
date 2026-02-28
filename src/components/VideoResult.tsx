'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { VideoInfo, VideoFormat } from '@/types';
import { formatDuration, formatFilesize, toFilename } from '@/lib/utils';

export default function VideoResult({ info, onClear }: { info: VideoInfo; onClear: () => void }) {
  const [loadingQuality, setLoadingQuality] = useState<string | null>(null);

  function handleDownload(fmt: VideoFormat) {
    if (loadingQuality) return;

    const filename = toFilename(info.title, fmt.ext);
    const token = Math.random().toString(36).slice(2, 10);
    const params = new URLSearchParams({ fbUrl: info.sourceUrl, filename, token });
    if (fmt.height) params.set('maxHeight', String(fmt.height));

    setLoadingQuality(fmt.quality);

    // Poll for the cookie the server sets when it starts sending the file.
    // The cookie arrives with the response headers — the exact moment the
    // browser receives the file and shows the save dialog.
    const cookieName = `dl-${token}`;
    let elapsed = 0;
    const poll = setInterval(() => {
      elapsed += 500;
      if (document.cookie.includes(`${cookieName}=`) || elapsed > 90_000) {
        clearInterval(poll);
        setLoadingQuality(null);
        document.cookie = `${cookieName}=; Max-Age=0; Path=/`;
      }
    }, 500);

    const a = document.createElement('a');
    a.href = `/api/download?${params.toString()}`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return (
    <div className="animate-slide-up">
      <button
        onClick={onClear}
        className="mb-4 flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Download another video
      </button>
    <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/60 text-left">
      <div className="flex flex-col sm:flex-row">

        {/* ── Thumbnail ── */}
        {info.thumbnail && (
          <div className="relative w-full flex-shrink-0 sm:w-56 sm:self-stretch lg:w-64">
            <div className="aspect-video w-full sm:hidden" />
            <Image
              src={info.thumbnail}
              alt={info.title}
              fill
              className="object-cover"
              unoptimized
              sizes="(max-width: 640px) 100vw, 256px"
            />
            {info.duration > 0 && (
              <span className="absolute bottom-2 right-2 rounded-md bg-black/75 px-2 py-0.5 font-mono text-xs text-white">
                {formatDuration(info.duration)}
              </span>
            )}
          </div>
        )}

        {/* ── Info & Download Buttons ── */}
        <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">

          {/* Title + uploader */}
          <div>
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-white sm:text-base">
              {info.title}
            </h3>
            {info.uploader && (
              <p className="mt-1 text-xs text-slate-400 sm:text-sm">{info.uploader}</p>
            )}
          </div>

          {/* Download buttons */}
          <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-3">
            {info.formats.map((fmt) => {
              const isLoading = loadingQuality === fmt.quality;
              const isDisabled = loadingQuality !== null;
              return (
                <button
                  key={fmt.quality}
                  onClick={() => handleDownload(fmt)}
                  disabled={isDisabled}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all duration-200 sm:w-auto sm:px-5 sm:py-2.5 ${
                    fmt.quality === 'hd'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/20 hover:from-blue-600 hover:to-blue-700 disabled:opacity-70'
                      : 'bg-slate-700 text-slate-200 hover:bg-slate-600 disabled:opacity-70'
                  } ${isLoading ? 'cursor-wait' : isDisabled ? 'cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
                    <>
                      <svg className="h-4 w-4 flex-shrink-0 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Preparing…
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      {fmt.label}
                      {fmt.filesize ? (
                        <span className="text-xs opacity-60">({formatFilesize(fmt.filesize)})</span>
                      ) : null}
                    </>
                  )}
                </button>
              );
            })}
          </div>

          <p className="text-xs text-slate-500">
            Download starts automatically. Links expire in ~1 hour.
          </p>
        </div>
      </div>
    </div>
    </div>
  );
}
