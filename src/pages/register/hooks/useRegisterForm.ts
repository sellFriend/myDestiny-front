import { useState } from 'react';

export interface RegisterFormData {
  photoPreview: string;
  name: string;
  age: string;
  gender: 'male' | 'female' | null;
  isStudent: boolean | null;
  school: string;
  major: string;
  occupation: string;
  mbti: string;
  hobbies: string[];
  intro: string;
  phoneNumber: string; // 하이픈 없는 숫자만 저장 (서버 전송용). 화면에서만 하이픈 표시. 중복 방지용·비공개.
  instagramId: string; // 공개 연락처 (인스타/카카오 중 하나는 필수)
  kakaoId: string; // 공개 연락처 (인스타/카카오 중 하나는 필수)
}

const INITIAL_FORM: RegisterFormData = {
  photoPreview: '',
  name: '',
  age: '',
  gender: null,
  isStudent: null,
  school: '',
  major: '',
  occupation: '',
  mbti: '',
  hobbies: [],
  intro: '',
  phoneNumber: '',
  instagramId: '',
  kakaoId: '',
};

const TOTAL_STEPS = 7;

export function useRegisterForm() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<RegisterFormData>(INITIAL_FORM);
  const [isCompleted, setIsCompleted] = useState(false);

  const updateField = <K extends keyof RegisterFormData>(key: K, value: RegisterFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleHobby = (hobby: string) => {
    setForm((prev) => ({
      ...prev,
      hobbies: prev.hobbies.includes(hobby)
        ? prev.hobbies.filter((h) => h !== hobby)
        : [...prev.hobbies, hobby],
    }));
  };

  const goNext = () => {
    if (step < TOTAL_STEPS) setStep((s) => s + 1);
  };

  const goPrev = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const submit = () => setIsCompleted(true);

  const reset = () => {
    setForm(INITIAL_FORM);
    setStep(1);
    setIsCompleted(false);
  };

  return {
    step,
    totalSteps: TOTAL_STEPS,
    form,
    isCompleted,
    updateField,
    toggleHobby,
    goNext,
    goPrev,
    submit,
    reset,
  };
}
