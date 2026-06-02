import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ROUTES } from '@/constants/routes';

interface CTASectionProps {
  onRegisterFriend: () => void;
}

export function CTASection({ onRegisterFriend }: CTASectionProps) {
  return (
    <section className="px-6 py-24 bg-pastel-navy text-white">
      <motion.div
        className="max-w-3xl mx-auto text-center"
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <h2 className="text-5xl font-black tracking-tighter mb-6 leading-tight">
          소개할 준비가 됐다면<br />지금 시작하세요
        </h2>
        <p className="text-white/60 mb-10 leading-relaxed">
          좋은 인연은 좋은 소개에서 시작됩니다. <br />
          새로운 만남의 시작을 만들어보세요.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={onRegisterFriend}
            className="px-8 py-4 bg-white text-black text-sm font-semibold rounded-pill hover:bg-white/90 transition-colors"
          >
            친구 등록하기
          </button>
          <Link
            to={ROUTES.EXPLORE}
            className="px-8 py-4 border border-white/40 text-white text-sm font-semibold rounded-pill hover:border-white/80 transition-colors"
          >
            둘러보기
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
