import { RouterProvider } from 'react-router-dom';
import { OverlayProvider } from 'overlay-kit';
import { QueryProvider } from '@/providers/QueryProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { router } from '@/router';

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <OverlayProvider>
          <RouterProvider router={router} />
        </OverlayProvider>
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;
