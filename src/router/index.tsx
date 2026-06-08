import { Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { ScrollToTop } from '@/components/ScrollToTop';
import { RouteErrorBoundary } from '@/components/ErrorBoundary';
import { lazyWithRetry } from '@/utils/lazyWithRetry';

const HomePage = lazyWithRetry(() => import('@/pages/home'));
const LoginPage = lazyWithRetry(() => import('@/pages/login'));
const OAuthCallbackPage = lazyWithRetry(() => import('@/pages/oauth-callback'));
const ExplorePage = lazyWithRetry(() => import('@/pages/explore'));
const FriendsPage = lazyWithRetry(() => import('@/pages/friends'));
const RequestsPage = lazyWithRetry(() => import('@/pages/requests'));
const RegisterPage = lazyWithRetry(() => import('@/pages/register'));
const BlockedPage = lazyWithRetry(() => import('@/pages/blocked'));
const LegalPage = lazyWithRetry(() => import('@/pages/legal'));

function PageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 rounded-full border-2 border-black/20 border-t-black animate-spin" />
    </div>
  );
}

function withSuspense(element: React.ReactNode) {
  return <Suspense fallback={<PageFallback />}>{element}</Suspense>;
}

export const router = createBrowserRouter([
  {
    element: <ScrollToTop />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: ROUTES.HOME,
        element: withSuspense(<HomePage />),
      },
      {
        path: ROUTES.LOGIN,
        element: withSuspense(<LoginPage />),
      },
      {
        path: ROUTES.OAUTH_CALLBACK,
        element: withSuspense(<OAuthCallbackPage />),
      },
      {
        path: ROUTES.EXPLORE,
        element: withSuspense(<ExplorePage />),
      },
      {
        path: ROUTES.FRIENDS,
        element: withSuspense(<FriendsPage />),
      },
      {
        path: ROUTES.REQUESTS,
        element: withSuspense(<RequestsPage />),
      },
      {
        path: ROUTES.REGISTER,
        element: withSuspense(<RegisterPage />),
      },
      {
        // 친구(B)가 주선자 숏링크로 접근하는 폼. madamId 는 제출 시 path variable 로 쓰인다.
        path: `${ROUTES.FORM}/:madamId`,
        element: withSuspense(<RegisterPage />),
      },
      {
        // 매물(친구)로 등록된 사용자가 서비스 진입 시 강제 이동되는 안내 페이지
        path: ROUTES.BLOCKED,
        element: withSuspense(<BlockedPage />),
      },
      {
        path: '/legal/:slug',
        element: withSuspense(<LegalPage />),
      },
    ],
  },
]);
