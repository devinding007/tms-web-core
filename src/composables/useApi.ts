import type { ApiListResult } from '@/types/api';
import type { Personnel } from '@/types/models/Personnel';
import type { Question } from '@/types/models/Question';
import type { PersonnelSkillPayload, SkillItem } from '@/types/models/Skill';
import type { ExamPaper } from '@/types/models/ExamPaper';

import { ResumeData } from '@/types/models/Resume';
import { PageResult, Pagination } from '@/types/models/Pagination';
import { SkillSummary } from '@/types/models/SkillSummary';
import { http } from '@/plugins/axios';
import { Repo } from '@/data/Repo';
import {
  ExamPaperStoreRepo,
  ExamRunStoreRepo,
  PersonnelStoreRepo,
  QuestionStoreRepo,
  SkillStoreRepo,
} from '@/data/RepoStoreImp';
import { ExamSession, ExamSubmissionPayload } from '@/types/models/Exam';
import { EXAM_RUN_STATUS, ExamRunStatus, 試験実施ステータス } from '@/types/codes';
import { ExamRun } from '@/types/models/ExamRun';
import { useLink } from 'vuetify/lib/composables/router.mjs';
import cloneDeep from 'lodash.clonedeep';

export function uuid(): string {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
}

function delay<T>(data: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

// 人材データ検索
export async function listPersonnel(
  keyword?: string,
  page = 1,
  pageSize = 10
): Promise<ApiListResult<Personnel>> {
  const repo: Repo<Personnel> = new PersonnelStoreRepo();
  const pagination: Pagination = {
    page: page,
    size: pageSize,
  };

  // const { items: listResult, total: total } = repo.list(pagination);

  return delay(repo.list(pagination));
}
export async function getPersonnel(id: string): Promise<Personnel | undefined> {
  return delay(new PersonnelStoreRepo().findById(id), 3000);
  // return delay(PERSONNEL.find((p) => p.人材ＩＤ === id));
}
export async function createPersonnel(p: Omit<Personnel, '人材ID'>): Promise<Personnel> {
  const newItem: Personnel = {
    ...p,
    人材ＩＤ: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
  } as Personnel;
  new PersonnelStoreRepo().save(newItem);
  // (PERSONNEL as any).unshift(newItem);
  return delay(newItem, 1200);
}
export async function updatePersonnel(p: Personnel): Promise<Personnel> {
  // const idx = PERSONNEL.findIndex((x) => x.人材ＩＤ === p.人材ＩＤ);
  // if (idx >= 0) PERSONNEL[idx] = p;
  new PersonnelStoreRepo().save(p);
  return delay(p, 1200);
}

// 人材データ削除
export async function deletePersonnel(id: string): Promise<void> {
  new PersonnelStoreRepo().remove(id);
  // const idx = PERSONNEL.findIndex((x) => x.人材ＩＤ === id);
  // if (idx >= 0) PERSONNEL.splice(idx, 1);
  return delay(undefined as any, 300);
}

export async function listSkillOptions(): Promise<string[]> {
  const res = new SkillStoreRepo().list({
    page: 1,
    size: 100,
  });
  const skillList: Set<string> = new Set();
  res.items.forEach((item) => {
    item.スキル.forEach((skill) => {
      skillList.add(skill.スキル名);
    });
  });
  return delay([...skillList]);
}

// スキル取得
export async function getSkillsByPersonnelId(id: string): Promise<SkillItem[]> {
  const skillPayload: PersonnelSkillPayload | undefined = new SkillStoreRepo().findById(id);
  return delay(skillPayload ? [...skillPayload.スキル] : []);
}
// スキル保存
export async function saveSkills(payload: PersonnelSkillPayload): Promise<void> {
  // SKILLS[payload.人材ＩＤ] = payload.スキル.map((s) => ({ ...s }));
  new SkillStoreRepo().save(payload);
  return delay(undefined as any, 300);
}

export interface QuestionFilters {
  問題ＩＤ?: string;
  スキル?: string;
  難易度_FROM?: number;
  難易度_TO?: number;
  自動生成フラグ?: 0 | 1;
  キーワード?: string;
}
export async function listQuestions(
  filters: QuestionFilters,
  page = 1,
  pageSize = 10
): Promise<ApiListResult<Question>> {
  const pagination: Pagination = {
    page: page,
    size: pageSize,
  };
  const repo = new QuestionStoreRepo();
  const res: PageResult<Question> = repo.list(pagination);
  return delay({
    items: res.items,
    total: res.total,
  });
}
export async function getQuestion(id: string): Promise<Question | undefined> {
  return delay(new QuestionStoreRepo().findById(id));
}
export async function saveQuestion(q: Question): Promise<Question> {
  new QuestionStoreRepo().save(q);
  return delay(q);
}
export async function deleteQuestion(id: string): Promise<void> {
  new QuestionStoreRepo().remove(id);
  return delay(undefined as any, 800);
}

// 試験用紙関連
export interface PaperFilters {
  名称?: string;
  説明?: string;
  keyword?: string;
}
export async function listExamPapers(
  filters: PaperFilters,
  page = 1,
  pageSize = 10
): Promise<ApiListResult<ExamPaper>> {
  const pagination: Pagination = {
    page: page,
    size: pageSize,
  };
  const res: PageResult<ExamPaper> = new ExamPaperStoreRepo().list(pagination);
  return delay({ items: res.items, total: res.total });
}

export async function getExamPaper(id: string): Promise<ExamPaper | undefined> {
  return delay(new ExamPaperStoreRepo().findById(id));
}

export async function getExamExecutionPaper(id: string): Promise<ExamPaper | undefined> {
  const executionPaper: ExamPaper | undefined = {
    試験用紙ＩＤ: '',
    試験用紙名称: '',
    説明: '',
    作成日時: '',
    問題リスト: [],
  };
  Object.assign(executionPaper, new ExamPaperStoreRepo().findById(id));
  executionPaper.問題リスト = [];
  return delay(executionPaper);
}

export async function saveExamPaper(paper: ExamPaper): Promise<ExamPaper> {
  new ExamPaperStoreRepo().save(paper);
  return delay(paper, 800);
}

export async function deleteExamPaper(id: string): Promise<void> {
  new ExamPaperStoreRepo().remove(id);
  return delay(undefined, 500);
}

export async function aiGenerateQuestion(seed?: Partial<Question>): Promise<Question> {
  const skill = seed?.スキル || 'General';
  const randId = () =>
    globalThis.crypto && 'randomUUID' in globalThis.crypto
      ? (globalThis.crypto as any).randomUUID()
      : Math.random().toString(36).slice(2);
  const qid = randId();
  const choices = [0, 1, 2, 3].map((i) => ({
    選択肢ＩＤ: randId() as any,
    選択肢文章: `${skill} の自動生成選択肢 ${i + 1}`,
    回答理由: `${skill} に関する自動生成の理由 ${i + 1}`,
  }));
  const result: Question = {
    問題ＩＤ: qid as any,
    問題文章: seed?.問題文章 || `${skill} に関する自動生成問題`,
    難易度: seed?.難易度 || 5,
    スキル: skill,
    模範回答: choices[0].選択肢ＩＤ as any,
    模範回答理由: 'AI生成により自動選定されたため。',
    自動生成フラグ: 1,
    選択肢: choices as any,
    削除フラグ: 0,
  };
  return delay(result, 1200);
}

export async function aiAnalyseResume(resumeData?: ResumeData): Promise<SkillSummary> {
  const { data } = await http.post<SkillSummary>('/api/resume/analyse', resumeData);
  return data;
}

// 試験実施検索フィルター定義
export interface RunFilters {
  idLike?: string;
  userLike?: string;
  status?: ExamRunStatus;
  keyword?: string;
}

// 試験実施一覧検索
export async function listExamRuns(
  filters: RunFilters,
  page = 1,
  pageSize = 10
): Promise<ApiListResult<ExamRun>> {
  const pagination: Pagination = {
    page: page,
    size: pageSize,
  };
  const repo = new ExamRunStoreRepo();
  const res: PageResult<ExamRun> = repo.list(pagination);
  const ret: ExamRun[] = [];
  res.items.forEach((exam) => {
    const newExam: ExamRun = {
      試験ＩＤ: '',
      参加者氏名: '',
      試験ステータス: 0,
    };
    Object.assign(newExam, exam);
    newExam.試験問題解答 = [];
    ret.push(newExam);
  });

  return delay({ items: ret, total: res.total });
}

export async function getExamRun(id: string): Promise<ExamRun | undefined> {
  return delay(new ExamRunStoreRepo().findById(id));
}

export async function saveExamRun(examRun: ExamRun): Promise<ExamRun> {
  new ExamRunStoreRepo().save(examRun);
  return delay(examRun);
}

// 試験実施を参加者へ配布（模範回答削除して渡す）
export async function fetchExamSessionById(id: string): Promise<ExamRun | undefined> {
  const examRun: ExamRun | undefined = new ExamRunStoreRepo().findById(id);
  if (examRun) {
    const exam: ExamRun = cloneDeep(examRun);
    if (!exam.試験用紙) throw new Error('問題用紙が存在しません。');
    exam.試験用紙.問題リスト.forEach((v) => {
      v.模範回答 = '';
      v.模範回答理由 = '';
      v.選択肢.forEach((w) => {
        w.回答理由 = '';
      });
    });
    return delay(exam);
  }
  throw new Error('試験が存在しません。');
}

// 試験確定
export async function confirmExamRun(id: string): Promise<ExamRun> {
  const repo: ExamRunStoreRepo = new ExamRunStoreRepo();
  const examRun = repo.findById(id);
  if (examRun && examRun.試験ステータス == 試験実施ステータス.準備中) {
    examRun.試験ステータス = 試験実施ステータス.未実施;
    new ExamRunStoreRepo().save(examRun);
  } else {
    throw new Error('試験実施ステータスが準備中でないため、確定できません。');
  }
  return delay(examRun);
}

// 試験開始
export async function startExamRun(id: string): Promise<ExamRun | undefined> {
  const repo: ExamRunStoreRepo = new ExamRunStoreRepo();
  const examRun = repo.findById(id);
  if (examRun && examRun.試験ステータス == 試験実施ステータス.未実施) {
    examRun.試験ステータス = 試験実施ステータス.実施中;
    new ExamRunStoreRepo().save(examRun);
  } else {
    throw new Error('試験実施ステータスが未実施でないため、開始できません。');
  }
  return delay(examRun);
}

export function buildSubmissionPayload(
  exam: ExamRun,
  answers: Record<string, string>
): ExamSubmissionPayload {
  const list = exam.試験用紙!.問題リスト.map((p) => {
    return {
      試験用紙問題ＩＤ: p.試験用紙問題ＩＤ,
      回答試験用紙選択肢ＩＤ: answers[p.試験用紙問題ＩＤ] || '',
    };
  });
  return {
    試験ＩＤ: exam.試験ＩＤ,
    試験問題解答: list,
  };
}

export async function submitExamAnswers(payload: ExamSubmissionPayload): Promise<void> {
  console.log('submitExamAnswers payload', payload);
  await delay(500);
  // デモのため常に成功
  return;
}
