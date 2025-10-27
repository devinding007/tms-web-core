import type { ApiListResult } from '@/types/api';
import type { Personnel } from '@/types/models/Personnel';
import type { Question } from '@/types/models/Question';
import type { PersonnelSkillPayload, SkillItem } from '@/types/models/Skill';
import type { ExamSession, ExamSubmissionPayload } from '@/types/models/Exam';

const PERSONNEL: Personnel[] = [
  {
    人材ID: 'b9fcb3b2-6d88-41b7-b5b4-2f1d6b24cf32',
    所属会社: 'ABCソリューション株式会社',
    名前: '山田 太郎',
    社員番号: 'A1001',
    生年月日: '19900415',
    現案件終了年月日: '20251231',
    BPフラグ: 0,
  },
  {
    人材ID: 'f2cdd908-4a2e-4e61-9a2d-73f7a38c72a1',
    所属会社: 'DEFテクノロジーズ株式会社',
    名前: '佐藤 花子',
    社員番号: 'A1002',
    生年月日: '19870620',
    現案件終了年月日: '20250630',
    BPフラグ: 0,
  },
  {
    人材ID: '6b5cc053-2682-4f14-9b62-05611b78d74f',
    所属会社: 'GHIシステムズ株式会社',
    名前: '鈴木 一郎',
    社員番号: 'A1003',
    生年月日: '19921005',
    現案件終了年月日: '20250430',
    BPフラグ: 0,
  },
  {
    人材ID: 'c6e72e4e-22b5-437b-b0d7-6a88290eb2b1',
    所属会社: 'JKLソフトウェア合同会社',
    名前: '高橋 美咲',
    社員番号: 'A1004',
    生年月日: '19981125',
    現案件終了年月日: '20250715',
    BPフラグ: 0,
  },
  {
    人材ID: 'e2ac3f3f-9827-49d7-b463-c7889c80e3a2',
    所属会社: 'MNOエンジニアリング株式会社',
    名前: '田中 健',
    社員番号: 'A1005',
    生年月日: '19891210',
    現案件終了年月日: '20260331',
    BPフラグ: 0,
  },
] as any;
const SKILL_OPTIONS = [
  'Java',
  'Spring Boot',
  'Vue.js',
  'TypeScript',
  'SQL',
  'Python',
  'Docker',
  'Kubernetes',
];
const SKILLS: Record<string, SkillItem[]> = {
  'c3b9c8c4-1d9f-4b68-9d79-6cfdf843a93e': [
    { スキル名: 'Java', スキル点数: 85 },
    { スキル名: 'Spring Boot', スキル点数: 78 },
    { スキル名: 'Vue.js', スキル点数: 88 },
    { スキル名: 'TypeScript', スキル点数: 80 },
    { スキル名: 'SQL', スキル点数: 92 },
  ],
};

function delay<T>(data: T, ms = 800): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

export async function listPersonnel(
  keyword?: string,
  page = 1,
  pageSize = 10
): Promise<ApiListResult<Personnel>> {
  const filtered = keyword
    ? PERSONNEL.filter((p) =>
        [p.名前, p.所属会社, p.社員番号].some((v) =>
          v?.toLowerCase().includes((keyword || '').toLowerCase())
        )
      )
    : PERSONNEL;
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);
  return delay({ items, total: filtered.length });
}
export async function getPersonnel(id: string): Promise<Personnel | undefined> {
  return delay(PERSONNEL.find((p) => p.人材ID === id));
}
export async function createPersonnel(p: Omit<Personnel, '人材ID'>): Promise<Personnel> {
  const newItem: Personnel = {
    ...p,
    人材ID: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
  } as Personnel;
  (PERSONNEL as any).unshift(newItem);
  return delay(newItem, 1200);
}
export async function updatePersonnel(p: Personnel): Promise<Personnel> {
  const idx = PERSONNEL.findIndex((x) => x.人材ID === p.人材ID);
  if (idx >= 0) PERSONNEL[idx] = p;
  return delay(p, 1200);
}
export async function deletePersonnel(id: string): Promise<void> {
  const idx = PERSONNEL.findIndex((x) => x.人材ID === id);
  if (idx >= 0) PERSONNEL.splice(idx, 1);
  return delay(undefined as any, 800);
}

export async function listSkillOptions(): Promise<string[]> {
  return delay(SKILL_OPTIONS.slice());
}
export async function getSkillsByPersonnelId(id: string): Promise<SkillItem[]> {
  return delay(SKILLS[id] ? [...SKILLS[id]] : []);
}
export async function saveSkills(payload: PersonnelSkillPayload): Promise<void> {
  SKILLS[payload.人材ＩＤ] = payload.スキル.map((s) => ({ ...s }));
  return delay(undefined as any, 1200);
}

