import { useState } from 'react';
import { Check, X } from 'lucide-react';
import type { Gender } from '@/lib/api';
import { useAcquaintanceReview } from '@/hooks/useAcquaintanceReview';

interface AcquaintanceReviewModalProps {
  acquaintanceId: string;
  onClose: () => void;
}

function genderLabel(gender: Gender | null): string {
  if (gender === 'female') return '여';
  if (gender === 'male') return '남';
  return '';
}

/** 콤마/슬래시로 구분된 취미 문자열을 태그 배열로 변환 */
function parseHobbies(hobbies: string | null): string[] {
  if (!hobbies) return [];
  return hobbies
    .split(/[,/·]/)
    .map((h) => h.trim())
    .filter(Boolean);
}

export function AcquaintanceReviewModal({ acquaintanceId, onClose }: AcquaintanceReviewModalProps) {
  const { detail, isLoading, isError, approve, reject, isApproving, isRejecting, isBusy } =
    useAcquaintanceReview(acquaintanceId, onClose);
  const [confirmReject, setConfirmReject] = useState(false);

  const gender = detail ? genderLabel(detail.gender) : '';
  const hobbies = detail ? parseHobbies(detail.hobby) : [];
  const photo = detail?.photoUrls[0];
  // 상세(ProfileDetail)는 학생이면 학교·학과를, 아니면 직업을 보여준다.
  const occupationLine = detail
    ? detail.isStudent
      ? [detail.schoolName, detail.major].filter(Boolean).join(' · ')
      : (detail.occupation ?? '')
    : '';

  return (
    <div
      className="fixed inset-0 z-[70] flex justify-center bg-black/50 sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative flex h-full w-full flex-col overflow-y-auto bg-white sm:h-auto sm:max-h-[80vh] sm:max-w-md sm:rounded-block sm:shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3.5 top-3.5 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.06] text-black/55 transition-colors hover:bg-black/10 hover:text-black/80"
          aria-label="닫기"
        >
          <X className="h-4 w-4" />
        </button>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-black/20 border-t-black" />
          </div>
        ) : isError || !detail ? (
          <div className="flex h-64 flex-col items-center justify-center px-6 text-center">
            <p className="mb-2 text-lg font-black text-black">불러오지 못했어요</p>
            <p className="text-sm text-black/40">잠시 후 다시 시도해 주세요</p>
          </div>
        ) : (
          <>
            <div className="border-b border-black/5 px-6 pb-5 pt-7">
              <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-black/35">
                폼 제출 확인
              </p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-2xl font-black tracking-tight text-black">{detail.name}</h2>
                <span className="text-base font-bold text-black/45">{detail.age}세</span>
                {gender && <span className="text-sm font-medium text-black/40">· {gender}</span>}
              </div>
              {occupationLine && (
                <p className="mt-1 text-sm font-medium text-black/55">{occupationLine}</p>
              )}
            </div>

            <div className="space-y-5 px-6 py-6">
              {photo && (
                <img
                  src={photo}
                  alt={detail.name}
                  className="aspect-[4/5] w-full rounded-block object-cover"
                />
              )}

              {detail.mbti && (
                <section>
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-black/35">
                    MBTI
                  </p>
                  <span className="rounded-pill bg-black px-3.5 py-1.5 text-sm font-bold text-white">
                    {detail.mbti}
                  </span>
                </section>
              )}

              {hobbies.length > 0 && (
                <section>
                  <p className="mb-2.5 font-mono text-[10px] uppercase tracking-widest text-black/35">
                    취미
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {hobbies.map((h) => (
                      <span
                        key={h}
                        className="rounded-pill border border-black/10 bg-black/[0.03] px-3 py-1.5 text-sm text-black/70"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {detail.introduction && (
                <section>
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-black/35">
                    소개글
                  </p>
                  <p className="text-[15px] leading-relaxed text-black/70">
                    {detail.introduction}
                  </p>
                </section>
              )}
            </div>

            <div className="sticky bottom-0 border-t border-black/5 bg-white px-6 py-5">
              {confirmReject ? (
                <div className="space-y-3">
                  <p className="text-center text-sm font-medium text-black/60">
                    거절하면 지인 관리 목록에서 제거돼요. 계속할까요?
                  </p>
                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => setConfirmReject(false)}
                      disabled={isBusy}
                      className="flex-1 rounded-pill border border-black/15 py-3.5 text-sm font-semibold text-black/60 transition-colors hover:border-black/40 hover:text-black disabled:opacity-50"
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      onClick={() => reject()}
                      disabled={isBusy}
                      className="flex-1 rounded-pill bg-black py-3.5 text-sm font-semibold text-white transition-colors hover:bg-black/80 disabled:opacity-50"
                    >
                      {isRejecting ? '거절 중…' : '거절하기'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setConfirmReject(true)}
                    disabled={isBusy}
                    className="flex-1 rounded-pill border border-black/15 py-3.5 text-sm font-semibold text-black/60 transition-colors hover:border-black/40 hover:text-black disabled:opacity-50"
                  >
                    거절
                  </button>
                  <button
                    type="button"
                    onClick={() => approve()}
                    disabled={isBusy}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-pill bg-black py-3.5 text-sm font-semibold text-white transition-colors hover:bg-black/80 disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" />
                    {isApproving ? '승인 중…' : '승인'}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
