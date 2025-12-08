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
            :items-per-page="-1"
            hide-default-footer
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
                  color="secondary"
                  prepend-icon="mdi-school"
                  @click.stop="onOpenSkill(item.人材ＩＤ)">
                  スキル
                </v-btn>
                <v-btn
                  size="small"
                  color="secondary"
                  prepend-icon="mdi-school"
                  @click.stop="onOpenResume(item.人材ＩＤ)">
                  経歴
                </v-btn>
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
        <!-- ローディング中 -->
        <template v-if="analyzing">
          <v-skeleton-loader type="table" />
        </template>

        <!-- まだ結果がない場合 -->
        <template v-else-if="analysisResults.length === 0">
          <div class="text-body-2 text-medium-emphasis">
            分析結果はまだありません。「適任要員分析」ボタンを押して分析を実行してください。
          </div>
        </template>

        <!-- 結果がある場合 -->
        <template v-else>
          <!-- 説明＋AIバッジ -->
          <div class="d-flex align-center justify-space-between mb-3">
            <div>
              <div class="text-subtitle-2 font-weight-medium">適任要員分析結果</div>
              <div class="text-caption text-medium-emphasis">
                募集要項と候補要員のスキル・経歴をもとに、マッチ度の高い順に表示しています。
              </div>
            </div>
          </div>

          <!-- 凡例（任意） -->
          <div class="d-flex flex-wrap ga-2 text-caption text-medium-emphasis mb-2">
            <div class="d-flex align-center ga-1">
              <v-chip size="x-small" color="success" variant="flat" class="px-2"
                >マッチ率 >= 80%</v-chip
              >
              即戦力候補
            </div>
            <div class="d-flex align-center ga-1">
              <v-chip size="x-small" color="primary" variant="flat" class="px-2"
                >80% > マッチ率 >= 60%</v-chip
              >
              強候補
            </div>
            <div class="d-flex align-center ga-1">
              <v-chip size="x-small" color="warning" variant="flat" class="px-2"
                >60% > マッチ率 >= 40%</v-chip
              >
              要検討
            </div>
            <div class="d-flex align-center ga-1">
              <v-chip size="x-small" color="error" variant="flat" class="px-2"
                >40% > マッチ率</v-chip
              >
              アンマッチ
            </div>
          </div>

          <v-divider class="mb-2" />

          <!-- ランキング本体：v-list ベース -->
          <v-list density="comfortable" lines="two" class="py-0">
            <template v-for="(item, index) in rankedResults" :key="item.人材ID">
              <v-list-item>
                <!-- 左側：順位バッジ -->
                <template #prepend>
                  <v-avatar :color="scoreChipColor(item.マッチ率)" size="40" class="elevation-2">
                    <span class="text-body-1 font-weight-bold">
                      {{ item.rank }}
                    </span>
                  </v-avatar>
                </template>

                <!-- タイトル：名前 -->
                <template #title>
                  <div class="d-flex align-center ga-2">
                    <span>{{ item.名前 }}</span>
                  </div>
                  <div class="d-flex flex-column ga-1">
                    <div class="d-flex align-center ga-2">
                      <span class="text-caption text-medium-emphasis">マッチ率</span>
                      <v-chip
                        size="small"
                        :color="scoreChipColor(item.マッチ率)"
                        variant="flat"
                        class="px-3">
                        {{ item.マッチ率 }}%
                      </v-chip>
                      <v-spacer />
                      <span
                        v-if="item.スキル採点 && item.スキル採点.length > 0"
                        class="text-caption text-medium-emphasis"
                        >マッチスキル</span
                      >
                      <v-chip
                        v-for="q in item.スキル採点"
                        :key="q.スキル名"
                        class="ma-1"
                        size="small"
                        variant="tonal"
                        color="primary"
                        >{{ q.スキル名 }}: {{ q.スキル点数 }}</v-chip
                      >
                    </div>
                    <v-progress-linear
                      :model-value="item.マッチ率"
                      height="6"
                      rounded
                      :color="scoreBarColor(item.マッチ率)" />
                  </div>
                </template>

                <!-- サブタイトル：マッチ率＋バー＋コメント -->
                <template #subtitle>
                  <div class="d-flex flex-column ga-1">
                    <div class="text-body-2 mt-1">
                      {{ item.コメント }}
                    </div>
                  </div>
                </template>
              </v-list-item>

              <!-- 行の区切り線 -->
              <v-divider v-if="index < rankedResults.length - 1" inset />
            </template>
          </v-list>

          <div class="text-caption text-medium-emphasis text-right mt-2">
            ※ コメントはAIが自動生成したサマリを元にしています。
          </div>
        </template>
      </v-card-text>
    </v-card>

    <!-- モーダルなど -->
    <PersonnelMultiSelectModal v-model:open="selectModalOpen" @selected="onSelectedCandidates" />
    <SkillEditorModal mode="view" v-model:open="skillModalOpen" :personnel-id="skillTargetId" />
    <ResumeDetailModal
      mode="view"
      v-model:open="resumeModalOpen"
      :personnel-id="resumeDataTargetId" />
    <ErrorDialog v-model:open="errorOpen" :message="errorMessage" />

    <v-overlay :model-value="analyzing || saving" class="align-center justify-center" persistent>
      <v-progress-circular indeterminate size="64" />
    </v-overlay>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import PersonnelMultiSelectModal from '@/modules/personnel/PersonnelMultiSelectModal.vue';
  import SkillEditorModal from '@/modules/skill/SkillEditorModal.vue';
  import ResumeDetailModal from '@/modules/resume/ResumeDetailModal.vue';
  import ErrorDialog from '@/components/common/ErrorDialog.vue';
  import type { Personnel } from '@/types/models/Personnel';
  import { useToast } from '@/plugins/toast';
  import type { Proposal, ProposalAnalyseResult, CandidateAnalysis } from '@/types/models/Proposal';
  import { ResumeDataStoreRepo, SkillStoreRepo, ProposalStoreRepo } from '@/data/RepoStoreImp';
  import cloneDeep from 'lodash.clonedeep';
  import { http } from '@/plugins/axios';
  import { uuid, delay } from '@/composables/useApi';

  const toast = useToast();

  const props = defineProps<{
    proposalId?: string | null;
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
  // スキルモーダル画面関連
  const skillModalOpen = ref(false);
  const skillTargetId = ref('');
  // 経歴モーダル画面関連
  const resumeModalOpen = ref(false);
  const resumeDataTargetId = ref('');

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
    // { title: '人材ID', key: '人材ID' },
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
    return true;
    // return (
    //   proposalName.value.trim().length > 0 &&
    //   jobDescription.value.trim().length > 0 &&
    //   hasChanges.value
    // );
  });

  function load() {
    if (!props.proposalId) return;
    const p = new ProposalStoreRepo().findById(props.proposalId);
    console.log('opening... ' + p);

    if (!p) return;
    proposalName.value = p.提案名;
    jobDescription.value = p.募集要項;
    candidates.value = p.対象人材;
    if (p.分析結果) analysisResults.value = p.分析結果;
  }

  // props.proposal 変更時にフォームへ反映
  watch(
    () => props.proposalId,
    (newId) => {
      if (newId) {
        const p = new ProposalStoreRepo().findById(newId);
        if (p) {
          proposalId.value = p.提案ID;
          proposalName.value = p.提案名;
          jobDescription.value = p.募集要項;
          candidates.value = p.対象人材;
          if (p.分析結果) analysisResults.value = p.分析結果;
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
            対象人材: [],
          };
        }
        candidates.value = [];
        analysisResults.value = [];
      }
    },
    { immediate: true }
  );

  function generateUuid(): string {
    return uuid();
    // return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    //   const r = (Math.random() * 16) | 0;
    //   const v = c === 'x' ? r : (r & 0x3) | 0x8;
    //   return v.toString(16);
    // });
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
      const resumeRepo = new ResumeDataStoreRepo();
      const skillRepo = new SkillStoreRepo();
      const req: any[] = [];
      const nameMap = new Map<string, string>();
      candidates.value.forEach((p) => {
        const resume = cloneDeep(resumeRepo.findById(p.人材ＩＤ));
        nameMap.set(p.人材ＩＤ, p.名前);
        delete resume?.AI分析結果;
        const skill = skillRepo.findById(p.人材ＩＤ);
        req.push({
          id: p.人材ＩＤ,
          経歴情報: resume,
          スキル採点情報: skill,
        });
      });

      const { data } = await http.post<ProposalAnalyseResult[]>('/api/proposal/analyse', {
        募集要項: jobDescription.value,
        候補要員: req,
      });
      await delay(undefined, 1000);

      const results: CandidateAnalysis[] = [];
      data.forEach((res) => {
        results.push({
          人材ID: res.人材ＩＤ,
          名前: nameMap.get(res.人材ＩＤ) ?? '',
          マッチ率: res.マッチ率,
          コメント: res.理由,
          スキル採点: res.スキル採点,
        });
      });

      results.sort((a, b) => b.マッチ率 - a.マッチ率);
      analysisResults.value = results;
      toast.show('適任要員の分析が完了しました', 'success');
    } catch (e) {
      errorMessage.value = '適任要員の分析に失敗しました';
      errorOpen.value = true;
    } finally {
      analyzing.value = false;
    }
  }

  function onOpenSkill(id: string) {
    skillTargetId.value = id;
    skillModalOpen.value = true;
  }

  function onOpenResume(id: string) {
    resumeDataTargetId.value = id;
    resumeModalOpen.value = true;
  }

  function onSave() {
    if (!canSave.value) return;
    const payload: Proposal = {
      提案ID: proposalId.value,
      提案名: proposalName.value.trim(),
      募集要項: jobDescription.value.trim(),
      対象人材: candidates.value,
      分析結果: analysisResults.value,
    };
    emit('save', payload);
    // 画面を閉じずに連続編集するケースに備えて、自分の中の "基準" も更新しておく
    originalProposal.value = { ...payload };
  }

  function scoreChipColor(score: number) {
    if (score >= 80) return 'success';
    if (score >= 60) return 'primary';
    if (score >= 40) return 'warning';
    return 'error';
  }

  function scoreBarColor(score: number) {
    // チップと同じ判定でOK
    return scoreChipColor(score);
  }

  // load, canSave と onSave を親から使えるようにする
  defineExpose({
    canSave,
    onSave,
    load,
  });
</script>
