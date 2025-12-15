<template>
  <v-card
    ><v-card-title class="d-flex align-center ga-2"
      ><v-icon>mdi-book-open</v-icon> 問題管理<v-spacer /><v-btn
        v-if="mode === 'edit'"
        color="primary"
        prepend-icon="mdi-plus"
        @click="openCreate"
        >追加登録</v-btn
      ></v-card-title
    ><v-card-text
      ><SearchBar v-model="keyword" :loading="loading" @search="onSearch" @reset="onReset"
        ><template #advanced
          ><div class="d-flex flex-wrap ga-2">
            <v-text-field
              v-model="filterId"
              label="問題ＩＤ(UUID)"
              hide-details
              density="comfortable"
              style="max-width: 320px" /><v-select
              v-model="filterSkill"
              :items="skillOptions"
              label="スキル"
              hide-details
              density="comfortable"
              style="max-width: 200px" /><v-text-field
              v-model.number="filterLvFrom"
              type="number"
              min="1"
              max="10"
              label="難易度From"
              hide-details
              density="comfortable"
              style="max-width: 140px" /><v-text-field
              v-model.number="filterLvTo"
              type="number"
              min="1"
              max="10"
              label="難易度To"
              hide-details
              density="comfortable"
              style="max-width: 140px" /><v-select
              v-model="filterAuto"
              :items="[
                { title: '指定なし', value: undefined },
                { title: '手動', value: 0 },
                { title: '自動生成', value: 1 },
              ]"
              label="自動生成"
              hide-details
              density="comfortable"
              style="max-width: 200px" /></div></template
      ></SearchBar>
      <div class="mt-4">
        <template v-if="loading"><v-skeleton-loader type="table" /></template
        ><template v-else
          ><v-data-table
            :headers="computedHeaders"
            :items="items"
            :items-per-page="-1"
            :hide-default-footer="true"
            :page="page"
            item-key="問題ＩＤ"
            class="elevation-1 rounded-lg"
            @click:row="onRowClick"
            ><template #item.自動生成フラグ="{ item }"
              ><v-chip size="small" :color="item.自動生成フラグ === 1 ? 'secondary' : 'primary'">{{
                item.自動生成フラグ === 1 ? '自動' : '手動'
              }}</v-chip>
            </template>
            <template v-if="mode === 'select'" #item.actions="{ item }">
              <div class="d-flex ga-2">
                <v-btn
                  size="small"
                  color="secondary"
                  prepend-icon="mdi-eye"
                  @click.stop="openView(item)"
                  >参照</v-btn
                >
              </div>
            </template>
            <template v-if="mode === 'edit'" #item.actions="{ item }"
              ><div class="d-flex ga-2">
                <v-btn
                  size="small"
                  color="primary"
                  prepend-icon="mdi-pencil"
                  @click.stop="openEdit(item)"
                  >編集</v-btn
                ><v-btn
                  size="small"
                  color="error"
                  prepend-icon="mdi-delete"
                  :loading="deletingId === item.問題ＩＤ"
                  @click.stop="onDelete(item)"
                  >削除</v-btn
                >
              </div></template
            ><template #bottom
              ><div class="d-flex justify-end pa-2 ga-2 align-center">
                <v-select
                  :items="[5, 10, 20]"
                  v-model="pageSize"
                  density="compact"
                  label="ページサイズ"
                  style="max-width: 140px" /><v-pagination
                  v-model="page"
                  :length="pageCount"
                  @update:modelValue="fetchList" /></div></template></v-data-table
        ></template></div></v-card-text></v-card
  ><QuestionDetailModal
    v-model:open="detailOpen"
    :mode="detailMode"
    :question-id="editingId"
    @saved="onRefetch"
    @deleted="onRefetch" /><ErrorDialog v-model:open="errorOpen" :message="errorMessage" />
</template>
<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import SearchBar from '@/components/shared/SearchBar.vue';
  import ErrorDialog from '@/components/common/ErrorDialog.vue';
  import QuestionDetailModal from './QuestionDetailModal.vue';
  import { listQuestions, listSkillOptions, deleteQuestion } from '@/composables/useApi';
  import type { Question } from '@/types/models/Question';
  import { useToast } from '@/plugins/toast';
  const props = withDefaults(defineProps<{ mode?: 'edit' | 'select' }>(), { mode: 'edit' });
  const emit = defineEmits<{ (e: 'selected', v: Question): void }>();
  const toast = useToast();
  const keyword = ref<string>('');
  const filterId = ref<string>('');
  const filterSkill = ref<string | undefined>(undefined);
  const filterLvFrom = ref<number | undefined>(undefined);
  const filterLvTo = ref<number | undefined>(undefined);
  const filterAuto = ref<0 | 1 | undefined>(undefined);
  const items = ref<Question[]>([]);
  const total = ref(0);
  const page = ref(1);
  const pageSize = ref(10);
  const pageCount = computed(() => Math.ceil(total.value / pageSize.value));
  const headersBase = [
    { title: '問題ＩＤ', key: '問題ＩＤ', width: 320 },
    { title: 'スキル', key: 'スキル', width: 140 },
    { title: '難易度', key: '難易度', width: 100 },
    { title: '問題文章', key: '問題文章' },
    { title: '自動生成', key: '自動生成フラグ', width: 120 },
  ];
  const computedHeaders = computed(() =>
    props.mode === 'edit'
      ? [...headersBase, { title: '操作', key: 'actions', width: 200, sortable: false }]
      : [...headersBase, { title: '操作', key: 'actions', width: 100, sortable: false }]
  );
  const loading = ref(true);
  const deletingId = ref<string | null>(null);
  const errorOpen = ref(false);
  const errorMessage = ref('');
  const detailOpen = ref(false);
  const detailMode = ref<'view' | 'edit' | 'create'>('view');
  const editingId = ref<string | undefined>(undefined);
  const skillOptions = ref<string[]>([]);
  onMounted(async () => {
    skillOptions.value = await listSkillOptions();
    fetchList();
  });
  async function fetchList() {
    try {
      loading.value = true;
      console.log('[FETCH] 请求分页:', page.value, pageSize.value);
      const res = await listQuestions(
        {
          問題ＩＤ: filterId.value || undefined,
          スキル: filterSkill.value || undefined,
          難易度_FROM: filterLvFrom.value,
          難易度_TO: filterLvTo.value,
          自動生成フラグ: filterAuto.value,
          キーワード: keyword.value || undefined,
        },
        page.value,
        pageSize.value
      );
      console.log('[FETCH] 返回数据:', res.items);
      items.value = res.items;
      total.value = res.total;
      // items.value = [];
      // total.value = 0;
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
    filterId.value = '';
    filterSkill.value = undefined;
    filterLvFrom.value = undefined;
    filterLvTo.value = undefined;
    filterAuto.value = undefined;
    page.value = 1;
    fetchList();
  }
  function openCreate() {
    detailMode.value = 'create';
    editingId.value = undefined;
    detailOpen.value = true;
  }
  function openEdit(item: Question) {
    detailMode.value = 'edit';
    editingId.value = item.問題ＩＤ;
    detailOpen.value = true;
  }
  function openView(item: Question) {
    detailMode.value = 'view';
    editingId.value = item.問題ＩＤ;
    detailOpen.value = true;
  }
  async function onDelete(item: Question) {
    if (!confirm('削除しますか？')) return;
    try {
      deletingId.value = item.問題ＩＤ;
      await deleteQuestion(item.問題ＩＤ);
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
    if (props.mode === 'select' && ctx?.item) emit('selected', ctx.item as Question);
  }
  function onRefetch() {
    fetchList();
  }
</script>
