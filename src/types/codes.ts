export const BP区分 = { 社員: 0, BP: 1 } as const;
export const 削除フラグ = { 有効: 0, 削除: 1 } as const;
export const 自動生成フラグ = { 手動: 0, 自動生成: 1 } as const;
export const 試験実施ステータス = {
  準備中: 0,
  未実施: 1,
  実施中: 2,
  実施完了: 3,
  人材DB反映済: 4,
  試験中止: 9,
} as const;
export type ExamRunStatus = 0 | 1 | 2 | 3 | 4 | 9;
export const EXAM_RUN_STATUS = {
  0: '準備中', // 試験を新規作成
  1: '未実施', // 試験確定
  2: '実施中', // 試験リンクがクリックされた
  3: '実施完了', // 試験が提出された
  4: '人材DB反映済', // 試験結果がDBに反映された
  9: '試験中止',
} as const;

export const EXAM_RUN_STATUS_COLOR = {
  0: 'info',
  1: 'grey',
  2: 'primary',
  3: 'success',
  4: 'success',
  9: 'error',
} as const;
