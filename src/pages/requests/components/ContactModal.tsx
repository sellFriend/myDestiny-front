import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, Copy, Loader2, X } from 'lucide-react';
import { matchingApi, queryKeys, type MatchingResponse } from '@/lib/api';

interface ContactModalProps {
  matching: MatchingResponse;
  onClose: () => void;
}

function ContactRow({ label, value }: { label: string; value: string | null }) {
  const [copied, setCopied] = useState(false);

  if (!value) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-black/8 px-4 py-3.5">
        <span className="text-sm font-semibold text-black/70">{label}</span>
        <span className="text-sm text-black/30">미등록</span>
      </div>
    );
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // 복사 실패는 조용히 무시 (값은 화면에 보임)
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex w-full items-center justify-between rounded-xl border border-black/8 px-4 py-3.5 text-left transition-colors hover:bg-black/[0.03]"
    >
      <span className="flex flex-col">
        <span className="text-[11px] font-medium text-black/40">{label}</span>
        <span className="text-sm font-semibold text-black">{value}</span>
      </span>
      {copied ? (
        <span className="flex items-center gap-1 text-xs font-semibold text-black">
          <Check className="h-3.5 w-3.5" /> 복사됨
        </span>
      ) : (
        <Copy className="h-4 w-4 text-black/30" />
      )}
    </button>
  );
}

export function ContactModal({ matching, onClose }: ContactModalProps) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.matchings.contact(matching.id),
    queryFn: () => matchingApi.contact(matching.id),
  });

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-block bg-white p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 flex items-center justify-between">
          <h3 className="text-lg font-black text-black">연락처</h3>
          <button type="button" onClick={onClose} className="p-1" aria-label="닫기">
            <X className="h-5 w-5 text-black/40" />
          </button>
        </div>
        <p className="mb-5 text-sm text-black/50">
          {data?.name ? `${data.name}님의 연락처예요. 먼저 편하게 인사 건네보세요.` : '성사된 인연의 연락처예요.'}
        </p>

        {isLoading ? (
          <div className="flex h-28 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-black/30" />
          </div>
        ) : isError ? (
          <div className="flex h-28 flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm text-black/50">연락처를 불러오지 못했어요</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-pill bg-black px-4 py-2 text-sm font-semibold text-white"
            >
              다시 시도
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            <ContactRow label="카카오톡 ID" value={data?.kakaoId ?? null} />
            <ContactRow label="인스타그램" value={data?.instagramId ?? null} />
          </div>
        )}
      </div>
    </div>
  );
}