let QUESTIONS: Question[] = [
  {
    問題ＩＤ: 'f8b92b3a-7c5b-4b1c-a8b0-dc1f8a7d1b62',
    問題文章: '次のうち、Javaでオブジェクトを正しく比較する方法はどれですか？',
    難易度: 4,
    スキル: 'Java',
    模範回答: 'a3c37fbb-b6d4-49d0-a4f5-10d9ec0a1e9e',
    模範回答理由: 'Javaでは、オブジェクトの内容比較にはequals()メソッドを使用する必要があるため。',
    自動生成フラグ: 0,
    選択肢: [
      {
        選択肢ＩＤ: 'a3c37fbb-b6d4-49d0-a4f5-10d9ec0a1e9e',
        選択肢文章: 'equals()メソッドを使う',
        回答理由: '==は参照比較のため、オブジェクト内容を比較するにはequals()を使うべき。',
      },
      {
        選択肢ＩＤ: '21d3a61b-43cc-4bb7-a3d1-6b6b2b52c924',
        選択肢文章: '==演算子を使う',
        回答理由: '==は参照比較であり、異なるオブジェクトでも同内容ならfalseになる。',
      },
      {
        選択肢ＩＤ: 'a42b4d8f-5f43-48a3-b35f-8e89b5dbac7a',
        選択肢文章: 'compareTo()メソッドを使う',
        回答理由: 'compareTo()は主にComparableを実装したクラスで大小比較に使う。',
      },
      {
        選択肢ＩＤ: 'be22e8bb-5dc8-4af5-a3c8-86e474d51855',
        選択肢文章: 'hashCode()を使う',
        回答理由: 'hashCode()はハッシュ値比較であり、内容比較には不適切。',
      },
    ],
  },
  {
    問題ＩＤ: 'b1c2290f-8a3b-4f6e-9f9f-1c4a4a7cf4b8',
    問題文章: 'Vue.jsで双方向バインディングを行うためのディレクティブはどれですか？',
    難易度: 3,
    スキル: 'VueJS',
    模範回答: 'c3b45a91-b112-4673-9051-f06b45ecb3d3',
    模範回答理由: 'v-modelディレクティブは入力要素とデータの双方向バインディングを提供するため。',
    自動生成フラグ: 0,
    選択肢: [
      {
        選択肢ＩＤ: 'c3b45a91-b112-4673-9051-f06b45ecb3d3',
        選択肢文章: 'v-model',
        回答理由: '双方向データバインディング用に特化したディレクティブ。',
      },
      {
        選択肢ＩＤ: '98e3c7de-2de9-4d84-a5d7-5fd7e60b0f71',
        選択肢文章: 'v-bind',
        回答理由: 'v-bindは片方向のプロパティバインディングに使用される。',
      },
      {
        選択肢ＩＤ: 'cc04d1d1-23a3-469f-bd5a-0fa4b38f79cb',
        選択肢文章: 'v-if',
        回答理由:
          '条件付きレンダリングのためのディレクティブであり、データバインディングとは無関係。',
      },
      {
        選択肢ＩＤ: 'dd6d2b94-8182-48b7-8a13-6e3479f824cb',
        選択肢文章: 'v-on',
        回答理由: 'イベントリスナー登録用のディレクティブ。双方向バインディングではない。',
      },
    ],
  },
  {
    問題ＩＤ: '46ea9400-3562-432d-83d2-29bf68576ece',
    問題文章: 'VueJSに関する次の記述のうち、正しいものはどれですか？',
    難易度: 8,
    スキル: 'VueJS',
    模範回答: '58cecc55-42d1-4049-ae32-91d155c078dc',
    模範回答理由: 'VueJS において選択肢2が適切なため。',
    自動生成フラグ: 0,
    選択肢: [
      {
        選択肢ＩＤ: 'c72a05ed-5a22-4057-854b-a9c04b3d4aef',
        選択肢文章: 'VueJS の選択肢 1',
        回答理由: 'VueJS に関する理由 1',
      },
      {
        選択肢ＩＤ: '58cecc55-42d1-4049-ae32-91d155c078dc',
        選択肢文章: 'VueJS の選択肢 2',
        回答理由: 'VueJS に関する理由 2',
      },
      {
        選択肢ＩＤ: 'a1822a42-65bc-4be7-bd54-c82bd04972e8',
        選択肢文章: 'VueJS の選択肢 3',
        回答理由: 'VueJS に関する理由 3',
      },
      {
        選択肢ＩＤ: 'b9bfcbf1-2b92-440e-b1a7-2b4d6d66c9e4',
        選択肢文章: 'VueJS の選択肢 4',
        回答理由: 'VueJS に関する理由 4',
      },
    ],
  },
  {
    問題ＩＤ: '38d0a0f8-9e32-4ab5-8c62-3b44084d3e07',
    問題文章: 'TypeScriptに関する次の記述のうち、正しいものはどれですか？',
    難易度: 5,
    スキル: 'TypeScript',
    模範回答: '5a608317-3db0-4d3b-a637-bcd07569d4a6',
    模範回答理由: 'TypeScript において選択肢3が適切なため。',
    自動生成フラグ: 0,
    選択肢: [
      {
        選択肢ＩＤ: 'e5d919af-755d-4363-978b-3ee3397e9649',
        選択肢文章: 'TypeScript の選択肢 1',
        回答理由: 'TypeScript に関する理由 1',
      },
      {
        選択肢ＩＤ: '1b445b66-e591-446a-989d-712d54639a12',
        選択肢文章: 'TypeScript の選択肢 2',
        回答理由: 'TypeScript に関する理由 2',
      },
      {
        選択肢ＩＤ: '5a608317-3db0-4d3b-a637-bcd07569d4a6',
        選択肢文章: 'TypeScript の選択肢 3',
        回答理由: 'TypeScript に関する理由 3',
      },
      {
        選択肢ＩＤ: '3e991cb3-a0eb-41f5-8e48-041ace176987',
        選択肢文章: 'TypeScript の選択肢 4',
        回答理由: 'TypeScript に関する理由 4',
      },
    ],
  },
  {
    問題ＩＤ: 'd3b915f0-04a7-4f55-bf91-3be81a7e749f',
    問題文章: 'SQLに関する次の記述のうち、正しいものはどれですか？',
    難易度: 4,
    スキル: 'SQL',
    模範回答: '57943f5c-add6-4c1d-bbb6-48801885dccb',
    模範回答理由: 'SQL において選択肢3が適切なため。',
    自動生成フラグ: 1,
    選択肢: [
      {
        選択肢ＩＤ: 'e3ec3b78-513b-4cd8-9c12-a4811fd0ed8d',
        選択肢文章: 'SQL の選択肢 1',
        回答理由: 'SQL に関する理由 1',
      },
      {
        選択肢ＩＤ: '68c098d0-3678-46e9-ba97-8fe4adcfad0e',
        選択肢文章: 'SQL の選択肢 2',
        回答理由: 'SQL に関する理由 2',
      },
      {
        選択肢ＩＤ: '57943f5c-add6-4c1d-bbb6-48801885dccb',
        選択肢文章: 'SQL の選択肢 3',
        回答理由: 'SQL に関する理由 3',
      },
      {
        選択肢ＩＤ: '6692c121-de0c-4cf0-a6ae-93bb3d5a690a',
        選択肢文章: 'SQL の選択肢 4',
        回答理由: 'SQL に関する理由 4',
      },
    ],
  },
  {
    問題ＩＤ: '0a4a1da9-ff53-4ec6-8c36-0854019fc876',
    問題文章: 'Pythonに関する次の記述のうち、正しいものはどれですか？',
    難易度: 4,
    スキル: 'Python',
    模範回答: '264fe468-a6bf-415a-aad9-4bd06ed161c9',
    模範回答理由: 'Python において選択肢3が適切なため。',
    自動生成フラグ: 1,
    選択肢: [
      {
        選択肢ＩＤ: '838ad985-50da-4d7b-8ade-43ee6fd29926',
        選択肢文章: 'Python の選択肢 1',
        回答理由: 'Python に関する理由 1',
      },
      {
        選択肢ＩＤ: '60fece80-f2e1-4297-88d0-0d973c75da09',
        選択肢文章: 'Python の選択肢 2',
        回答理由: 'Python に関する理由 2',
      },
      {
        選択肢ＩＤ: '264fe468-a6bf-415a-aad9-4bd06ed161c9',
        選択肢文章: 'Python の選択肢 3',
        回答理由: 'Python に関する理由 3',
      },
      {
        選択肢ＩＤ: 'f0bcf094-492b-4026-b8f4-726ba3030cf9',
        選択肢文章: 'Python の選択肢 4',
        回答理由: 'Python に関する理由 4',
      },
    ],
  },
  {
    問題ＩＤ: 'c15bfd1d-73c2-490a-b3df-b5a4552dadfe',
    問題文章: 'Dockerに関する次の記述のうち、正しいものはどれですか？',
    難易度: 2,
    スキル: 'Docker',
    模範回答: 'd7061d11-6120-413f-9953-0d564baaaec2',
    模範回答理由: 'Docker において選択肢3が適切なため。',
    自動生成フラグ: 0,
    選択肢: [
      {
        選択肢ＩＤ: '03f65c8d-4dd1-4d0e-89d4-9158fb11fb39',
        選択肢文章: 'Docker の選択肢 1',
        回答理由: 'Docker に関する理由 1',
      },
      {
        選択肢ＩＤ: '6be6f894-6d1c-4cf0-b0b1-f0c197742ed4',
        選択肢文章: 'Docker の選択肢 2',
        回答理由: 'Docker に関する理由 2',
      },
      {
        選択肢ＩＤ: 'd7061d11-6120-413f-9953-0d564baaaec2',
        選択肢文章: 'Docker の選択肢 3',
        回答理由: 'Docker に関する理由 3',
      },
      {
        選択肢ＩＤ: '5491a5c9-b267-439d-a079-279045e65aaa',
        選択肢文章: 'Docker の選択肢 4',
        回答理由: 'Docker に関する理由 4',
      },
    ],
  },
  {
    問題ＩＤ: '68d5aafb-ddc8-45ce-a9d2-b07b9142e820',
    問題文章: 'Kubernetesに関する次の記述のうち、正しいものはどれですか？',
    難易度: 4,
    スキル: 'Kubernetes',
    模範回答: 'd8e47af4-a831-4b3b-8a6d-a0fc057fba86',
    模範回答理由: 'Kubernetes において選択肢4が適切なため。',
    自動生成フラグ: 0,
    選択肢: [
      {
        選択肢ＩＤ: 'fb021306-6a0e-4934-842c-6b1ad412858d',
        選択肢文章: 'Kubernetes の選択肢 1',
        回答理由: 'Kubernetes に関する理由 1',
      },
      {
        選択肢ＩＤ: '0bb3c2e2-2f77-4c3f-90e4-96e84c10adb7',
        選択肢文章: 'Kubernetes の選択肢 2',
        回答理由: 'Kubernetes に関する理由 2',
      },
      {
        選択肢ＩＤ: 'f2e3e17a-082f-4aae-a1ef-6a0846188e1d',
        選択肢文章: 'Kubernetes の選択肢 3',
        回答理由: 'Kubernetes に関する理由 3',
      },
      {
        選択肢ＩＤ: 'd8e47af4-a831-4b3b-8a6d-a0fc057fba86',
        選択肢文章: 'Kubernetes の選択肢 4',
        回答理由: 'Kubernetes に関する理由 4',
      },
    ],
  },
  {
    問題ＩＤ: '8c6d7de8-af0f-4119-8b96-38d6c0435b26',
    問題文章: 'Networkに関する次の記述のうち、正しいものはどれですか？',
    難易度: 4,
    スキル: 'Network',
    模範回答: '64b60c4f-d0ec-4b3a-8a4f-28de26e2fe83',
    模範回答理由: 'Network において選択肢2が適切なため。',
    自動生成フラグ: 0,
    選択肢: [
      {
        選択肢ＩＤ: '5732c5bf-ba53-4091-a2ee-03c61f98b533',
        選択肢文章: 'Network の選択肢 1',
        回答理由: 'Network に関する理由 1',
      },
      {
        選択肢ＩＤ: '64b60c4f-d0ec-4b3a-8a4f-28de26e2fe83',
        選択肢文章: 'Network の選択肢 2',
        回答理由: 'Network に関する理由 2',
      },
      {
        選択肢ＩＤ: '044ec240-b049-4c2f-aa6b-190657df237e',
        選択肢文章: 'Network の選択肢 3',
        回答理由: 'Network に関する理由 3',
      },
      {
        選択肢ＩＤ: 'f5a35788-e4c0-4e66-a5a5-918c2ff4f822',
        選択肢文章: 'Network の選択肢 4',
        回答理由: 'Network に関する理由 4',
      },
    ],
  },
  {
    問題ＩＤ: '9d157dae-ad2f-42ef-a1da-f4bb50a65fc7',
    問題文章: 'Linuxに関する次の記述のうち、正しいものはどれですか？',
    難易度: 9,
    スキル: 'Linux',
    模範回答: '86dd63e8-d24b-4be2-98f8-46074053f580',
    模範回答理由: 'Linux において選択肢1が適切なため。',
    自動生成フラグ: 0,
    選択肢: [
      {
        選択肢ＩＤ: '86dd63e8-d24b-4be2-98f8-46074053f580',
        選択肢文章: 'Linux の選択肢 1',
        回答理由: 'Linux に関する理由 1',
      },
      {
        選択肢ＩＤ: '21c1898d-70a4-4005-9e7a-17e2ac1ee2a6',
        選択肢文章: 'Linux の選択肢 2',
        回答理由: 'Linux に関する理由 2',
      },
      {
        選択肢ＩＤ: 'c6420df2-abaf-4933-ad37-30fa2056201d',
        選択肢文章: 'Linux の選択肢 3',
        回答理由: 'Linux に関する理由 3',
      },
      {
        選択肢ＩＤ: '828c0b7d-88d8-4d76-a76a-464eb730d9b7',
        選択肢文章: 'Linux の選択肢 4',
        回答理由: 'Linux に関する理由 4',
      },
    ],
  },
  {
    問題ＩＤ: 'cc11a289-7a5a-4a94-90e7-ebeae39ac81e',
    問題文章: 'Javaに関する次の記述のうち、正しいものはどれですか？',
    難易度: 9,
    スキル: 'Java',
    模範回答: 'a46f70e4-4061-402d-973c-b7322d2b305b',
    模範回答理由: 'Java において選択肢1が適切なため。',
    自動生成フラグ: 1,
    選択肢: [
      {
        選択肢ＩＤ: 'a46f70e4-4061-402d-973c-b7322d2b305b',
        選択肢文章: 'Java の選択肢 1',
        回答理由: 'Java に関する理由 1',
      },
      {
        選択肢ＩＤ: '4a405b60-4b7d-4f2b-ade8-0cdb50baadd2',
        選択肢文章: 'Java の選択肢 2',
        回答理由: 'Java に関する理由 2',
      },
      {
        選択肢ＩＤ: '7980a164-b0de-4c9c-8b58-212ed76f63a1',
        選択肢文章: 'Java の選択肢 3',
        回答理由: 'Java に関する理由 3',
      },
      {
        選択肢ＩＤ: '73cfb6b5-7d81-4486-bd7e-255b3b68f862',
        選択肢文章: 'Java の選択肢 4',
        回答理由: 'Java に関する理由 4',
      },
    ],
  },
  {
    問題ＩＤ: 'f08092b8-d5af-469c-a219-3cb9a0d8b702',
    問題文章: 'Spring Bootに関する次の記述のうち、正しいものはどれですか？',
    難易度: 1,
    スキル: 'Spring Boot',
    模範回答: 'db7c71ce-d5c1-4517-b2d2-91a7f1b78fa2',
    模範回答理由: 'Spring Boot において選択肢2が適切なため。',
    自動生成フラグ: 1,
    選択肢: [
      {
        選択肢ＩＤ: '49e1e357-3716-4053-be74-799710adec47',
        選択肢文章: 'Spring Boot の選択肢 1',
        回答理由: 'Spring Boot に関する理由 1',
      },
      {
        選択肢ＩＤ: 'db7c71ce-d5c1-4517-b2d2-91a7f1b78fa2',
        選択肢文章: 'Spring Boot の選択肢 2',
        回答理由: 'Spring Boot に関する理由 2',
      },
      {
        選択肢ＩＤ: '1f6822d1-8ad1-44c7-af7a-c1a91e6cddbe',
        選択肢文章: 'Spring Boot の選択肢 3',
        回答理由: 'Spring Boot に関する理由 3',
      },
      {
        選択肢ＩＤ: '482e05b9-64ef-4141-8678-f872750a92c0',
        選択肢文章: 'Spring Boot の選択肢 4',
        回答理由: 'Spring Boot に関する理由 4',
      },
    ],
  },
  {
    問題ＩＤ: '5c7062ac-19c8-47cf-827a-1476e38b3810',
    問題文章: 'VueJSに関する次の記述のうち、正しいものはどれですか？',
    難易度: 1,
    スキル: 'VueJS',
    模範回答: '57d9a96f-26be-47d4-83b6-63b3e205707b',
    模範回答理由: 'VueJS において選択肢3が適切なため。',
    自動生成フラグ: 1,
    選択肢: [
      {
        選択肢ＩＤ: 'a4ae9118-3202-4adf-b080-b3171877ee04',
        選択肢文章: 'VueJS の選択肢 1',
        回答理由: 'VueJS に関する理由 1',
      },
      {
        選択肢ＩＤ: '4ef01eb2-9e49-42fe-8879-90cae238b4a3',
        選択肢文章: 'VueJS の選択肢 2',
        回答理由: 'VueJS に関する理由 2',
      },
      {
        選択肢ＩＤ: '57d9a96f-26be-47d4-83b6-63b3e205707b',
        選択肢文章: 'VueJS の選択肢 3',
        回答理由: 'VueJS に関する理由 3',
      },
      {
        選択肢ＩＤ: '9feaeef8-134a-4130-8952-43a091915fbf',
        選択肢文章: 'VueJS の選択肢 4',
        回答理由: 'VueJS に関する理由 4',
      },
    ],
  },
  {
    問題ＩＤ: '954bb656-df7f-431e-ad58-0d0f90b7bc99',
    問題文章: 'TypeScriptに関する次の記述のうち、正しいものはどれですか？',
    難易度: 2,
    スキル: 'TypeScript',
    模範回答: '6c391ecb-7275-4278-974c-4b11b350bef6',
    模範回答理由: 'TypeScript において選択肢4が適切なため。',
    自動生成フラグ: 1,
    選択肢: [
      {
        選択肢ＩＤ: 'fd4e642c-6db7-4f3b-87d0-6059dd070852',
        選択肢文章: 'TypeScript の選択肢 1',
        回答理由: 'TypeScript に関する理由 1',
      },
      {
        選択肢ＩＤ: '70987451-e87a-45f2-8565-af2d41bafa4b',
        選択肢文章: 'TypeScript の選択肢 2',
        回答理由: 'TypeScript に関する理由 2',
      },
      {
        選択肢ＩＤ: 'e3e72bd1-f7a9-4caf-a733-9abe589d1939',
        選択肢文章: 'TypeScript の選択肢 3',
        回答理由: 'TypeScript に関する理由 3',
      },
      {
        選択肢ＩＤ: '6c391ecb-7275-4278-974c-4b11b350bef6',
        選択肢文章: 'TypeScript の選択肢 4',
        回答理由: 'TypeScript に関する理由 4',
      },
    ],
  },
  {
    問題ＩＤ: 'cf907428-d795-4b1f-83b9-f4fe7527d172',
    問題文章: 'SQLに関する次の記述のうち、正しいものはどれですか？',
    難易度: 2,
    スキル: 'SQL',
    模範回答: 'd2217da3-365b-4f1f-8654-187f3a59e1d5',
    模範回答理由: 'SQL において選択肢2が適切なため。',
    自動生成フラグ: 0,
    選択肢: [
      {
        選択肢ＩＤ: '1cfdc746-6861-40c1-aefe-078a7c1585e2',
        選択肢文章: 'SQL の選択肢 1',
        回答理由: 'SQL に関する理由 1',
      },
      {
        選択肢ＩＤ: 'd2217da3-365b-4f1f-8654-187f3a59e1d5',
        選択肢文章: 'SQL の選択肢 2',
        回答理由: 'SQL に関する理由 2',
      },
      {
        選択肢ＩＤ: '3ce5638b-8ebf-415d-ae8c-caede2f29624',
        選択肢文章: 'SQL の選択肢 3',
        回答理由: 'SQL に関する理由 3',
      },
      {
        選択肢ＩＤ: 'b7326bf6-4067-4404-87c6-d5df92d7cdb7',
        選択肢文章: 'SQL の選択肢 4',
        回答理由: 'SQL に関する理由 4',
      },
    ],
  },
  {
    問題ＩＤ: 'd7c01bb2-c44f-477a-ab81-24409d74c2da',
    問題文章: 'Pythonに関する次の記述のうち、正しいものはどれですか？',
    難易度: 2,
    スキル: 'Python',
    模範回答: 'a6798e37-9fec-4222-bb33-bdaf6d30f34c',
    模範回答理由: 'Python において選択肢3が適切なため。',
    自動生成フラグ: 0,
    選択肢: [
      {
        選択肢ＩＤ: '422e9b5f-eca9-47ab-b86c-8db688dcfe30',
        選択肢文章: 'Python の選択肢 1',
        回答理由: 'Python に関する理由 1',
      },
      {
        選択肢ＩＤ: '57a3a11e-77e3-4ab3-9504-d7d9db5c0ba5',
        選択肢文章: 'Python の選択肢 2',
        回答理由: 'Python に関する理由 2',
      },
      {
        選択肢ＩＤ: 'a6798e37-9fec-4222-bb33-bdaf6d30f34c',
        選択肢文章: 'Python の選択肢 3',
        回答理由: 'Python に関する理由 3',
      },
      {
        選択肢ＩＤ: 'b55f73a7-b518-465e-a355-59973ea45e4e',
        選択肢文章: 'Python の選択肢 4',
        回答理由: 'Python に関する理由 4',
      },
    ],
  },
  {
    問題ＩＤ: '431cb7f4-4b19-412a-a8b1-a556e1833d49',
    問題文章: 'Dockerに関する次の記述のうち、正しいものはどれですか？',
    難易度: 2,
    スキル: 'Docker',
    模範回答: 'b58ef54a-5d5b-4874-b3da-314791210f7b',
    模範回答理由: 'Docker において選択肢4が適切なため。',
    自動生成フラグ: 1,
    選択肢: [
      {
        選択肢ＩＤ: 'ec9d20ca-65a2-427f-ae89-6e19e7a24ca0',
        選択肢文章: 'Docker の選択肢 1',
        回答理由: 'Docker に関する理由 1',
      },
      {
        選択肢ＩＤ: 'e06b4212-83b3-4590-9ee2-ca7e11532752',
        選択肢文章: 'Docker の選択肢 2',
        回答理由: 'Docker に関する理由 2',
      },
      {
        選択肢ＩＤ: '17aad1e5-2055-4f3b-96f3-ee9a151ae497',
        選択肢文章: 'Docker の選択肢 3',
        回答理由: 'Docker に関する理由 3',
      },
      {
        選択肢ＩＤ: 'b58ef54a-5d5b-4874-b3da-314791210f7b',
        選択肢文章: 'Docker の選択肢 4',
        回答理由: 'Docker に関する理由 4',
      },
    ],
  },
  {
    問題ＩＤ: 'f7fe3b38-6f94-41cc-9d8b-c74180e2649a',
    問題文章: 'Kubernetesに関する次の記述のうち、正しいものはどれですか？',
    難易度: 10,
    スキル: 'Kubernetes',
    模範回答: '7da56d4c-286a-4b21-b865-b144579cb1a5',
    模範回答理由: 'Kubernetes において選択肢3が適切なため。',
    自動生成フラグ: 0,
    選択肢: [
      {
        選択肢ＩＤ: '48570de2-2770-4c20-afbb-1e9bf3aa9a66',
        選択肢文章: 'Kubernetes の選択肢 1',
        回答理由: 'Kubernetes に関する理由 1',
      },
      {
        選択肢ＩＤ: 'ba0d4161-ffcc-4f48-b584-c4cbdff58d9d',
        選択肢文章: 'Kubernetes の選択肢 2',
        回答理由: 'Kubernetes に関する理由 2',
      },
      {
        選択肢ＩＤ: '7da56d4c-286a-4b21-b865-b144579cb1a5',
        選択肢文章: 'Kubernetes の選択肢 3',
        回答理由: 'Kubernetes に関する理由 3',
      },
      {
        選択肢ＩＤ: '4bce686a-d9dd-418f-be38-5ec8fc4438e2',
        選択肢文章: 'Kubernetes の選択肢 4',
        回答理由: 'Kubernetes に関する理由 4',
      },
    ],
  },
  {
    問題ＩＤ: '43777c6a-14f0-4f30-960a-0ebd0a164084',
    問題文章: 'Networkに関する次の記述のうち、正しいものはどれですか？',
    難易度: 7,
    スキル: 'Network',
    模範回答: '3ef20ef0-70eb-4805-b8a4-1d9f3dfbdd9f',
    模範回答理由: 'Network において選択肢4が適切なため。',
    自動生成フラグ: 1,
    選択肢: [
      {
        選択肢ＩＤ: '50adb555-084b-4446-abf0-eb89536f1679',
        選択肢文章: 'Network の選択肢 1',
        回答理由: 'Network に関する理由 1',
      },
      {
        選択肢ＩＤ: '5d504974-19ae-43ce-9a6f-0fcaecc14735',
        選択肢文章: 'Network の選択肢 2',
        回答理由: 'Network に関する理由 2',
      },
      {
        選択肢ＩＤ: '1f4fd1ab-f33b-4a2b-878d-0143e352b2ba',
        選択肢文章: 'Network の選択肢 3',
        回答理由: 'Network に関する理由 3',
      },
      {
        選択肢ＩＤ: '3ef20ef0-70eb-4805-b8a4-1d9f3dfbdd9f',
        選択肢文章: 'Network の選択肢 4',
        回答理由: 'Network に関する理由 4',
      },
    ],
  },
  {
    問題ＩＤ: '90810a1d-8333-4160-935f-9f2fafff7987',
    問題文章: 'Linuxに関する次の記述のうち、正しいものはどれですか？',
    難易度: 3,
    スキル: 'Linux',
    模範回答: 'b9e82a75-92fb-43fe-92eb-e577e3a37258',
    模範回答理由: 'Linux において選択肢3が適切なため。',
    自動生成フラグ: 0,
    選択肢: [
      {
        選択肢ＩＤ: 'c1938538-962a-439d-a64c-7b77dcb8ec25',
        選択肢文章: 'Linux の選択肢 1',
        回答理由: 'Linux に関する理由 1',
      },
      {
        選択肢ＩＤ: '039a1b9e-f5a1-4f5f-ae03-377e7757d29a',
        選択肢文章: 'Linux の選択肢 2',
        回答理由: 'Linux に関する理由 2',
      },
      {
        選択肢ＩＤ: 'b9e82a75-92fb-43fe-92eb-e577e3a37258',
        選択肢文章: 'Linux の選択肢 3',
        回答理由: 'Linux に関する理由 3',
      },
      {
        選択肢ＩＤ: 'd22756ab-2140-49a7-9163-6f8e3966bb1a',
        選択肢文章: 'Linux の選択肢 4',
        回答理由: 'Linux に関する理由 4',
      },
    ],
  },
] as any;

