import type { ExamPaper } from './ExamPaper';
import type { ExamRunStatus } from '../codes';
export interface ExamAnswer {
  試験用紙問題ＩＤ: string;
  回答試験用紙選択肢ＩＤ: string;
}
export interface ExamRun {
  試験ＩＤ: string;
  参加者氏名: string;
  参加者人材ＩＤ?: string;
  登録済人材?: 0 | 1;
  試験ステータス: ExamRunStatus;
  // 試験リンクＩＤ?: string;
  試験実施日時?: string;
  試験提出日時?: string;
  試験用紙?: ExamPaper;
  試験問題解答?: ExamAnswer[];
}
