<template>
  <v-dialog v-model="openSync" max-width="1200" scrollable persistent>
    <v-card>
      <v-card-title class="d-flex align-center" :class="'bg-primary text-white'">
        <v-icon class="mr-2">mdi-file-account</v-icon>
        経歴詳細
        <v-spacer />
        <v-btn icon variant="text" @click="close"><v-icon>mdi-close</v-icon></v-btn>
      </v-card-title>

      <v-card-text>
        <v-row dense>
          <v-col cols="12" md="8">
            <v-file-input
              v-model="file"
              accept=".xlsx,.xls"
              label="Excelを選択"
              prepend-icon="mdi-microsoft-excel"
              @change="onFileChange" />
          </v-col>
        </v-row>

        <!-- <v-overlay v-model="ui.overlay" contained persistent /> -->
        <ResumeSummaryView v-model="form" />
      </v-card-text>

      <v-divider />

      <v-card-actions class="justify-end">
        <v-btn variant="text" prepend-icon="mdi-close" @click="close">キャンセル</v-btn>
        <v-btn
          color="primary"
          prepend-icon="mdi-content-save"
          :disabled="!dirty"
          :loading="saving"
          @click="onSave"
          >保存</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import { ref, watch, computed } from 'vue';
  import ResumeSummaryView from './ResumeSummaryView.vue';
  import { parseResumeFromExcel } from './parse';

  import { ResumeData } from '@/types/models/Resume';

  const props = defineProps<{ open: boolean; modelValue?: ResumeData }>();
  const emit = defineEmits<{
    (e: 'update:open', v: boolean): void;
    (e: 'update:modelValue', v: ResumeData): void;
    (e: 'saved', v: ResumeData): void;
  }>();

  const openSync = ref(props.open);
  watch(
    () => props.open,
    (v) => (openSync.value = v)
  );
  watch(openSync, (v) => emit('update:open', v));

  const form = ref<ResumeData>(props.modelValue || {});
  watch(
    () => props.modelValue,
    (v) => {
      if (v) form.value = v;
    }
  );

  const original = ref<string>(JSON.stringify(form.value));
  const saving = ref(false);
  const file = ref<File | null>(null);

  const dirty = computed(() => JSON.stringify(form.value) !== original.value);

  function close() {
    emit('update:open', false);
  }

  async function onFileChange() {
    if (!file.value) return;
    try {
      // ui.showOverlay(true)
      const parsed = await parseResumeFromExcel(file.value);
      form.value = parsed;
      // ui.toast('取り込み完了', 'success')
    } catch (e: any) {
      // ui.alert('取り込みに失敗しました。ファイル内容をご確認ください。')
    } finally {
      // ui.showOverlay(false)
    }
  }

  async function onSave() {
    saving.value = true;
    try {
      // Stub: pretend to save
      await new Promise((r) => setTimeout(r, 600));
      original.value = JSON.stringify(form.value);
      emit('saved', form.value);
      // ui.toast('保存しました', 'success')
    } catch (e) {
      // ui.alert('保存に失敗しました')
    } finally {
      saving.value = false;
    }
  }
</script>
