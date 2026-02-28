import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DownloadSection from "@/components/DownloadSection";
import Features from "@/components/Features";
import FAQ from "@/components/FAQ";

export const metadata: Metadata = {
  title: "FBDown — Free Facebook Video Downloader Online",
  description:
    "Download Facebook videos, Reels, and Watch videos in HD quality for free. No login or registration needed. Fast and safe.",
};

const SUPPORTED = ["Public Videos", "Reels", "Watch Videos"];

const STEPS = [
  {
    n: "01",
    title: "Copy the URL",
    desc: 'Click the three-dot menu on any Facebook video and tap "Copy link".',
  },
  {
    n: "02",
    title: "Paste & Fetch",
    desc: "Paste the link into the box above, then click the Download button.",
  },
  {
    n: "03",
    title: "Save to Device",
    desc: "Choose HD or SD quality, then save the file to your device.",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="px-4 pb-14 pt-12 sm:pb-20 sm:pt-16 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs text-blue-400 sm:mb-6 sm:px-4 sm:text-sm">
              <span className="h-1.5 w-1.5 flex-shrink-0 animate-pulse-dot rounded-full bg-blue-400" />
              Free{" "}
              <span className="h-1.5 w-1.5 flex-shrink-0 animate-pulse-dot rounded-full bg-blue-400" />{" "}
              Fast
            </div>

            {/* Heading — 3 steps so it never jumps harshly */}
            <h1 className="mb-4 text-[2rem] font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Download Facebook{" "}
              <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                Videos in HD
              </span>
            </h1>

            <p className="mx-auto mb-7 max-w-lg text-base text-slate-300 sm:mb-8 sm:text-lg">
              Save any public Facebook video, Reel, or Watch video to your
              device. No watermarks. No limits.
            </p>

            {/* Supported content types */}
            <div className="mb-8 flex flex-wrap justify-center gap-2 sm:mb-10">
              {SUPPORTED.map((type) => (
                <span
                  key={type}
                  className="rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1 text-xs text-slate-300"
                >
                  ✓ {type}
                </span>
              ))}
            </div>

            {/* Download widget */}
            <DownloadSection />
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────────────────── */}
        <section
          id="how-it-works"
          className="bg-slate-800/30 px-4 py-14 sm:px-6 sm:py-16"
        >
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-10 text-center text-2xl font-bold text-white sm:text-3xl">
              How It Works
            </h2>

            {/* Steps — vertical on mobile with connector line, horizontal on sm+ */}
            <div className="relative grid grid-cols-1 gap-0 sm:grid-cols-3 sm:gap-8">
              {/* Connector line (desktop only) */}
              <div
                aria-hidden
                className="absolute left-1/2 top-6 hidden h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent sm:block"
              />

              {STEPS.map((s, idx) => (
                <div
                  key={s.n}
                  className="relative flex items-start gap-4 py-5 sm:flex-col sm:items-center sm:gap-0 sm:py-0 sm:text-center"
                >
                  {/* Vertical connector line (mobile only) */}
                  {idx < STEPS.length - 1 && (
                    <div
                      aria-hidden
                      className="absolute left-6 top-14 h-full w-px bg-gradient-to-b from-blue-500/20 to-transparent sm:hidden"
                    />
                  )}

                  {/* Step number circle */}
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/10 text-lg font-extrabold text-blue-400 sm:mb-4 sm:h-14 sm:w-14 sm:text-xl">
                    {s.n}
                  </div>

                  <div>
                    <h3 className="font-semibold text-white sm:mb-2">
                      {s.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-400 sm:mt-0">
                      {s.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Features />
        <FAQ />
      </main>

      <Footer />
    </div>
  );
}
