<template>
  <v-card>
    <v-card-title class="d-flex align-center ga-2">
      <v-icon>mdi-clipboard-text</v-icon> 試験一覧
      <v-spacer />
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreate">追加登録</v-btn>
    </v-card-title>
    <v-card-text>
      <SearchBar v-model="keyword" :loading="loading" @search="onSearch" @reset="onReset">
        <template #advanced>
          <div class="d-flex flex-wrap ga-2">
            <v-text-field
              v-model="filterId"
              label="試験実施ID（部分一致）"
              hide-details
              density="comfortable"
              style="max-width: 280px" />
            <v-text-field
              v-model="filterUser"
              label="参加者氏名（部分一致）"
              hide-details
              density="comfortable"
              style="max-width: 220px" />
            <v-select
              v-model="filterStatus"
              :items="statusItems"
              label="試験ステータス"
              hide-details
              density="comfortable"
              style="max-width: 220px" />
          </div>
        </template>
      </SearchBar>

      <div class="mt-4">
        <template v-if="loading"><v-skeleton-loader type="table" /></template>
        <template v-else>
          <v-data-table
            :headers="headers"
            :items="items"
            :items-per-page="pageSize"
            :page="page"
            item-key="試験ＩＤ"
            class="elevation-1 rounded-lg">
            <template #item.試験ステータス="{ item }"
              ><v-chip
                size="small"
                :color="EXAM_RUN_STATUS_COLOR[item.試験ステータス]"
                variant="tonal"
                >{{ statusLabel(item.試験ステータス) }}</v-chip
              ></template
            >
            <template #item.actions="{ item }">
              <div class="d-flex ga-2">
                <v-btn size="small" color="secondary" prepend-icon="mdi-eye" @click="openView(item)"
                  >参照</v-btn
                >
                <v-btn
                  size="small"
                  color="primary"
                  prepend-icon="mdi-pencil"
                  @click="openEdit(item)"
                  >編集</v-btn
                >
              </div>
            </template>
            <template #bottom>
              <div class="d-flex justify-end pa-2 ga-2 align-center">
                <v-select
                  :items="[5, 10, 20]"
                  v-model="pageSize"
                  density="compact"
                  label="ページサイズ"
                  style="max-width: 140px" />
                <v-pagination v-model="page" :length="pageCount" @update:modelValue="fetchList" />
              </div>
            </template>
          </v-data-table>
        </template>
      </div>
    </v-card-text>
  </v-card>

  <ExamRunDetailModal
    v-model:open="detailOpen"
    :mode="detailMode"
    :run-id="editingId"
    @saved="fetchList" />
</template>
<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import SearchBar from '@/components/shared/SearchBar.vue';
  import { listExamRuns } from './api';
  import { EXAM_RUN_STATUS, EXAM_RUN_STATUS_COLOR } from '@/types/codes';
  import ExamRunDetailModal from './ExamRunDetailModal.vue';
  import type { ExamRun } from '@/types/models/ExamRun';

  const items = ref<ExamRun[]>([]);
  const total = ref(0);
  const page = ref(1);
  const pageSize = ref(10);
  const loading = ref(true);
  const keyword = ref('');
  const filterId = ref('');
  const filterUser = ref('');
  const filterStatus = ref<number | undefined>(undefined);
  const statusItems = Object.entries(EXAM_RUN_STATUS).map(([value, title]) => ({
    title,
    value: Number(value),
  }));

  const headers = [
    { title: '試験ＩＤ', key: '試験ＩＤ', width: 280 },
    { title: '参加者氏名', key: '参加者氏名', width: 180 },
    { title: '試験ステータス', key: '試験ステータス', width: 160 },
    { title: '試験実施日時', key: '試験実施日時', width: 160 },
    { title: '操作', key: 'actions', width: 200, sortable: false },
  ];
  const pageCount = computed(() => Math.ceil(total.value / pageSize.value));
  function statusLabel(v: number) {
    return (EXAM_RUN_STATUS as any)[v] || v;
  }

  async function fetchList() {
    loading.value = true;
    const res = await listExamRuns(
      {
        idLike: filterId.value || undefined,
        userLike: filterUser.value || undefined,
        status: filterStatus.value as any,
        keyword: keyword.value || undefined,
      },
      page.value,
      pageSize.value
    );
    items.value = res.items;
    total.value = res.total;
    loading.value = false;
  }
  onMounted(fetchList);
  function onSearch(q: any) {
    keyword.value = q.keyword || '';
    page.value = 1;
    fetchList();
  }
  function onReset() {
    keyword.value = '';
    filterId.value = '';
    filterUser.value = '';
    filterStatus.value = undefined;
    page.value = 1;
    fetchList();
  }

  const detailOpen = ref(false);
  const detailMode = ref<'view' | 'edit' | 'create'>('create');
  const editingId = ref<string | undefined>(undefined);
  function openCreate() {
    detailMode.value = 'create';
    editingId.value = undefined;
    detailOpen.value = true;
  }
  function openEdit(item: ExamRun) {
    detailMode.value = 'edit';
    editingId.value = item.試験ＩＤ;
    detailOpen.value = true;
  }
  function openView(item: ExamRun) {
    detailMode.value = 'view';
    editingId.value = item.試験ＩＤ;
    detailOpen.value = true;
  }
</script>