export interface QuestionFilters {
  問題ＩＤ?: string;
  スキル?: string;
  難易度_FROM?: number;
  難易度_TO?: number;
  自動生成フラグ?: 0 | 1;
  キーワード?: string;
}
export async function listQuestions(
  filters: QuestionFilters,
  page = 1,
  pageSize = 10
): Promise<ApiListResult<Question>> {
  let arr = QUESTIONS.filter((q) => (q.削除フラグ ?? 0) === 0);
  if (filters.問題ＩＤ) arr = arr.filter((q) => q.問題ＩＤ === filters.問題ＩＤ);
  if (filters.スキル)
    arr = arr.filter((q) => q.スキル.toLowerCase() === filters.スキル!.toLowerCase());
  if (filters.自動生成フラグ !== undefined)
    arr = arr.filter((q) => q.自動生成フラグ === filters.自動生成フラグ);
  if (filters.難易度_FROM !== undefined) arr = arr.filter((q) => q.難易度 >= filters.難易度_FROM!);
  if (filters.難易度_TO !== undefined) arr = arr.filter((q) => q.難易度 <= filters.難易度_TO!);
  if (filters.キーワード) {
    const kw = filters.キーワード.toLowerCase();
    arr = arr.filter((q) => q.問題文章.toLowerCase().includes(kw));
  }
  const start = (page - 1) * pageSize;
  const items = arr.slice(start, start + pageSize);
  return delay({ items, total: arr.length });
}
export async function getQuestion(id: string): Promise<Question | undefined> {
  return delay(QUESTIONS.find((q) => q.問題ＩＤ === id));
}
export async function saveQuestion(q: Question): Promise<Question> {
  const idx = QUESTIONS.findIndex((x) => x.問題ＩＤ === q.問題ＩＤ);
  if (idx >= 0) QUESTIONS[idx] = JSON.parse(JSON.stringify(q));
  else QUESTIONS.unshift(JSON.parse(JSON.stringify(q)));
  return delay(q, 1200);
}
export async function deleteQuestion(id: string): Promise<void> {
  const idx = QUESTIONS.findIndex((x) => x.問題ＩＤ === id);
  if (idx >= 0) QUESTIONS[idx].削除フラグ = 1;
  return delay(undefined as any, 800);
}
export async function aiGenerateQuestion(seed?: Partial<Question>): Promise<Question> {
  const skill = seed?.スキル || 'General';
  const randId = () =>
    globalThis.crypto && 'randomUUID' in globalThis.crypto
      ? (globalThis.crypto as any).randomUUID()
      : Math.random().toString(36).slice(2);
  const qid = randId();
  const choices = [0, 1, 2, 3].map((i) => ({
    選択肢ＩＤ: randId() as any,
    選択肢文章: `${skill} の自動生成選択肢 ${i + 1}`,
    回答理由: `${skill} に関する自動生成の理由 ${i + 1}`,
  }));
  const result: Question = {
    問題ＩＤ: qid as any,
    問題文章: seed?.問題文章 || `${skill} に関する自動生成問題`,
    難易度: seed?.難易度 || 5,
    スキル: skill,
    模範回答: choices[0].選択肢ＩＤ as any,
    模範回答理由: 'AI生成により自動選定されたため。',
    自動生成フラグ: 1,
    選択肢: choices as any,
    削除フラグ: 0,
  };
  return delay(result, 1200);
}

