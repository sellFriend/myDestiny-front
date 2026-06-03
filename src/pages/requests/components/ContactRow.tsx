import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface ContactRowProps {
  label: string;
  value: string | null;
}

/** 연락처 한 줄 — 탭하면 클립보드로 복사 (Fitts: 행 전체가 탭 영역) */
export function ContactRow({ label, value }: ContactRowProps) {
  const [copied, setCopied] = useState(false);

  if (!value) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-black/[0.08] px-4 py-3.5">
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
      className="flex w-full items-center justify-between rounded-xl border border-black/[0.08] px-4 py-3.5 text-left transition-colors hover:bg-black/[0.03]"
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
