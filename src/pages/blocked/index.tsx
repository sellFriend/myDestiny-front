import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

/**
 * 매물(친구)로 등록된 사용자가 서비스를 이용하려 할 때 보여주는 안내 페이지.
 * 필터 단 403(매물 사용자 전체 차단)을 받으면 로그아웃 처리 후 이 경로로 이동한다.
 * (cross-role-block-guide.md — 두 역할은 동시에 가질 수 없다.)
 */
const BlockedPage = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <h2 className="text-2xl font-black text-black mb-3">이용할 수 없는 계정이에요</h2>
      <p className="text-black/50 leading-relaxed mb-8">
        친구로 등록된 계정은 주선자 서비스를 이용할 수 없어요.
        <br />
        매칭 소개는 나를 등록한 주선자를 통해 진행돼요.
      </p>
      <Link
        to={ROUTES.HOME}
        className="px-6 py-3 border border-black/10 text-black/60 text-sm font-semibold rounded-pill"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
};

export default BlockedPage;