const SAMPLE_EXAM: ExamSession = {
  試験ＩＤ: 'f8f1a8e0-3b24-4c3a-9b7d-9f7f1a9b2c10',
  参加者氏名: '田中 一郎',
  参加者人材ＩＤ: '3a6e9f20-6c4a-45c3-9a2e-0a3c1b2d4e56',
  試験ステータス: 3,
  試験リンクＩＤ: 'EX-7M2H-20251022',
  試験用紙: {
    試験用紙ＩＤ: 'b2d3c4e5-6f70-48a1-9b2c-3d4e5f6a7b80',
    試験用紙名称: '社内フルスタック基礎確認テスト（UUID版）',
    説明: '社内アプリ開発に必要な基礎知識（Java/Spring、フロント、DB、CI/CD、セキュリティ等）の理解度を確認します。制限時間60分、全問単一選択。',
    作成日時: '2025-10-22T22:30:00+09:00',
    問題リスト: [
      {
        試験用紙問題ＩＤ: 'd4e5f6a7-8192-4ab3-9cdd-5a6b7c8d9e15',
        試験用紙ＩＤ: 'b2d3c4e5-6f70-48a1-9b2c-3d4e5f6a7b80',
        問題文章: 'RDBで正規化の主目的として最も適切なのはどれか？',
        難易度: 3,
        スキル: 'Database',
        選択肢: [
          {
            選択肢ＩＤ: '86777879-7a7b-4abd-9e75-d5e6f708192a',
            選択肢文章: '冗長性を下げ更新異常を防ぐ',
            回答理由: '正しい。',
          },
          {
            選択肢ＩＤ: '87797a7b-7c7d-4bce-9f85-e6f708192a3b',
            選択肢文章: '必ず性能を最大化する',
            回答理由: '誤り。性能とはトレードオフもある。',
          },
          {
            選択肢ＩＤ: '887a7b7c-7d7e-4cdf-9095-f708192a3b4c',
            選択肢文章: 'バックアップを不要にする',
            回答理由: '誤り。',
          },
          {
            選択肢ＩＤ: '897b7c7d-7e7f-4de0-91a5-08192a3b4c5d',
            選択肢文章: '全文検索を自動で有効にする',
            回答理由: '誤り。',
          },
        ],
      },
      {
        試験用紙問題ＩＤ: 'e5f6a7b8-92a3-4bc4-9dee-6b7c8d9e0f16',
        試験用紙ＩＤ: 'b2d3c4e5-6f70-48a1-9b2c-3d4e5f6a7b80',
        問題文章: 'SPAでAPIエラーをUIに通知する一般的な方法はどれか？',
        難易度: 3,
        スキル: 'Frontend',
        選択肢: [
          {
            選択肢ＩＤ: '8a7b7c7d-7e7f-4ef1-9237-192a3b4c5d6e',
            選択肢文章: 'console.logのみに出力する',
            回答理由: 'ユーザーに伝わらない。',
          },
          {
            選択肢ＩＤ: '8b7c7d7e-7f70-4f02-9347-2a3b4c5d6e7f',
            選択肢文章: 'スナックバー/トーストで通知する',
            回答理由: '正しい。',
          },
          {
            選択肢ＩＤ: '8c7d7e7f-7071-4013-9457-3b4c5d6e7f80',
            選択肢文章: 'ページを強制リロードする',
            回答理由: 'UXが悪い。',
          },
          {
            選択肢ＩＤ: '8d7e7f70-7172-4124-9567-4c5d6e7f8091',
            選択肢文章: '何もしない',
            回答理由: '誤り。',
          },
        ],
      },
    ],
  },
};

export async function fetchExamByLinkId(examLinkId: string): Promise<ExamSession | null> {
  // 疑似バックエンド呼び出し
  await delay(300);
  if (examLinkId === SAMPLE_EXAM.試験リンクＩＤ) {
    // ディープコピーで副作用防止
    return JSON.parse(JSON.stringify(SAMPLE_EXAM));
  }
  return null;
}

export function buildSubmissionPayload(
  exam: ExamSession,
  answers: Record<string, string>
): ExamSubmissionPayload {
  const list = exam.試験用紙.問題リスト.map((p) => {
    return {
      試験用紙問題ＩＤ: p.試験用紙問題ＩＤ,
      回答試験用紙選択肢ＩＤ: answers[p.試験用紙問題ＩＤ] || '',
    };
  });
  return {
    試験ＩＤ: exam.試験ＩＤ,
    試験問題解答: list,
  };
}

export async function submitExamAnswers(payload: ExamSubmissionPayload): Promise<void> {
  console.log('submitExamAnswers payload', payload);
  await delay(500);
  // デモのため常に成功
  return;
}
