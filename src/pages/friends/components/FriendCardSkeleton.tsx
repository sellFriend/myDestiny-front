export function FriendCardSkeleton() {
  return (
    <div className="bg-white border border-black/10 rounded-block overflow-hidden">
      <div className="h-60 bg-black/[0.06] animate-pulse" />
      <div className="bg-black/[0.02] px-5 pt-3 pb-4">
        <div className="h-3 w-2/3 bg-black/[0.08] rounded animate-pulse mb-2" />
        <div className="h-6 w-1/2 bg-black/[0.10] rounded animate-pulse mb-3" />
        <div className="h-4 w-full bg-black/[0.06] rounded animate-pulse mb-1.5" />
        <div className="h-4 w-3/4 bg-black/[0.06] rounded animate-pulse mb-4" />
        <div className="flex gap-1.5">
          <div className="h-6 w-14 bg-black/[0.06] rounded-pill animate-pulse" />
          <div className="h-6 w-16 bg-black/[0.06] rounded-pill animate-pulse" />
          <div className="h-6 w-12 bg-black/[0.06] rounded-pill animate-pulse" />
        </div>
      </div>
    </div>
  );
}
