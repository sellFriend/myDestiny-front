import { RouterProvider } from 'react-router-dom';
import { OverlayProvider } from 'overlay-kit';
import { QueryProvider } from '@/providers/QueryProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { router } from '@/router';

function App() {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <AuthProvider>
          <OverlayProvider>
            <RouterProvider router={router} />
          </OverlayProvider>
        </AuthProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}

export default App;
