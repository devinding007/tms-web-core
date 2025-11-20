<template>
  <v-dialog
    v-model="model"
    :max-width="isFullscreen ? undefined : 980"
    :fullscreen="isFullscreen"
    :scrim="true"
    close-on-esc
    close-on-back>
    <v-card class="fixed-dialog d-flex flex-column h-100">
      <v-toolbar density="comfortable" color="primary" class="text-white">
        <v-toolbar-title>試験用紙（{{ titleByMode }}）</v-toolbar-title>
        <v-spacer />
        <v-btn icon variant="text" @click="isFullscreen = !isFullscreen">
          <v-icon>
            {{ isFullscreen ? 'mdi-window-restore' : 'mdi-window-maximize' }}
          </v-icon>
        </v-btn>

        <v-btn icon @click="model = false" title="閉じる"><v-icon>mdi-close</v-icon></v-btn>
      </v-toolbar>

      <template v-if="loading"
        ><v-card-text><v-skeleton-loader type="article" /></v-card-text
      ></template>

      <v-card-text class="flex-grow-1 overflow-y-auto" v-else>
        <div class="grid gap-4">
          <v-text-field
            :model-value="form.試験用紙ＩＤ"
            label="試験用紙ID (UUID)"
            disabled
            :placeholder="isCreate ? '(保存時に採番)' : ''" />
          <v-text-field v-model="form.試験用紙名称" label="試験用紙名称" :disabled="isView" />
          <v-textarea v-model="form.説明" label="説明" auto-grow :disabled="isView" />
          <v-text-field
            :model-value="new Date(form.作成日時).toLocaleString()"
            label="作成日時"
            disabled />

          <v-divider class="my-2" />
          <div class="d-flex align-center justify-space-between">
            <div class="text-subtitle-1 d-flex align-center">
              <v-icon class="mr-2">mdi-format-list-bulleted-square</v-icon>問題リスト
            </div>
          </div>

          <div class="choices-stack">
            <v-card v-for="(p, idx) in form.問題リスト" :key="p.試験用紙問題ＩＤ" variant="tonal">
              <v-card-text class="d-flex flex-column" style="gap: 8px">
                <!-- ヘッダー：左=ラベル（スキル/難易度）＋問題文、右=並べ替え/削除 -->
                <div class="d-flex align-start" style="gap: 8px">
                  <div class="flex-1">
                    <div class="d-flex align-center flex-wrap ga-2 mb-1">
                      <v-chip size="small" color="primary" variant="tonal" prepend-icon="mdi-tag">{{
                        p.スキル
                      }}</v-chip>
                      <v-chip
                        size="small"
                        color="secondary"
                        variant="tonal"
                        prepend-icon="mdi-stairs"
                        >難易度 {{ p.難易度 }}</v-chip
                      >
                    </div>
                    <div class="text-subtitle-2">{{ p.問題文章 }}</div>
                  </div>
                  <div class="d-flex ga-1 align-center ml-auto">
                    <v-btn
                      v-if="!isView"
                      size="small"
                      icon="mdi-arrow-up"
                      title="上へ"
                      @click="moveUp(idx)"
                      :disabled="idx === 0" />
                    <v-btn
                      v-if="!isView"
                      size="small"
                      icon="mdi-arrow-down"
                      title="下へ"
                      @click="moveDown(idx)"
                      :disabled="idx === form.問題リスト.length - 1" />
                    <v-btn
                      v-if="!isView"
                      size="small"
                      color="error"
                      prepend-icon="mdi-delete"
                      @click="removeProblem(idx)"
                      >削除</v-btn
                    >
                  </div>
                </div>
                <!-- 選択肢（参照表示） -->
                <div class="mt-2">
                  <div class="text-caption text-medium-emphasis">選択肢</div>
                  <v-list density="compact" lines="two">
                    <v-list-item
                      v-for="c in p.選択肢"
                      :key="c.選択肢ＩＤ"
                      :title="c.選択肢文章"
                      :subtitle="c.回答理由">
                      <template #prepend>
                        <v-icon v-if="p.模範回答 === c.選択肢ＩＤ" color="success"
                          >mdi-check-circle</v-icon
                        >
                        <v-icon v-else class="text-disabled"
                          >mdi-checkbox-blank-circle-outline</v-icon
                        >
                      </template>
                      <template #append
                        ><code class="text-caption"
                          >{{ c.選択肢ＩＤ.slice(0, 8) }}...</code
                        ></template
                      >
                    </v-list-item>
                  </v-list>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </div>
      </v-card-text>

      <v-card-actions v-if="!isView" class="justify-end">
        <v-spacer />
        <v-btn variant="text" @click="model = false">キャンセル</v-btn>
        <v-btn variant="tonal" prepend-icon="mdi-robot" :loading="genLoading" @click="aiOpen = true"
          >試験用紙AI一括生成</v-btn
        >
        <v-btn color="secondary" prepend-icon="mdi-plus" @click="selectOpen = true">問題追加</v-btn>
        <v-btn
          color="primary"
          prepend-icon="mdi-content-save"
          :disabled="!dirty"
          :loading="saving"
          @click="onSave"
          >保存</v-btn
        >
      </v-card-actions>

      <v-overlay :model-value="saving" persistent />
    </v-card>
  </v-dialog>

  <AIGenerateModal v-model:open="aiOpen" @generated="onAIGenerated" />
  <QuestionListDialog
    v-model:open="selectOpen"
    mode="select"
    title="問題一覧"
    @selected="onPickQuestion" />
  <ErrorDialog v-model:open="errorOpen" :message="errorMessage" />
