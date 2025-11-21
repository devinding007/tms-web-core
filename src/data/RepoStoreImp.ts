import { Personnel } from '@/types/models/Personnel';
import { Repo } from './Repo';
import { usePersonnelStore } from '@/store/usePersonnelStore';
import { PageResult, Pagination } from '@/types/models/Pagination';
import { Question } from '@/types/models/Question';
import { useQuestionStore } from '@/store/useQuestionStore';
import { useResumeDataStore } from '@/store/useResumeStore';
import { useSkillStore } from '@/store/useSkillStore';
import { ResumeData } from '@/types/models/Resume';
import { PersonnelSkillPayload } from '@/types/models/Skill';
import { ExamPaper } from '@/types/models/ExamPaper';
import { useExamPaperStore } from '@/store/examPaperStore';
import { ExamRun } from '@/types/models/ExamRun';
import { useExamRunStore } from '@/store/examRunStore';
import cloneDeep from 'lodash.clonedeep';

// Storeを利用する人材管理リポ
export class PersonnelStoreRepo implements Repo<Personnel> {
  private store: ReturnType<typeof usePersonnelStore>;
  constructor() {
    this.store = usePersonnelStore();
  }
  getCount(): number {
    return this.store.items.length;
  }
  list(p: Pagination): PageResult<Personnel> {
    const start = (p.page - 1) * p.size;
    const items = this.store.items;
    return {
      items: items.slice(start, start + p.size),
      total: items.length,
    };
  }

  findById(id: string): Personnel | undefined {
    const ret: Personnel | undefined = this.store.items.find((v) => v.人材ＩＤ === id);
    // if (ret == null) {
    //   throw new Error(`人材ＩＤ[${id}]が見つかりません`);
    // }
    return ret;
  }
  save(personnel: Personnel): void {
    personnel = cloneDeep(personnel);
    const i = this.store.items.findIndex((v) => v.人材ＩＤ === personnel.人材ＩＤ);
    i >= 0 ? this.store.items.splice(i, 1, personnel) : this.store.items.push(personnel);
  }
  remove(id: string): void {
    const i = this.store.items.findIndex((v) => v.人材ＩＤ === id);
    if (i >= 0) this.store.items.splice(i, 1);
  }
}

// Storeを利用する問題管理repo
export class QuestionStoreRepo implements Repo<Question> {
  private store: ReturnType<typeof useQuestionStore>;
  constructor(store = useQuestionStore()) {
    this.store = store;
  }

  list(p: Pagination): PageResult<Question> {
    const { page, size } = p;

    // フィルタ
    let arr = this.store.items;

    // ページング（1始まり）
    const start = Math.max(0, (page - 1) * size);

    return {
      items: this.store.items.slice(start, start + p.size),
      total: this.store.items.length,
    };
  }

  findById(id: string): Question | undefined {
    const hit = this.store.items.find((v) => v.問題ＩＤ === id);
    // if (!hit) throw new Error(`問題ＩＤ [${id}] が見つかりません`);
    return hit;
  }

  save(question: Question): void {
    question = cloneDeep(question);
    // 既存なら更新日時だけ更新
    const i = this.store.items.findIndex((v) => v.問題ＩＤ === question.問題ＩＤ);
    if (i >= 0) {
      this.store.items.splice(i, 1, { ...question });
    } else {
      this.store.items.push({
        ...question,
      });
    }
  }

  remove(id: string): void {
    const i = this.store.items.findIndex((v) => v.問題ＩＤ === id);
    if (i >= 0) this.store.items.splice(i, 1);
  }
}

// Storeを利用する人材管理リポ
export class ResumeDataStoreRepo implements Repo<ResumeData> {
  private store: ReturnType<typeof useResumeDataStore>;
  constructor() {
    this.store = useResumeDataStore();
  }
  getCount(): number {
    return this.store.items.length;
  }
  list(p: Pagination): PageResult<ResumeData> {
    const start = (p.page - 1) * p.size;
    const items = this.store.items;
    return {
      items: items.slice(start, start + p.size),
      total: items.length,
    };
  }

  findById(id: string): ResumeData | undefined {
    const ret: ResumeData | undefined = this.store.items.find((v) => v.人材ＩＤ === id);
    return ret;
  }
  save(resumeData: ResumeData): void {
    resumeData = cloneDeep(resumeData);
    const i = this.store.items.findIndex((v) => v.人材ＩＤ === resumeData.人材ＩＤ);
    i >= 0 ? this.store.items.splice(i, 1, resumeData) : this.store.items.push(resumeData);
  }
  remove(id: string): void {
    const i = this.store.items.findIndex((v) => v.人材ＩＤ === id);
    if (i >= 0) this.store.items.splice(i, 1);
  }
}

// Storeを利用する人材管理リポ
export class SkillStoreRepo implements Repo<PersonnelSkillPayload> {
  private store: ReturnType<typeof useSkillStore>;
  constructor() {
    this.store = useSkillStore();
  }
  getCount(): number {
    return this.store.items.length;
  }
  list(p: Pagination): PageResult<PersonnelSkillPayload> {
    const start = (p.page - 1) * p.size;
    const items = this.store.items;
    return {
      items: items.slice(start, start + p.size),
      total: items.length,
    };
  }

