import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

export function CTASection() {
  return (
    <section className="px-6 py-24 bg-pastel-navy text-white">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-5xl font-black tracking-tighter mb-6 leading-tight">
          소개할 준비가 됐다면<br />지금 시작하세요
        </h2>
        <p className="text-white/60 mb-10 leading-relaxed">
          친구를 등록하는 것만으로 시작됩니다.
          내 친구의 운명적 만남을 내가 만들어보세요.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to={ROUTES.REGISTER}
            className="px-8 py-4 bg-white text-black text-sm font-semibold rounded-pill hover:bg-white/90 transition-colors"
          >
            친구 등록하기
          </Link>
          <Link
            to={ROUTES.EXPLORE}
            className="px-8 py-4 border border-white/40 text-white text-sm font-semibold rounded-pill hover:border-white/80 transition-colors"
          >
            둘러보기
          </Link>
        </div>
      </div>
    </section>
  );
}
