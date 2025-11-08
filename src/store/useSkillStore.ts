import { PersonnelSkillPayload } from '@/types/models/Skill';
import { defineStore } from 'pinia';

const SAMPLE_SKILL_DATA: PersonnelSkillPayload[] = [];

export const useSkillStore = defineStore('skill', {
  state: () => ({
    items: SAMPLE_SKILL_DATA,
  }),
  persist: true,
});
