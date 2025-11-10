import { ExamPaper } from '@/types/models/ExamPaper';
import { defineStore } from 'pinia';

const SAMPLE_EXAMPAPER: ExamPaper[] = [];

export const useExamPaperStore = defineStore('examPaper', {
  state: () => ({
    items: [...SAMPLE_EXAMPAPER] as ExamPaper[],
  }),
  getters: {
    byId: (s) => (id: string) => s.items.find((v) => v.試験用紙ＩＤ === id),
  },
  actions: {
    setAll(rows: ExamPaper[]) {
      this.items = rows;
    },
    upsert(row: ExamPaper) {
      const i = this.items.findIndex((x) => x.試験用紙ＩＤ === row.試験用紙ＩＤ);
      if (i >= 0) this.items.splice(i, 1, row);
      else this.items.push(row);
    },
    remove(id: string) {
      const i = this.items.findIndex((x) => x.試験用紙ＩＤ === id);
      if (i >= 0) this.items.splice(i, 1);
    },
  },
  persist: true,
});
