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

export function delay<T>(data: T, ms = 600): Promise<T> {
  return new Promise((r) => setTimeout(() => r(data), ms));
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
    await delay(undefined, 1000);

    if (!Array.isArray(data)) {
      return [];
    }
    // 選択肢の順番をシャッフルする
    data.forEach((q) => {
      q.選択肢 = shuffleArray(q.選択肢);
    });
    return data;
  } catch (e) {
    throw e;
  }
}

function shuffleArray<T>(array: T[]): T[] {
  const result = [...array]; // 元の配列を変更しないようコピー
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // 0〜iのランダム整数
    [result[i], result[j]] = [result[j], result[i]]; // 要素を交換
  }
  return result;
}
