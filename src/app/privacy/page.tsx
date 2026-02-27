import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'FBDown Privacy Policy — how we handle your data.',
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 px-4 py-12">
        <article className="prose prose-invert mx-auto max-w-3xl prose-headings:text-white prose-p:text-slate-300 prose-li:text-slate-300 prose-strong:text-white prose-a:text-blue-400">
          <h1>Privacy Policy</h1>
          <p className="text-slate-500 text-sm">Last updated: {new Date().getFullYear()}</p>

          <h2>1. Information We Collect</h2>
          <p>
            When you use FBDown, we temporarily process the Facebook URL you submit in order to
            extract video download links. We do not store this URL after the request is complete.
          </p>
          <p>
            We collect standard server logs (IP address, request timestamp, HTTP method) solely
            for rate limiting and abuse prevention. Logs are not sold or shared with third parties.
          </p>

          <h2>2. Video Content</h2>
          <p>
            FBDown does not download, store, or cache any video content. All media is served
            directly from Facebook&apos;s content delivery network (CDN). We never have access to
            the actual video bytes.
          </p>

          <h2>3. Cookies</h2>
          <p>
            FBDown does not use tracking cookies or analytics. We do not use advertising cookies.
            If you use a browser-side paste feature, your clipboard data remains on your device.
          </p>

          <h2>4. Third-Party Services</h2>
          <p>
            We use <strong>yt-dlp</strong> (an open-source tool) to extract video metadata from
            Facebook. This tool makes requests to Facebook on the server side; Facebook&apos;s own
            privacy policy applies to those requests.
          </p>

          <h2>5. Children&apos;s Privacy</h2>
          <p>
            FBDown is not intended for children under 13. We do not knowingly collect personal
            information from children.
          </p>

          <h2>6. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will be reflected by
            the &quot;Last updated&quot; date above.
          </p>

          <h2>7. Contact</h2>
          <p>
            If you have questions about this Privacy Policy, please open an issue on our
            repository or contact us via the website.
          </p>

          <p>
            <Link href="/">← Back to Home</Link>
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
