<template>
  <div class="p-4">
    <h2 class="text-h5 mb-4">
      <v-icon class="mr-2">mdi-view-dashboard</v-icon> ダッシュボード（スタブ）
    </h2>
    <v-card class="mb-4"><v-card-text>左のナビから各画面へ移動してください。</v-card-text></v-card>

    <v-card class="mb-4">
      <v-card-title class="d-flex align-center ga-2">
        <v-icon>mdi-eye</v-icon> 人材参照モード（モーダル）デモ <v-spacer /><v-btn
          color="primary"
          prepend-icon="mdi-magnify"
          @click="openSelectPersonnel"
          >人材を選択</v-btn
        >
      </v-card-title>
      <v-card-text>
        <div v-if="selectedPersonnel">
          選択結果：<strong>{{ selectedPersonnel.名前 }}</strong
          >（{{ selectedPersonnel.所属会社 }} / {{ selectedPersonnel.社員番号 }}）
        </div>
        <div v-else>未選択</div>
      </v-card-text>
    </v-card>

    <v-card class="mb-4">
      <v-card-title class="d-flex align-center ga-2">
        <v-icon>mdi-eye</v-icon> 問題参照モード（モーダル）デモ <v-spacer /><v-btn
          color="primary"
          prepend-icon="mdi-magnify"
          @click="openSelectQuestion"
          >問題を選択</v-btn
        >
      </v-card-title>
      <v-card-text>
        <div v-if="selectedQuestion">
          選択結果：<strong>{{ selectedQuestion.問題文章 }}</strong
          >（{{ selectedQuestion.問題ＩＤ }} / {{ selectedQuestion.スキル }}）
        </div>
        <div v-else>未選択</div>
      </v-card-text>
    </v-card>

    <v-card class="mb-4">
      <v-card-title class="d-flex align-center ga-2">
        <v-icon>mdi-eye</v-icon> 試験実施デモ <v-spacer />

        <v-text-field
          v-model="examLinkId"
          label="試験リンクID"
          hide-details
          density="comfortable"
          style="max-width: 280px" />

        <v-btn color="primary" prepend-icon="mdi-lead-pencil" @click="openExamSession"
          >試験実施</v-btn
        >
      </v-card-title>
      <v-card-text> </v-card-text>
    </v-card>

    <PersonnelSelectModal v-model:open="selectOpenPersonnel" @selected="onSelectedPersonnel" />
    <QuestionListDialog
      v-model:open="selectOpenQuestion"
      mode="select"
      @selected="onSelectedQuestion" />
  </div>
</template>
<script setup lang="ts">
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  const router = useRouter();

  import PersonnelSelectModal from '@/modules/personnel/PersonnelSelectModal.vue';
  import QuestionListDialog from '@/modules/exam/QuestionListDialog.vue';
  const selectOpenPersonnel = ref(false);
  const examLinkId = ref('EX-7M2H-20251022');
  const selectedPersonnel = ref<any>(null);
  const openSelectPersonnel = () => (selectOpenPersonnel.value = true);
  const onSelectedPersonnel = (item: any) => {
    selectedPersonnel.value = item;
  };
  const selectOpenQuestion = ref(false);
  const selectedQuestion = ref<any>(null);
  const openSelectQuestion = () => (selectOpenQuestion.value = true);
  const onSelectedQuestion = (item: any) => {
    selectedQuestion.value = item;
  };
  const openExamSession = () => {
    router.push({
      path: '/exam-session',
      query: { examLinkId: examLinkId.value },
    });
  };
</script>
