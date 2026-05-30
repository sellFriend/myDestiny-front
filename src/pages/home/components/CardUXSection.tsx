export function CardUXSection() {
  return (
    <section className="px-6 py-24 bg-black text-white overflow-hidden">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-16">
        <div className="flex-1">
          <p className="text-sm font-mono uppercase tracking-widest text-white/40 mb-4">
            Card UX
          </p>
          <h2 className="text-5xl font-black tracking-tighter mb-6 leading-tight">
            삼성페이처럼<br />직관적으로
          </h2>
          <p className="text-white/60 leading-relaxed mb-8">
            카드를 스와이프하며 친구의 프로필을 탐색하고,
            마음에 드는 카드를 클릭해 상세 정보를 확인하세요.
            복잡한 필터링 없이 직관적인 UX로 소개팅을 경험합니다.
          </p>
          <ul className="space-y-3 text-sm text-white/60">
            {['좌우 스와이프로 프로필 탐색', '카드 클릭으로 상세 정보 확인', '원하는 친구와 연결 요청'].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-pastel-lime flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex-1 flex justify-center">
          <div className="relative w-64 h-80">
            <div className="absolute inset-0 bg-pastel-coral rounded-block rotate-6 opacity-60" />
            <div className="absolute inset-0 bg-pastel-pink rounded-block rotate-3 opacity-80" />
            <div className="absolute inset-0 bg-white rounded-block shadow-2xl">
              <div className="p-6 h-full flex flex-col">
                <div className="flex-1 bg-pastel-cream rounded-xl mb-4" />
                <div className="space-y-2">
                  <div className="h-4 w-28 bg-black/10 rounded" />
                  <div className="h-3 w-20 bg-black/5 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
