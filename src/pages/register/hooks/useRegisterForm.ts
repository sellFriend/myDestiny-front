import { useState } from 'react';

export interface RegisterFormData {
  name: string;
  age: string;
  photo: string;
  occupation: string;
  mbti: string;
  interests: string[];
  intro: string;
}

const INITIAL_FORM: RegisterFormData = {
  name: '',
  age: '',
  photo: '',
  occupation: '',
  mbti: '',
  interests: [],
  intro: '',
};

const TOTAL_STEPS = 8;

export function useRegisterForm() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<RegisterFormData>(INITIAL_FORM);
  const [isCompleted, setIsCompleted] = useState(false);

  const updateField = <K extends keyof RegisterFormData>(key: K, value: RegisterFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleInterest = (interest: string) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
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
    toggleInterest,
    goNext,
    goPrev,
    submit,
    reset,
  };
}
