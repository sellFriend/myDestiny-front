import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ROUTES } from "@/constants/routes";

interface HeroSectionProps {
  onRegisterFriend: () => void;
}

export function HeroSection({ onRegisterFriend }: HeroSectionProps) {
  return (
    <section className="relative -mt-16 min-h-screen flex flex-col items-center justify-center px-6 pt-28 pb-20 overflow-hidden bg-white">
      <div className="absolute top-0 right-0 w-[480px] h-[480px] bg-pastel-lime rounded-block opacity-70 translate-x-1/3 -translate-y-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[320px] h-[320px] bg-pastel-pink rounded-block opacity-60 -translate-x-1/4 translate-y-1/4 pointer-events-none" />

      <div className="relative z-10 text-center max-w-5xl mx-auto">
        <p className="text-sm font-mono uppercase tracking-widest text-black/40 mb-6">
          Acquaintance-based matching
        </p>
        <h1 className="text-5xl md:text-7xl font-black text-black leading-[1.15] tracking-tighter mb-8 ">
          좋은 사람은,
          <br />
          가까운 사람이 더 잘 아니까.
        </h1>
        <p className="text-lg text-black/60 mb-10 max-w-xl mx-auto leading-relaxed">
          신뢰할 수 있는 지인 소개 기반 매칭 플랫폼 <br />
          친구가 대신 소개하고 연결해주는 새로운 만남
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to={ROUTES.EXPLORE}
            className="px-8 py-4 bg-black text-white text-sm font-semibold rounded-pill hover:bg-black/80 transition-colors"
          >
            소개 둘러보기
          </Link>
          <button
            type="button"
            onClick={onRegisterFriend}
            className="px-8 py-4 bg-white text-black text-sm font-semibold rounded-pill border border-black hover:bg-black/5 transition-colors"
          >
            친구 등록하기
          </button>
        </div>
      </div>

      <div className="relative z-10 mt-16 flex justify-center">
        <StackedCardPreview />
      </div>
    </section>
  );
}

function StackedCardPreview() {
  const cards = [
    { color: "bg-pastel-lilac", rotate: -6, zIndex: 0 },
    { color: "bg-pastel-cream", rotate: -3, zIndex: 10 },
    { color: "bg-white border border-black/10", rotate: 0, zIndex: 20 },
  ];

  return (
    <div className="relative w-52 h-72">
      {cards.map((card, i) => (
        <motion.div
          key={i}
          className={`absolute inset-0 ${card.color} rounded-block shadow-lg`}
          style={{ zIndex: card.zIndex }}
          initial={{ rotate: card.rotate }}
          animate={i === 2 ? { x: [0, 8, 0, -8, 0] } : { rotate: card.rotate }}
          transition={
            i === 2
              ? { duration: 8, repeat: Infinity, ease: "easeInOut" }
              : undefined
          }
        >
          {i === 2 && (
            <div className="p-5 h-full flex flex-col justify-end">
              <div className="w-10 h-10 rounded-full bg-pastel-mint mb-3" />
              <div className="w-24 h-3 bg-black/10 rounded mb-2" />
              <div className="w-16 h-2 bg-black/5 rounded" />
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
