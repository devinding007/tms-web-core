import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import PersonnelEditor from '@/modules/personnel/PersonnelEditor.vue';

describe('PersonnelEditor', () => {
  it('初期表示でダイアログが開いてもコンポーネントが存在する', async () => {
    const wrapper = mount(PersonnelEditor, {
      props: {
        open: true,
        item: {
          人材ＩＤ: 'id1',
          所属会社: 'A',
          名前: 'B',
          社員番号: 'C',
          生年月日: '20200101',
          現案件終了年月日: '20250101',
          BPフラグ: 0,
        },
      },
    });
    expect(wrapper.exists()).toBeTruthy();
  });
});
