export function MatchingCardSkeleton() {
  return (
    <article className="rounded-block border border-black/10 bg-white p-5 sm:p-6">
      <div className="mb-3 flex items-center justify-between">
        <div className="h-3 w-20 bg-black/[0.08] rounded animate-pulse" />
        <div className="h-5 w-16 bg-black/[0.08] rounded-pill animate-pulse" />
      </div>
      <div className="h-5 w-3/4 bg-black/[0.08] rounded animate-pulse mb-2" />
      <div className="h-4 w-1/2 bg-black/[0.06] rounded animate-pulse mb-5" />
      <div className="h-11 w-full bg-black/[0.06] rounded-pill animate-pulse" />
    </article>
  );
}
