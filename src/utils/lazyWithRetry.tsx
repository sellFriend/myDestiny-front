import { lazy, type ComponentType } from 'react';

export const RELOAD_FLAG = 'chunk-reload';

/**
 * dynamic import 실패(옛 청크 404, preload 실패)로 인한 에러인지 판별한다.
 * 브라우저/번들러마다 메시지가 달라 여러 시그니처를 함께 본다.
 */
export function isChunkLoadError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = `${error.name} ${error.message}`;
  return (
    /Failed to fetch dynamically imported module/i.test(message) ||
    /error loading dynamically imported module/i.test(message) ||
    /Importing a module script failed/i.test(message) ||
    /ChunkLoadError/i.test(message) ||
    /Loading chunk \d+ failed/i.test(message)
  );
}

/**
 * 새 배포 후 옛 청크가 사라져 dynamic import 가 404 로 실패하는 경우
 * (Failed to fetch dynamically imported module) 1회에 한해 페이지를 새로고침해
 * 최신 index.html / 청크를 다시 받아온다. 무한 새로고침은 sessionStorage 로 가드.
 */
export function lazyWithRetry<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    try {
      const component = await factory();
      // 정상 로드되면 가드 해제
      window.sessionStorage.removeItem(RELOAD_FLAG);
      return component;
    } catch (error) {
      const alreadyReloaded = window.sessionStorage.getItem(RELOAD_FLAG);
      if (!alreadyReloaded) {
        window.sessionStorage.setItem(RELOAD_FLAG, '1');
        window.location.reload();
        // reload 가 진행되는 동안 렌더링을 멈추기 위해 영원히 pending 인 Promise 반환
        return new Promise<{ default: T }>(() => {});
      }
      throw error;
    }
  });
}
