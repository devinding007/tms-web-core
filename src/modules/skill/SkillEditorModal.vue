<template>
  <v-dialog v-model="model" width="860" :scrim="true" close-on-esc close-on-back>
    <v-card class="fixed-dialog">
      <v-toolbar color="primary" density="comfortable" class="text-white">
        <v-toolbar-title>人材スキル管理</v-toolbar-title>
        <v-spacer /><v-btn icon @click="model = false"><v-icon>mdi-close</v-icon></v-btn>
      </v-toolbar>
      <v-card-text>
        <template v-if="loading"><v-skeleton-loader type="table" /></template>
        <template v-else>
          <v-data-table
            :headers="headers"
            :items="rows"
            item-key="__rowId"
            class="elevation-1 rounded-lg">
            <template #item.スキル名="{ item }"
              ><v-autocomplete
                v-model="item.スキル名"
                :items="skillOptions"
                label="スキル名"
                hide-details
                density="comfortable"
                :menu-props="{ maxHeight: 300 }"
            /></template>
            <template #item.スキル点数="{ item }"
              ><v-text-field
                v-model.number="item.スキル点数"
                type="number"
                min="1"
                max="100"
                density="comfortable"
                hide-details
                style="max-width: 120px"
            /></template>
            <template #item.actions="{ item }"
              ><v-btn icon size="small" color="error" @click="removeRow(item)"
                ><v-icon>mdi-delete</v-icon></v-btn
              ></template
            >
            <template #bottom
              ><div class="d-flex justify-space-between pa-2">
                <v-btn variant="tonal" prepend-icon="mdi-plus" @click="addRow">スキル追加</v-btn>
                <div /></div
            ></template>
          </v-data-table>
        </template>
      </v-card-text>
      <v-card-actions
        ><v-spacer /><v-btn variant="text" @click="model = false">閉じる</v-btn
        ><v-btn
          color="primary"
          :loading="saving"
          :disabled="!dirty"
          @click="onSave"
          prepend-icon="mdi-content-save"
          >保存</v-btn
        ></v-card-actions
      >
      <v-overlay :model-value="saving" persistent />
    </v-card>
  </v-dialog>
  <ErrorDialog v-model:open="errorOpen" :message="errorMessage" />
</template>
<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import { getSkillsByPersonnelId, listSkillOptions, saveSkills } from '@/composables/useApi';
  import type { SkillItem } from '@/types/models/Skill';
  import { useToast } from '@/plugins/toast';
  import ErrorDialog from '@/components/common/ErrorDialog.vue';

  const props = defineProps<{ open: boolean; personnelId: string }>();
  const emit = defineEmits<{ (e: 'update:open', v: boolean): void }>();
  const model = computed({ get: () => props.open, set: (v: boolean) => emit('update:open', v) });

  const headers = [
    { title: 'スキル名', key: 'スキル名' },
    { title: 'スキル点数', key: 'スキル点数', width: 160 },
    { title: '操作', key: 'actions', width: 80, sortable: false },
  ];
  const rows = ref<(SkillItem & { __rowId: string })[]>([]);
  const original = ref<string>('');
  const loading = ref(true);
  const saving = ref(false);
  const skillOptions = ref<string[]>([]);
  watch(
    () => props.open,
    async (v) => {
      if (v) await load();
    },
    { immediate: true }
  );
  async function load() {
    loading.value = true;
    try {
      const [items, options] = await Promise.all([
        getSkillsByPersonnelId(props.personnelId),
        listSkillOptions(),
      ]);
      rows.value = items.map((x) => ({
        ...x,
        __rowId: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
      }));
      skillOptions.value = options;
      original.value = JSON.stringify(rows.value.map(({ __rowId, ...rest }) => rest));
    } finally {
      loading.value = false;
    }
  }
  const dirty = computed(
    () => JSON.stringify(rows.value.map(({ __rowId, ...rest }) => rest)) !== original.value
  );
  function addRow() {
    rows.value.push({
      スキル名: '',
      スキル点数: 50,
      __rowId: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
    });
  }
  function removeRow(item: any) {
    rows.value = rows.value.filter((x) => x.__rowId !== item.__rowId);
  }
  const toast = useToast();
  const errorOpen = ref(false);
  const errorMessage = ref('');
  async function onSave() {
    try {
      saving.value = true;
      await saveSkills({
        人材ＩＤ: props.personnelId,
        スキル: rows.value.map(({ __rowId, ...rest }) => rest),
      });
      original.value = JSON.stringify(rows.value.map(({ __rowId, ...rest }) => rest));
      toast.show('保存しました', 'success');
      model.value = false;
    } catch (e) {
      errorMessage.value = '保存に失敗しました';
      errorOpen.value = true;
    } finally {
      saving.value = false;
    }
  }
</script>
