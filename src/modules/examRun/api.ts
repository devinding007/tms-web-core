import type { ApiListResult } from '@/types/api';
import type { ExamRun } from '@/types/models/ExamRun';
import type { ExamRunStatus } from '@/types/codes';

import type { ExamSession, ExamSubmissionPayload } from '@/types/models/Exam';

import { useExamStore } from '@/store/examRunStore';

const uuid = () =>
  (globalThis.crypto && 'randomUUID' in globalThis.crypto
    ? (globalThis.crypto as any).randomUUID()
    : Math.random().toString(36).slice(2)) as string;
const now = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(
    d.getMinutes()
  )}`;
};
function delay<T>(data: T, ms = 500): Promise<T> {
  return new Promise((r) => setTimeout(() => r(data), ms));
}

let RUNS: ExamRun[] = [
  {
    試験ＩＤ: 'f8f1a8e0-3b24-4c3a-9b7d-9f7f1a9b2c10',
    参加者氏名: '田中 一郎',
    参加者人材ＩＤ: '3a6e9f20-6c4a-45c3-9a2e-0a3c1b2d4e56',
    試験ステータス: 3,
    試験リンクＩＤ: 'EX-7M2H-20251022',
    試験実施日時: '202510222237',
    試験用紙: undefined,
    試験問題解答: [],
  },
];

export interface RunFilters {
  idLike?: string;
  userLike?: string;
  status?: ExamRunStatus;
  keyword?: string;
}
export async function listExamRuns(
  filters: RunFilters,
  page = 1,
  pageSize = 10
): Promise<ApiListResult<ExamRun>> {
  let arr = RUNS.slice();
  if (filters.idLike) arr = arr.filter((x) => x.試験ＩＤ.includes(filters.idLike!));
  if (filters.userLike) arr = arr.filter((x) => x.参加者氏名.includes(filters.userLike!));
  if (filters.status !== undefined) arr = arr.filter((x) => x.試験ステータス === filters.status);
  const start = (page - 1) * pageSize;
  return delay(
    { items: JSON.parse(JSON.stringify(arr.slice(start, start + pageSize))), total: arr.length },
    400
  );
}

export async function getExamRun(id: string): Promise<ExamRun | undefined> {
  const found = RUNS.find((r) => r.試験ＩＤ === id);
  return delay(found ? JSON.parse(JSON.stringify(found)) : undefined, 300);
}

export async function saveExamRun(run: ExamRun): Promise<ExamRun> {
  const copy = JSON.parse(JSON.stringify(run)) as ExamRun;
  if (!copy.試験ＩＤ) copy.試験ＩＤ = uuid();
  if (!copy.試験ステータス) copy.試験ステータス = 0;
  if (!copy.試験実施日時) copy.試験実施日時 = now();
  const i = RUNS.findIndex((x) => x.試験ＩＤ === copy.試験ＩＤ);
  if (i >= 0) RUNS[i] = copy;
  else RUNS.unshift(copy);

  //一時追加
  const examSessionList = useExamStore().examSession;
  const session: ExamSession = {
    試験ＩＤ: run.試験ＩＤ,
    参加者氏名: run.参加者氏名,
    参加者人材ＩＤ: run.参加者人材ＩＤ!,
    試験ステータス: run.試験ステータス,
    試験リンクＩＤ: run.試験リンクＩＤ!,
    試験用紙: run.試験用紙!,
  };
  const updatedList = examSessionList.filter((es) => es.試験リンクＩＤ === session.試験リンクＩＤ);
  updatedList.push(session);
  useExamStore().examSession = updatedList;

  return delay(JSON.parse(JSON.stringify(copy)), 200);
}

export async function generateExamLink(
  id: string
): Promise<{ linkId: string; status: ExamRunStatus }> {
  const r = RUNS.find((x) => x.試験ＩＤ === id);
  if (!r) throw new Error('not found');
  const link = `EX-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${new Date()
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, '')}`;
  r.試験リンクＩＤ = link;
  r.試験ステータス = 1; // 準備中 -> 未実施
  return delay({ linkId: link, status: r.試験ステータス }, 400);
}

export async function simulateLinkOpened(id: string): Promise<ExamRunStatus> {
  const r = RUNS.find((x) => x.試験ＩＤ === id);
  if (!r) throw new Error('not found');
  r.試験ステータス = 2; // 実施中
  return delay(r.試験ステータス, 300);
}

export async function submitExamAnswers(id: string): Promise<ExamRunStatus> {
  const r = RUNS.find((x) => x.試験ＩＤ === id);
  if (!r) throw new Error('not found');
  r.試験ステータス = 3;
  return delay(r.試験ステータス, 500);
}

export async function markReflected(id: string): Promise<ExamRunStatus> {
  const r = RUNS.find((x) => x.試験ＩＤ === id);
  if (!r) throw new Error('not found');
  r.試験ステータス = 4;
  return delay(r.試験ステータス, 300);
}
