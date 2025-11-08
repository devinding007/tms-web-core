import { ResumeData } from '@/types/models/Resume';
import { defineStore } from 'pinia';

const SAMPLE_RESUME_DATA: ResumeData[] = [];

export const useResumeDataStore = defineStore('resume', {
  state: () => ({
    items: SAMPLE_RESUME_DATA,
  }),
  persist: true,
});
