<template>
  <v-dialog v-model="model" max-width="980" :scrim="true" close-on-esc close-on-back>
    <v-card class="fixed-dialog">
      <!-- 上部：タイトル＋閉じるのみ（ボタンは下部に集約） -->
      <v-toolbar density="comfortable" color="primary" class="text-white">
        <v-toolbar-title>問題詳細（{{ titleByMode }}）</v-toolbar-title>
        <v-spacer />
        <v-btn icon @click="model = false" title="閉じる"><v-icon>mdi-close</v-icon></v-btn>
      </v-toolbar>

      <!-- ローディング時はスケルトン -->
      <template v-if="loading">
        <v-card-text><v-skeleton-loader type="article" /></v-card-text>
      </template>

      <v-card-text v-else>
        <!-- フォーム本体：余白を広く、2カラムを多用 -->
        <div class="grid gap-4">
          <v-text-field
            :model-value="form.問題ＩＤ"
            label="問題ID (UUID)"
            disabled
            :placeholder="isCreate ? '(フロントで採番／編集不可)' : ''" />

          <div class="grid md:grid-cols-2 gap-4">
            <v-select
              v-model="form.スキル"
              :items="skillOptions"
              label="スキル"
              :disabled="isView" />
            <v-text-field
              v-model.number="form.難易度"
              label="難易度 (1-10)"
              type="number"
              min="1"
              max="10"
              :disabled="isView" />
          </div>

          <v-textarea
            v-model="form.問題文章"
            label="問題文章"
            rows="3"
            auto-grow
            :disabled="isView" />

          <div class="grid md:grid-cols-2 gap-4">
            <v-select
              v-model="form.模範回答"
              :items="
                form.選択肢.map((c) => ({
                  title: `${c.選択肢文章} (${c.選択肢ＩＤ.slice(0, 8)}...)`,
                  value: c.選択肢ＩＤ,
                }))
              "
              label="模範回答（選択肢ID）"
              :disabled="isView || form.選択肢.length === 0" />
            <v-switch
              v-model="autoFlag"
              :true-value="1"
              :false-value="0"
              inset
              label="自動生成フラグ"
              :disabled="isView" />
          </div>

          <v-textarea
            v-model="form.模範回答理由"
            label="模範回答理由"
            rows="2"
            auto-grow
            :disabled="isView" />

          <v-divider class="my-2" />

          <!-- 選択肢：カードでゆとりを持って表示 -->
          <div class="d-flex align-center justify-space-between">
            <div class="text-subtitle-1 d-flex align-center">
              <v-icon class="mr-2">mdi-format-list-bulleted</v-icon>選択肢
            </div>
            <v-btn v-if="!isView" variant="tonal" prepend-icon="mdi-plus" @click="addChoice"
              >選択肢追加</v-btn
            >
          </div>

          <div class="choices-stack">
            <v-card v-for="(c, idx) in form.選択肢" :key="c.選択肢ＩＤ" variant="tonal">
              <v-card-text class="d-flex flex-column" style="gap: 8px">
                <div class="grid md:grid-cols-2 gap-3">
                  <v-text-field v-model="c.選択肢ＩＤ" label="選択肢ID (UUID)" disabled />
                  <div class="d-flex align-center" style="gap: 8px">
                    <v-text-field
                      v-model="c.選択肢文章"
                      label="選択肢文章"
                      :disabled="isView"
                      class="flex-1" />
                    <v-btn
                      v-if="!isView"
                      icon="mdi-delete"
                      color="error"
                      @click="removeChoice(idx)" />
                  </div>
                </div>
                <v-textarea
                  v-model="c.回答理由"
                  label="回答理由（なぜ選/不選択か）"
                  auto-grow
                  :disabled="isView" />
              </v-card-text>
            </v-card>
          </div>
        </div>
      </v-card-text>

      <!-- 下部：アクションに集約（参照モードは非表示） -->
      <v-card-actions v-if="!isView">
        <v-spacer />
        <v-btn variant="text" @click="model = false">キャンセル</v-btn>
        <v-btn variant="tonal" prepend-icon="mdi-robot" :loading="aiLoading" @click="onAIGenerate"
          >AI生成</v-btn
        >
        <v-btn
          color="primary"
          prepend-icon="mdi-content-save"
          :disabled="!dirty"
          :loading="saving"
          @click="onSave"
          >保存</v-btn
        >
        <v-btn
          v-if="!isCreate"
          color="error"
          prepend-icon="mdi-delete"
          :loading="deleting"
          @click="confirmDelete = true"
          >削除</v-btn
        >
      </v-card-actions>

      <v-overlay :model-value="saving || deleting || aiLoading" persistent />
    </v-card>
  </v-dialog>

  <!-- 削除確認 -->
  <v-dialog v-model="confirmDelete" width="420">
    <v-card>
      <v-card-title class="text-error">
        <v-icon class="mr-2">mdi-delete</v-icon>削除しますか？
      </v-card-title>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="confirmDelete = false">キャンセル</v-btn>
        <v-btn color="error" prepend-icon="mdi-delete" :loading="deleting" @click="onDelete"
          >はい</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>

  <ErrorDialog v-model:open="errorOpen" :message="errorMessage" />
