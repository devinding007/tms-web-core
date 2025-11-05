import * as XLSX from 'xlsx';

import {
  ResumeData,
  ResumeSkill,
  ResumeEducation,
  ResumeExperience,
  ResumeLanguage,
} from '@/types/models/Resume';

// Stub parser: reads the first sheet and tries to detect a record-like row.
// Replace with your own mapping logic.
export async function parseResumeFromExcel(file: File): Promise<ResumeData> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  if (sheet) {
    try {
      const rows = XLSX.utils.sheet_to_json(sheet, {
        raw: false,
        header: 'A',
        dateNF: 'yyyy-mm-dd',
        blankrows: true,
        defval: null,
      }) as any[];
      return readExcel(rows);
    } catch (e) {
      throw e;
    }
  }
  return {};
}

function readExcel(rows: any[]) {
  // 個人基本情報
  const res: ResumeData = {
    氏名: rows[4]['E'],
    出生年月: rows[4]['Q'],
    国籍: rows[4]['AB'],
    来日年月: rows[4]['AF'],
    最寄駅: rows[5]['E'],
    アピールポイント: rows[34]['F'],
    言語: [],
    学歴: [],
    スキル: [],
    資格: [],
    業務歴: [],
  };
  // 学歴
  for (let i = 7; i <= 9; i++) {
    if (rows[i]['B']) {
      const eduData: ResumeEducation = {
        開始年月: rows[i]['B'],
        終了年月: rows[i]['G'],
        学校: rows[i]['K'],
        専門: rows[i]['Y'],
        学位: rows[i]['AI'],
      };
      res.学歴!.push(eduData);
    }
  }
  // 資格・免許
  for (let i = 11; i <= 15; i++) {
    if (rows[i]['E']) {
      res.資格?.push(rows[i]['E']);
    }
  }
  // 語学能力
  const langType = ['Z', 'AD', 'AH', 'AL'];
  langType.forEach((type) => {
    let lang: ResumeLanguage = {
      言語名: rows[11][type],
      読み: rows[12][type],
      書き: rows[13][type],
      会話: rows[14][type],
    };
    if (lang && lang.言語名 && lang.会話 && lang.読み && lang.書き) {
      res.言語?.push(lang);
    }
  });

  // スキル
  for (let i = 17; i <= 31; i++) {
    let skillData: ResumeSkill = {
      スキル名: rows[i]['A'],
      レベル: rows[i]['G'],
    };
    if (skillData.レベル && skillData.スキル名) {
      res.スキル?.push(skillData);
    }

    skillData = {
      スキル名: rows[i]['I'],
      レベル: rows[i]['O'],
    };
    if (skillData.レベル && skillData.スキル名) {
      res.スキル?.push(skillData);
    }

    skillData = {
      スキル名: rows[i]['Q'],
      レベル: rows[i]['W'],
    };
    if (skillData.レベル && skillData.スキル名) {
      res.スキル?.push(skillData);
    }

    skillData = {
      スキル名: rows[i]['Y'],
      レベル: rows[i]['AF'],
    };
    if (skillData.レベル && skillData.スキル名) {
      res.スキル?.push(skillData);
    }

    skillData = {
      スキル名: rows[i]['AH'],
      レベル: rows[i]['AO'],
    };
    if (skillData.レベル && skillData.スキル名) {
      res.スキル?.push(skillData);
    }
  }
  // 業務経歴（スタートライン：40行目）
  const sl = 39;
  for (let i = 0; i <= 30; i++) {
    if (sl + i * 3 + 2 >= rows.length) break;

    let exp: ResumeExperience = {
      期間開始: rows[sl + i * 3]['B'],
      期間終了: rows[sl + i * 3 + 2]['B'],
      役割: rows[sl + i * 3]['AO'],
      チーム規模: rows[sl + i * 3]['T'],
      利用技術: [],
      担当業務詳細: rows[sl + i * 3]['H'],
    };
    if (!exp || !exp.担当業務詳細) break;
    console.log(exp);
    console.log(rows[sl + i * 3]['X']);
    console.log(rows[sl + i * 3]['AB']);
    if (rows[sl + i * 3]['X']) {
      exp.利用技術?.push(...rows[sl + i * 3]['X'].split('\n'));
    }
    if (rows[sl + i * 3]['AB']) {
      exp.利用技術?.push(...rows[sl + i * 3]['AB'].split('\n'));
    }
    res.業務歴?.push(exp);
    console.log(res);
  }

  res.スキル?.sort((s1, s2) => {
    if (!s1.レベル || !s2.レベル) return 0;
    if (s1.レベル == s2.レベル) return 0;
    else if (s1.レベル < s2.レベル) return -1;
    else if (s1.レベル > s2.レベル) return 1;
    else return 0;
  });

  return res;
}
