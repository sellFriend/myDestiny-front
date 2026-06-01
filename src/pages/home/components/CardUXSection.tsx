import { motion } from 'framer-motion';

export function CardUXSection() {
  return (
    <section className="px-6 py-24 bg-black text-white overflow-hidden">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-16">
        <motion.div
          className="flex-1"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <p className="text-sm font-mono uppercase tracking-widest text-white/40 mb-4">
            Card UX
          </p>
          <h2 className="text-5xl font-black tracking-tighter mb-6 leading-tight">
            카드 한 장으로<br />새로운 인연 찾기
          </h2>
          <p className="text-white/60 leading-relaxed mb-8">
            긴 목록을 하나씩 확인할 필요 없이, 카드를 넘기며 새로운 인연을 쉽고 빠르게 찾아보세요.
          </p>
          <ul className="space-y-3 text-sm text-white/60">
            {['스와이프로 새로운 인연 발견', '클릭으로 자세한 정보 확인', '간편하게 연결 요청하기'].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-pastel-lime flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          className="flex-1 flex justify-center"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
        >
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
        </motion.div>
      </div>
    </section>
  );
}
