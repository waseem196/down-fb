'use client';

import Image from 'next/image';
import type { VideoInfo, VideoFormat } from '@/types';
import { formatDuration, formatFilesize, toFilename } from '@/lib/utils';

export default function VideoResult({ info }: { info: VideoInfo }) {
  function handleDownload(fmt: VideoFormat) {
    const a = document.createElement('a');
    a.href = fmt.url;
    a.download = toFilename(info.title, fmt.ext);
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/60 text-left animate-slide-up">
      <div className="flex flex-col sm:flex-row">

        {/* ── Thumbnail ── */}
        {info.thumbnail && (
          <div className="relative w-full flex-shrink-0 sm:w-56 sm:self-stretch lg:w-64">
            {/* 16:9 spacer on mobile so the image has a defined height */}
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

          {/* Download buttons — stacked on mobile, inline on sm+ */}
          <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-3">
            {info.formats.map((fmt) => (
              <button
                key={fmt.quality}
                onClick={() => handleDownload(fmt)}
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all duration-200 sm:w-auto sm:px-5 sm:py-2.5 ${
                  fmt.quality === 'hd'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/20 hover:from-blue-600 hover:to-blue-700'
                    : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                }`}
              >
                <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {fmt.label}
                {fmt.filesize ? (
                  <span className="text-xs opacity-60">({formatFilesize(fmt.filesize)})</span>
                ) : null}
              </button>
            ))}
          </div>

          <p className="text-xs text-slate-500">
            Links expire in ~1 hour. If the download doesn&apos;t start automatically,
            right-click → &quot;Save link as&quot;.
          </p>
        </div>
      </div>
    </div>
  );
}
