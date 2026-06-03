export function MatchingCardSkeleton() {
  return (
    <article className="rounded-block border border-black/[0.08] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:p-6">
      {/* 상대 아바타 + 관계/상태 */}
      <div className="flex items-start gap-3.5">
        <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-black/[0.08]" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="h-5 w-2/3 animate-pulse rounded bg-black/[0.08]" />
            <div className="h-6 w-16 shrink-0 animate-pulse rounded-pill bg-black/[0.08]" />
          </div>
          <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-black/[0.06]" />
        </div>
      </div>

      {/* 액션 */}
      <div className="mt-4 h-11 w-full animate-pulse rounded-pill bg-black/[0.06]" />
    </article>
  );
}
