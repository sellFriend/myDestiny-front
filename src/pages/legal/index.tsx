import { useParams, Link, Navigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { AppHeader } from '@/components/AppHeader';
import { ROUTES } from '@/constants/routes';
import privacyContent from '@/content/privacy-policy.md?raw';
import termsContent from '@/content/terms-of-service.md?raw';

const LEGAL_PAGES = {
  privacy: { content: privacyContent, title: '개인정보처리방침' },
  terms: { content: termsContent, title: '이용약관' },
} as const;

type LegalSlug = keyof typeof LEGAL_PAGES;

export default function LegalPage() {
  const { slug } = useParams<{ slug: string }>();

  if (!slug || !(slug in LEGAL_PAGES)) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  const { content } = LEGAL_PAGES[slug as LegalSlug];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AppHeader />

      <main className="mx-auto w-full max-w-2xl flex-1 px-5 pt-8 pb-20">
        <Link
          to={ROUTES.HOME}
          className="mb-6 inline-block text-sm text-black/40 hover:text-black transition-colors"
        >
          ← 홈으로
        </Link>

        <article className="prose-legal">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-2xl font-black text-black mb-6">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-lg font-bold text-black mt-10 mb-3">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-base font-semibold text-black mt-6 mb-2">{children}</h3>
              ),
              p: ({ children }) => (
                <p className="text-sm text-black/70 leading-relaxed mb-3">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="text-sm text-black/70 leading-relaxed">{children}</li>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </article>
      </main>

      <footer className="px-6 py-8 border-t border-black/10 bg-white">
        <div className="max-w-5xl mx-auto text-center text-sm text-black/40">
          <span className="font-black tracking-tight">내인연 (My Destiny)</span>
          <span className="mx-2">·</span>
          <span>© 2026 SellFriend. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
