<template>
  <v-dialog v-model="openSync" max-width="1200" scrollable persistent>
    <v-card>
      <v-card-title class="d-flex align-center ga-2" :class="'bg-primary text-white'">
        <v-icon class="mr-2">mdi-file-account</v-icon>
        経歴詳細
        <v-chip v-if="props.personnelId">{{ props.personnelId }}</v-chip>
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

        <v-alert v-if="!form" type="info" variant="plain"
          >「エクセル選択」をクリックして経歴書をアップロードしてください。経歴データ取り込み後、「AI経歴分析」ボタンを押下してください。</v-alert
        >

        <!-- === 外枠: AI分析結果 === -->
        <v-card variant="outlined" class="pa-2" v-if="form?.AI分析結果">
          <v-card-title class="d-flex align-center" @click="expandAIAnalysis = !expandAIAnalysis">
            <v-icon class="mr-2">mdi-robot-outline</v-icon>
            AI分析結果
            <v-spacer /><v-chip>クリックして{{ !expandAIAnalysis ? '展開' : '折り畳む' }}</v-chip>
          </v-card-title>
          <v-divider />
          <v-card-text>
            <v-expand-transition>
              <!--  -->
              <SkillSummaryView v-show="expandAIAnalysis" :skill-summary="form?.AI分析結果" />
            </v-expand-transition>
          </v-card-text>
        </v-card>

        <!-- <v-overlay v-model="ui.overlay" contained persistent /> -->
        <v-card variant="outlined" class="pa-2 mt-4" v-if="form">
          <!-- expandProfile -->
          <v-card-title class="d-flex align-center" @click="expandProfile = !expandProfile">
            <v-icon class="mr-2">mdi-account</v-icon>
            経歴データ
            <v-spacer /><v-chip>クリックして{{ !expandProfile ? '展開' : '折り畳む' }}</v-chip>
          </v-card-title>
          <v-divider />

          <v-expand-transition>
            <v-card-text v-show="expandProfile">
              <ResumeSummaryView class="mt-4" v-model="form" />
            </v-card-text>
          </v-expand-transition>
        </v-card>
      </v-card-text>

      <v-divider />

      <v-card-actions class="justify-end">
        <v-btn variant="text" prepend-icon="mdi-close" @click="close">キャンセル</v-btn>
        <v-btn
          variant="text"
          color="primary"
          :disabled="!dirty"
          prepend-icon="mdi-robot-outline"
          :loading="analysing"
          @click="onAnalyse"
          >AI経歴分析</v-btn
        >
        <v-btn
          color="primary"
          prepend-icon="mdi-content-save"
          :disabled="!dirty"
          :loading="saving"
          @click="openResumeSaveModal = true"
          >保存</v-btn
        >
      </v-card-actions>
    </v-card>

    <ResumeSaveModal v-model:open="openResumeSaveModal" @saved="onSave" />
  </v-dialog>
</template>

<script setup lang="ts">
  import { ref, watch, computed } from 'vue';
  import SkillSummaryView from './SkillSummaryView.vue';
  import ResumeSummaryView from './ResumeSummaryView.vue';
  import ResumeSaveModal from './ResumeSaveModal.vue';
  import { parseResumeFromExcel } from './parse';

  import { ResumeData } from '@/types/models/Resume';
  import { aiAnalyseResume } from '@/composables/useApi';
  import { useToast } from '@/plugins/toast';
  import type { SaveSelections } from '@/types/models/Resume';
  import { PersonnelStoreRepo, ResumeDataStoreRepo, SkillStoreRepo } from '@/data/RepoStoreImp';
  import { PersonnelSkillPayload } from '@/types/models/Skill';
  import cloneDeep from 'lodash.clonedeep';
  import { toRaw } from 'vue';

  const props = defineProps<{ open: boolean; personnelId?: string }>();
  const emit = defineEmits<{
    (e: 'update:open', v: boolean): void;
    (e: 'update:modelValue', v: ResumeData): void;
    (e: 'saved', v: ResumeData | undefined): void;
  }>();

  const toast = useToast();

  const expandAIAnalysis = ref(true);
  const expandProfile = ref(true);

  // const skillSummary = ref<SkillSummary>();
  const openResumeSaveModal = ref(false);
  const openSync = ref(props.open);
  watch(
    () => props.open,
    (v) => (openSync.value = v)
  );
  watch(openSync, (v) => emit('update:open', v));
  watch(openSync, (v) => {
    if (v && props.personnelId) {
      // 人材ＩＤで経歴データを検索する
      // TODO
      file.value = null;
      form.value = new ResumeDataStoreRepo().findById(props.personnelId);
    }
  });

  const form = ref<ResumeData | undefined>();
  // watch(
  //   () => props.modelValue,
  //   (v) => {
  //     if (v) form.value = v;
  //   }
  // );

  const original = ref<string>(JSON.stringify(form.value));
  const saving = ref(false);
  const analysing = ref(false);
  const file = ref<File | null>(null);

  const dirty = computed(() => JSON.stringify(form.value) !== original.value);

  async function onAnalyse() {
    try {
      analysing.value = true;
      const resp = await aiAnalyseResume(form.value);
      form.value!.AI分析結果 = resp;
    } catch (e) {
      // errorMessage.value = 'AI生成に失敗しました';
      // errorOpen.value = true;
    } finally {
      analysing.value = false;
    }
  }

  function close() {
    emit('update:open', false);
  }

  async function onFileChange() {
    if (form.value && form.value.AI分析結果) form.value!.AI分析結果 = undefined;
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

  async function onSave(selections: SaveSelections) {
    const personnelRepo = new PersonnelStoreRepo();
    const resumeRepo = new ResumeDataStoreRepo();
    const skillRepo = new SkillStoreRepo();
    saving.value = true;
    try {
      if (props.personnelId && form.value) {
        // debugger;
        const person = personnelRepo.findById(props.personnelId);
        const resumeData = cloneDeep(toRaw(form.value));
        resumeData.人材ＩＤ = props.personnelId;
        console.log('save started');
        if (selections.basic) {
          person!.名前 = form.value.氏名!;
          personnelRepo.save(person!);
          console.log('personnel saved');
        }
        if (!selections.analysis) {
          resumeData.AI分析結果 = undefined;
        }
        if (selections.resume) {
          resumeRepo.save(resumeData);
          console.log('resume saved');
        }
        // AI経歴分析済の場合
        if (form.value.AI分析結果 && form.value.AI分析結果.スキル採点) {
          // 分析結果の反映
          const skillData: PersonnelSkillPayload = {
            人材ＩＤ: props.personnelId,
            スキル: [],
          };
          if (selections.analysis) {
            // AI分析結果からスキルデータに変換する
            form.value.AI分析結果?.スキル採点.forEach((skillScore) => {
              skillData.スキル.push({
                スキル名: skillScore.スキル名,
                スキル点数: skillScore.点数,
              });
            });
            skillRepo.save(skillData);
            console.log('skill saved');
          }
        }
      }
      // if (!form) return;
      // Stub: pretend to save
      await new Promise((r) => setTimeout(r, 600));
      original.value = JSON.stringify(form.value);
      emit('saved', form.value);
      console.log(selections);
      toast.show('保存しました', 'success');
      openSync.value = false;
    } catch (e) {
      // ui.alert('保存に失敗しました')
    } finally {
      saving.value = false;
    }
  }
</script>
