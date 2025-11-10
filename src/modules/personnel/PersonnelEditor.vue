<template>
  <v-dialog v-model="model" width="720" :scrim="true" close-on-back close-on-esc>
    <v-card class="fixed-dialog">
      <v-toolbar density="comfortable" color="primary" class="text-white">
        <v-toolbar-title>{{ isNew ? '新規登録' : '編集' }}</v-toolbar-title>
        <v-spacer /><v-btn icon @click="onCancel" title="閉じる"><v-icon>mdi-close</v-icon></v-btn>
      </v-toolbar>
      <v-card-text>
        <v-row dense>
          <v-col cols="12" md="6"
            ><v-text-field
              label="人材ID（自動生成・編集不可）"
              :model-value="form.人材ＩＤ || '(新規作成時に自動生成)'"
              disabled
          /></v-col>
          <v-col cols="12" md="6"><v-text-field v-model="form.所属会社" label="所属会社" /></v-col>
          <v-col cols="12" md="6"><v-text-field v-model="form.名前" label="名前" /></v-col>
          <v-col cols="12" md="6"><v-text-field v-model="form.社員番号" label="社員番号" /></v-col>
          <v-col cols="12" md="6"
            ><v-text-field v-model="form.生年月日" label="生年月日(YYYYMMDD)"
          /></v-col>
          <v-col cols="12" md="6"
            ><v-text-field v-model="form.現案件終了年月日" label="現案件終了年月日(YYYYMMDD)"
          /></v-col>
          <v-col cols="12" md="6"
            ><v-select
              v-model="form.BPフラグ"
              :items="[
                { title: '社員', value: 0 },
                { title: 'BP', value: 1 },
              ]"
              label="BPフラグ"
          /></v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer /><v-btn variant="text" @click="onCancel">キャンセル</v-btn>
        <v-btn
          color="primary"
          :loading="saving"
          :disabled="!dirty"
          @click="onSave"
          prepend-icon="mdi-content-save"
          >保存</v-btn
        >
      </v-card-actions>
      <v-overlay :model-value="saving" persistent />
    </v-card>
  </v-dialog>
  <ErrorDialog v-model:open="errorOpen" :message="errorMessage" />
</template>
<script setup lang="ts">
  import { computed, reactive, watch, ref, nextTick } from 'vue';
  import type { Personnel } from '@/types/models/Personnel';
  import { useToast } from '@/plugins/toast';
  import ErrorDialog from '@/components/common/ErrorDialog.vue';
  import { createPersonnel, updatePersonnel } from '@/composables/useApi';

  const props = defineProps<{ open: boolean; item?: Personnel | null }>();
  const emit = defineEmits<{
    (e: 'update:open', v: boolean): void;
    (e: 'saved', v: Personnel): void;
  }>();

  const model = computed({ get: () => props.open, set: (v: boolean) => emit('update:open', v) });
  const isNew = computed(() => !props.item?.人材ＩＤ);

  const form = reactive<Personnel>({
    人材ＩＤ: props.item?.人材ＩＤ || '',
    所属会社: props.item?.所属会社 || '',
    名前: props.item?.名前 || '',
    社員番号: props.item?.社員番号 || '',
    生年月日: props.item?.生年月日 || '',
    現案件終了年月日: props.item?.現案件終了年月日 || '',
    BPフラグ: props.item?.BPフラグ ?? 0,
  });

  // 初期スナップショットを保持（dirty判定用）
  const original = ref('');
  watch(
    () => props.item,
    async (v) => {
      form.人材ＩＤ = v?.人材ＩＤ || '';
      form.所属会社 = v?.所属会社 || '';
      form.名前 = v?.名前 || '';
      form.社員番号 = v?.社員番号 || '';
      form.生年月日 = v?.生年月日 || '';
      form.現案件終了年月日 = v?.現案件終了年月日 || '';
      form.BPフラグ = v?.BPフラグ ?? 0;
      await nextTick();
      original.value = JSON.stringify(form);
    },
    { immediate: true }
  );

  const dirty = computed(() => JSON.stringify(form) !== original.value);

  const toast = useToast();
  const saving = ref(false);
  const errorOpen = ref(false);
  const errorMessage = ref('');

  async function onSave() {
    try {
      saving.value = true;
      let res: Personnel;
      if (isNew.value) {
        // 人材ID は自動生成のため送信しない
        const { 人材ID: _omit, ...payload } = form as any;
        res = await createPersonnel(payload);
      } else {
        res = await updatePersonnel(form);
      }
      toast.show('保存しました', 'success');
      emit('saved', res);
      original.value = JSON.stringify(form);
      model.value = false;
    } catch (e) {
      errorMessage.value = '保存に失敗しました';
      errorOpen.value = true;
    } finally {
      saving.value = false;
    }
  }
  function onCancel() {
    model.value = false;
  }
</script>
