import { z } from 'zod';

// Accept any Facebook domain (www, m, web, l, etc.) or fb.watch short links.
// We keep validation intentionally loose here — yt-dlp is the real validator
// and will return a meaningful error if the URL doesn't point to a video.
const isFacebookUrl = (url: string): boolean => {
  try {
    const { hostname } = new URL(url);
    return (
      hostname === 'fb.watch' ||
      hostname.endsWith('.facebook.com') ||
      hostname === 'facebook.com'
    );
  } catch {
    return false;
  }
};

export const urlSchema = z.object({
  url: z
    .string()
    .min(1, 'URL is required.')
    .url('Please enter a valid URL.')
    .refine(isFacebookUrl, 'Please enter a Facebook video URL (facebook.com or fb.watch).'),
});

export type UrlInput = z.infer<typeof urlSchema>;
