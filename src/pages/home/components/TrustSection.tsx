const TRUST_POINTS = [
  {
    title: '실제 지인 기반',
    description: '무작위 매칭이 아닌, 실제로 아는 사람이 소개합니다. 신뢰할 수 있는 연결만 존재합니다.',
    bg: 'bg-pastel-cream',
  },
  {
    title: '마담 승인 시스템',
    description: '소개 요청은 친구의 마담이 직접 승인해야 진행됩니다. 일방적인 연락이 없습니다.',
    bg: 'bg-pastel-mint',
  },
  {
    title: '충분한 정보 제공',
    description: '이름, 나이, 직업, MBTI, 자기소개까지. 만나기 전에 충분히 알아갈 수 있습니다.',
    bg: 'bg-pastel-pink',
  },
] as const;

export function TrustSection() {
  return (
    <section className="px-6 py-24 bg-white">
      <div className="max-w-5xl mx-auto">
        <p className="text-sm font-mono uppercase tracking-widest text-black/40 mb-4">
          Why Madam
        </p>
        <h2 className="text-5xl font-black text-black tracking-tighter mb-16">
          기존 소개팅과<br />무엇이 다른가
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TRUST_POINTS.map((point) => (
            <div key={point.title} className={`${point.bg} rounded-block p-8`}>
              <h3 className="text-lg font-bold text-black mb-3">{point.title}</h3>
              <p className="text-sm text-black/60 leading-relaxed">{point.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
