import type { ApiListResult } from '@/types/api';
import type { Personnel } from '@/types/models/Personnel';
import type { Question } from '@/types/models/Question';
import type { PersonnelSkillPayload, SkillItem, SkillUpdate } from '@/types/models/Skill';
import type { ExamPaper } from '@/types/models/ExamPaper';

import { ResumeData } from '@/types/models/Resume';
import { PageResult, Pagination } from '@/types/models/Pagination';
import { SkillSummary } from '@/types/models/SkillSummary';
import { http } from '@/plugins/axios';
import { Repo } from '@/data/Repo';
import {
  ExamPaperStoreRepo,
  ExamRunStoreRepo,
  PersonnelFilters,
  PersonnelStoreRepo,
  QuestionStoreRepo,
  SkillStoreRepo,
} from '@/data/RepoStoreImp';
import { ExamSession, ExamSubmissionPayload } from '@/types/models/Exam';
import { EXAM_RUN_STATUS, ExamRunStatus, 試験実施ステータス } from '@/types/codes';
import { ExamRun } from '@/types/models/ExamRun';
import { useLink } from 'vuetify/lib/composables/router.mjs';
import cloneDeep from 'lodash.clonedeep';
import { Proposal } from '@/types/models/Proposal';

export function uuid(): string {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
}

