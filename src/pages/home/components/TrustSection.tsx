import { motion } from 'framer-motion';

const TRUST_POINTS = [
  {
    title: '아는 사람이 소개해요',
    description: '모르는 사람의 추천이 아니라, 실제 지인이 직접 소개해요.',
    bg: 'bg-pastel-cream',
  },
  {
    title: '갑자기 연락 오지 않아요',
    description: '상대와 소개자의 동의가 있어야만 연결돼요.',
    bg: 'bg-pastel-mint',
  },
  {
    title: '알고 만날 수 있어요',
    description: '기본 정보와 자기소개를 보고, 천천히 결정하세요.',
    bg: 'bg-pastel-pink',
  },
] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

export function TrustSection() {
  return (
    <section className="px-6 py-24 bg-white">
      <div className="max-w-5xl mx-auto">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <p className="text-sm font-mono uppercase tracking-widest text-black/40 mb-4">
            Why MyDestiny
          </p>
          <h2 className="text-5xl font-black text-black tracking-tighter mb-16">
            왜 더 믿을 수 있을까요?
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TRUST_POINTS.map((point, i) => (
            <motion.div
              key={point.title}
              className={`${point.bg} rounded-block p-8`}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: i * 0.12 }}
            >
              <h3 className="text-lg font-bold text-black mb-3">{point.title}</h3>
              <p className="text-sm text-black/60 leading-relaxed">{point.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
