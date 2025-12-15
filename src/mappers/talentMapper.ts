import type { Personnel } from '@/types/models/Personnel';



// ---- TalentDTO（バックエンドから返却されるデータ構造）----
type TalentDTO = {
  talentId: string;
  company: string;
  name: string;
  employeeNumber: string;
  birthDate: string | null;
  projectEndDate: string | null;
  bpFlag: boolean;
  deletedFlag: boolean;
};

// ---- TalentDTO → Personnel（フロント側の表示用構造）へ変換 ----
export function toPersonnel(t: TalentDTO): Personnel {
  return {
    人材ＩＤ: t.talentId,
    所属会社: t.company,
    名前: t.name,
    社員番号: t.employeeNumber,
    生年月日: t.birthDate ?? '',
    現案件終了年月日: t.projectEndDate ?? '',
    BPフラグ: t.bpFlag ? 1 : 0,
  };
}

export function toTalentDTO(p: Omit<Personnel, '人材ＩＤ'>) {
  return {
    talentId: null, // 新规不用前端生成，让后端生成更规范
    company: p.所属会社,
    name: p.名前,
    employeeNumber: p.社員番号,
    birthDate: toIsoDate(p.生年月日),
    projectEndDate: toIsoDate(p.現案件終了年月日),
    bpFlag: p.BPフラグ === 1,
    deletedFlag: false,
  };
}

function toIsoDate(input: string): string | null {
  // 入力値が空または未定義の場合は null を返す
  if (!input) return null;

  // すでに ISO 形式（YYYY-MM-DD）の場合はそのまま返却
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return input;
  }

  // スラッシュ「/」や「年」「月」「日」などの区切り文字で分割し、数値部分のみを抽出
  const parts = input.split(/[/\-年月日]/).filter(Boolean);

  // 年・月・日の3要素が揃っている場合のみ処理
  if (parts.length === 3) {
    // 各要素を2桁にパディング（例: "1" → "01"）
    const [year, month, day] = parts.map(part => part.padStart(2, '0'));
    return `${year}-${month}-${day}`;
  }

  // 上記条件に該当しない場合は変換不能とみなし、null を返却
  console.warn('日付の変換に失敗しました。入力値:', input);
  return null;
}

