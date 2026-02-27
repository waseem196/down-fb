'use client';

import { useState } from 'react';
import Link from 'next/link';

const NAV = [
  { href: '/#how-it-works', label: 'How It Works' },
  { href: '/#faq',          label: 'FAQ'           },
  { href: '/terms',         label: 'Terms'         },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/*
        Transparent backdrop — sits behind the dropdown but above the page.
        Clicking it closes the menu without any visual effect.
        Hidden on sm+ since the dropdown never opens there.
      */}
      {open && (
        <div
          aria-hidden
          className="fixed inset-0 z-40 sm:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <header className="sticky top-0 z-50 border-b border-slate-700/40 bg-slate-900/80 backdrop-blur-md">

        {/* ── Main bar — height never changes ─────────────────────────────── */}
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6 sm:py-4">

          {/* Logo */}
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/20">
              <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <span className="text-lg font-bold text-white">
              FB<span className="text-blue-400">Down</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 text-sm text-slate-400 sm:flex">
            {NAV.map(({ href, label }) => (
              <Link key={href} href={href} className="transition-colors hover:text-white">
                {label}
              </Link>
            ))}
          </nav>

          {/* Hamburger — mobile only */}
          <button
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:hidden"
          >
            {/* Animated bars ↔ X */}
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? (
                <path
                  key="x"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  key="bars"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/*
          ── Mobile dropdown ──────────────────────────────────────────────────
          position: absolute  →  floats below the bar, zero effect on document flow
          top: 100%           →  snaps flush to the bottom edge of the sticky bar
          z-50                →  above the z-40 backdrop
        */}
        {open && (
          <nav
            id="mobile-nav"
            className="absolute left-0 right-0 top-full z-50 animate-slide-down border-t border-slate-700/40 bg-slate-900/95 shadow-xl shadow-black/30 backdrop-blur-md sm:hidden"
          >
            <div className="mx-auto flex max-w-6xl flex-col px-4 pb-3 pt-2">
              {NAV.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                >
                  {label}
                </Link>
              ))}
            </div>
          </nav>
        )}

      </header>
    </>
  );
}
