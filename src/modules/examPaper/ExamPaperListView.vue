<template>
  <v-card>
    <v-card-title class="d-flex align-center ga-2">
      <v-icon>mdi-file-document-multiple</v-icon> 試験用紙管理
      <v-spacer />
      <v-btn v-if="mode === 'edit'" color="primary" prepend-icon="mdi-plus" @click="openCreate"
        >追加登録</v-btn
      >
    </v-card-title>

    <v-card-text>
      <SearchBar v-model="keyword" :loading="loading" @search="onSearch" @reset="onReset">
        <template #advanced>
          <div class="d-flex flex-wrap ga-2">
            <v-text-field
              v-model="filterName"
              label="試験用紙名称"
              hide-details
              density="comfortable"
              style="max-width: 320px" />
            <v-text-field
              v-model="filterDesc"
              label="説明（部分一致）"
              hide-details
              density="comfortable"
              style="max-width: 480px" />
          </div>
        </template>
      </SearchBar>

      <div class="mt-4">
        <template v-if="loading"><v-skeleton-loader type="table" /></template>
        <template v-else>
          <v-data-table
            :headers="computedHeaders"
            :items="items"
            :items-per-page="pageSize"
            :page="page"
            item-key="試験用紙ＩＤ"
            class="elevation-1 rounded-lg"
            @click:row="onRowClick">
            <template #item.作成日時="{ item }">{{
              new Date(item.作成日時).toLocaleString()
            }}</template>
            <template v-if="mode === 'edit'" #item.actions="{ item }">
              <div class="d-flex ga-2">
                <v-btn
                  size="small"
                  color="secondary"
                  prepend-icon="mdi-eye"
                  @click.stop="openView(item)"
                  >参照</v-btn
                >
                <v-btn
                  size="small"
                  color="primary"
                  prepend-icon="mdi-pencil"
                  @click.stop="openEdit(item)"
                  >編集</v-btn
                >
                <v-btn
                  size="small"
                  color="error"
                  prepend-icon="mdi-delete"
                  :loading="deletingId === item.試験用紙ＩＤ"
                  @click.stop="onDelete(item)"
                  >削除</v-btn
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

  <ExamPaperDetailModal
    v-model:open="detailOpen"
    :mode="detailMode"
    :paper-id="editingId"
    @saved="fetchList()" />
  <ErrorDialog v-model:open="errorOpen" :message="errorMessage" />
</template>
<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import SearchBar from '@/components/shared/SearchBar.vue';
  import ErrorDialog from '@/components/common/ErrorDialog.vue';
  import ExamPaperDetailModal from './ExamPaperDetailModal.vue';
  import type { ExamPaper } from '@/types/models/ExamPaper';
  import { useToast } from '@/plugins/toast';
  import { deleteExamPaper, listExamPapers } from '@/composables/useApi';

  const props = withDefaults(defineProps<{ mode?: 'edit' | 'select' }>(), { mode: 'edit' });
  const emit = defineEmits<{ (e: 'selected', v: ExamPaper): void }>();

  const toast = useToast();
  const keyword = ref('');
  const filterName = ref('');
  const filterDesc = ref('');
  const items = ref<ExamPaper[] | undefined>([]);
  const total = ref(0);
  const page = ref(1);
  const pageSize = ref(10);
  const pageCount = computed(() => Math.ceil(total.value / pageSize.value));
  const headersBase = [
    { title: '試験用紙名称', key: '試験用紙名称', width: 280 },
    { title: '説明', key: '説明' },
    { title: '作成日時', key: '作成日時', width: 200 },
  ];
  const computedHeaders = computed(() =>
    props.mode === 'edit'
      ? [...headersBase, { title: '操作', key: 'actions', width: 300, sortable: false }]
      : headersBase
  );
  const loading = ref(true);
  const deletingId = ref<string | null>(null);
  const errorOpen = ref(false);
  const errorMessage = ref('');
  const detailOpen = ref(false);
  const detailMode = ref<'view' | 'edit' | 'create'>('view');
  const editingId = ref<string | undefined>(undefined);

  onMounted(() => {
    fetchList();
  });

  async function fetchList() {
    try {
      loading.value = true;
      const res = await listExamPapers(
        {
          名称: filterName.value || undefined,
          説明: filterDesc.value || undefined,
          keyword: keyword.value || undefined,
        },
        page.value,
        pageSize.value
      );
      items.value = res.items;
      total.value = res.total;
    } catch (e) {
      errorMessage.value = '検索に失敗しました';
      errorOpen.value = true;
    } finally {
      loading.value = false;
    }
  }
  function onSearch(q: { keyword?: string }) {
    keyword.value = q.keyword ?? '';
    page.value = 1;
    fetchList();
  }
  function onReset() {
    keyword.value = '';
    filterName.value = '';
    filterDesc.value = '';
    page.value = 1;
    fetchList();
  }
  function openCreate() {
    detailMode.value = 'create';
    editingId.value = undefined;
    detailOpen.value = true;
  }
  function openEdit(item: ExamPaper) {
    detailMode.value = 'edit';
    editingId.value = item.試験用紙ＩＤ;
    detailOpen.value = true;
  }
  function openView(item: ExamPaper) {
    detailMode.value = 'view';
    editingId.value = item.試験用紙ＩＤ;
    detailOpen.value = true;
  }
  async function onDelete(item: ExamPaper) {
    if (!confirm('削除しますか？')) return;
    try {
      deletingId.value = item.試験用紙ＩＤ;
      await deleteExamPaper(item.試験用紙ＩＤ);
      toast.show('削除しました', 'success');
      fetchList();
    } catch (e) {
      errorMessage.value = '削除に失敗しました';
      errorOpen.value = true;
    } finally {
      deletingId.value = null;
    }
  }
  function onRowClick(e: MouseEvent, ctx: any) {
    if (props.mode === 'select' && ctx?.item) emit('selected', ctx.item as ExamPaper);
  }
</script>