function delay<T>(data: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

// 人材データ検索
export async function listPersonnel(
  filters: PersonnelFilters,
  page = 1,
  pageSize = 10
): Promise<ApiListResult<Personnel>> {
  const repo: Repo<Personnel> = new PersonnelStoreRepo();
  const pagination: Pagination = {
    page: page,
    size: pageSize,
  };

  // const { items: listResult, total: total } = repo.list(pagination);
  // return delay(repo.list(pagination));
  return delay(repo.findBy!(filters, pagination));
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

// 試験実施・選択状況収集
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

// 試験提出
export async function submitExamAnswers(payload: ExamSubmissionPayload): Promise<void> {
  debugger;
  console.log('submitExamAnswers payload', payload);
  const repo: ExamRunStoreRepo = new ExamRunStoreRepo();
  const examRun = repo.findById(payload.試験ＩＤ);
  if (!examRun) throw new Error('試験実施情報が存在しません。');
  examRun.試験提出日時 = new Date().toISOString();
  examRun.試験ステータス = 試験実施ステータス.実施完了;
  const answerMap = new Map<string, string>();
  payload.試験問題解答.forEach((ans) => {
    answerMap.set(ans.試験用紙問題ＩＤ, ans.回答試験用紙選択肢ＩＤ);
    examRun.試験問題解答?.push({
      試験用紙問題ＩＤ: ans.試験用紙問題ＩＤ,
      回答試験用紙選択肢ＩＤ: ans.回答試験用紙選択肢ＩＤ,
    });
  });
  examRun.試験正解数 = 0;
  examRun.試験用紙?.問題リスト.forEach((question) => {
    if (question.模範回答 === answerMap.get(question.試験用紙問題ＩＤ)) {
      examRun.試験正解数 = (examRun.試験正解数 ?? 0) + 1;
    }
  });
  repo.save(examRun);

  await delay(500);
  // デモのため常に成功
  return;
}

// 日付フォーマット
export function formatDate(date: Date, format: string): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 0始まりなので +1
  const day = String(date.getDate()).padStart(2, '0');
  let ret = format;
  ret = format.replace('yyyy', year.toString());
  ret = ret.replace('mm', month.toString());
  ret = ret.replace('dd', day.toString());
  return ret;
}

/**
 * UTCのISO文字列(例: "2025-11-10T05:22:10.832Z")をJSTに変換して整形します。
 * fmt: 'YYYY-MM-DD HH:mm:ss' | 'YYYY/MM/DD HH:mm:ss' | 'ISO'
 */
export function utcToJst(
  isoUtc: string,
  fmt: 'YYYY-MM-DD HH:mm:ss' | 'YYYY/MM/DD HH:mm:ss' | 'ISO' = 'YYYY-MM-DD HH:mm:ss'
): string {
  const d = new Date(isoUtc); // Z付きならUTCとして解釈される
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Invalid date: ${isoUtc}`);
  }

  // JSTで各パーツを取得
  const dtf = new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const parts = Object.fromEntries(dtf.formatToParts(d).map((p) => [p.type, p.value])) as Record<
    string,
    string
  >;

  const base = `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;

  switch (fmt) {
    case 'YYYY/MM/DD HH:mm:ss':
      return `${parts.year}/${parts.month}/${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
    case 'ISO':
      return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}+09:00`;
    default:
      return base; // 'YYYY-MM-DD HH:mm:ss'
  }
}

/**
 * スキルポイント計算
 * @param oldPoint 古いスキル点数
 * @param level 問題難易度 1-10
 * @param isRightAnswer 正解不正解区分
 */
export function calcNewSkillPoint(oldPoint: number, level: number, isRightAnswer: boolean): number {
  let alpha = oldPoint;
  let beta = 100 - oldPoint;
  const infoAmount = level;
  if (isRightAnswer) {
    alpha += infoAmount;
  } else beta += 11 - infoAmount;
  return Math.ceil((alpha / (alpha + beta)) * 100);
}

// 試験結果からスキル結果を反映する
export async function reflectSkillPoint(examId: string): Promise<SkillUpdate[]> {
  const repo: ExamRunStoreRepo = new ExamRunStoreRepo();
  const skillRepo: SkillStoreRepo = new SkillStoreRepo();
  const examRun = repo.findById(examId);
  if (!examRun || !examRun.試験問題解答) throw new Error('試験実施情報が存在しません。');
  if (!examRun.参加者人材ＩＤ) throw new Error('参加者が登録されておりません');
  const answerMap = new Map<string, string>();
  examRun.試験問題解答.forEach((ans) => {
    answerMap.set(ans.試験用紙問題ＩＤ, ans.回答試験用紙選択肢ＩＤ);
  });
  const skillDto = skillRepo.findById(examRun.参加者人材ＩＤ);
  const skillMap = new Map<string, number>();
  skillDto?.スキル.forEach((skill) => {
    skillMap.set(skill.スキル名, skill.スキル点数);
  });
  if (!skillDto) throw new Error('参加者が登録されておりません');
  const skillMapBefore = cloneDeep(skillMap);
  examRun.試験用紙?.問題リスト.forEach((question) => {
    const skillPoint = skillMap.get(question.スキル) ?? 0;
    let newPoint = skillPoint;
    if (question.模範回答 === answerMap.get(question.試験用紙問題ＩＤ)) {
      newPoint = calcNewSkillPoint(skillPoint, question.難易度, true);
    } else {
      newPoint = calcNewSkillPoint(skillPoint, question.難易度, false);
    }
    skillMap.set(question.スキル, newPoint);
  });
  const updateRes: SkillUpdate[] = [];
  skillMap.forEach((val, key) => {
    const scoreBefore = skillMapBefore.get(key);
    if (scoreBefore != val) {
      updateRes.push({
        スキル名: key,
        スキル点数更新前: scoreBefore ?? 0,
        スキル点数更新後: val,
      });
    }
  });
  skillDto.スキル = [];
  skillMap.forEach((val, key) => {
    skillDto.スキル.push({
      スキル名: key,
      スキル点数: val,
    });
  });
  skillRepo.save(skillDto);
  examRun.スキル反映結果 = updateRes;
  examRun.試験ステータス = 4; // 結果反映済
  return updateRes;
}

export interface CandidateAnalysis {
  人材ID: string;
  名前: string;
  マッチ率: number;
  コメント: string;
}

export async function analyzeCandidates(
  requirementSummary: string,
  candidates: Personnel[]
): Promise<CandidateAnalysis[]> {
  await delay(800);
  const results: CandidateAnalysis[] = candidates.map((p, index) => {
    const base = 60 + (candidates.length - index) * 5;
    const random = Math.floor(Math.random() * 10);
    const score = Math.min(100, base + random);
    return {
      人材ID: p.人材ＩＤ,
      名前: p.名前,
      マッチ率: score,
      コメント: `${requirementSummary} に対して、${p.名前}さんはこれまでの経歴とスキルセットが近く、早期にキャッチアップできると想定されます。`,
    };
  });
  results.sort((a, b) => b.マッチ率 - a.マッチ率);
  return results;
}
const mockProposals: Proposal[] = [
  {
    提案ID: 'f8b92b3a-7c5b-4b1c-a8b0-dc1f8a7d1b62',
    提案名: 'ECサイト保守開発 要員提案',
    募集要項:
      '自社ECサイトの保守開発案件です。Java / Spring Boot を用いたサーバサイド開発と、Vue / TypeScript によるフロントエンド改修が主な業務です。',
  },
  {
    提案ID: '38d0a0f8-9e32-4ab5-8c62-3b44084d3e07',
    提案名: '業務システム刷新プロジェクト 要員提案',
    募集要項:
      '基幹業務システム刷新案件における要員提案です。要件定義〜結合テストまでをリードできるPM/PLクラスの人材を想定しています。',
  },
];

export async function listProposals(keyword?: string): Promise<Proposal[]> {
  await delay(300);
  if (!keyword) {
    return [...mockProposals];
  }
  const lower = keyword.toLowerCase();
  return mockProposals.filter((p) => {
    return (
      p.提案ID.toLowerCase().includes(lower) ||
      p.提案名.toLowerCase().includes(lower) ||
      p.募集要項.toLowerCase().includes(lower)
    );
  });
}

export async function saveProposal(proposal: Proposal): Promise<void> {
  await delay(300);
  const idx = mockProposals.findIndex((p) => p.提案ID === proposal.提案ID);
  if (idx === -1) {
    mockProposals.push({ ...proposal });
  } else {
    mockProposals[idx] = { ...proposal };
  }
}

export async function deleteProposal(id: string): Promise<void> {
  await delay(300);
  const idx = mockProposals.findIndex((p) => p.提案ID === id);
  if (idx !== -1) {
    mockProposals.splice(idx, 1);
  }
}
