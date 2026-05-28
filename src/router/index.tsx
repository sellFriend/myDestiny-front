import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

const HomePage = lazy(() => import('@/pages/home'));
const ExplorePage = lazy(() => import('@/pages/explore'));
const FriendsPage = lazy(() => import('@/pages/friends'));
const RequestsPage = lazy(() => import('@/pages/requests'));
const RegisterPage = lazy(() => import('@/pages/register'));

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
    path: ROUTES.HOME,
    element: withSuspense(<HomePage />),
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
]);
