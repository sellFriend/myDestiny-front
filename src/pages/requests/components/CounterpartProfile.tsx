import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { profileApi, queryKeys, type GenderUpper, type MatchingProfileRef } from '@/lib/api';
import { ProfileAvatar } from '@/pages/requests/components/ProfileAvatar';

/** 콤마/슬래시/가운뎃점으로 구분된 취미 문자열을 태그 배열로 (explore와 동일 규칙 · Jakob's Law) */
function parseHobbies(hobby: string | null): string[] {
  if (!hobby) return [];
  return hobby
    .split(/[,/·]/)
    .map((h) => h.trim())
    .filter(Boolean);
}

function genderLabel(gender: GenderUpper): string {
  if (gender === 'FEMALE') return '여성';
  if (gender === 'MALE') return '남성';
  return '';
}

interface CounterpartProfileProps {
  profile: MatchingProfileRef;
}

/**
 * 요청함 상세의 '상대 지인'(결정의 주인공) 카드.
 * 리스트 응답엔 이름·성별만 있어, 상세 진입 시 profiles/{id}(ProfileDetail)로
 * 나이·직업·MBTI·취미·소개·사진을 별도 fetch 한다. (UX 설계 §2 ② · §6.3 점진적 공개)
 *
 * ref(name·gender)가 바닥값이라 상세 fetch가 실패(권한·네트워크)해도 헤더는 그대로 유지된다.
 */
export function CounterpartProfile({ profile }: CounterpartProfileProps) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.profiles.detail(profile.id),
    queryFn: () => profileApi.get(profile.id),
  });

  // 직업 한 줄: 학생이면 학교·학과, 아니면 직업 (explore 상세와 동일 규칙)
  const jobLine = data
    ? data.isStudent
      ? [data.schoolName, data.major].filter(Boolean).join(' · ')
      : data.occupation
    : null;

  // 헤더 보조 라인: 성별 · 직업 (둘 다 없으면 '프로필')
  const subLine = [genderLabel(profile.gender), jobLine].filter(Boolean).join(' · ') || '프로필';

  // 매칭 ref의 photoUrls 로 갤러리·아바타를 즉시 렌더하고, 상세 fetch가 도착하면 그쪽 사진으로 교체한다.
  // 사진 1장은 아바타로 충분 — 2장 이상일 때만 갤러리로 펼친다. (§1 single-focus 유지)
  const photos = data?.photoUrls ?? profile.photoUrls;
  const hasGallery = photos.length > 1;

  // 원형 앵커는 항상 첫 사진으로 (ref.photoUrls → 상세 fetch 순으로 폴백)
  const avatarRef: MatchingProfileRef = {
    ...profile,
    photoUrls: photos,
  };

  const hobbies = parseHobbies(data?.hobby ?? null);

  return (
    <div className="rounded-2xl bg-black/[0.025] px-5 py-4">
      {/* 앵커: 사진 + 이름(·나이) + 성별/직업 */}
      <div className="flex items-center gap-4">
        <ProfileAvatar profile={avatarRef} size={64} />
        <div className="min-w-0">
          <div className="flex items-baseline gap-1.5">
            <p className="text-lg font-bold text-black">{profile.name}</p>
            {data && <span className="text-sm font-semibold text-black/45">{data.age}세</span>}
          </div>
          <p className="mt-0.5 truncate text-sm text-black/45">{subLine}</p>
        </div>
      </div>

      {isLoading && (
        <div className="mt-4 flex h-14 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-black/25" />
        </div>
      )}

      {isError && (
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-3 w-full rounded-xl bg-black/[0.04] py-2.5 text-sm font-medium text-black/45 transition-colors hover:bg-black/[0.07]"
        >
          상세 정보를 불러오지 못했어요 · 다시 시도
        </button>
      )}

      {data && (
        <div className="mt-4 space-y-4 border-t border-black/[0.06] pt-4">
          {hasGallery && (
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {photos.map((url) => (
                <img
                  key={url}
                  src={url}
                  alt={`${data.name} 사진`}
                  className="h-28 w-24 shrink-0 rounded-xl object-cover"
                />
              ))}
            </div>
          )}

          {data.mbti && (
            <div>
              <p className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-black/35">
                MBTI
              </p>
              <span className="rounded-pill bg-black px-3 py-1.5 text-sm font-bold text-white">
                {data.mbti}
              </span>
            </div>
          )}

          {hobbies.length > 0 && (
            <div>
              <p className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-black/35">
                취미
              </p>
              <div className="flex flex-wrap gap-2">
                {hobbies.map((hobby) => (
                  <span
                    key={hobby}
                    className="rounded-pill border border-black/10 bg-black/5 px-3 py-1.5 text-sm text-black/70"
                  >
                    {hobby}
                  </span>
                ))}
              </div>
            </div>
          )}

          {data.introduction && (
            <div>
              <p className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-black/35">
                소개글
              </p>
              <p className="text-sm leading-relaxed text-black/65">{data.introduction}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
