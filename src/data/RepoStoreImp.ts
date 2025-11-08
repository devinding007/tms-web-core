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
    // if (ret == null) {
    //   throw new Error(`人材ＩＤ[${id}]が見つかりません`);
    // }
    return ret;
  }
  save(resumeData: ResumeData): void {
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
    const i = this.store.items.findIndex((v) => v.人材ＩＤ === personnel.人材ＩＤ);
    i >= 0 ? this.store.items.splice(i, 1, personnel) : this.store.items.push(personnel);
  }
  remove(id: string): void {
    const i = this.store.items.findIndex((v) => v.人材ＩＤ === id);
    if (i >= 0) this.store.items.splice(i, 1);
  }
}
