'use client';

import { useRef, useState } from 'react';
import type { VideoInfo } from '@/types';

interface Props {
  onResult: (info: VideoInfo) => void;
  onClear: () => void;
}

const STEPS = [
  { id: 1, label: 'Validating URL',         pct: 20 },
  { id: 2, label: 'Connecting to Facebook', pct: 45 },
  { id: 3, label: 'Receiving video info',   pct: 78 },
  { id: 4, label: 'Processing formats',     pct: 93 },
] as const;

const DONE_PCT = 100;

export default function DownloadForm({ onResult, onClear }: Props) {
  const [url, setUrl]                 = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress]       = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setCurrentStep(0);
    setProgress(0);
    onClear();

    try {
      const res = await fetch('/api/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
      });

      // Non-2xx → plain JSON error (rate limit, bad URL)
      if (!res.ok) {
        const json = await res.json();
        setError(json.error ?? 'Something went wrong. Please try again.');
        return;
      }

      // 200 → SSE stream
      const reader  = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer    = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const events = buffer.split('\n\n');
        buffer = events.pop() ?? '';

        for (const event of events) {
          const dataLine = event.split('\n').find((l) => l.startsWith('data: '));
          if (!dataLine) continue;
          try {
            const msg = JSON.parse(dataLine.slice(6));

            if (msg.type === 'step') {
              const step = STEPS.find((s) => s.id === msg.step);
              if (step) { setCurrentStep(step.id); setProgress(step.pct); }
            } else if (msg.type === 'done') {
              setProgress(DONE_PCT);
              setCurrentStep(5);
              await new Promise((r) => setTimeout(r, 350));
              onResult(msg.data);
            } else if (msg.type === 'error') {
              setError(msg.error ?? 'Something went wrong. Please try again.');
              return;
            }
          } catch { /* ignore malformed event */ }
        }
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
      setCurrentStep(0);
      setProgress(0);
    }
  }

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text.trim());
      setError(null);
    } catch {
      inputRef.current?.focus();
    }
  }

  function handleClear() {
    setUrl('');
    setError(null);
    onClear();
    inputRef.current?.focus();
  }

  return (
    <form onSubmit={handleSubmit} className="w-full" noValidate>

      {/* ── Input row ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row">

        {/* URL input */}
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="url"
            inputMode="url"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(null); }}
            placeholder="Paste Facebook video URL here…"
            disabled={loading}
            autoComplete="off"
            spellCheck={false}
            className={`h-13 w-full rounded-xl border bg-slate-800 px-4 pr-20 text-sm text-white placeholder-slate-500 outline-none transition-all focus:ring-2 focus:ring-blue-500 sm:h-14 sm:text-base ${
              error ? 'border-red-500' : 'border-slate-600 focus:border-blue-500'
            }`}
          />
          {/* Paste / Clear */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {url ? (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear"
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:text-white"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePaste}
                className="rounded-lg px-2.5 py-1 text-xs font-medium text-blue-400 transition-colors hover:bg-blue-500/10 hover:text-blue-300 sm:px-3 sm:text-sm"
              >
                Paste
              </button>
            )}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:from-blue-600 hover:to-blue-700 disabled:cursor-not-allowed disabled:from-slate-600 disabled:to-slate-600 disabled:shadow-none sm:h-14 sm:w-auto sm:min-w-[148px]"
        >
          {loading ? (
            <>
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Fetching…
            </>
          ) : (
            <>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </>
          )}
        </button>
      </div>

      {/* ── Progress ──────────────────────────────────────────────────────── */}
      {loading && (
        <div className="mt-5 animate-fade-in">
          {/* Bar */}
          <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Steps */}
          <div className="space-y-2.5">
            {STEPS.map((step) => {
              const isDone   = currentStep > step.id;
              const isActive = currentStep === step.id;

              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-3 text-sm transition-colors duration-300 ${
                    isDone   ? 'text-blue-400' :
                    isActive ? 'text-white'    :
                               'text-slate-600'
                  }`}
                >
                  {/* Icon */}
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
                    {isDone ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : isActive ? (
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                        <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="9" strokeWidth="2" />
                      </svg>
                    )}
                  </span>

                  <span className={`flex-1 truncate ${isActive ? 'font-medium' : ''}`}>
                    {step.label}
                  </span>

                  {isActive && (
                    <span className="flex-shrink-0 font-mono text-xs text-slate-400">
                      {progress}%
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Error ─────────────────────────────────────────────────────────── */}
      {error && (
        <div className="mt-3 flex animate-fade-in items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400">
          <svg className="mt-0.5 h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
    </form>
  );
}
