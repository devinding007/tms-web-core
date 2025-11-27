import type { UUID } from '@/types/common';

export interface Personnel {
  人材ＩＤ: UUID;
  所属会社: string;
  名前: string;
  社員番号: string;
  生年月日: string;
  現案件終了年月日: string;
  BPフラグ: 0 | 1;
}
