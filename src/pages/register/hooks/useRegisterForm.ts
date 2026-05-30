import { useState } from 'react';

export interface RegisterFormData {
  photoPreview: string;
  name: string;
  age: string;
  isStudent: boolean | null;
  school: string;
  major: string;
  occupation: string;
  mbti: string;
  hobbies: string[];
  intro: string;
  contact: string;
}

const INITIAL_FORM: RegisterFormData = {
  photoPreview: '',
  name: '',
  age: '',
  isStudent: null,
  school: '',
  major: '',
  occupation: '',
  mbti: '',
  hobbies: [],
  intro: '',
  contact: '',
};

const TOTAL_STEPS = 10;

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
