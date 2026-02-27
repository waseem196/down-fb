import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-slate-700/40 bg-slate-900/60 px-4 py-8 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 text-sm text-slate-500 sm:flex-row sm:justify-between">

        <span className="text-center sm:text-left">
          © {new Date().getFullYear()} FBDown &mdash; Not affiliated with Facebook&nbsp;/&nbsp;Meta Platforms.
        </span>

        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <Link href="/terms" className="transition-colors hover:text-slate-300">
            Terms of Service
          </Link>
          <Link href="/privacy" className="transition-colors hover:text-slate-300">
            Privacy Policy
          </Link>
          <a
            href="https://github.com/yt-dlp/yt-dlp"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-slate-300"
          >
            Powered by yt-dlp
          </a>
        </nav>
      </div>
    </footer>
  );
}
