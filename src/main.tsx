import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/styles/globals.css';
import App from './App';

// 새 배포로 옛 청크가 사라져 모듈 preload 가 실패하면 1회 새로고침해 최신 청크를 받아온다.
window.addEventListener('vite:preloadError', () => {
  if (!window.sessionStorage.getItem('chunk-reload')) {
    window.sessionStorage.setItem('chunk-reload', '1');
    window.location.reload();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
