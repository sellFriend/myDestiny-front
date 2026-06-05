import { X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface LoginModalProps {
  message?: string;
  onClose: () => void;
}

export function LoginModal({ message, onClose }: LoginModalProps) {
  const { loginWithKakao } = useAuth();

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white rounded-block p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-black text-black">
            {message ? '로그인이 필요해요' : '로그인'}
          </h3>
          <button type="button" onClick={onClose} className="p-1">
            <X className="w-5 h-5 text-black/40" />
          </button>
        </div>

        {message && (
          <p className="text-sm text-black/50 mb-7 leading-relaxed">{message}</p>
        )}

        <button
          type="button"
          onClick={() => loginWithKakao()}
          className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-pill text-sm font-semibold text-[#191600] bg-[#FEE500] hover:brightness-95 transition-[filter]${message ? '' : ' mt-2'}`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 3C6.97 3 3 6.2 3 10.15c0 2.54 1.69 4.77 4.23 6.03-.18.65-.67 2.4-.77 2.77-.12.46.17.45.36.33.15-.1 2.36-1.6 3.32-2.26.6.09 1.22.13 1.86.13 5.03 0 9-3.2 9-7.15S17.03 3 12 3Z"
              fill="#191600"
            />
          </svg>
          카카오로 시작하기
        </button>
      </div>
    </div>
  );
}
