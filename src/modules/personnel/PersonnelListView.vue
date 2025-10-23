<template>
  <v-card>
    <v-card-title class="d-flex align-center ga-2">
      <v-icon>mdi-account-multiple</v-icon>
      人材データ管理
      <v-spacer />
      <v-btn v-if="mode === 'edit'" color="primary" prepend-icon="mdi-plus" @click="openEditor()"
        >追加登録</v-btn
      >
    </v-card-title>
    <v-card-text>
      <SearchBar v-model="keyword" :loading="loading" @search="onSearch" @reset="onReset">
        <template #advanced>
          <div class="d-flex ga-2">
            <v-select
              v-model="bp"
              :items="[
                { title: '指定なし', value: undefined },
                { title: '社員', value: 0 },
                { title: 'BP', value: 1 },
              ]"
              label="BPフラグ"
              density="comfortable"
              style="max-width: 200px"
              hide-details />
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
            item-key="人材ID"
            class="elevation-1 rounded-lg"
            @click:row="onClickRow">
            <template #item.BPフラグ="{ item }">
              <v-chip size="small" :color="item.BPフラグ === 0 ? 'primary' : 'secondary'">{{
                item.BPフラグ === 0 ? '社員' : 'BP'
              }}</v-chip>
            </template>
            <template v-if="mode === 'edit'" #item.actions="{ item }">
              <div class="d-flex ga-2">
                <v-btn
                  size="small"
                  color="primary"
                  prepend-icon="mdi-pencil"
                  @click.stop="openEditor(item)"
                  >編集</v-btn
                >
                <v-btn
                  size="small"
                  color="error"
                  prepend-icon="mdi-delete"
                  :loading="deletingId === item.人材ID"
                  @click.stop="onDelete(item)"
                  >削除</v-btn
                >
                <v-btn
                  size="small"
                  color="secondary"
                  prepend-icon="mdi-school"
                  @click.stop="openSkill(item)"
                  >スキル</v-btn
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

  <PersonnelEditor
    v-if="mode === 'edit'"
    v-model:open="editorOpen"
    :item="editing"
    @saved="fetchList" />
  <SkillEditorModal v-if="mode === 'edit'" v-model:open="skillOpen" :personnel-id="skillTargetId" />
  <ErrorDialog v-model:open="errorOpen" :message="errorMessage" />
</template>
<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import SearchBar from '@/components/shared/SearchBar.vue';
  import PersonnelEditor from './PersonnelEditor.vue';
  import ErrorDialog from '@/components/common/ErrorDialog.vue';
  import SkillEditorModal from '@/modules/skill/SkillEditorModal.vue';
  import { listPersonnel, deletePersonnel } from './api';
  import type { Personnel } from '@/types/models/Personnel';
  import { useToast } from '@/plugins/toast';

  const props = withDefaults(defineProps<{ mode?: 'edit' | 'select' }>(), { mode: 'edit' });
  const emit = defineEmits<{ (e: 'selected', v: Personnel): void }>();

  const toast = useToast();
  const keyword = ref<string>('');
  const bp = ref<number | undefined>(undefined);

  const baseHeaders = [
    { title: '所属会社', key: '所属会社' },
    { title: '名前', key: '名前' },
    { title: '社員番号', key: '社員番号' },
    { title: '生年月日', key: '生年月日' },
    { title: '現案件終了年月日', key: '現案件終了年月日' },
    { title: 'BP', key: 'BPフラグ', width: 100 },
  ];
  const computedHeaders = computed(() =>
    props.mode === 'edit'
      ? [...baseHeaders, { title: '操作', key: 'actions', sortable: false, width: 280 }]
      : baseHeaders
  );

  const items = ref<Personnel[]>([]);
  const total = ref(0);
  const page = ref(1);
  const pageSize = ref(10);
  const pageCount = computed(() => Math.ceil(total.value / pageSize.value));

  const loading = ref(true);
  const deletingId = ref<string | null>(null);
  const editorOpen = ref(false);
  const editing = ref<Personnel | null>(null);
  const skillOpen = ref(false);
  const skillTargetId = ref<string>('');
  const errorOpen = ref(false);
  const errorMessage = ref('');

  onMounted(fetchList);

  async function fetchList() {
    try {
      loading.value = true;
      const res = await listPersonnel(keyword.value || undefined, page.value, pageSize.value);
      items.value = res.items.filter((x) =>
        bp.value === undefined ? true : x.BPフラグ === bp.value
      );
      total.value = res.total;
    } catch (e: any) {
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
    bp.value = undefined;
    page.value = 1;
    fetchList();
  }
  function openEditor(item?: Personnel) {
    editing.value = item ?? null;
    editorOpen.value = true;
  }
  async function onDelete(item: Personnel) {
    if (!confirm('削除してよろしいですか？')) return;
    try {
      deletingId.value = item.人材ID;
      await deletePersonnel(item.人材ID);
      toast.show('削除しました', 'success');
      fetchList();
    } catch (e) {
      errorMessage.value = '削除に失敗しました';
      errorOpen.value = true;
    } finally {
      deletingId.value = null;
    }
  }
  function openSkill(item: Personnel) {
    skillTargetId.value = item.人材ID;
    skillOpen.value = true;
  }
  function onClickRow(_e: any, ctx: any) {
    if (props.mode === 'select' && ctx?.item) emit('selected', ctx.item as Personnel);
  }
</script>
