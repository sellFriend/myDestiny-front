import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Loader2, Send, X } from 'lucide-react';
import { ApiError, matchingApi } from '@/lib/api';
import { type Profile } from '@/pages/explore/hooks/useSwipeCards';
import { type Friend } from '@/pages/friends/components/FriendCard';
import { useFriends } from '@/pages/friends/hooks/useFriends';
import { useAuth } from '@/contexts/AuthContext';
import { LoginModal } from '@/components/LoginModal';

interface DetailModalProps {
  profile: Profile;
  onClose: () => void;
}

const PHOTO_GRADIENTS: Record<string, string> = {
  'bg-pastel-lime': 'from-[#a8d900]/50 to-[#a8d900]/20',
  'bg-pastel-lilac': 'from-[#8b76e8]/50 to-[#8b76e8]/20',
  'bg-pastel-mint': 'from-[#5ed9a8]/50 to-[#5ed9a8]/20',
  'bg-pastel-coral': 'from-[#e05a4a]/50 to-[#e05a4a]/20',
  'bg-pastel-cream': 'from-[#e8c84a]/50 to-[#e8c84a]/20',
  'bg-pastel-pink': 'from-[#e87aab]/50 to-[#e87aab]/20',
};

// 이름 영역 포인트 틴트 — 내 친구 상세와 동일 톤(어휘 통일)
const ACCENT_TINTS: Record<string, string> = {
  'bg-pastel-lime': 'bg-[#ceff6e]/20',
  'bg-pastel-lilac': 'bg-[#c5b8ff]/20',
  'bg-pastel-mint': 'bg-[#b8ffe5]/25',
  'bg-pastel-coral': 'bg-[#ff8b7b]/15',
  'bg-pastel-cream': 'bg-[#fff6d3]/35',
  'bg-pastel-pink': 'bg-[#ffb8d0]/20',
};

/** 드롭다운에 보여줄 친구 한 줄 표기: "이름, 나이 · 직업/학교" */
function friendOptionLabel(f: Friend) {
  const job = f.isStudent ? [f.school, f.major].filter(Boolean).join(' · ') : f.occupation;
  return job ? `${f.name}, ${f.age} · ${job}` : `${f.name}, ${f.age}`;
}

