<template>
  <v-dialog
    v-model="model"
    :scrim="true"
    :max-width="isFullscreen ? undefined : 1200"
    :fullscreen="isFullscreen"
    close-on-esc
    close-on-back>
    <v-card class="d-flex flex-column h-100">
      <!-- 上部はタイトル＋閉じるのみ（操作は一覧側に委譲） -->
      <v-toolbar density="comfortable" color="primary">
        <v-toolbar-title>
          <v-icon class="mr-2">mdi-book-open</v-icon>{{ title }}
          <span v-if="mode === 'select'">（選択）</span>
          <span v-else>（編集）</span>
        </v-toolbar-title>
        <v-spacer />
        <v-btn icon variant="text" @click="isFullscreen = !isFullscreen">
          <v-icon>
            {{ isFullscreen ? 'mdi-window-restore' : 'mdi-window-maximize' }}
          </v-icon>
        </v-btn>
        <v-btn icon @click="model = false" title="閉じる">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="dialog-body">
        <!-- 一覧本体：既存の QuestionListView を流用 -->
        <QuestionListView :mode="mode" @selected="onPick" />
      </v-card-text>

      <!-- 下部：閉じるボタンのみ（選択はダブルクリック or onPickでハンドリング）-->
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="model = false">閉じる</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue';
  import QuestionListView from './QuestionListView.vue';
  import type { Question } from '@/types/models/Question';

  const props = withDefaults(
    defineProps<{
      open: boolean;
      /** 'select' = 参照モード（操作列非表示／ダブルクリックで返却）
       *  'edit'   = 編集モード（操作列表示／新規・編集・削除可能） */
      mode?: 'select' | 'edit';
      /** タイトル（既定: '問題一覧'） */
      title?: string;
      /** 選択時に自動でダイアログを閉じる（既定: true） */
      closeOnSelect?: boolean;
    }>(),
    { mode: 'select', title: '問題一覧', closeOnSelect: true }
  );
  const isFullscreen = ref(false);

  const emit = defineEmits<{
    (e: 'update:open', v: boolean): void;
    (e: 'selected', v: Question): void;
  }>();

  const model = computed({
    get: () => props.open,
    set: (v: boolean) => emit('update:open', v),
  });

  function onPick(q: Question) {
    emit('selected', q);
    if (props.closeOnSelect) model.value = false;
  }
</script>

<style scoped>
  /* モーダル内部で一覧がはみ出さないように最大高さを制御して縦スクロール */
  .dialog-body {
    /* max-height: 70vh; */
    overflow: auto;
  }
</style>