</template>

<script setup lang="ts">
  import { computed, reactive, ref, watch, nextTick } from 'vue';
  import type { Question, Choice } from '@/types/models/Question';
  import {
    listSkillOptions,
    getQuestion,
    saveQuestion,
    deleteQuestion,
    aiGenerateQuestion,
  } from '@/composables/useApi';
  import ErrorDialog from '@/components/common/ErrorDialog.vue';
  import { useToast } from '@/plugins/toast';

  type Mode = 'view' | 'edit' | 'create';
  const props = defineProps<{ open: boolean; mode: Mode; questionId?: string }>();
  const emit = defineEmits<{
    (e: 'update:open', v: boolean): void;
    (e: 'saved', v: Question): void;
    (e: 'deleted', id: string): void;
  }>();

  const model = computed({ get: () => props.open, set: (v: boolean) => emit('update:open', v) });
  const isView = computed(() => props.mode === 'view');
  const isCreate = computed(() => props.mode === 'create');

  const empty = (): Question => ({
    問題ＩＤ: (globalThis.crypto && 'randomUUID' in globalThis.crypto
      ? (globalThis.crypto as any).randomUUID()
      : Math.random().toString(36).slice(2)) as any,
    問題文章: '',
    難易度: 5,
    スキル: '',
    模範回答: null as any,
    模範回答理由: '',
    自動生成フラグ: 0,
    削除フラグ: 0,
    選択肢: [],
  });

  const form = reactive<Question>(empty());
  const original = ref('');
  const saving = ref(false);
  const deleting = ref(false);
  const aiLoading = ref(false);
  const loading = ref(false);

  const errorOpen = ref(false);
  const errorMessage = ref('');
  const skillOptions = ref<string[]>([]);

  const titleByMode = computed(() =>
    isCreate.value ? '新規登録' : isView.value ? '参照' : '編集'
  );
  const autoFlag = computed({
    get: () => form.自動生成フラグ,
    set: (v: number) => (form.自動生成フラグ = v as 0 | 1),
  });
  const dirty = computed(() => JSON.stringify(form) !== original.value);

  const choiceHeaders = []; // 未使用（テーブル→カード表示へ変更）

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
      skillOptions.value = await listSkillOptions();
      if (isCreate.value) {
        Object.assign(form, empty());
      } else {
        const q = await getQuestion(props.questionId!);
        if (q) Object.assign(form, JSON.parse(JSON.stringify(q)));
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

  function addChoice() {
    const c: Choice = {
      選択肢ＩＤ: (globalThis.crypto && 'randomUUID' in globalThis.crypto
        ? (globalThis.crypto as any).randomUUID()
        : Math.random().toString(36).slice(2)) as any,
      選択肢文章: '',
      回答理由: '',
    };
    form.選択肢.push(c);
  }
  function removeChoice(idx: number) {
    form.選択肢.splice(idx, 1);
  }

  const toast = useToast();
  async function onSave() {
    try {
      saving.value = true;
      const res = await saveQuestion(form);
      original.value = JSON.stringify(form);
      toast.show('保存しました', 'success');
      emit('saved', res);
      model.value = false;
    } catch (e) {
      errorMessage.value = '保存に失敗しました';
      errorOpen.value = true;
    } finally {
      saving.value = false;
    }
  }
  async function onDelete() {
    try {
      deleting.value = true;
      await deleteQuestion(form.問題ＩＤ);
      toast.show('削除しました', 'success');
      emit('deleted', form.問題ＩＤ);
      confirmDelete.value = false;
      model.value = false;
    } catch (e) {
      errorMessage.value = '削除に失敗しました';
      errorOpen.value = true;
    } finally {
      deleting.value = false;
    }
  }
  async function onAIGenerate() {
    try {
      aiLoading.value = true;
      const out = await aiGenerateQuestion({
        スキル: form.スキル || 'General',
        難易度: form.難易度,
      });
      form.問題文章 = out.問題文章;
      form.自動生成フラグ = 1;
      form.選択肢 = out.選択肢;
      form.模範回答 = out.模範回答;
      form.模範回答理由 = out.模範回答理由;
    } catch (e) {
      errorMessage.value = 'AI生成に失敗しました';
      errorOpen.value = true;
    } finally {
      aiLoading.value = false;
    }
  }

  const confirmDelete = ref(false);
</script>

<style scoped>
  /* シンプルなグリッドユーティリティ（Tailwindなしでも使えるように） */
  .grid {
    display: grid;
  }
  .gap-4 {
    gap: 1rem;
  }
  .gap-3 {
    gap: 0.75rem;
  }

  .md\:grid-cols-2 {
    grid-template-columns: 1fr;
  }
  @media (min-width: 960px) {
    .md\:grid-cols-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  /* 選択肢群の縦スタックの余白 */
  .choices-stack {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
</style>
