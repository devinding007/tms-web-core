<template>
  <div class="d-flex flex-column ga-4">
    <!-- 募集要項（提案ヘッダ＋自由入力） -->
    <v-card>
      <v-card-title class="d-flex align-center ga-2">
        <v-icon>mdi-account-search</v-icon>
        要員提案
      </v-card-title>
      <v-card-text>
        <div class="d-flex flex-column flex-md-row ga-4 mb-4">
          <v-text-field
            v-model="proposalId"
            label="提案ID"
            density="comfortable"
            variant="outlined"
            disabled />
          <v-text-field v-model="proposalName" label="提案名" density="comfortable" clearable />
        </div>
        <v-textarea
          v-model="jobDescription"
          label="募集要項（自由入力）"
          density="comfortable"
          rows="6"
          auto-grow
          hint="案件概要・求めるスキル・条件・期間などを自由に記載してください"
          persistent-hint />
      </v-card-text>
    </v-card>

    <!-- 候補要員 -->
    <v-card>
      <v-card-title class="d-flex align-center ga-2">
        <v-icon>mdi-account-multiple</v-icon>
        候補要員
        <v-spacer />
        <v-btn color="secondary" prepend-icon="mdi-account-multiple-plus" @click="openSelectModal">
          人材選択
        </v-btn>
      </v-card-title>
      <v-card-text>
        <div v-if="candidates.length === 0" class="text-body-2 text-medium-emphasis">
          候補要員が選択されていません。「人材選択」ボタンから追加してください。
        </div>
        <div v-else>
          <v-data-table
            :headers="candidateHeaders"
            :items="candidates"
            item-key="人材ＩＤ"
            class="elevation-1 rounded-lg">
            <template #item.BPフラグ="{ item }">
              <v-chip size="small" :color="item.BPフラグ === 0 ? 'primary' : 'secondary'">
                {{ item.BPフラグ === 0 ? '社員' : 'BP' }}
              </v-chip>
            </template>
            <template #item.actions="{ item }">
              <div class="d-flex ga-2">
                <v-btn
                  size="small"
                  color="error"
                  prepend-icon="mdi-delete"
                  @click.stop="removeCandidate(item.人材ＩＤ)">
                  削除
                </v-btn>
              </div>
            </template>
          </v-data-table>
        </div>
      </v-card-text>
    </v-card>

    <!-- 適任要員分析結果 -->
    <v-card>
      <v-card-title class="d-flex align-center ga-2">
        <v-icon>mdi-robot</v-icon>
        適任要員分析結果
        <v-spacer />
        <v-btn
          color="primary"
          prepend-icon="mdi-robot"
          :disabled="!canAnalyze || analyzing"
          :loading="analyzing"
          @click="onAnalyze">
          適任要員分析
        </v-btn>
      </v-card-title>
      <v-card-text>
        <template v-if="analyzing">
          <v-skeleton-loader type="table" />
        </template>
        <template v-else-if="analysisResults.length === 0">
          <div class="text-body-2 text-medium-emphasis">
            分析結果はまだありません。「適任要員分析」ボタンを押して分析を実行してください。
          </div>
        </template>
        <template v-else>
          <v-data-table
            :headers="analysisHeaders"
            :items="rankedResults"
            item-key="人材ID"
            class="elevation-1 rounded-lg">
            <template #item.rank="{ item }">
              <span>{{ item.rank }}</span>
            </template>
            <template #item.マッチ率="{ item }">
              <span>{{ item.マッチ率 }}%</span>
            </template>
          </v-data-table>
        </template>
      </v-card-text>
    </v-card>

    <!-- モーダルなど -->
    <PersonnelMultiSelectModal v-model:open="selectModalOpen" @selected="onSelectedCandidates" />
    <ErrorDialog v-model:open="errorOpen" :message="errorMessage" />

    <v-overlay :model-value="analyzing || saving" class="align-center justify-center" persistent>
      <v-progress-circular indeterminate size="64" />
    </v-overlay>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import PersonnelMultiSelectModal from '@/modules/personnel/PersonnelMultiSelectModal.vue';
  import ErrorDialog from '@/components/common/ErrorDialog.vue';
  import type { Personnel } from '@/types/models/Personnel';
  import type { CandidateAnalysis } from '@/composables/useApi';
  import { useToast } from '@/plugins/toast';
  import type { Proposal } from '@/types/models/Proposal';

  const toast = useToast();

  const props = defineProps<{
    proposal?: Proposal | null;
    saving?: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'save', v: Proposal): void;
  }>();

  // 提案ヘッダ
  const proposalId = ref('');
  const proposalName = ref('');
  const jobDescription = ref('');
  const originalProposal = ref<Proposal | null>(null);

  // 候補要員・分析結果
  const candidates = ref<Personnel[]>([]);
  const analysisResults = ref<CandidateAnalysis[]>([]);

  const selectModalOpen = ref(false);
  const analyzing = ref(false);
  const errorOpen = ref(false);
  const errorMessage = ref('');

  // 親から渡される保存中フラグ
  const saving = computed(() => props.saving ?? false);

  const candidateHeaders = [
    { title: '所属会社', key: '所属会社' },
    { title: '名前', key: '名前' },
    { title: '社員番号', key: '社員番号' },
    { title: '生年月日', key: '生年月日' },
    { title: '現案件終了年月日', key: '現案件終了年月日' },
    { title: 'BP', key: 'BPフラグ', width: 100 },
    { title: '操作', key: 'actions', sortable: false, width: 120 },
  ];

  const analysisHeaders = [
    { title: '順位', key: 'rank', sortable: false, width: 80 },
    { title: '人材ID', key: '人材ID' },
    { title: '名前', key: '名前' },
    { title: 'マッチ率', key: 'マッチ率', width: 120 },
    { title: 'コメント', key: 'コメント', sortable: false },
  ];

  const rankedResults = computed(() =>
    analysisResults.value.map((r, idx) => ({
      ...r,
      rank: idx + 1,
    }))
  );

  // 分析ボタン活性条件：募集要項テキスト + 候補要員1名以上
  const canAnalyze = computed(() => {
    return jobDescription.value.trim().length > 0 && candidates.value.length > 0;
  });

  // 保存ボタン活性条件：必須項目入力 + 内容変更あり
  const hasChanges = computed(() => {
    if (!originalProposal.value) return true;
    return (
      originalProposal.value.提案ID !== proposalId.value ||
      originalProposal.value.提案名 !== proposalName.value ||
      originalProposal.value.募集要項 !== jobDescription.value
    );
  });

  const canSave = computed(() => {
    return (
      proposalName.value.trim().length > 0 &&
      jobDescription.value.trim().length > 0 &&
      hasChanges.value
    );
  });

  // props.proposal 変更時にフォームへ反映
  watch(
    () => props.proposal,
    (p) => {
      if (p) {
        proposalId.value = p.提案ID;
        proposalName.value = p.提案名;
        jobDescription.value = p.募集要項;
        originalProposal.value = { ...p };
      } else {
        const id = generateUuid();
        proposalId.value = id;
        proposalName.value = '';
        jobDescription.value = '';
        originalProposal.value = {
          提案ID: id,
          提案名: '',
          募集要項: '',
        };
      }
      candidates.value = [];
      analysisResults.value = [];
    },
    { immediate: true }
  );

  function generateUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  function openSelectModal() {
    selectModalOpen.value = true;
  }

  function onSelectedCandidates(selected: Personnel[]) {
    const existingIds = new Set(candidates.value.map((c) => c.人材ＩＤ));
    const merged = [...candidates.value];
    for (const p of selected) {
      if (!existingIds.has(p.人材ＩＤ)) {
        merged.push(p);
        existingIds.add(p.人材ＩＤ);
      }
    }
    candidates.value = merged;
  }

  function removeCandidate(id: string) {
    candidates.value = candidates.value.filter((c) => c.人材ＩＤ !== id);
  }

  async function onAnalyze() {
    if (!canAnalyze.value) {
      toast.show('募集要項と候補要員を入力してください', 'info');
      return;
    }
    try {
      analyzing.value = true;

      const baseScore = 85;
      const step = 7;

      const normalized = jobDescription.value.replace(/\s+/g, ' ').trim();
      const preview = normalized.slice(0, 60) || '募集要項の記載内容';

      const results: CandidateAnalysis[] = candidates.value.map((p, index) => {
        const score = Math.max(60, baseScore - index * step);
        return {
          人材ID: p.人材ＩＤ,
          名前: p.名前,
          マッチ率: score,
          コメント:
            `募集要項（例:「${preview}…」）に対して、${p.名前}さんはこれまでの経験・スキルが近く、` +
            '早期に戦力化が期待できると想定されます。',
        };
      });

      results.sort((a, b) => b.マッチ率 - a.マッチ率);
      analysisResults.value = results;
      toast.show('（デモ）適任要員の分析結果を表示しました', 'success');
    } catch (e) {
      errorMessage.value = '適任要員の分析に失敗しました';
      errorOpen.value = true;
    } finally {
      analyzing.value = false;
    }
  }

  function onSave() {
    if (!canSave.value) return;
    const payload: Proposal = {
      提案ID: proposalId.value,
      提案名: proposalName.value.trim(),
      募集要項: jobDescription.value.trim(),
    };
    emit('save', payload);
    // 画面を閉じずに連続編集するケースに備えて、自分の中の "基準" も更新しておく
    originalProposal.value = { ...payload };
  }

  // canSave と onSave を親から使えるようにする
  defineExpose({
    canSave,
    onSave,
  });
</script>
