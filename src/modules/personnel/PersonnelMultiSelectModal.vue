<template>
  <v-dialog v-model="dialogModel" max-width="960" scrollable>
    <v-card>
      <v-toolbar density="comfortable" color="primary" class="text-white">
        <v-icon>mdi-account-multiple-plus</v-icon>
        人材複数選択
        <v-spacer />
        <v-btn icon variant="text" @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <!-- <v-card-title class="d-flex align-center ga-2">
      </v-card-title> -->
      <v-card-text>
        <SearchBar v-model="keyword" :loading="loading" @search="onSearch" @reset="onReset">
          <template #advanced>
            <div class="d-flex ga-2">
              <v-select
                v-model="bp"
                :items="bpItems"
                label="BPフラグ"
                density="compact"
                style="max-width: 200px" />
              <v-date-input
                prepend-icon=""
                v-model="filters.案件終了日_FROM"
                label="案件終了日(FROM)"
                clearable
                style="max-width: 200px">
              </v-date-input>
              <v-date-input
                prepend-icon=""
                v-model="filters.案件終了日_TO"
                style="max-width: 200px"
                clearable
                label="案件終了日(TO)">
              </v-date-input>
            </div>
          </template>
        </SearchBar>

        <div class="mt-4">
          <template v-if="loading">
            <v-skeleton-loader type="table" />
          </template>
          <template v-else>
            <v-data-table
              :headers="headers"
              :items="items"
              item-key="人材ＩＤ"
              item-value="人材ＩＤ"
              show-select
              v-model="selectedIds"
              class="elevation-1 rounded-lg">
              <template #item.BPフラグ="{ item }">
                <v-chip size="small" :color="item.BPフラグ === 0 ? 'primary' : 'secondary'">
                  {{ item.BPフラグ === 0 ? '社員' : 'BP' }}
                </v-chip>
              </template>

              <template #bottom>
                <div class="d-flex justify-end pa-2 ga-2 align-center">
                  <span class="text-body-2">選択件数: {{ selectedIds.length }}</span>
                </div>
              </template>
            </v-data-table>
          </template>
        </div>
      </v-card-text>
      <v-divider />
      <v-card-actions class="justify-end">
        <v-btn variant="text" prepend-icon="mdi-close" @click="close"> キャンセル </v-btn>
        <v-btn
          color="primary"
          prepend-icon="mdi-check"
          :disabled="selectedIds.length === 0"
          @click="confirm">
          決定
        </v-btn>
      </v-card-actions>
      <ErrorDialog v-model:open="errorOpen" :message="errorMessage" />
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue';
  import SearchBar from '@/components/shared/SearchBar.vue';
  import ErrorDialog from '@/components/common/ErrorDialog.vue';
  import type { Personnel } from '@/types/models/Personnel';
  import { listPersonnel } from '@/composables/useApi';
  import { BP_FLAG_ITEMS } from '@/types/codes';
  import { PersonnelFilters } from '@/data/RepoStoreImp';
  import { VDateInput } from 'vuetify/labs/VDateInput';

  const props = defineProps<{
    open: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'update:open', v: boolean): void;
    (e: 'selected', v: Personnel[]): void;
  }>();

  const dialogModel = computed({
    get: () => props.open,
    set: (v: boolean) => emit('update:open', v),
  });

  const keyword = ref('');
  const bp = ref<number | undefined>(undefined);
  const bpItems = BP_FLAG_ITEMS;
  const items = ref<Personnel[]>([]);
  const selectedIds = ref<string[]>([]);
  const loading = ref(false);
  const errorOpen = ref(false);
  const errorMessage = ref('');

  const filters = ref<PersonnelFilters>({
    キーワード: '',
    // 案件終了日_FROM: '',
    // 案件終了日_TO: '',
  });

  const headers = [
    { title: '所属会社', key: '所属会社' },
    { title: '名前', key: '名前' },
    { title: '社員番号', key: '社員番号' },
    { title: '生年月日', key: '生年月日' },
    { title: '現案件終了年月日', key: '現案件終了年月日' },
    { title: 'BP', key: 'BPフラグ', width: 100 },
  ];

  watch(
    () => props.open,
    (v) => {
      if (v) {
        selectedIds.value = [];
        fetchList();
      }
    }
  );

  onMounted(() => {
    if (props.open) fetchList();
  });

  async function fetchList() {
    try {
      selectedIds.value = [];
      loading.value = true;
      const res = await listPersonnel(filters.value, 1, 100);
      items.value = res.items.filter((x) =>
        bp.value === undefined ? true : x.BPフラグ === bp.value
      );
    } catch (e) {
      errorMessage.value = '人材一覧の取得に失敗しました';
      errorOpen.value = true;
    } finally {
      loading.value = false;
    }
  }

  function onSearch(q: { keyword?: string }) {
    keyword.value = q.keyword ?? '';
    fetchList();
  }

  function onReset() {
    keyword.value = '';
    bp.value = undefined;
    fetchList();
  }

  function close() {
    emit('update:open', false);
  }

  function confirm() {
    const idSet = new Set(selectedIds.value);
    const selected = items.value.filter((p) => idSet.has(p.人材ＩＤ));
    console.log(selected);
    emit('selected', selected);
    emit('update:open', false);
  }
</script>
