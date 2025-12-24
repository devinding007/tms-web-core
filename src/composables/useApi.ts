import type { ApiListResult } from '@/types/api';
import type { Personnel } from '@/types/models/Personnel';
import type { Question } from '@/types/models/Question';
import type { PersonnelSkillPayload, SkillItem, SkillUpdate } from '@/types/models/Skill';
import type { ExamPaper, ExamPaperQuestion } from '@/types/models/ExamPaper';

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
  ProposalStoreRepo,
  QuestionStoreRepo,
  SkillStoreRepo,
} from '@/data/RepoStoreImp';

import { toPersonnel, toTalentDTO } from '@/mappers/talentMapper';
import { ExamSession, ExamSubmissionPayload } from '@/types/models/Exam';
import { EXAM_RUN_STATUS, ExamRunStatus, 試験実施ステータス } from '@/types/codes';
import { ExamRun } from '@/types/models/ExamRun';
import { useLink } from 'vuetify/lib/composables/router.mjs';
import cloneDeep from 'lodash.clonedeep';
import { Proposal } from '@/types/models/Proposal';

export function uuid(): string {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
}

export function delay<T>(data: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

// 人材データ検索
export async function listPersonnel(
  filters: PersonnelFilters,
  page = 1,
  pageSize = 10
): Promise<ApiListResult<Personnel>> {
  const pagination: Pagination = {
    page: page,
    size: pageSize,
  };

  // const { items: listResult, total: total } = repo.list(pagination);
  // return delay(repo.list(pagination));


  // ---mock data
  // return delay(repo.findBy!(filters, pagination));

  // // --- 後端から TalentDTO[] を取得 ---
  const allDtos = await http.get('/api/talents').then(res => res.data as any[]);
  const total = allDtos.length;
    
  const start = (page - 1) * pageSize;
  const pagedDtos = allDtos.slice(start, start + pageSize);

  const items = pagedDtos.map(toPersonnel);
  return { items, total };
}
export async function getPersonnel(id: string): Promise<Personnel | undefined> {
  // return delay(new PersonnelStoreRepo().findById(id), 3000);
  // return delay(PERSONNEL.find((p) => p.人材ＩＤ === id));

  const response = await http.get(`/api/talents/${id}`);
  return toPersonnel(response.data);
}
// mock data用
// export async function createPersonnel(p: Omit<Personnel, '人材ID'>): Promise<Personnel> {
//   const newItem: Personnel = {
//     ...p,
//     人材ＩＤ: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
//   } as Personnel;
//   new PersonnelStoreRepo().save(newItem);
//   // (PERSONNEL as any).unshift(newItem);
//   return delay(newItem, 1200);
//}

export async function createPersonnel(
  p: Omit<Personnel, '人材ＩＤ'>
): Promise<Personnel> {
  // ----- 前端のPersonnel形式を、バックエンドのTalentDTO形式に変換 -----
  const dto = toTalentDTO(p);

  // ----- バックエンドに新規登録リクエストを送信（POST /api/talents） -----
  const response = await http.post('/api/talents', dto);

  // ----- バックエンドから返却されるTalentDTOを、フロント側のPersonnel形式に変換 -----
  return toPersonnel(response.data);
}
// 更新
// mock data用
// export async function updatePersonnel(p: Personnel): Promise<Personnel> {
//   // const idx = PERSONNEL.findIndex((x) => x.人材ＩＤ === p.人材ＩＤ);
//   // if (idx >= 0) PERSONNEL[idx] = p;
//   new PersonnelStoreRepo().save(p);
//   return delay(p, 1200);
// }

export async function updatePersonnel(p: Personnel): Promise<Personnel> {
  const dto = toTalentDTO(p);
  const response = await http.put(`/api/talents/${p.人材ＩＤ}`, dto);
  return toPersonnel(response.data);
}

// 人材データ削除
// export async function deletePersonnel(id: string): Promise<void> {
//   new PersonnelStoreRepo().remove(id);
//   // const idx = PERSONNEL.findIndex((x) => x.人材ＩＤ === id);
//   // if (idx >= 0) PERSONNEL.splice(idx, 1);
//   return delay(undefined as any, 300);
// }

export async function deletePersonnel(id: string): Promise<void> {
  await http.patch(`/api/talents/${id}/soft-delete`);
}

// export async function listSkillOptions(): Promise<string[]> {
//   const res = await new SkillStoreRepo().list({ page: 1, size: 1000 });
//   const skillList: Set<string> = new Set();
//   res.items.forEach((item) => {
//     item.スキル.forEach((skill) => {
//       skillList.add(skill.スキル名);
//     });
//   });
//   return delay([...skillList]);
// }

export async function listSkillOptions(): Promise<string[]> {
  const res = await http.get<string[]>('/api/skill/options');
  return res.data;
}

// スキル取得
// export async function getSkillsByPersonnelId(id: string): Promise<SkillItem[]> {
//   const skillPayload: PersonnelSkillPayload | undefined = await new SkillStoreRepo().findById(id);
//   return delay(skillPayload ? [...skillPayload.スキル] : []);
// }

export async function getSkillsByPersonnelId(id: string): Promise<SkillItem[]> {
  const payload = await getSkillPayloadByPersonnelId(id);
  return payload?.スキル || []; // undefined なら空配列
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
//mock data用
//---------------
// export async function listQuestions(
//   filters: QuestionFilters,
//   page = 1,
//   pageSize = 10
// ): Promise<ApiListResult<Question>> {
//   const pagination: Pagination = {
//     page: page,
//     size: pageSize,
//   };
//   const repo = new QuestionStoreRepo();
//   const res: PageResult<Question> = repo.list(pagination);
//   return delay({
//     items: res.items,
//     total: res.total,
//   });
// }
// 問題データ検索（フィルタ条件付き）
export async function listQuestions(
  filters: QuestionFilters,
  page = 1,
  pageSize = 10
): Promise<ApiListResult<Question>> {
  // クエリパラメータを構築
  const params = new URLSearchParams();
  if (filters.問題ＩＤ) params.append('questionId', filters.問題ＩＤ);
  if (filters.スキル) params.append('skill', filters.スキル);
  if (filters.難易度_FROM !== undefined) params.append('difficultyFrom', filters.難易度_FROM.toString());
  if (filters.難易度_TO !== undefined) params.append('difficultyTo', filters.難易度_TO.toString());
  if (filters.自動生成フラグ !== undefined) params.append('isAutoGenerated', filters.自動生成フラグ.toString());
  if (filters.キーワード) params.append('keyword', filters.キーワード);
  params.append('page', page.toString());
  params.append('size', pageSize.toString());

  // バックエンドAPIを呼び出し
  const res = await http.get(`/api/questions?${params.toString()}`);
  console.log('listQuestions response data:', res.data);
  return res.data; // { items: Question[], total: number }
}
// mock data用
//---------------
// export async function getQuestion(id: string): Promise<Question | undefined> {
//   return delay(new QuestionStoreRepo().findById(id));
// }
// export async function saveQuestion(q: Question): Promise<Question> {
//   new QuestionStoreRepo().save(q);
//   return delay(q);
// }
// export async function deleteQuestion(id: string): Promise<void> {
//   new QuestionStoreRepo().remove(id);
//   return delay(undefined as any, 800);
// }

// 問題詳細取得
export async function getQuestion(id: string): Promise<Question | undefined> {
  const res = await http.get(`/api/questions/${id}`);
  return res.data; // Question (日本語フィールド)
}

// 問題保存（新規作成・更新）
export async function saveQuestion(q: Question): Promise<Question> {
  console.log('Saving question:', q);
  const res = await http.post('/api/questions', q);
  return res.data; // 保存後の Question (日本語フィールド)
}

// 問題削除（論理削除）
export async function deleteQuestion(id: string): Promise<void> {
  await http.delete(`/api/questions/${id}`);
}
// 試験用紙関連
export interface PaperFilters {
  名称?: string;
  説明?: string;
  keyword?: string;
}
//mock data用
// export async function listExamPapers(
//   filters: PaperFilters,
//   page = 1,
//   pageSize = 10
// ): Promise<ApiListResult<ExamPaper>> {
//   const pagination: Pagination = {
//     page: page,
//     size: pageSize,
//   };
//   const res: PageResult<ExamPaper> = new ExamPaperStoreRepo().list(pagination);
//   return delay({ items: res.items, total: res.total });
// }

// export async function getExamPaper(id: string): Promise<ExamPaper | undefined> {
//   return delay(new ExamPaperStoreRepo().findById(id));
// }

// export async function getExamExecutionPaper(id: string): Promise<ExamPaper | undefined> {
//   const executionPaper: ExamPaper | undefined = {
//     試験用紙ＩＤ: '',
//     試験用紙名称: '',
//     説明: '',
//     作成日時: '',
//     問題リスト: [],
//   };
//   Object.assign(executionPaper, new ExamPaperStoreRepo().findById(id));
//   executionPaper.問題リスト = [];
//   return delay(executionPaper);
// }

// export async function saveExamPaper(paper: ExamPaper): Promise<ExamPaper> {
//   new ExamPaperStoreRepo().save(paper);
//   return delay(paper, 800);
// }

// export async function deleteExamPaper(id: string): Promise<void> {
//   new ExamPaperStoreRepo().remove(id);
//   return delay(undefined, 500);
// }

/**
 * 試験用紙一覧を取得（ページネーション対応）。
 * フロントエンドの ExamPaperListView 互換の形式で返却。
 * 問題リストは含めない（一覧表示に不要）。
 */

interface ExamPaperQuestionRef {
  paper_question_id?: string; // 関連テーブルのID（更新時のみ必要）
  question_id: string;        // question テーブルのID
  display_order: number;      // 表示順
}

export async function listExamPapers(
  filters: PaperFilters,
  page = 1,
  pageSize = 10
): Promise<ApiListResult<ExamPaper>> {
  const params = new URLSearchParams();
  if (filters.名称) params.append('name', filters.名称);
  if (filters.説明) params.append('description', filters.説明);
  if (filters.keyword) params.append('keyword', filters.keyword);
  params.append('page', page.toString());
  params.append('size', pageSize.toString());

  const res = await http.get(`/api/exam-papers?${params.toString()}`);
  const { items, total } = res.data;

  // フロントエンド形式に変換（問題リストは空）
  const frontendItems: ExamPaper[] = items.map((item: any) => ({
    試験用紙ＩＤ: item['試験用紙ID'],
    試験用紙名称: item['試験用紙名称'],
    説明: item['説明'],
    作成日時: item['作成日時'],
    削除フラグ: item.deletedAt ? 1 : 0, // deletedAt は日本語フィールド名ではない
    問題リスト: [],
  }));
  console.log('listExamPapers frontendItems:', frontendItems);

  return { items: frontendItems, total };
}

/**
 * 試験用紙詳細を取得。
 * 問題と選択肢を含み、フロントエンドの ExamPaperDetailModal 互換形式で返却。
 * 内部で __question_id を隠しフィールドとして保存（保存時に再利用）。
 */
export async function getExamPaper(id: string): Promise<ExamPaper | undefined> {
  const res = await http.get(`/api/exam-papers/${id}`);
  const { paper, questions } = res.data;

  if (!paper) {
    return undefined;
  }

  const 問題リスト: ExamPaperQuestion[] = (questions || []).map((pq: any) => {
    const q = pq.question;
    if (!q) {
      console.warn('Missing question data for paper_question_id:', pq.paper_question_id);
      return {
        試験用紙問題ＩＤ: pq.paper_question_id || '',
        試験用紙ＩＤ: paper.paperId, // ← 修正: paper_id → paperId
        問題文章: '（データ取得エラー）',
        難易度: 0,
        スキル: '',
        模範回答: '',
        模範回答理由: '',
        自動生成フラグ: 0,
        選択肢: [],
      } as ExamPaperQuestion;
    }

    // ★★ 修正：日本語フィールド名を直接使用 ★★
    const choices = pq.choices.map((c: any) => ({
      選択肢ＩＤ: c?.['選択肢ＩＤ'] || '',
      選択肢文章: c?.['選択肢文章'] || '',
      回答理由: c?.['回答理由'] || '',
    }));

    const item: ExamPaperQuestion = {
      試験用紙問題ＩＤ: pq.paper_question_id,
      試験用紙ＩＤ: paper.paperId, // ← 修正: paper_id → paperId
      問題文章: q['問題文章'],
      難易度: q['難易度'],
      スキル: q['スキル'],
      模範回答: q['模範回答'] || '',
      模範回答理由: q['模範回答理由'] || '',
      自動生成フラグ: q['自動生成フラグ'] ? 1 : 0,
      選択肢: choices,
    };

    // 隠しフィールドで question_id を保持（保存時に使用）
    // ★★ 修正：日本語フィールド名から取得 ★★
    (item as any).__question_id = q['問題ＩＤ'];

    return item;
  });

  return {
    試験用紙ＩＤ: paper.paperId,       // ← 修正: paper_id → paperId
    試験用紙名称: paper.paperName,     // ← 修正: paper_name → paperName
    説明: paper.description,
    作成日時: paper.createdAt,         // ← 修正: created_at → createdAt
    削除フラグ: paper.deletedAt ? 1 : 0,
    問題リスト: 問題リスト,
  };
}

/**
 * 試験用紙を保存（新規作成 or 更新）。
 * フロントエンドの ExamPaper オブジェクトを受信し、
 * - 既存問題は __question_id を使って参照
 * - 新規問題は newQuestions として送信
 * する。
 * ★ フロントエンドは ID 生成方法を変更不要（uuid() のまま）。
 * ★ バックエンドが paper_id の存在有無で新規/更新を判定。
 */
export async function saveExamPaper(paper: ExamPaper): Promise<ExamPaper> {
  const existingRefs: ExamPaperQuestionRef[] = [];
  const newQuestions: Question[] = [];

  // 問題リストを既存/新規に分類
  paper.問題リスト.forEach((pq, idx) => {
    const hidden = pq as any;
    if (hidden.__question_id) {
      // 既存問題（question_id あり）
      existingRefs.push({
        paper_question_id: pq.試験用紙問題ＩＤ || undefined,
        question_id: hidden.__question_id,
        display_order: idx + 1,
      });
    } else {
      // 新規問題（AI生成等）
      newQuestions.push({
        問題ＩＤ: '',
        問題文章: pq.問題文章,
        難易度: pq.難易度,
        スキル: pq.スキル,
        模範回答: pq.模範回答,
        模範回答理由: pq.模範回答理由,
        自動生成フラグ: pq.自動生成フラグ,
        選択肢: pq.選択肢,
        削除フラグ: 0,
      });
    }
  });

  // ペイロード構築（paper_id を常に含める）
  const payload = {
    paper_id: paper.試験用紙ＩＤ, // ← バックエンドが新規/更新を判断
    paper: {
      paper_name: paper.試験用紙名称,
      description: paper.説明,
    },
    questionRefs: existingRefs,
    newQuestions: newQuestions.length > 0 ? newQuestions : undefined,
  };

  // 常に POST（新規/更新の判定はバックエンドに委譲）
  const res = await http.post('/api/exam-papers', payload);
  let paperId: string;
  if (typeof res.data === 'string') {
    // バックエンドが文字列を返している場合
    paperId = res.data;
  } else if (res.data && typeof res.data === 'object') {
    // バックエンドが JSON オブジェクトを返している場合
    paperId = res.data.paper_id;
  } else {
    throw new Error('paper_id を取得できませんでした');
  }

  const savedPaper = await getExamPaper(paperId);
  if (!savedPaper) {
    throw new Error('試験用紙の保存後にデータを取得できませんでした。');
  }
  // 保存後の完全な試験用紙を取得
  return savedPaper;
}

/**
 * 試験用紙を削除。
 */
export async function deleteExamPaper(id: string): Promise<void> {
  await http.delete(`/api/exam-papers/${id}`);
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
  await delay(undefined, 1000);
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
//mock data用
// ---------------
// export async function listExamRuns(
//   filters: RunFilters,
//   page = 1,
//   pageSize = 10
// ): Promise<ApiListResult<ExamRun>> {
//   const pagination: Pagination = {
//     page: page,
//     size: pageSize,
//   };
//   const repo = new ExamRunStoreRepo();
//   const res: PageResult<ExamRun> = repo.list(pagination);
//   const ret: ExamRun[] = [];
//   res.items.forEach((exam) => {
//     const newExam: ExamRun = {
//       試験ＩＤ: '',
//       参加者氏名: '',
//       試験ステータス: 0,
//     };
//     Object.assign(newExam, exam);
//     newExam.試験問題解答 = [];
//     ret.push(newExam);
//   });

//   return delay({ items: ret, total: res.total });
// }

export async function listExamRuns(
  filters: RunFilters,
  page = 1,
  pageSize = 10
): Promise<ApiListResult<ExamRun>> {
  const params = new URLSearchParams();
  if (filters.idLike) params.append('idLike', filters.idLike);
  if (filters.userLike) params.append('userLike', filters.userLike);
  if (filters.status !== undefined) params.append('status', filters.status.toString());
  if (filters.keyword) params.append('keyword', filters.keyword);
  params.append('page', page.toString());
  params.append('size', pageSize.toString());

  const res = await http.get(`/api/exam-runs?${params.toString()}`);
  return res.data; // { items: ExamRun[], total: number }
}

// 試験実施詳細取得
//mock data用
// ---------------
// export async function getExamRun(id: string): Promise<ExamRun | undefined> {
//   return delay(new ExamRunStoreRepo().findById(id));
// }
/**
 * 試験実施詳細を取得
 */
export async function getExamRun(id: string): Promise<ExamRun | undefined> {
  try {
    const res = await http.get(`/api/exam-runs/${id}`);
    return res.data; // ExamRun（全字段、日文）
  } catch (error: any) {
    if (error.response?.status === 404) {
      return undefined;
    }
    throw error;
  }
}

// 試験実施保存
//mock data用
// ---------------
// export async function saveExamRun(examRun: ExamRun): Promise<ExamRun> {
//   new ExamRunStoreRepo().save(examRun);
//   return delay(examRun);
// }
/**
 * 試験実施を保存（新規作成）
 * - 更新は別途 confirm/submit/reflect で状態遷移
 */

export async function saveExamRun(examRun: ExamRun): Promise<ExamRun> {
  const res = await http.post('/api/exam-runs', examRun);
  return res.data;
}



// 試験実施を参加者へ配布（模範回答削除して渡す）
// mock data用
// ---------------
// export async function fetchExamSessionById(id: string): Promise<ExamRun | undefined> {
//   const examRun: ExamRun | undefined = new ExamRunStoreRepo().findById(id);
//   if (examRun) {
//     const exam: ExamRun = cloneDeep(examRun);
//     if (!exam.試験用紙) throw new Error('問題用紙が存在しません。');
//     exam.試験用紙.問題リスト.forEach((v) => {
//       v.模範回答 = '';
//       v.模範回答理由 = '';
//       v.選択肢.forEach((w) => {
//         w.回答理由 = '';
//       });
//     });
//     return delay(exam);
//   }
//   throw new Error('試験が存在しません。');
// }


/**
 * 考生用：試験セッションを取得（模範回答を削除）
 */
export async function fetchExamSessionById(id: string): Promise<ExamRun | undefined> {
  try {
    const res = await http.get(`/api/exam-sessions/${id}`);
    return res.data; // 後端已移除模範回答
  } catch (error: any) {
    if (error.response?.status === 404) {
      return undefined;
    }
    throw error;
  }
}
// 試験確定
// mock data用
// ---------------
// export async function confirmExamRun(id: string): Promise<ExamRun> {
//   const repo: ExamRunStoreRepo = new ExamRunStoreRepo();
//   const examRun = repo.findById(id);
//   if (examRun && examRun.試験ステータス == 試験実施ステータス.準備中) {
//     examRun.試験ステータス = 試験実施ステータス.未実施;
//     new ExamRunStoreRepo().save(examRun);
//   } else {
//     throw new Error('試験実施ステータスが準備中でないため、確定できません。');
//   }
//   return delay(examRun);
// }

/**
 * 試験を確定（準備中 → 未実施）
 */
export async function confirmExamRun(id: string): Promise<ExamRun> {
  const res = await http.patch(`/api/exam-runs/${id}/confirm`);
  return res.data;
}

// 試験開始
// mock data用
// ---------------
// export async function startExamRun(id: string): Promise<ExamRun | undefined> {
//   const repo: ExamRunStoreRepo = new ExamRunStoreRepo();
//   const examRun = repo.findById(id);
//   if (examRun && examRun.試験ステータス == 試験実施ステータス.未実施) {
//     examRun.試験ステータス = 試験実施ステータス.実施中;
//     new ExamRunStoreRepo().save(examRun);
//   } else {
//     throw new Error('試験実施ステータスが未実施でないため、開始できません。');
//   }
//   return delay(examRun);
// }

/**
 * 試験を開始（未実施 → 実施中）
 */
export async function startExamRun(id: string): Promise<ExamRun | undefined> {
  const res = await http.post(`/api/exam-runs/${id}/start`);
  return res.data;
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
// mock data用
// ---------------
// export async function submitExamAnswers(payload: ExamSubmissionPayload): Promise<void> {
//   const repo: ExamRunStoreRepo = new ExamRunStoreRepo();
//   const examRun = repo.findById(payload.試験ＩＤ);
//   if (!examRun) throw new Error('試験実施情報が存在しません。');
//   examRun.試験提出日時 = new Date().toISOString();
//   examRun.試験ステータス = 試験実施ステータス.実施完了;
//   const answerMap = new Map<string, string>();
//   payload.試験問題解答.forEach((ans) => {
//     answerMap.set(ans.試験用紙問題ＩＤ, ans.回答試験用紙選択肢ＩＤ);
//     examRun.試験問題解答?.push({
//       試験用紙問題ＩＤ: ans.試験用紙問題ＩＤ,
//       回答試験用紙選択肢ＩＤ: ans.回答試験用紙選択肢ＩＤ,
//     });
//   });
//   examRun.試験正解数 = 0;
//   examRun.試験用紙?.問題リスト.forEach((question) => {
//     if (question.模範回答 === answerMap.get(question.試験用紙問題ＩＤ)) {
//       examRun.試験正解数 = (examRun.試験正解数 ?? 0) + 1;
//     }
//   });
//   repo.save(examRun);

//   await delay(500);
//   // デモのため常に成功
//   return;
// }
/**
 * 試験回答を提出（実施中 → 実施完了）
 */
export async function submitExamAnswers(payload: ExamSubmissionPayload): Promise<void> {
  await http.post('/api/exam-runs/submit', payload); // 注意：這裡用 /submit 作為入口，也可設計為 /{id}/submit
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
// mock data用
// ---------------
// export interface SkillUpdate {
// export async function reflectSkillPoint(examId: string): Promise<SkillUpdate[]> {
//   const repo: ExamRunStoreRepo = new ExamRunStoreRepo();
//   const skillRepo: SkillStoreRepo = new SkillStoreRepo();
//   const examRun = await repo.findById(examId);
//   if (!examRun || !examRun.試験問題解答) throw new Error('試験実施情報が存在しません。');
//   if (!examRun.参加者人材ＩＤ) throw new Error('参加者が登録されておりません');
//   const answerMap = new Map<string, string>();
//   examRun.試験問題解答.forEach((ans) => {
//     answerMap.set(ans.試験用紙問題ＩＤ, ans.回答試験用紙選択肢ＩＤ);
//   });
//   const skillDto = await skillRepo.findById(examRun.参加者人材ＩＤ);
//   const skillMap = new Map<string, number>();
//   skillDto?.スキル.forEach((skill) => {
//     skillMap.set(skill.スキル名, skill.スキル点数);
//   });
//   if (!skillDto) throw new Error('参加者が登録されておりません');
//   const skillMapBefore = cloneDeep(skillMap);
//   examRun.試験用紙?.問題リスト.forEach((question) => {
//     const skillPoint = skillMap.get(question.スキル) ?? 0;
//     let newPoint = skillPoint;
//     if (question.模範回答 === answerMap.get(question.試験用紙問題ＩＤ)) {
//       newPoint = calcNewSkillPoint(skillPoint, question.難易度, true);
//     } else {
//       newPoint = calcNewSkillPoint(skillPoint, question.難易度, false);
//     }
//     skillMap.set(question.スキル, newPoint);
//   });
//   const updateRes: SkillUpdate[] = [];
//   skillMap.forEach((val, key) => {
//     const scoreBefore = skillMapBefore.get(key);
//     if (scoreBefore != val) {
//       updateRes.push({
//         スキル名: key,
//         スキル点数更新前: scoreBefore ?? 0,
//         スキル点数更新後: val,
//       });
//     }
//   });
//   skillDto.スキル = [];
//   skillMap.forEach((val, key) => {
//     skillDto.スキル.push({
//       スキル名: key,
//       スキル点数: val,
//     });
//   });
//   skillRepo.save(skillDto);
//   examRun.スキル反映結果 = updateRes;
//   examRun.試験ステータス = 4; // 結果反映済
//   return updateRes;
// }
/**
 * スキルポイントを人材DBに反映（実施完了 → スキル反映済）
 */
export async function reflectSkillPoint(examId: string): Promise<SkillUpdate[]> {
  const res = await http.post(`/api/exam-runs/${examId}/reflect`);
  return res.data; // SkillUpdate[]
}

// 試験実施一覧検索
// mock data用
// ---------------
// export async function listProposals(
//   // filters: RunFilters,
//   page = 1,
//   pageSize = 10
// ): Promise<ApiListResult<Proposal>> {
//   const pagination: Pagination = {
//     page: page,
//     size: pageSize,
//   };
//   const repo = new ProposalStoreRepo();
//   const res: PageResult<Proposal> = repo.list(pagination);
//   return delay({ items: res.items, total: res.total });
// }

// export async function saveProposal(proposal: Proposal): Promise<Proposal> {
//   new ProposalStoreRepo().save(proposal);
//   return delay(proposal, 800);
// }

// export async function deleteProposal(id: string): Promise<void> {
//   new ProposalStoreRepo().remove(id);
//   return delay(undefined, 500);
// }

// 1. 提案一覧取得
export async function listProposals(page = 1, pageSize = 10): Promise<ApiListResult<Proposal>> {
  const params = new URLSearchParams({
    page: page.toString(),
    size: pageSize.toString(),
  });
  const res = await http.get(`/api/proposals?${params}`);
  return res.data; // { items: Proposal[], total: number }
}

// 2. 提案保存（新規作成・更新）
export async function saveProposal(proposal: Proposal): Promise<Proposal> {
  const res = await http.post('/api/proposals', proposal);
  return res.data; // 保存後の Proposal オブジェクト
}

// 3. 提案削除
export async function deleteProposal(id: string): Promise<void> {
  await http.delete(`/api/proposals/${id}`);
}

export async function getProposalById(id: string): Promise<Proposal | null> {
  const res = await http.get(`/api/proposals/${id}`);
  return res.data;
}

// 履歴書関連
// 履歴書保存
export async function saveResume(resume: ResumeData): Promise<void> {
  await http.put(`/api/resume/${resume.人材ＩＤ}`, resume);
}
export async function getResumeByPersonnelId(id: string): Promise<ResumeData | undefined> {
  const res = await http.get(`/api/resume/${id}`);
  return res.data;
}

// スキル関連
export async function saveSkillPayload(payload: PersonnelSkillPayload): Promise<void> {
  await http.put(`/api/skill/${payload.人材ＩＤ}`, payload);
}
export async function getSkillPayloadByPersonnelId(id: string): Promise<PersonnelSkillPayload | undefined> {
  try {
    const res = await http.get(`/api/skill/${id}`);
    return res.data;
  } catch (error: any) {
    // 404 の場合 → スキル未登録とみなして undefined を返す（エラーにしない）
    if (error.message?.includes('404')) {
      return undefined;
    }
    // 他のエラーは再スロー
    throw error;
  }
}
