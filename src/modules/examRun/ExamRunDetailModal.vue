<template>
  <v-dialog v-model="model" max-width="1024" :scrim="true" close-on-esc close-on-back>
    <v-card class="fixed-dialog">
      <v-toolbar density="comfortable" color="primary" class="text-white">
        <v-toolbar-title>試験実施詳細（{{ titleByMode }}）</v-toolbar-title>
        <v-spacer /><v-btn icon @click="model = false"><v-icon>mdi-close</v-icon></v-btn>
      </v-toolbar>

      <template v-if="loading"
        ><v-card-text><v-skeleton-loader type="article" /></v-card-text
      ></template>

      <v-card-text v-else>
        <v-card variant="outlined">
          <v-card-title
            class="text-subtitle-1 d-flex align-center ga-2"
            @click="expandExamInfo = !expandExamInfo"
            ><v-icon>mdi-clipboard-text</v-icon> 試験基本情報
            <v-chip :color="examStatusColor">ステータス: {{ examStatusStr }}</v-chip>
          </v-card-title>
          <v-expand-transition>
            <v-card-text v-show="expandExamInfo">
              <v-row dense>
                <v-col cols="12" md="12"
                  ><v-text-field
                    label="試験ＩＤ"
                    :model-value="form.試験ＩＤ || '(新規採番)'"
                    disabled
                /></v-col>
              </v-row>
              <v-row>
                <v-col cols="12" md="6"
                  ><v-text-field
                    v-model="form.参加者氏名"
                    label="参加者氏名"
                    :disabled="!isEditableBase || form.登録済人材 === 1"
                /></v-col>
                <v-col cols="12" md="6" class="d-flex flex-row align-center ga-3">
                  <v-checkbox
                    v-model="form.登録済人材"
                    :true-value="1"
                    :false-value="0"
                    label="登録済人材"
                    :disabled="!isEditableBase">
                    <template #label>
                      <div class="d-flex flex-column">
                        <span>登録済人材</span>
                        <span class="text-caption text-medium-emphasis"
                          >登録済の場合は人材DBから選択する。<br />試験後スキル採点を人材DBに反映可能</span
                        >
                      </div>
                    </template>
                  </v-checkbox>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" md="6"
                  ><v-text-field
                    v-if="form.登録済人材 === 1"
                    :model-value="form.参加者人材ＩＤ || '-'"
                    label="参加者人材ＩＤ"
                    disabled
                /></v-col>

                <v-col cols="12" md="6"
                  ><v-btn
                    v-if="isEditableBase && form.登録済人材 === 1"
                    color="primary"
                    variant="tonal"
                    prepend-icon="mdi-account-search"
                    @click="personOpen = true"
                    >人材選択</v-btn
                  ></v-col
                >
              </v-row>
              <v-row>
                <!-- <v-tooltip text="コピーします"></v-tooltip>
              <v-alert type="info" variant="tonal"
                >試験用紙が未設定です。試験基本情報にてご設定ください。</v-alert
              > -->
              </v-row>
              <v-row>
                <v-col cols="12" md="6" class="d-flex ga-2 align-center"
                  ><v-text-field
                    :model-value="form.試験用紙?.試験用紙ＩＤ || '-'"
                    label="試験用紙ＩＤ"
                    disabled
                /></v-col>

                <v-col cols="12" md="6" class="d-flex ga-2 align-center"
                  ><v-btn
                    v-if="isEditableBase"
                    color="primary"
                    variant="tonal"
                    prepend-icon="mdi-file-find"
                    @click="paperOpen = true"
                    >試験用紙選択</v-btn
                  ></v-col
                >
                <v-col cols="12" md="6" class="d-flex ga-2 align-center">
                  <v-btn
                    v-if="isEditableBase"
                    color="primary"
                    prepend-icon="mdi-check-decagram"
                    @click="onConfirmBase"
                    >試験確定</v-btn
                  >
                  <v-btn
                    v-if="form.試験リンクＩＤ"
                    variant="tonal"
                    prepend-icon="mdi-qrcode"
                    @click="onQr"
                    >試験QRコード生成</v-btn
                  >
                </v-col>
              </v-row>
            </v-card-text>
          </v-expand-transition>
        </v-card>

        <!-- 試験参加情報 -->
        <v-card v-if="showExamLinkInfo" variant="outlined" class="mt-4">
          <v-card-title
            class="text-subtitle-1 d-flex align-center ga-2"
            @click="expandExamLinkInfo = !expandExamLinkInfo"
            ><v-icon>mdi-clipboard-text</v-icon> 試験参加情報
          </v-card-title>

          <v-expand-transition>
            <v-card-text v-show="expandExamLinkInfo" style="max-height: none">
              <v-row dense>
                <v-col cols="12" md="4"
                  ><v-text-field
                    :model-value="form.試験リンクＩＤ || '-'"
                    label="試験リンクＩＤ"
                    disabled
                /></v-col>
                <v-col cols="12" md="8" class="d-flex justify-center">
                  <a :href="examUrlLink">{{ examUrlLink }}</a>
                  <v-img v-if="qrBase64" :src="qrBase64" max-width="50"
                /></v-col>
              </v-row>
            </v-card-text>
          </v-expand-transition>
        </v-card>

        <!-- 試験用紙 -->
        <v-card variant="outlined" class="mt-4">
          <v-card-title
            class="text-subtitle-1 d-flex align-center ga-2"
            @click="expandExamPaper = !expandExamPaper"
            ><v-icon>mdi-file-document-multiple</v-icon> 試験用紙</v-card-title
          >
          <v-expand-transition>
            <v-card-text v-show="expandExamPaper" style="max-height: none">
              <template v-if="!form.試験用紙"
                ><v-alert type="info" variant="tonal"
                  >試験用紙が未設定です。試験基本情報にてご設定ください。</v-alert
                ></template
              >
              <template v-else>
                <div class="d-flex flex-column overflow-visible ga-3">
                  <div
                    v-for="(p, idx) in form.試験用紙.問題リスト"
                    :key="p.試験用紙問題ＩＤ"
                    class="pa-3 rounded-lg"
                    style="border: 1px dashed #e0e0e0">
                    <div class="d-flex align-start ga-2">
                      <div class="text-medium-emphasis">Q{{ idx + 1 }}.</div>
                      <div class="flex-1">
                        <div class="d-flex align-center flex-wrap ga-2 mb-1">
                          <v-chip
                            size="small"
                            color="primary"
                            variant="tonal"
                            prepend-icon="mdi-tag"
                            >{{ p.スキル }}</v-chip
                          >
                          <v-chip
                            size="small"
                            color="secondary"
                            variant="tonal"
                            prepend-icon="mdi-stairs"
                            >難易度 {{ p.難易度 }}</v-chip
                          >
                        </div>
                        <div class="text-subtitle-2">{{ p.問題文章 }}</div>
                        <v-list density="compact" lines="two" class="mt-1">
                          <template v-if="isResultVisible">
                            <template v-if="isCorrect(p)">
                              <v-list-item
                                v-for="c in p.選択肢"
                                v-show="c.選択肢ＩＤ === p.模範回答"
                                :key="c.選択肢ＩＤ"
                                :title="c.選択肢文章"
                                :subtitle="c.回答理由">
                                <template #prepend
                                  ><v-icon color="success">mdi-check-circle</v-icon></template
                                >
                              </v-list-item>
                            </template>
                            <template v-else>
                              <template v-for="c in p.選択肢">
                                <v-list-item
                                  v-if="
                                    c.選択肢ＩＤ === userAnswerOf(p.試験用紙問題ＩＤ) ||
                                    c.選択肢ＩＤ === p.模範回答
                                  "
                                  :key="c.選択肢ＩＤ"
                                  :title="c.選択肢文章"
                                  :subtitle="c.回答理由">
                                  <template #prepend>
                                    <v-icon v-if="c.選択肢ＩＤ === p.模範回答" color="success"
                                      >mdi-check-circle</v-icon
                                    >
                                    <v-icon v-else color="error">mdi-close-circle</v-icon>
                                  </template>
                                </v-list-item>
                              </template>
                            </template>
                          </template>
                          <template v-else>
                            <v-list-item
                              v-for="c in p.選択肢"
                              :key="c.選択肢ＩＤ"
                              :title="c.選択肢文章"
                              :subtitle="c.回答理由">
                              <template #prepend>
                                <v-icon v-if="c.選択肢ＩＤ === p.模範回答" color="success"
                                  >mdi-check-circle</v-icon
                                >
                                <v-icon v-else class="text-disabled"
                                  >mdi-checkbox-blank-circle-outline</v-icon
                                >
                              </template>
                            </v-list-item>
                          </template>
                        </v-list>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-if="isResultVisible" class="mt-4">
                  <v-divider class="mb-3" />
                  <div class="text-subtitle-1 mb-2 d-flex align-center ga-2">
                    <v-icon>mdi-chart-bar</v-icon> 試験結果集計
                  </div>
                  <v-data-table
                    :headers="sumHeaders"
                    :items="summaryRows"
                    class="rounded-lg"
                    :items-per-page="999"
                    ><template #bottom
                  /></v-data-table>
                </div>
              </template>
            </v-card-text>
          </v-expand-transition>
        </v-card>

        <!-- 試験結果 -->
        <v-card v-if="showExamResult" variant="outlined" class="mt-4">
          <v-card-title class="text-subtitle-1 d-flex align-center ga-2"
            ><v-icon>mdi-clipboard-text</v-icon> 試験実施結果
          </v-card-title>
          <v-card-text> </v-card-text>
        </v-card>
      </v-card-text>

      <v-card-actions v-if="!isView">
        <v-spacer />
        <v-btn variant="text" @click="model = false">キャンセル</v-btn>
        <v-btn
          v-if="canGenerateLink"
          color="secondary"
          prepend-icon="mdi-link-variant"
          :loading="linkLoading"
          @click="onGenerateLink"
          >試験リンク生成</v-btn
        >
        <v-btn color="primary" prepend-icon="mdi-content-save" :loading="saving" @click="onSaveBase"
          >試験準備保存</v-btn
        >
      </v-card-actions>

      <v-overlay :model-value="saving || linkLoading" persistent />
    </v-card>
  </v-dialog>

  <PersonnelSelectModal v-model:open="personOpen" @selected="pickPerson" />
  <ExamPaperListDialog
    v-model:open="paperOpen"
    mode="select"
    @selected="chooseFirstPaper"></ExamPaperListDialog>
