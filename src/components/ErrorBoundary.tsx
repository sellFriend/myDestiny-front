import { Component, useEffect, type ErrorInfo, type ReactNode } from 'react';
import { useRouteError } from 'react-router-dom';
import { RELOAD_FLAG, isChunkLoadError } from '@/utils/lazyWithRetry';

/**
 * 청크(스테일 모듈) 에러면 1회에 한해 새로고침을 트리거하고 true 를 반환한다.
 * lazyWithRetry / vite:preloadError 와 같은 'chunk-reload' 가드를 공유해
 * 무한 새로고침을 막는다.
 */
function tryChunkReload(error: unknown): boolean {
  if (isChunkLoadError(error) && !window.sessionStorage.getItem(RELOAD_FLAG)) {
    window.sessionStorage.setItem(RELOAD_FLAG, '1');
    window.location.reload();
    return true;
  }
  return false;
}

function handleManualReload() {
  // 수동 새로고침은 자동 가드를 풀어 다음 배포 때도 자동 복구가 동작하게 한다.
  window.sessionStorage.removeItem(RELOAD_FLAG);
  window.location.reload();
}

/** 크래시 시 흰 화면 대신 보여줄 안내 폴백 UI */
export function ErrorFallback() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-8 text-center">
      <p className="text-4xl">🥺</p>
      <div className="flex flex-col gap-2">
        <p className="text-base font-bold text-black/80">화면을 불러오지 못했어요</p>
        <p className="text-sm text-black/50">잠시 후 다시 시도하거나 새로고침해 주세요.</p>
      </div>
      <button
        type="button"
        onClick={handleManualReload}
        className="rounded-full bg-black px-6 py-3 text-sm font-bold text-white active:scale-95 transition-transform"
      >
        새로고침
      </button>
    </div>
  );
}

/**
 * 라우트 렌더 에러를 잡는 errorElement.
 *
 * createBrowserRouter 는 라우트 element 내부에서 터진 에러를 자체적으로 가로채므로
 * 라우터 바깥의 <ErrorBoundary> 까지 전파되지 않는다. 옛 청크가 읽혀 lazy 페이지가
 * 렌더 중 크래시나는 핵심 케이스가 여기에 해당하므로 반드시 필요하다.
 */
export function RouteErrorBoundary() {
  const error = useRouteError();

  useEffect(() => {
    if (tryChunkReload(error)) return;
    if (import.meta.env.DEV) {
      console.error('[RouteErrorBoundary]', error);
    }
  }, [error]);

  return <ErrorFallback />;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * 라우터 바깥(Provider 등)에서 발생한 렌더 에러를 잡는 최후 바운더리.
 * 라우트 내부 에러는 RouteErrorBoundary 가 담당한다.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (tryChunkReload(error)) return;
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error, info.componentStack);
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return <ErrorFallback />;
  }
}