</template>

<script setup lang="ts">
  import { computed, reactive, ref, watch, nextTick } from 'vue';
  import type { ExamPaper, ExamPaperQuestion } from '@/types/models/ExamPaper';
  import type { Question } from '@/types/models/Question';
  import { mapQuestionToPaperProblem } from './api';
  import AIGenerateModal from './AIGenerateModal.vue';
  import QuestionListDialog from '@/modules/exam/QuestionListDialog.vue';
  import ErrorDialog from '@/components/common/ErrorDialog.vue';
  import { useToast } from '@/plugins/toast';
  import { getExamPaper, saveExamPaper, uuid } from '@/composables/useApi';

  type Mode = 'view' | 'edit' | 'create';
  const props = defineProps<{ open: boolean; mode: Mode; paperId?: string }>();
  const emit = defineEmits<{ (e: 'update:open', v: boolean): void; (e: 'saved'): void }>();

  const isFullscreen = ref(false);

  const model = computed({ get: () => props.open, set: (v: boolean) => emit('update:open', v) });
  const isView = computed(() => props.mode === 'view');
  const isCreate = computed(() => props.mode === 'create');

  const empty = (): ExamPaper => ({
    試験用紙ＩＤ: '',
    試験用紙名称: '',
    説明: '',
    作成日時: new Date().toISOString(),
    削除フラグ: 0,
    問題リスト: [],
  });
  const form = reactive<ExamPaper>(empty());
  const original = ref('');
  const saving = ref(false);
  const loading = ref(false);
  const genLoading = ref(false);
  const errorOpen = ref(false);
  const errorMessage = ref('');
  const titleByMode = computed(() => (isCreate.value ? '新規' : isView.value ? '参照' : '編集'));
  const toast = useToast();

  watch(
    () => props.open,
    async (v) => {
      if (v) {
        isFullscreen.value = false;
        await load();
      }
    },
    { immediate: true }
  );

  async function load() {
    try {
      loading.value = true;
      if (isCreate.value) {
        Object.assign(form, empty());
        form.試験用紙ＩＤ = uuid();
      } else {
        const p = await getExamPaper(props.paperId!);
        if (p) Object.assign(form, JSON.parse(JSON.stringify(p)));
      }
      await nextTick();
      original.value = JSON.stringify(form);
    } catch (e) {
      errorMessage.value = '読み込みに失敗しました';
      errorOpen.value = true;
    } finally {
      loading.value = false;
    }
  }

  const dirty = computed(() => JSON.stringify(form) !== original.value);
  function removeProblem(idx: number) {
    form.問題リスト.splice(idx, 1);
  }
  function moveUp(idx: number) {
    if (idx <= 0) return;
    const item = form.問題リスト.splice(idx, 1)[0];
    form.問題リスト.splice(idx - 1, 0, item);
  }
  function moveDown(idx: number) {
    if (idx >= form.問題リスト.length - 1) return;
    const item = form.問題リスト.splice(idx, 1)[0];
    form.問題リスト.splice(idx + 1, 0, item);
  }

  const aiOpen = ref(false);
  const selectOpen = ref(false);
  function onAIGenerated(list: Question[]) {
    list.forEach((q) => {
      const mapped = mapQuestionToPaperProblem(q, form.試験用紙ＩＤ || ('(未採番)' as any));
      form.問題リスト.push(mapped);
    });
    genLoading.value = false;
  }
  function onPickQuestion(q: Question) {
    const mapped: ExamPaperQuestion = mapQuestionToPaperProblem(
      q,
      form.試験用紙ＩＤ || ('(未採番)' as any)
    );
    form.問題リスト.push(mapped);
  }

  async function onSave() {
    try {
      saving.value = true;
      const saved = await saveExamPaper(form);
      Object.assign(form, saved);
      original.value = JSON.stringify(form);
      toast.show('保存しました', 'success');
      emit('saved');
      model.value = false;
    } catch (e) {
      errorMessage.value = '保存に失敗しました';
      errorOpen.value = true;
    } finally {
      saving.value = false;
    }
  }
</script>

<style scoped>
  .grid {
    display: grid;
  }
  .gap-4 {
    gap: 1rem;
  }
  .choices-stack {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .ml-auto {
    margin-left: auto;
  }
</style>