</template>
<script setup lang="ts">
  import { ref, reactive, computed, watch, nextTick } from 'vue';
  import type { ExamRun } from '@/types/models/ExamRun';
  import type { ExamPaper, ExamPaperQuestion } from '@/types/models/ExamPaper';
  import type { Choice } from '@/types/models/Question';
  import { EXAM_RUN_STATUS, EXAM_RUN_STATUS_COLOR } from '@/types/codes';
  import { getExamRun, saveExamRun, generateExamLink } from './api';
  import { useToast } from '@/plugins/toast';
  import ExamPaperListDialog from '@/modules/examPaper/ExamPaperListDialog.vue';
  import PersonnelSelectModal from '@/modules/personnel/PersonnelSelectModal.vue';
  import QRCode from 'qrcode';

  type Mode = 'view' | 'edit' | 'create';
  const props = defineProps<{ open: boolean; mode: Mode; runId?: string }>();
  const emit = defineEmits<{ (e: 'update:open', v: boolean): void; (e: 'saved'): void }>();
  const model = computed({ get: () => props.open, set: (v: boolean) => emit('update:open', v) });
  const isView = computed(() => props.mode === 'view');
  const form = reactive<ExamRun>({
    試験ＩＤ: '',
    参加者氏名: '',
    参加者人材ＩＤ: '',
    登録済人材: 0,
    試験ステータス: 0,
    試験実施日時: '',
    試験リンクＩＤ: '',
    試験用紙: undefined,
    試験問題解答: [],
  });
  const examUrlLink = computed(
    () => `http://localhost:5173/exam-session?examLinkId=${form.試験リンクＩＤ}`
  );
  const qrBase64 = ref('');
  const original = ref('');
  const saving = ref(false);
  const loading = ref(false);
  const linkLoading = ref(false);
  const titleByMode = computed(() =>
    props.mode === 'create' ? '新規' : props.mode === 'edit' ? '編集' : '参照'
  );
  const toast = useToast();
  const isEditableBase = computed(() => props.mode !== 'view' && form.試験ステータス === 0);
  // 折りたたみフラグ
  const expandExamInfo = ref(true); //試験基本情報
  const expandExamLinkInfo = ref(true); //試験リンク
  const expandExamPaper = ref(true); //試験用紙
  const expandExamResult = ref(true); //試験結果
  // 試験ステータステキスト
  const examStatusStr = computed(() => EXAM_RUN_STATUS[form.試験ステータス]);
  const examStatusColor = computed(() => EXAM_RUN_STATUS_COLOR[form.試験ステータス]);
  // 試験参加情報表示可否の計算
  const showExamLinkInfo = computed(() => form.試験ステータス >= 1 && form.試験ステータス <= 4);
  // 試験結果表示可否の計算
  const showExamResult = computed(() => form.試験ステータス >= 3 && form.試験ステータス <= 4);

  const canGenerateLink = computed(
    () => props.mode !== 'view' && form.試験ステータス === 0 && !!form.試験用紙 && !!form.参加者氏名
  );
  const isResultVisible = computed(() => form.試験ステータス === 3 || form.試験ステータス === 4);
  function userAnswerOf(problemId: string) {
    return form.試験問題解答?.find((x) => x.試験用紙問題ＩＤ === problemId)?.回答試験用紙選択肢ＩＤ;
  }
  function isCorrect(p: any) {
    const a = userAnswerOf(p.試験用紙問題ＩＤ);
    return a && a === p.模範回答;
  }
  const sumHeaders = [
    { title: 'スキル', key: 'スキル', width: 180 },
    { title: '出題数', key: 'total', width: 100 },
    { title: '正解数', key: 'ok', width: 100 },
  ];
  const summaryRows = computed(() => {
    const rows: Record<string, { スキル: string; total: number; ok: number }> = {};
    if (!form.試験用紙) return [];
    for (const p of form.試験用紙.問題リスト) {
      const key = p.スキル;
      if (!rows[key]) rows[key] = { スキル: key, total: 0, ok: 0 };
      rows[key].total += 1;
      if (userAnswerOf(p.試験用紙問題ＩＤ) === p.模範回答) rows[key].ok += 1;
    }
    return Object.values(rows);
  });

  watch(
    () => props.open,
    async (v) => {
      if (v) await load();
    },
    { immediate: true }
  );
  async function load() {
    try {
      loading.value = true;
      if (props.mode === 'create') {
        Object.assign(form, {
          試験ＩＤ: '',
          参加者氏名: '',
          参加者人材ＩＤ: '',
          登録済人材: 0,
          試験ステータス: 0,
          試験リンクＩＤ: '',
          試験実施日時: '',
          試験用紙: undefined,
          試験問題解答: [],
        });
      } else if (props.runId) {
        const v = await getExamRun(props.runId);
        if (v) Object.assign(form, v);
      }
      await nextTick();
      original.value = JSON.stringify(form);
    } finally {
      loading.value = false;
    }
  }

  const personOpen = ref(false);

  function pickPerson(p: any) {
    form.参加者氏名 = p.名前;
    form.参加者人材ＩＤ = p.人材ID;
    personOpen.value = false;
  }

  const paperOpen = ref(false);
  async function chooseFirstPaper(examPaper: ExamPaper) {
    form.試験用紙 = examPaper;
    paperOpen.value = false;
  }

  async function onConfirmBase() {
    try {
      saving.value = true;
      const saved = await saveExamRun(form);
      Object.assign(form, saved);
      toast.show('試験基本情報を保存しました', 'success');
    } finally {
      saving.value = false;
    }
  }
  async function onGenerateLink() {
    try {
      linkLoading.value = true;
      const saved = await saveExamRun(form);
      Object.assign(form, saved);
      const r = await generateExamLink(form.試験ＩＤ);
      form.試験リンクＩＤ = r.linkId;
      form.試験ステータス = r.status;
      toast.show('試験リンクを生成しました', 'success');
    } finally {
      linkLoading.value = false;
    }
  }
  async function onSaveBase() {
    await onConfirmBase();
    emit('saved');
    model.value = false;
  }
  async function onQr() {
    if (!form.試験リンクＩＤ) return;
    const dataUrl = await QRCode.toDataURL(form.試験リンクＩＤ + Date.now(), {
      width: 196,
      margin: 1,
    });
    qrBase64.value = dataUrl;
    console.log(form.試験リンクＩＤ + Date.now());
    console.log('hey');
    // const w = window.open('about:blank', '_blank');
    // if (w) {
    //   w.document.write(`<img src="${dataUrl}" alt="QR">`);
    // }
  }
</script>
