import type { ApiListResult } from '@/types/api';
import type { ExamPaper, ExamPaperQuestion } from '@/types/models/ExamPaper';
import type { Question } from '@/types/models/Question';
import type { GenerationRequest } from '@/types/models/GenerationRequest';
import { http } from '@/plugins/axios';

const nowISO = () => new Date().toISOString();
const uuid = () =>
  (globalThis.crypto && 'randomUUID' in globalThis.crypto
    ? (globalThis.crypto as any).randomUUID()
    : Math.random().toString(36).slice(2)) as string;

function delay<T>(data: T, ms = 600): Promise<T> {
  return new Promise((r) => setTimeout(() => r(data), ms));
}

let PAPERS: ExamPaper[] = [
  {
    試験用紙ＩＤ: 'b8f72b83-1b7f-4c9d-923c-8b82a7d9df41',
    試験用紙名称: 'Webアプリ開発エンジニア基礎試験',
    説明: 'この試験は、Webアプリケーション開発に関する基礎的な知識を確認するためのものです。全問選択式ですので、最も適切な選択肢を選んでください。',
    作成日時: '2025-10-17T12:00:00+09:00',
    削除フラグ: 0,
    問題リスト: [],
  },
];

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
  let arr = PAPERS.filter((p) => (p.削除フラグ ?? 0) === 0);
  const kw = (filters.keyword || '').trim().toLowerCase();
  if (filters.名称) {
    const n = filters.名称.toLowerCase();
    arr = arr.filter((x) => x.試験用紙名称.toLowerCase().includes(n));
  }
  if (filters.説明) {
    const d = filters.説明.toLowerCase();
    arr = arr.filter((x) => x.説明.toLowerCase().includes(d));
  }
  if (kw) {
    arr = arr.filter(
      (x) => x.試験用紙名称.toLowerCase().includes(kw) || x.説明.toLowerCase().includes(kw)
    );
  }
  const start = (page - 1) * pageSize;
  const items = JSON.parse(JSON.stringify(arr.slice(start, start + pageSize)));
  return delay({ items, total: arr.length });
}

export async function getExamPaper(id: string): Promise<ExamPaper | undefined> {
  const p = PAPERS.find((x) => x.試験用紙ＩＤ === id);
  return delay(p ? JSON.parse(JSON.stringify(p)) : undefined);
}

export async function saveExamPaper(paper: ExamPaper): Promise<ExamPaper> {
  const copy = JSON.parse(JSON.stringify(paper)) as ExamPaper;
  if (!copy.試験用紙ＩＤ) copy.試験用紙ＩＤ = uuid();
  if (!copy.作成日時) copy.作成日時 = nowISO();
  const i = PAPERS.findIndex((x) => x.試験用紙ＩＤ === copy.試験用紙ＩＤ);
  if (i >= 0) PAPERS[i] = copy;
  else PAPERS.unshift(copy);
  return delay(JSON.parse(JSON.stringify(copy)), 800);
}

export async function deleteExamPaper(id: string): Promise<void> {
  const i = PAPERS.findIndex((x) => x.試験用紙ＩＤ === id);
  if (i >= 0) PAPERS[i].削除フラグ = 1;
  return delay(undefined, 500);
}

export interface AIGenerateCond {
  skills: string[];
  jobPosting?: string;
  levelFrom: number;
  levelTo: number;
  count: number;
}

export async function aiBulkGeneratePaperProblems(cond: AIGenerateCond): Promise<Question[]> {
  const request: GenerationRequest = {
    levelFrom: String(cond.levelFrom),
    levelTo: String(cond.levelTo),
    jobPosting: String(cond.jobPosting),
    skills: cond.skills.join(','),
    number: String(cond.count),
  };
  const res = await invokeGenerateApi(request);
  return res;
}

export async function aiBulkGeneratePaperProblems_fake(cond: AIGenerateCond): Promise<Question[]> {
  const list: Question[] = [];
  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)] || 'General';
  for (let i = 0; i < cond.count; i++) {
    const skill = pick(cond.skills.length ? cond.skills : ['General']);
    const choices = new Array(4).fill(0).map((_, j) => ({
      選択肢ＩＤ: uuid(),
      選択肢文章: `${skill} の選択肢 ${j + 1}`,
      回答理由: `${skill} に関する説明 ${j + 1}`,
    }));
    const correct = choices[0].選択肢ＩＤ;
    list.push({
      問題ＩＤ: uuid(),
      問題文章: `${skill} に関する自動生成問題 ${i + 1}`,
      難易度: Math.max(1, Math.min(10, cond.levelFrom)),
      スキル: skill,
      模範回答: correct,
      模範回答理由: 'AIにより自動選定。',
      自動生成フラグ: 1,
      選択肢: choices,
      削除フラグ: 0,
    } as any);
  }
  return delay(list, 800);
}

export function mapQuestionToPaperProblem(question: Question, paperId: string): ExamPaperQuestion {
  const uuidLocal = uuid;
  const idMap: Record<string, string> = {};
  const newChoices = question.選択肢.map((c) => {
    const nid = uuidLocal();
    idMap[c.選択肢ＩＤ as string] = nid;
    return { ...c, 選択肢ＩＤ: nid };
  });
  const mapped: ExamPaperQuestion = {
    試験用紙問題ＩＤ: uuidLocal(),
    試験用紙ＩＤ: paperId as any,
    問題文章: question.問題文章,
    難易度: question.難易度,
    スキル: question.スキル,
    模範回答: idMap[question.模範回答 as string] || newChoices[0].選択肢ＩＤ,
    模範回答理由: question.模範回答理由,
    自動生成フラグ: question.自動生成フラグ ?? 0,
    選択肢: newChoices,
  };
  return mapped;
}

export async function invokeGenerateApi(request: GenerationRequest): Promise<Question[]> {
  try {
    // console.log(http);
    const { data } = await http.post<Question[]>('/api/exam/generate', request);
    if (!Array.isArray(data)) {
      return [];
    }
    return data;
  } catch (e) {
    throw e;
  }
}