  findById(id: string): PersonnelSkillPayload | undefined {
    const ret: PersonnelSkillPayload | undefined = this.store.items.find((v) => v.人材ＩＤ === id);
    // if (ret == null) {
    //   throw new Error(`人材ＩＤ[${id}]が見つかりません`);
    // }
    return ret;
  }
  save(personnel: PersonnelSkillPayload): void {
    personnel = cloneDeep(personnel);
    const i = this.store.items.findIndex((v) => v.人材ＩＤ === personnel.人材ＩＤ);
    i >= 0 ? this.store.items.splice(i, 1, personnel) : this.store.items.push(personnel);
  }
  remove(id: string): void {
    const i = this.store.items.findIndex((v) => v.人材ＩＤ === id);
    if (i >= 0) this.store.items.splice(i, 1);
  }
}

// Storeを利用する試験用紙管理repo
export class ExamPaperStoreRepo implements Repo<ExamPaper> {
  private store: ReturnType<typeof useExamPaperStore>;
  constructor(store = useExamPaperStore()) {
    this.store = store;
  }

  list(p: Pagination): PageResult<ExamPaper> {
    const { page, size } = p;

    // フィルタ
    let arr = this.store.items;

    // ページング（1始まり）
    const start = Math.max(0, (page - 1) * size);

    return {
      items: this.store.items.slice(start, start + p.size),
      total: this.store.items.length,
    };
  }

  findById(id: string): ExamPaper | undefined {
    const hit = this.store.items.find((v) => v.試験用紙ＩＤ === id);
    // if (!hit) throw new Error(`問題ＩＤ [${id}] が見つかりません`);
    return hit;
  }

  save(examPaper: ExamPaper): void {
    examPaper = cloneDeep(examPaper);
    // 既存なら更新日時だけ更新
    const i = this.store.items.findIndex((v) => v.試験用紙ＩＤ === examPaper.試験用紙ＩＤ);
    if (i >= 0) {
      this.store.items.splice(i, 1, { ...examPaper });
    } else {
      this.store.items.push({
        ...examPaper,
      });
    }
  }

  remove(id: string): void {
    const i = this.store.items.findIndex((v) => v.試験用紙ＩＤ === id);
    if (i >= 0) this.store.items.splice(i, 1);
  }
}

// Storeを利用する試験実施管理repo
export class ExamRunStoreRepo implements Repo<ExamRun> {
  private store: ReturnType<typeof useExamRunStore>;
  constructor(store = useExamRunStore()) {
    this.store = store;
  }

  list(p: Pagination): PageResult<ExamRun> {
    const { page, size } = p;

    // フィルタ
    let arr = this.store.items;

    // ページング（1始まり）
    const start = Math.max(0, (page - 1) * size);

    return {
      items: this.store.items.slice(start, start + p.size),
      total: this.store.items.length,
    };
  }

  findById(id: string): ExamRun | undefined {
    const hit = this.store.items.find((v) => v.試験ＩＤ === id);
    // if (!hit) throw new Error(`問題ＩＤ [${id}] が見つかりません`);
    return hit;
  }

  save(examRun: ExamRun): void {
    examRun = cloneDeep(examRun);
    // 既存なら更新日時だけ更新
    const i = this.store.items.findIndex((v) => v.試験ＩＤ === examRun.試験ＩＤ);
    if (i >= 0) {
      this.store.items.splice(i, 1, { ...examRun });
    } else {
      this.store.items.push({
        ...examRun,
      });
    }
  }

  remove(id: string): void {
    const i = this.store.items.findIndex((v) => v.試験ＩＤ === id);
    if (i >= 0) this.store.items.splice(i, 1);
  }
}

// export class ExamPaperStoreRepo implements Repo<ExamPaper> {
//   private store: ReturnType<typeof useExamPaperStore>;
//   constructor(store = useExamPaperStore()) {
//     this.store = store;
//   }

//   list(p: Pagination): PageResult<ExamPaper> {
//     const { page, size } = p;

//     // フィルタ
//     let arr = this.store.items;

//     // ページング（1始まり）
//     const start = Math.max(0, (page - 1) * size);

//     return {
//       items: this.store.items.slice(start, start + p.size),
//       total: this.store.items.length,
//     };
//   }

//   findById(id: string): ExamPaper | undefined {
//     const hit = this.store.items.find((v) => v.試験用紙ＩＤ === id);
//     // if (!hit) throw new Error(`問題ＩＤ [${id}] が見つかりません`);
//     return hit;
//   }

//   save(examPaper: ExamPaper): void {
//     // 既存なら更新日時だけ更新
//     const i = this.store.items.findIndex((v) => v.試験用紙ＩＤ === examPaper.試験用紙ＩＤ);
//     if (i >= 0) {
//       this.store.items.splice(i, 1, { ...examPaper });
//     } else {
//       this.store.items.push({
//         ...examPaper,
//       });
//     }
//   }

//   remove(id: string): void {
//     const i = this.store.items.findIndex((v) => v.試験用紙ＩＤ === id);
//     if (i >= 0) this.store.items.splice(i, 1);
//   }
// }