export function DetailModal({ profile, onClose }: DetailModalProps) {
  const { isLoggedIn } = useAuth();
  const { friends } = useFriends(isLoggedIn);
  // 매칭 요청은 한 사람에게만 걸 수 있어, 이미 성사됐거나(matched) 다른 요청을 보낸 중(hasOutgoingRequest)인
  // 친구는 선택 목록에서 뺀다. (profiles-match-candidate-filter-frontend-guide §2)
  const registeredFriends = friends.filter(
    (f) => f.status === 'approved' && !f.isMatched && !f.hasOutgoingRequest,
  );

  const [showLogin, setShowLogin] = useState(false);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [view, setView] = useState<'detail' | 'request' | 'sent'>('detail');
  const [selectedFriendId, setSelectedFriendId] = useState('');
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const queryClient = useQueryClient();

  // 매칭 요청 생성 (POST /api/matchings). 성공하면 'sent' 화면으로,
  // 409/400(쿨다운·중복·미공개 등)은 서버 message 를 그대로 노출한다. (matching-frontend-guide §3.1)
  const createMatching = useMutation({
    mutationFn: () =>
      matchingApi.create({
        requesterProfileId: selectedFriendId,
        targetProfileId: profile.id,
        message: message.trim() || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matchings'] });
      setView('sent');
    },
    onError: (error) => {
      setErrorMsg(
        error instanceof ApiError
          ? error.message
          : '요청을 보내지 못했어요. 잠시 후 다시 시도해 주세요.',
      );
    },
  });

  const gradient = PHOTO_GRADIENTS[profile.cardColor] ?? 'from-black/20 to-black/5';
  const accentTint = ACCENT_TINTS[profile.cardColor] ?? 'bg-black/[0.03]';

  const occupationLine = profile.isStudent
    ? `${profile.school} · ${profile.major}`
    : profile.occupation;

  const handleContactRequest = () => {
    if (!isLoggedIn) {
      setShowLogin(true);
      return;
    }
    // 웹·앱 모두 콘텐츠 영역을 폼으로 인라인 전환한다.
    setView('request');
  };

  const handleSend = () => {
    if (!selectedFriendId || createMatching.isPending) return;
    setErrorMsg('');
    createMatching.mutate();
  };

  const viewAnim = {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
    transition: { duration: 0.18, ease: 'easeOut' as const },
  };

  const primaryBtn =
    'flex items-center justify-center gap-2 rounded-pill bg-black py-3.5 text-sm font-bold text-white transition-all hover:bg-black/85 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-30';
  const ghostBtn =
    'flex items-center justify-center gap-2 rounded-pill bg-black/[0.05] py-3.5 text-sm font-semibold text-black/60 transition-colors hover:bg-black/[0.09] hover:text-black/80';

  return (
    <>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      >
        <motion.div
          className="relative flex max-h-[90vh] w-full max-w-sm flex-col overflow-hidden rounded-block bg-white sm:h-[72vh] sm:max-h-[600px] sm:max-w-4xl sm:flex-row sm:shadow-2xl"
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 360, damping: 40 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 닫기 — 사진 위(모바일)·흰 배경(웹) 모두 보이도록 반응형 스타일 */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3.5 top-3.5 z-30 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition-colors bg-black/40 text-white hover:bg-black/55 sm:bg-black/[0.06] sm:text-black/55 sm:hover:bg-black/10 sm:hover:text-black/80"
            aria-label="닫기"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Photo column — 웹에선 좌측 절반을 채우는 큰 사진 영역 */}
          <div className="relative flex-shrink-0 sm:w-1/2">
            {profile.photo ? (
              <button
                type="button"
                onClick={() => setIsImageOpen(true)}
                className="block h-52 w-full cursor-zoom-in sm:h-full"
                aria-label="사진 크게 보기"
              >
                <img
                  src={profile.photo}
                  alt={profile.name}
                  className="h-full w-full object-cover"
                />
                {/* 탭 힌트 — 사진 하단 그라데이션 위에 표기 */}
                <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-center bg-gradient-to-t from-black/45 to-transparent pb-3 pt-8 text-[11px] font-semibold text-white/90">
                  탭하여 사진 크게 보기
                </span>
              </button>
            ) : (
              <div
                className={`flex h-52 items-center justify-center bg-gradient-to-br ${gradient} sm:h-full`}
              >
                <span className="text-7xl font-black text-white/60 select-none">
                  {profile.name.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Content column — 프로필 보기 ↔ 연락 요청 폼을 인라인 전환 */}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <AnimatePresence mode="wait" initial={false}>
              {view === 'request' ? (
                <motion.div key="request" className="flex min-h-0 flex-1 flex-col" {...viewAnim}>
                  <div className="flex-shrink-0 border-b border-black/5 px-6 pb-4 pt-6">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-black/35">
                      연락 요청
                    </p>
                    <p className="mt-1 text-base font-bold text-black">
                      {profile.name}님에게 내 친구를 소개해요
                    </p>
                  </div>

                  <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6 sm:min-h-0">
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-black/40">
                        소개할 내 친구
                      </label>
                      {registeredFriends.length > 0 ? (
                        <select
                          value={selectedFriendId}
                          onChange={(e) => {
                            setSelectedFriendId(e.target.value);
                            setErrorMsg('');
                          }}
                          className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black focus:border-black/30 focus:outline-none"
                        >
                          <option value="">친구를 선택해주세요</option>
                          {registeredFriends.map((f) => (
                            <option key={f.id} value={f.id}>
                              {friendOptionLabel(f)}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p className="rounded-xl border border-black/10 bg-black/[0.02] px-4 py-3 text-sm leading-relaxed text-black/45">
                          아직 등록된 친구가 없어요. 친구를 먼저 등록해주세요.
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-black/40">
                        한마디 <span className="text-black/25">(선택)</span>
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="어떤 점이 잘 어울릴지 적어주세요"
                        rows={3}
                        maxLength={200}
                        className="w-full resize-none rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black focus:border-black/30 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex-shrink-0 border-t border-black/5 px-6 py-4">
                    {errorMsg && (
                      <p className="mb-3 rounded-xl bg-pastel-coral/15 px-4 py-2.5 text-sm leading-relaxed text-pastel-coral">
                        {errorMsg}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setErrorMsg('');
                          setView('detail');
                        }}
                        className={`${ghostBtn} w-24 shrink-0`}
                      >
                        이전
                      </button>
                      <button
                        type="button"
                        onClick={handleSend}
                        disabled={!selectedFriendId || createMatching.isPending}
                        className={`${primaryBtn} flex-1`}
                      >
                        {createMatching.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                        보내기
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : view === 'sent' ? (
                <motion.div
                  key="sent"
                  className="flex min-h-0 flex-1 flex-col items-center justify-center px-8 py-10 text-center"
                  {...viewAnim}
                >
                  <motion.div
                    className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-pastel-lime"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.05 }}
                  >
                    <Check className="h-8 w-8 text-black" strokeWidth={3} />
                  </motion.div>
                  <p className="mb-2 text-lg font-black text-black">요청을 보냈어요</p>
                  <p className="mb-6 text-sm leading-relaxed text-black/50">
                    상대 주선자가 수락하면
                    <br />
                    서로의 연락처를 주고받아요.
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-pill bg-black px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-black/85"
                  >
                    확인
                  </button>
                </motion.div>
              ) : (
                <motion.div key="detail" className="flex min-h-0 flex-1 flex-col" {...viewAnim}>
                  {/* Identity header */}
                  <div className={`${accentTint} flex-shrink-0 border-b border-black/5 px-6 pb-5 pt-6`}>
                    {/* 주선자 — 도메인 용어 대신 관계 문장으로 (UX §5 Cognitive Load) */}
                    {profile.registrant && (
                      <p className="mb-1.5 text-xs font-semibold text-black/40">
                        {profile.registrant}님이 소개하는 친구
                      </p>
                    )}
                    <div className="flex items-baseline gap-2">
                      <h2 className="text-2xl font-black text-black sm:text-[1.75rem]">{profile.name}</h2>
                      <span className="text-base font-bold text-black/45">{profile.age}세</span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-black/55">{occupationLine}</p>
                  </div>

                  {/* Details */}
                  <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6 sm:min-h-0">
                    <div>
                      <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-black/35">MBTI</p>
                      <span className="rounded-pill bg-black px-3 py-1.5 text-sm font-bold text-white">
                        {profile.mbti}
                      </span>
                    </div>

                    <div>
                      <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-black/35">취미</p>
                      <div className="flex flex-wrap gap-2">
                        {profile.hobbies.map((h) => (
                          <span
                            key={h}
                            className="rounded-pill border border-black/10 bg-black/5 px-3 py-1.5 text-sm text-black/70"
                          >
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-black/35">소개글</p>
                      <p className="text-sm leading-relaxed text-black/65">{profile.intro}</p>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="flex-shrink-0 border-t border-black/5 px-6 py-5">
                    <button type="button" onClick={handleContactRequest} className={`${primaryBtn} w-full`}>
                      <Send className="h-4 w-4" />
                      연락 요청 보내기
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>

      {/* Image lightbox — 사진을 화면 가득 크게 보기 */}
      {isImageOpen && profile.photo && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setIsImageOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsImageOpen(false)}
            className="absolute right-4 top-[calc(env(safe-area-inset-top,0px)+1rem)] z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
            aria-label="닫기"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={profile.photo}
            alt={profile.name}
            className="max-h-full max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {showLogin && (
        <LoginModal
          message="연락 요청을 보내려면 로그인이 필요해요."
          onClose={() => setShowLogin(false)}
        />
      )}
    </>
  );
}
