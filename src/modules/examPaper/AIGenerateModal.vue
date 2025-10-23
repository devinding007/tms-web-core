<template>
  <v-dialog v-model="model" width="720" :scrim="true" close-on-back close-on-esc>
    <v-card>
      <v-toolbar density="comfortable" color="primary" class="text-white">
        <v-toolbar-title>AI一括生成（条件）</v-toolbar-title>
        <v-spacer /><v-btn icon @click="model=false"><v-icon>mdi-close</v-icon></v-btn>
      </v-toolbar>
      <v-card-text>
        <div class="d-flex flex-column" style="gap:12px">
          <v-combobox v-model="skills" :items="skillOptions" label="スキル（複数可）" multiple chips clearable />
          <div class="d-flex" style="gap:12px">
            <v-text-field v-model.number="levelFrom" type="number" min="1" max="10" label="難易度From" />
            <v-text-field v-model.number="levelTo" type="number" min="1" max="10" label="難易度To" />
            <v-text-field v-model.number="count" type="number" min="1" max="20" label="問題数" />
          </div>
          <v-alert type="info" variant="tonal">生成された問題はこの試験用紙へ追加されます（IDは新規採番）。</v-alert>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer /><v-btn variant="text" @click="model=false">キャンセル</v-btn>
        <v-btn color="primary" prepend-icon="mdi-robot" :loading="loading" @click="onGenerate">AI一括生成</v-btn>
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

const props = defineProps<{ open:boolean }>();
const emit = defineEmits<{ (e:'update:open', v:boolean): void; (e:'generated', v: Question[]): void }>();
const model = computed({ get:()=>props.open, set:(v:boolean)=>emit('update:open', v) });

const skills = ref<string[]>([]); const levelFrom = ref(3); const levelTo = ref(5); const count = ref(5);
const loading = ref(false); const skillOptions = ref<string[]>([]);
(async () => { skillOptions.value = await listSkillOptions(); })();

async function onGenerate(){
  try{
    loading.value=true;
    const result = await aiBulkGeneratePaperProblems({
      skills: skills.value,
      levelFrom: Math.min(levelFrom.value, levelTo.value),
      levelTo: Math.max(levelFrom.value, levelTo.value),
      count: count.value,
    });
    emit('generated', result);
    model.value=false;
  } finally {
    loading.value=false;
  }
}
</script>
