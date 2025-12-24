import { Personnel } from './Personnel';
import { SkillItem } from './Skill';

export interface Proposal {
  提案ID: string;
  提案名: string;
  募集要項: string;
  対象人材: Personnel[];
  分析結果?: CandidateAnalysis[];
}
export interface CandidateAnalysis {
  人材ID: string;
  名前: string;
  マッチ率: number;
  コメント: string;
  スキル採点: SkillItem[];
}

export interface ProposalAnalyseResult {
  人材ID: string;
  マッチ率: number;
  理由: string;
  スキル採点: SkillItem[];
}
