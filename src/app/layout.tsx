import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://your-domain.com';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'FBDown — Free Facebook Video Downloader',
    template: '%s | FBDown',
  },
  description:
    'Download Facebook videos, Reels, and Watch content in HD quality for free. No login, no registration — just paste and download.',
  keywords: [
    'facebook video downloader',
    'download facebook videos',
    'fb video download',
    'facebook reels downloader',
    'save facebook video',
    'facebook video to mp4',
  ],
  authors: [{ name: 'FBDown' }],
  openGraph: {
    title: 'FBDown — Free Facebook Video Downloader',
    description: 'Download Facebook videos in HD for free. No login required.',
    url: APP_URL,
    siteName: 'FBDown',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FBDown — Free Facebook Video Downloader',
    description: 'Download Facebook videos in HD for free. No login required.',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
