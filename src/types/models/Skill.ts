import type { UUID } from '@/types/common';
export interface SkillItem {
  スキル名: string;
  スキル点数: number;
}
export interface PersonnelSkillPayload {
  人材ＩＤ: UUID;
  スキル: SkillItem[];
}
export interface SkillUpdate {
  スキル名: string;
  スキル点数更新前: number;
  スキル点数更新後: number;
}
