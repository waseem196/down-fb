'use client';

import { useState } from 'react';

const FAQS = [
  {
    q: 'Is FBDown completely free?',
    a: 'Yes — 100% free. No subscription, no hidden fees, no registration required.',
  },
  {
    q: 'What types of Facebook content can I download?',
    a: 'You can download public Facebook videos, Reels, and Watch videos. Private videos require an authenticated session cookie configured on the server.',
  },
  {
    q: 'What format are downloads saved in?',
    a: 'Videos are saved as MP4, which plays on all devices and media players without extra software.',
  },
  {
    q: 'Why do the download links expire?',
    a: "Download links point directly to Facebook's CDN, which time-limits them (typically ~1 hour). If a link expires, paste the URL again to get a fresh one.",
  },
  {
    q: 'Is it legal to download Facebook videos?',
    a: 'You should only download content you own or have explicit permission to download. Downloading copyrighted material without permission may violate copyright law. Always respect content creators.',
  },
  {
    q: "Why can't I download a private video?",
    a: 'Private videos require Facebook authentication. This tool only supports public content by default. Contact your server administrator about cookie-based support.',
  },
  {
    q: 'Does FBDown store my videos?',
    a: "No. Videos are served directly from Facebook's servers. FBDown never stores, caches, or accesses your video content.",
  },
  {
    q: 'Is there a daily download limit?',
    a: 'There is a rate limit of 10 requests per minute per IP address to prevent abuse. There is no separate daily cap.',
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="bg-slate-900/40 px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-3 text-center text-2xl font-bold text-white sm:text-3xl">
          Frequently Asked Questions
        </h2>
        <p className="mb-10 text-center text-slate-400">
          Everything you need to know about FBDown.
        </p>

        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/40"
            >
              <button
                className="flex w-full items-center justify-between px-5 py-4 text-left font-medium text-white transition-colors hover:bg-slate-700/30"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <span>{faq.q}</span>
                <svg
                  className={`ml-4 h-5 w-5 flex-shrink-0 text-slate-400 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {open === i && (
                <p className="animate-fade-in px-5 pb-5 text-sm leading-relaxed text-slate-300">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
