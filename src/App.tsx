import { RouterProvider } from 'react-router-dom';
import { OverlayProvider } from 'overlay-kit';
import { QueryProvider } from '@/providers/QueryProvider';
import { router } from '@/router';

function App() {
  return (
    <QueryProvider>
      <OverlayProvider>
        <RouterProvider router={router} />
      </OverlayProvider>
    </QueryProvider>
  );
}

export default App;
