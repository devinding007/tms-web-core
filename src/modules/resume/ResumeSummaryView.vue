<template>
  <v-card class="mb-4">
    <v-card-title class="text-h6">プロフィール</v-card-title>
    <v-card-text>
      <div class="text-body-1">
        <strong>氏名:</strong> {{ data.氏名 || '—' }}
        <span class="ml-4"><strong>最寄駅:</strong> {{ data.最寄駅 || '—' }}</span>
      </div>
      <div class="text-body-2 mt-1">
        <strong>出生:</strong> {{ data.出生年月 || '—' }}
        <span class="ml-4"><strong>来日:</strong> {{ data.来日年月 || '—' }}</span>
        <span class="ml-4"><strong>国籍:</strong> {{ data.国籍 || '—' }}</span>
      </div>
      <div class="mt-3" v-if="data.アピールポイント">
        <strong>アピールポイント:</strong><br />
        <div v-for="(line, i) in data.アピールポイント.split('\n')" :key="i">{{ line }}</div>
      </div>
      <div class="mt-3" v-if="data.資格?.length">
        <strong>保有資格:</strong><br />
        <v-chip
          v-for="q in data.資格"
          :key="q"
          class="ma-1"
          size="small"
          variant="tonal"
          color="primary"
          >{{ q }}</v-chip
        >
      </div>
    </v-card-text>
  </v-card>

  <v-row class="section-gap" dense>
    <v-col cols="12" md="5">
      <v-card>
        <v-card-title class="text-h6">学歴</v-card-title>
        <v-card-text>
          <div v-if="!data.学歴?.length" class="text-disabled">—</div>
          <v-row v-else dense>
            <v-col cols="12" sm="12" v-for="(ed, i) in data.学歴" :key="i">
              <v-sheet class="pa-3 rounded-lg border">
                <div class="text-subtitle-2 font-weight-medium">{{ ed.学校 || '—' }}</div>
                <div class="text-caption mt-1">
                  {{ ed.開始年月 || '—' }} 〜 {{ ed.終了年月 || '—' }}
                </div>
                <div class="text-caption">{{ ed.専門 || '—' }} / {{ ed.学位 || '—' }}</div>
              </v-sheet>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-card class="mt-4">
        <v-card-title class="text-h6"
          >言語スキル<v-icon size="15">mdi-comment-question-outline</v-icon>
          <v-tooltip
            activator="parent"
            text="言語区分　A:ネイティブ／B:ビジネス／C:業務上可／D:やや難し"
            location="top"
            :open-delay="200" />
        </v-card-title>
        <v-card-text>
          <div v-if="!data.言語?.length" class="text-disabled">—</div>
          <v-row v-else dense>
            <v-col cols="12" sm="12" v-for="(lng, i) in data.言語" :key="i">
              <v-sheet class="pa-3 rounded-lg border">
                <div class="text-subtitle-2 font-weight-medium">{{ lng.言語名 }}</div>
                <div class="text-caption mt-1">
                  読み: {{ lng.読み }} / 書き: {{ lng.書き }} / 会話: {{ lng.会話 }}
                </div>
              </v-sheet>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" md="7">
      <v-card>
        <v-card-title class="text-h6"
          >スキル一覧
          <v-icon size="15">mdi-comment-question-outline</v-icon>
          <v-tooltip
            activator="parent"
            text="スキル区分　A:実務経験5年以上／B:実務経験1年以上／C:実践出来る／D:基本知識のみ	"
            location="top"
            :open-delay="200" />
        </v-card-title>
        <v-card-text>
          <v-data-table
            :headers="skillHeaders"
            :items="data.スキル || []"
            density="comfortable"
            item-key="スキル名"
            class="elevation-0"
            :page="page"
            :items-per-page="pageSize"
            :items-per-page-options="[5, 10, 20]"
            items-per-page-text="表示件数">
            <template #item.レベル="{ item }">
              <v-chip size="small" :color="levelColor(item.レベル)" variant="flat">{{
                item.レベル
              }}</v-chip>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>

  <v-card class="section-gap mt-4">
    <v-card-title class="text-h6">業務経歴</v-card-title>
    <v-card-text>
      <v-row dense>
        <v-col cols="12" md="6" v-for="(exp, i) in data.業務歴 || []" :key="i">
          <v-sheet class="pa-3 rounded-lg border">
            <div class="d-flex justify-space-between">
              <div class="text-subtitle-2 font-weight-medium">
                {{ exp.役割 || '—' }}・{{ exp.チーム規模 || '—' }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ exp.期間開始 || '—' }} 〜 {{ exp.期間終了 || '—' }}
              </div>
            </div>
            <div class="text-caption mt-1">
              <strong>利用技術:</strong>
              <v-chip
                v-for="tech in exp.利用技術"
                :key="tech"
                class="ma-1"
                size="small"
                variant="tonal"
                color="primary"
                >{{ tech }}</v-chip
              >
            </div>
            <div class="text-body-2 mt-2" style="white-space: pre-line">
              {{ exp.担当業務詳細 || '—' }}
            </div>
          </v-sheet>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import { ResumeData } from '@/types/models/Resume';

  const props = defineProps<{ modelValue: ResumeData }>();
  const emit = defineEmits<{ (e: 'update:modelValue', v: ResumeData): void }>();

  const data = ref<ResumeData>(props.modelValue || {});
  watch(
    () => props.modelValue,
    (v) => {
      if (v) data.value = v;
    }
  );

  const skillHeaders = [
    { title: 'スキル', key: 'スキル名' },
    { title: 'レベル', key: 'レベル', width: 120 },
  ];

  const page = ref(1);
  const pageSize = ref(10);
  const pageCount = computed(() => Math.ceil((data.value.スキル?.length || 0) / pageSize.value));

  function levelColor(l?: string) {
    if (l === 'A') return 'primary';
    if (l === 'B') return 'success';
    if (l === 'C') return 'warning';
    if (l === 'D') return 'error';
    return 'default';
  }
</script>

<style scoped>
  .border {
    border: 1px solid #e5e7eb;
  }
</style>
