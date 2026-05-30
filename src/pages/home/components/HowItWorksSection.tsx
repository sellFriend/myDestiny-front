const STEPS = [
  {
    number: '01',
    title: '프로필을 등록한다',
    description: '소개하고 싶은 친구의 프로필을 작성합니다.',
    bg: 'bg-pastel-lime',
  },
  {
    number: '02',
    title: '카드를 탐색한다',
    description: '다양한 프로필을 카드 형태로 둘러봅니다.',
    bg: 'bg-pastel-lilac',
  },
  {
    number: '03',
    title: '연결 요청을 보낸다',
    description: '관심 있는 사람을 발견하면 연결을 요청합니다.',
    bg: 'bg-pastel-mint',
  },
] as const;

export function HowItWorksSection() {
  return (
    <section className="px-6 py-24 bg-white">
      <div className="max-w-5xl mx-auto">
        <p className="text-sm font-mono uppercase tracking-widest text-black/40 mb-4">
          How it works
        </p>
        <h2 className="text-5xl font-black text-black tracking-tighter mb-16">
          세 단계로 시작하는 새로운 만남
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className={`${step.bg} rounded-block p-8 flex flex-col gap-4`}
            >
              <span className="text-4xl font-black text-black/20 font-mono">
                {step.number}
              </span>
              <h3 className="text-xl font-bold text-black">{step.title}</h3>
              <p className="text-sm text-black/60 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
