import { SkillSummary } from './SkillSummary';

export interface ResumeData {
  人材ＩＤ?: string;
  氏名?: string;
  出生年月?: string;
  国籍?: string;
  来日年月?: string;
  最寄駅?: string;
  言語?: ResumeLanguage[];
  学歴?: ResumeEducation[];
  資格?: string[];
  スキル?: ResumeSkill[];
  アピールポイント?: string;
  業務歴?: ResumeExperience[];
  AI分析結果?: SkillSummary;
}

export interface ResumeLanguage {
  言語名?: string;
  読み: string;
  書き: string;
  会話: string;
}

export interface ResumeSkill {
  スキル名?: string;
  レベル?: string;
}

export interface ResumeEducation {
  開始年月?: string;
  終了年月?: string;
  学校?: string;
  専門?: string;
  学位?: string;
}

export interface ResumeExperience {
  期間開始?: string;
  期間終了?: string;
  担当業務詳細?: string;
  チーム規模?: string;
  利用技術?: string[];
  役割?: string;
}

export interface SaveSelections {
  basic: boolean;
  resume: boolean;
  analysis: boolean;
  skillScores: boolean;
}
