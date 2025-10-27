export interface ExamChoice {
  選択肢ＩＤ: string;
  選択肢文章: string;
  回答理由: string;
}

export interface ExamProblem {
  試験用紙問題ＩＤ: string;
  試験用紙ＩＤ: string;
  問題文章: string;
  難易度: number;
  スキル: string;
  選択肢: ExamChoice[];
}

export interface ExamPaper {
  試験用紙ＩＤ: string;
  試験用紙名称: string;
  説明: string;
  作成日時: string;
  問題リスト: ExamProblem[];
}

export interface ExamSession {
  試験ＩＤ: string;
  参加者氏名: string;
  参加者人材ＩＤ: string;
  試験ステータス: number;
  試験リンクＩＤ: string;
  試験用紙: ExamPaper;
}

export interface ExamAnswerItem {
  試験用紙問題ＩＤ: string;
  回答試験用紙選択肢ＩＤ: string;
}

export interface ExamSubmissionPayload {
  試験ＩＤ: string;
  試験問題解答: ExamAnswerItem[];
}
