<template>
  <v-dialog v-model="model" width="720" :scrim="true" close-on-back close-on-esc>
    <v-card>
      <v-toolbar density="comfortable" color="primary" class="text-white">
        <v-toolbar-title>AI一括生成（条件）</v-toolbar-title>
        <v-spacer /><v-btn icon @click="model = false"><v-icon>mdi-close</v-icon></v-btn>
      </v-toolbar>
      <v-card-text>
        <div class="d-flex flex-column" style="gap: 12px">
          <v-combobox
            v-model="skills"
            :items="skillOptions"
            label="スキル（複数可）"
            multiple
            chips
            clearable />
          <v-textarea
            v-model="jobPosting"
            label="案件募集要項（入力すると内容からスキルを抽出）"
            auto-grow
            rows="3"
            clearable />
          <div class="text-caption text-medium-emphasis">
            ※スキル と 案件募集要項 のどちらか一方で構いません。
          </div>
          <div class="d-flex" style="gap: 12px">
            <v-text-field
              v-model.number="levelFrom"
              type="number"
              min="1"
              max="10"
              label="難易度From" />
            <v-text-field
              v-model.number="levelTo"
              type="number"
              min="1"
              max="10"
              label="難易度To" />
            <v-text-field v-model.number="count" type="number" min="1" max="20" label="問題数" />
          </div>
          <v-alert v-if="!canGenerate" type="warning" variant="tonal" density="comfortable">
            スキル または 案件募集要項 を入力してください。
          </v-alert>
          <v-alert type="info" variant="tonal"
            >生成された問題はこの試験用紙へ追加されます（IDは新規採番）。</v-alert
          >
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer /><v-btn variant="text" @click="model = false">キャンセル</v-btn>
        <v-btn
          :disabled="!canGenerate"
          color="primary"
          prepend-icon="mdi-robot"
          :loading="loading"
          @click="onGenerate"
          >AI一括生成</v-btn
        >
      </v-card-actions>
      <v-overlay :model-value="loading" persistent />
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { aiBulkGeneratePaperProblems } from './api';
  import { listSkillOptions } from '@/composables/useApi';
  import type { Question } from '@/types/models/Question';

  const props = defineProps<{ open: boolean }>();
  const emit = defineEmits<{
    (e: 'update:open', v: boolean): void;
    (e: 'generated', v: Question[]): void;
  }>();
  const model = computed({ get: () => props.open, set: (v: boolean) => emit('update:open', v) });

  const skills = ref<string[]>([]);
  const jobPosting = ref<string>('');
  const levelFrom = ref(3);
  const levelTo = ref(5);
  const count = ref(5);
  const loading = ref(false);
  const skillOptions = ref<string[]>([]);
  (async () => {
    skillOptions.value = await listSkillOptions();
  })();

  const canGenerate = computed(
    () =>
      (skills.value && skills.value.length > 0) ||
      (jobPosting.value && jobPosting.value.trim().length > 0)
  );

  async function onGenerate() {
    if (!canGenerate.value) return;
    try {
      loading.value = true;
      const result = await aiBulkGeneratePaperProblems({
        skills: skills.value,
        jobPosting: jobPosting.value.trim() || undefined,
        levelFrom: Math.min(levelFrom.value, levelTo.value),
        levelTo: Math.max(levelFrom.value, levelTo.value),
        count: count.value,
      });
      emit('generated', result);
      model.value = false;
    } catch (e: any) {
      alert(e?.message || 'AI生成に失敗しました');
    } finally {
      loading.value = false;
    }
  }
</script>
