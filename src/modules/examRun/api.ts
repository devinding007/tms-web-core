import type { ApiListResult } from '@/types/api';
import type { ExamRun } from '@/types/models/ExamRun';
import type { ExamRunStatus } from '@/types/codes';

import type { ExamSession, ExamSubmissionPayload } from '@/types/models/Exam';

import { useExamRunStore } from '@/store/examRunStore';

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

// export async function simulateLinkOpened(id: string): Promise<ExamRunStatus> {
//   const r = RUNS.find((x) => x.試験ＩＤ === id);
//   if (!r) throw new Error('not found');
//   r.試験ステータス = 2; // 実施中
//   return delay(r.試験ステータス, 300);
// }

// export async function submitExamAnswers(id: string): Promise<ExamRunStatus> {
//   const r = RUNS.find((x) => x.試験ＩＤ === id);
//   if (!r) throw new Error('not found');
//   r.試験ステータス = 3;
//   return delay(r.試験ステータス, 500);
// }

// export async function markReflected(id: string): Promise<ExamRunStatus> {
//   const r = RUNS.find((x) => x.試験ＩＤ === id);
//   if (!r) throw new Error('not found');
//   r.試験ステータス = 4;
//   return delay(r.試験ステータス, 300);
// }
