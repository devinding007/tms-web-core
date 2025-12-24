import type { UUID } from '@/types/common';
import type { Choice } from '@/types/models/Question';
export interface ExamPaper {
  試験用紙ＩＤ: UUID;
  試験用紙名称: string;
  説明: string;
  作成日時: string;
  削除フラグ?: 0 | 1;
  問題リスト: ExamPaperQuestion[];
}
export interface ExamPaperQuestion {
  試験用紙問題ＩＤ: string;
  試験用紙ＩＤ: string;
  問題文章: string;
  難易度: number;
  スキル: string;
  模範回答: string;
  模範回答理由: string;
  自動生成フラグ: 0 | 1;
  選択肢: {
    選択肢ＩＤ: string;
    選択肢文章: string;
    回答理由: string;
  }[];
}


