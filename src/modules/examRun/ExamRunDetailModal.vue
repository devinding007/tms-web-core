<template>
  <v-dialog
    v-model="model"
    :max-width="isFullscreen ? undefined : 1200"
    :fullscreen="isFullscreen"
    :scrim="true"
    close-on-esc
    close-on-back>
    <v-card class="fixed-dialog">
      <v-toolbar density="comfortable" color="primary" class="text-white">
        <v-toolbar-title>試験実施詳細（{{ titleByMode }}）</v-toolbar-title>
        <v-spacer />
        <v-btn icon variant="text" @click="isFullscreen = !isFullscreen">
          <v-icon>
            {{ isFullscreen ? 'mdi-window-restore' : 'mdi-window-maximize' }}
          </v-icon>
        </v-btn>
        <v-btn icon @click="model = false"><v-icon>mdi-close</v-icon></v-btn>
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
            <v-spacer />
            <v-chip>クリックして{{ !expandExamInfo ? '展開' : '折り畳む' }}</v-chip>
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
                <v-col cols="12" md="6" class="d-flex ga-2 align-center"> </v-col>
              </v-row>
            </v-card-text>
          </v-expand-transition>
        </v-card>

        <!-- 試験参加情報 -->
        <v-card v-if="showExamLinkInfo" variant="outlined" class="mt-4">
          <v-card-title
            class="text-subtitle-1 d-flex align-center ga-2"
            @click="expandExamLinkInfo = !expandExamLinkInfo"
            ><v-icon>mdi-clipboard-text</v-icon> 試験参加情報 <v-spacer />
            <v-chip>クリックして{{ !expandExamLinkInfo ? '展開' : '折り畳む' }}</v-chip>
          </v-card-title>

          <v-expand-transition>
            <v-card-text v-show="expandExamLinkInfo">
              <v-alert type="info" variant="tonal" class="mb-3"
                >試験リンクを<strong>クリックするとコピー</strong>されます。</v-alert
              >

              <v-row align="center" dense>
                <v-col cols="12" md="12">
                  <div class="text-body-1 mb-2">
                    <strong>試験ID:</strong>
                    <span class="mono ml-2">{{ form.試験ＩＤ }}</span>
                  </div>

                  <div class="text-body-1 d-flex align-center">
                    <strong>試験リンク:</strong>
                    <span
                      class="mono ml-2 clickable text-primary text-truncate"
                      style="max-width: 100%"
                      @click="copyLink"
                      title="クリックでコピー">
                      {{ examUrlLink }}
                    </span>
                    <v-btn
                      class="ml-2"
                      size="small"
                      icon
                      variant="text"
                      @click="copyLink"
                      :aria-label="'コピー'">
                      <v-icon>mdi-content-copy</v-icon>
                    </v-btn>
                  </div>
                </v-col>

                <v-col cols="12" md="12" class="text-center">
                  <v-sheet class="pa-4 rounded-lg border d-inline-block">
                    <v-img
                      v-if="qrBase64"
                      :src="qrBase64"
                      :alt="'QR for ' + examUrlLink"
                      width="220"
                      height="220" />
                    <div v-else class="text-disabled">QR生成中...</div>
                  </v-sheet>
                </v-col>
              </v-row>
            </v-card-text>
          </v-expand-transition>
        </v-card>

        <!-- 試験用紙 -->
        <v-card variant="outlined" class="mt-4">
          <v-card-title
            class="text-subtitle-1 d-flex align-center ga-2"
            @click="expandExamPaper = !expandExamPaper"
            ><v-icon>mdi-file-document-multiple</v-icon> 試験用紙「{{
              form.試験用紙?.試験用紙名称 || '—'
            }}」 <v-spacer />
            <v-chip>クリックして{{ !expandExamPaper ? '展開' : '折り畳む' }}</v-chip>
          </v-card-title>
          <v-divider></v-divider>
          <v-expand-transition>
            <v-card-text v-show="expandExamPaper" style="max-height: none">
              <template v-if="!form.試験用紙"
                ><v-alert type="info" variant="tonal"
                  >試験用紙が未設定です。試験基本情報にてご設定ください。</v-alert
                ></template
              >
              <template v-else>
                <div class="text-caption text-medium-emphasis mb-4">
                  <strong>説明:</strong>{{ form.試験用紙.説明 }}
                </div>
                <v-divider></v-divider>
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

                          <v-chip
                            v-if="!userAnswerOf(p.試験用紙問題ＩＤ)"
                            v-show="false"
                            size="small"
                            color="text-disabled"
                            variant="elevated"
                            prepend-icon="mdi-stairs">
                            未回答
                          </v-chip>
                          <v-chip
                            v-else-if="isCorrect(p)"
                            size="small"
                            color="success"
                            variant="tonal"
                            prepend-icon="mdi-checkbox-marked-circle-outline">
                            正解
                          </v-chip>
                          <v-chip
                            v-else
                            size="small"
                            color="error"
                            variant="tonal"
                            prepend-icon="mdi-close-circle-outline">
                            不正解
                          </v-chip>
                        </div>
                        <div class="text-subtitle-2">{{ p.問題文章 }}</div>
                        <v-list density="compact" lines="two" class="mt-1">
                          <template v-if="isResultVisible">
                            <!-- <template v-if="isCorrect(p)"> -->
                            <!-- v-show="c.選択肢ＩＤ === p.模範回答" -->
                            <v-list-item
                              v-for="c in p.選択肢"
                              :key="c.選択肢ＩＤ"
                              :title="c.選択肢文章"
                              :subtitle="c.回答理由">
                              <template #prepend>
                                <v-icon v-if="c.選択肢ＩＤ == p.模範回答" color="success"
                                  >mdi-checkbox-marked-circle-outline</v-icon
                                >
                                <v-icon
                                  v-else-if="c.選択肢ＩＤ == userAnswerOf(p.試験用紙問題ＩＤ)"
                                  color="error"
                                  >mdi-close-circle-outline</v-icon
                                >
                                <v-icon v-else color="text-disabled"
                                  >mdi-checkbox-blank-circle-outline</v-icon
                                >
                              </template>
                            </v-list-item>
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
              </template>
            </v-card-text>
          </v-expand-transition>
        </v-card>

        <!-- 試験結果：正答率確認 -->
        <v-card v-if="isResultVisible" variant="outlined" class="mt-4">
          <v-card-title
            class="d-flex align-center ga-3"
            @click="expandExamResult = !expandExamResult">
            <v-icon>mdi-chart-bar</v-icon>
            <span class="text-subtitle-1">試験結果集計</span>
            <v-spacer />
            <v-chip>クリックして{{ !expandExamResult ? '展開' : '折り畳む' }}</v-chip>
          </v-card-title>
          <v-expand-transition>
            <v-card-text v-show="expandExamResult">
              <div v-if="isResultVisible">
                <div class="text-subtitle-1 mb-2 d-flex align-center ga-2">
                  <div class="text-caption text-medium-emphasis">
                    スキル数：{{ summaryRowsWithRate.length }} 件 / 平均正答率：{{ avgAccuracy }}%
                  </div>
                </div>

                <!-- スキルごとのカード -->
                <div class="d-flex flex-wrap ga-4">
                  <v-sheet
                    v-for="row in summaryRowsWithRate"
                    :key="row.スキル"
                    class="pa-3 rounded-lg flex-grow-1"
                    style="min-width: 260px; max-width: 360px; border: 1px solid #e0e0e0">
                    <!-- ヘッダー：スキル名 + 正答率チップ -->
                    <div class="d-flex align-center mb-2">
                      <v-chip size="small" color="primary" variant="tonal" prepend-icon="mdi-tag">
                        {{ row.スキル }}
                      </v-chip>
                      <v-spacer />
                      <v-chip
                        size="small"
                        :color="rateColor(row.rate)"
                        variant="tonal"
                        prepend-icon="mdi-target">
                        {{ row.rate }}%
                      </v-chip>
                    </div>

                    <!-- 円グラフ + バー -->
                    <div class="d-flex align-center ga-3">
                      <v-progress-circular
                        :model-value="row.rate"
                        size="56"
                        width="6"
                        :color="rateColor(row.rate)">
                        {{ row.rate }}%
                      </v-progress-circular>

                      <div class="flex-grow-1">
                        <div class="d-flex justify-space-between text-caption mb-1">
                          <span>正解数 / 出題数</span>
                          <span>{{ row.ok }} / {{ row.total }}</span>
                        </div>
                        <v-progress-linear
                          :model-value="row.ok"
                          :max="row.total"
                          height="6"
                          rounded
                          :color="rateColor(row.rate)" />

                        <div
                          class="mt-2 d-flex justify-space-between text-caption text-medium-emphasis">
                          <span>正答率</span>
                          <span>{{ row.rate }}%</span>
                        </div>
                      </div>
                    </div>
                  </v-sheet>
                </div>
              </div>
            </v-card-text>
          </v-expand-transition>
        </v-card>

        <!-- 試験結果：スキル反映 -->
        <v-card v-if="showReflectResult" variant="outlined" class="mt-4">
          <v-card-title
            class="d-flex align-center ga-3"
            @click="expandExamReflection = !expandExamReflection">
            <v-icon>mdi-clipboard-text</v-icon>
            <span class="text-subtitle-1">スキル反映結果</span>
            <v-spacer />
            <v-chip>クリックして{{ !expandExamReflection ? '展開' : '折り畳む' }}</v-chip>
          </v-card-title>

          <v-expand-transition>
            <v-card-text v-show="expandExamReflection">
              <!-- ここはオマケ：何件・平均変化量など -->
              <div class="text-subtitle-1 mb-2 d-flex align-center ga-2">
                <div class="text-caption text-medium-emphasis">
                  <span
                    >更新スキル数：{{ skillDiffs.length }} 件 / 平均変化：{{ avgDiffText }}</span
                  >
                </div>
              </div>
              <div class="d-flex flex-wrap ga-4">
                <v-sheet
                  v-for="row in skillDiffs"
                  :key="row.スキル名"
                  class="pa-3 rounded-lg flex-grow-1"
                  style="min-width: 260px; max-width: 360px; border: 1px solid #e0e0e0">
                  <!-- ヘッダー部分：スキル名 + 変化チップ -->
                  <div class="d-flex align-center mb-2">
                    <v-chip size="small" color="primary" variant="tonal" prepend-icon="mdi-cog">
                      {{ row.スキル名 }}
                    </v-chip>

                    <v-spacer />

                    <v-chip
                      size="small"
                      :color="row.diff > 0 ? 'success' : row.diff < 0 ? 'error' : 'grey'"
                      variant="tonal"
                      :prepend-icon="
                        row.diff > 0
                          ? 'mdi-arrow-up-bold'
                          : row.diff < 0
                          ? 'mdi-arrow-down-bold'
                          : 'mdi-minus'
                      ">
                      {{ formatDiff(row.diff) }} pt
                    </v-chip>
                  </div>

                  <!-- 数値表示 -->
                  <div class="text-caption text-medium-emphasis mb-1">
                    調整前：<strong>{{ row.スキル点数更新前 }}</strong> / 調整後：<strong>{{
                      row.スキル点数更新後
                    }}</strong>
                  </div>

                  <!-- バー表示：Before / After -->
                  <div class="mb-1">
                    <div class="d-flex justify-space-between text-caption mb-1">
                      <span>Before</span>
                      <span>{{ row.スキル点数更新前 }} pt</span>
                    </div>
                    <v-progress-linear :model-value="row.スキル点数更新前" height="6" rounded />
                  </div>

                  <div>
                    <div class="d-flex justify-space-between text-caption mb-1">
                      <span>After</span>
                      <span>{{ row.スキル点数更新後 }} pt</span>
                    </div>
                    <v-progress-linear
                      :model-value="row.スキル点数更新後"
                      height="6"
                      rounded
                      color="primary" />
                  </div>
                </v-sheet>
              </div>
            </v-card-text>
          </v-expand-transition>
        </v-card>
      </v-card-text>

      <v-card-actions v-if="!isView">
        <v-spacer />
        <v-btn variant="text" @click="model = false">キャンセル</v-btn>
        <!-- <v-btn color="primary" prepend-icon="mdi-content-save" :loading="saving" @click="onSaveBase"
          >試験準備保存</v-btn
        > -->
        <v-btn
          v-if="isEditableBase"
          color="primary"
          prepend-icon="mdi-check-decagram"
          @click="onConfirmBase"
          >試験確定</v-btn
        >
        <v-btn
          v-if="showReflectBtn"
          color="primary"
          prepend-icon="mdi-school"
          :loading="reflecting"
          @click="onReflectResult"
          >スキル反映</v-btn
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
  import { EXAM_RUN_STATUS, EXAM_RUN_STATUS_COLOR } from '@/types/codes';
  import { useToast } from '@/plugins/toast';
  import ExamPaperListDialog from '@/modules/examPaper/ExamPaperListDialog.vue';
  import PersonnelSelectModal from '@/modules/personnel/PersonnelSelectModal.vue';
  import QRCode from 'qrcode';
  import {
    confirmExamRun,
    getExamRun,
    reflectSkillPoint,
    saveExamRun,
    uuid,
    getExamPaper,
  } from '@/composables/useApi';
  import { Personnel } from '@/types/models/Personnel';

  type Mode = 'view' | 'edit' | 'create';
  const isFullscreen = ref(false);

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
    試験用紙: undefined,
    試験問題解答: [],
  });
  const examUrlLink = computed(
    // () => `http://localhost:5173/exam-session?examLinkId=${form.試験ＩＤ}`
    () => `${import.meta.env.VITE_API_HOME_URL}exam-session?examLinkId=${form.試験ＩＤ}`
  );

  const qrBase64 = ref('');
  watch(examUrlLink, async (v) => {
    qrBase64.value = await makeQR(v);
  });

  const original = ref('');
  const saving = ref(false);
  const loading = ref(false);
  const reflecting = ref(false);
  const linkLoading = ref(false);
  const titleByMode = computed(() =>
    props.mode === 'create' ? '新規' : props.mode === 'edit' ? '編集' : '参照'
  );
  const toast = useToast();
  const isEditableBase = computed(() => props.mode !== 'view' && form.試験ステータス === 0);
  // スキル反映ボタン表示
  const showReflectBtn = computed(
    () => props.mode !== 'view' && form.試験ステータス === 3 && form.登録済人材 === 1
  );
  // スキル反映結果表示
  const showReflectResult = computed(() => form.試験ステータス === 4); // 結果反映済み

  // 折りたたみフラグ
  const expandExamInfo = ref(true); //試験基本情報
  const expandExamLinkInfo = ref(true); //試験リンク
  const expandExamPaper = ref(true); //試験用紙
  const expandExamResult = ref(true); //試験結果
  const expandExamReflection = ref(true); //試験反映結果
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
  const skillReflectionHeaders = [
    { title: 'スキル', key: 'スキル名', width: 180 },
    { title: '調整前', key: 'スキル点数更新前', width: 100 },
    { title: '調整後', key: 'スキル点数更新後', width: 100 },
  ];
  const sumHeaders = [
    { title: 'スキル', key: 'スキル', width: 180 },
    { title: '出題数', key: 'total', width: 100 },
    { title: '正解数', key: 'ok', width: 100 },
  ];
  const summaryRows = computed(() => {
    if (!form.試験用紙 || !form.試験問題数 || form.試験問題数 <= 0) return [];
  
    // 🔴 直接使用後端提供的總數
    return [{
      スキル: '全体',
      total: form.試験問題数,
      ok: form.試験正解数 ?? 0
    }];
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
          試験実施日時: '',
          試験用紙: undefined,
          試験問題解答: [],
        });
        form.試験ＩＤ = uuid();
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

  function pickPerson(p: Personnel) {
    form.参加者氏名 = p.名前;
    form.参加者人材ＩＤ = p.人材ＩＤ;
    personOpen.value = false;
  }

  const paperOpen = ref(false);
  async function chooseFirstPaper(examPaper: ExamPaper) {
    if (examPaper.試験用紙ＩＤ) {
      const fullPaper = await getExamPaper(examPaper.試験用紙ＩＤ);
      if (fullPaper) {
        form.試験用紙 = fullPaper; // ← 包含完整問題列表
      } else {
        toast.show('試験用紙の詳細取得に失敗しました', 'error');
      }
  }
    paperOpen.value = false;
  }

  async function onConfirmBase() {
    try {
      saving.value = true;
      const examRunToSave = { ...form };
      if (form.試験用紙) {
        examRunToSave.試験用紙 = {
          // 使用半形ID（與後端 @JsonProperty("試験用紙ID") 一致）
          試験用紙ID: form.試験用紙.試験用紙ＩＤ, //
          試験用紙名称: form.試験用紙.試験用紙名称,
          説明: form.試験用紙.説明,
          作成日時: form.試験用紙.作成日時,
          削除フラグ: form.試験用紙.削除フラグ,
          // 保存時不需要問題列表
          問題リスト: [],
        };
      }
      let saved = await saveExamRun(examRunToSave);
      saved = await confirmExamRun(saved?.試験ＩＤ);

      const originalPaper = form.試験用紙;

      Object.assign(form, saved);
      form.試験用紙 = originalPaper; 
      toast.show('試験基本情報を確定しました', 'success');
      emit('saved');
    } finally {
      saving.value = false;
    }
  }
  async function onSaveBase() {
    await onConfirmBase();
    emit('saved');
    model.value = false;
  }

  async function makeQR(text: string) {
    try {
      return await QRCode.toDataURL(text, {
        width: 1024,
        margin: 1,
        errorCorrectionLevel: 'M',
        color: { dark: '#000000', light: '#FFFFFF' },
      });
    } catch (e) {
      return '';
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(examUrlLink.value);
      toast.show('リンクをコピーしました', 'success');
    } catch (e) {
      toast.show('リンクコピーに失敗しました', 'error');
    }
  }

  async function onReflectResult() {
    reflecting.value = true;
    try {
      await reflectSkillPoint(form.試験ＩＤ);
      await load(); // ✅ 现在 GET 会返回正确的 スキル反映結果
      toast.show('スキル反映が完了しました', 'success');
      emit('saved');
    } catch (e) {
      toast.show('反映に失敗しました', 'error');
    } finally {
      reflecting.value = false;
    }
  }

  const skillDiffs = computed(() => {
    const list = form.スキル反映結果 ?? [];
    return list.map((r) => {
      const before = r.スキル点数更新前 ?? 0;
      const after = r.スキル点数更新後 ?? 0;
      return {
        ...r,
        diff: after - before,
      };
    });
  });

  const avgDiffText = computed(() => {
    if (!skillDiffs.value.length) return '-';
    const sum = skillDiffs.value.reduce((acc, x) => acc + x.diff, 0);
    const avg = Math.round((sum / skillDiffs.value.length) * 10) / 10;
    return (avg > 0 ? '+' : '') + avg + ' pt';
  });

  function formatDiff(v: number) {
    if (v > 0) return `+${v}`;
    return String(v);
  }

  const summaryRowsWithRate = computed(() => {
    return summaryRows.value.map((r) => {
      const rate = r.total > 0 ? Math.round((r.ok / r.total) * 100) : 0;
      return { ...r, rate };
    });
  });

  const avgAccuracy = computed(() => {
    if (!summaryRowsWithRate.value.length) return 0;
    const sum = summaryRowsWithRate.value.reduce((acc, r) => acc + r.rate, 0);
    return Math.round(sum / summaryRowsWithRate.value.length);
  });

  function rateColor(rate: number) {
    if (rate >= 80) return 'success';
    if (rate >= 50) return 'warning';
    return 'error';
  }
</script>
