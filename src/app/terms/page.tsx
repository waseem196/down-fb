import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'FBDown Terms of Service — please read before using the service.',
};

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 px-4 py-12">
        <article className="prose prose-invert mx-auto max-w-3xl prose-headings:text-white prose-p:text-slate-300 prose-li:text-slate-300 prose-strong:text-white prose-a:text-blue-400">
          <h1>Terms of Service</h1>
          <p className="text-slate-500 text-sm">Last updated: {new Date().getFullYear()}</p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By using FBDown (&quot;the Service&quot;), you agree to these Terms of Service. If you
            do not agree, do not use the Service.
          </p>

          <h2>2. Permitted Use</h2>
          <p>You may use the Service only to download content that:</p>
          <ul>
            <li>You own, or</li>
            <li>You have received explicit permission from the copyright owner to download.</li>
          </ul>

          <h2>3. Prohibited Use</h2>
          <p>You must not use the Service to:</p>
          <ul>
            <li>Download or distribute copyrighted content without authorisation.</li>
            <li>Violate Facebook&apos;s Terms of Service.</li>
            <li>Harass, stalk, or harm other individuals.</li>
            <li>Attempt to reverse-engineer, scrape, or abuse the Service.</li>
          </ul>

          <h2>4. Disclaimer of Warranties</h2>
          <p>
            The Service is provided &quot;as is&quot; without any warranties, express or implied.
            We do not guarantee that the Service will be uninterrupted, error-free, or that
            download links will remain valid.
          </p>

          <h2>5. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, FBDown shall not be liable for any indirect,
            incidental, or consequential damages arising from your use of the Service.
          </p>

          <h2>6. Intellectual Property</h2>
          <p>
            FBDown does not store, host, or claim ownership of any downloaded content. All videos
            are served directly from Facebook&apos;s CDN.
          </p>

          <h2>7. Changes to Terms</h2>
          <p>
            We may update these Terms at any time. Continued use of the Service after changes
            constitutes acceptance of the updated Terms.
          </p>

          <h2>8. Contact</h2>
          <p>
            For questions about these Terms, please open an issue on our repository or contact us
            via the website.
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
