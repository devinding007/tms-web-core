<template>
  <div>
    <!-- パンくず -->
    <v-breadcrumbs :items="breadcrumbs" density="comfortable" class="mb-4" />

    <!-- ローディング中 -->
    <SkeletonExamLoader v-if="loading" />

    <template v-else>
      <!-- ヒーローカード: 試験概要 + 進捗 -->
      <v-card class="mb-6 hero-card hero-sticky" rounded="xl" elevation="2">
        <!-- ヘッダ帯 -->
        <!--
          variant="tonal"
          -->
        <v-sheet
          class="hero-header d-flex flex-column flex-md-row align-start align-md-center w-100"
          color="primary"
          rounded="t-xl">
          <!-- 左: タイトルと説明 -->
          <div class="pa-4 flex-1">
            <div class="d-flex align-center ga-2">
              <v-icon color="white">mdi-clipboard-text-outline</v-icon>
              <span class="text-subtitle-1 font-weight-medium on-primary">
                {{ examData?.試験用紙.試験用紙名称 }}
              </span>
            </div>

            <div class="text-body-2 mt-2 on-primary">
              {{ examData?.試験用紙.説明 }}
            </div>
          </div>

          <!-- 右: メタ情報 -->
          <div class="pa-4 pt-0 pt-md-4 d-flex flex-column align-start ga-2 hero-meta">
            <v-chip
              size="small"
              color="on-primary"
              variant="tonal"
              prepend-icon="mdi-format-list-bulleted-square"
              label>
              {{ totalCount }} 問
            </v-chip>

            <v-chip
              size="small"
              color="on-primary"
              variant="tonal"
              prepend-icon="mdi-account"
              label>
              {{ examData?.参加者氏名 }}
            </v-chip>
          </div>
        </v-sheet>

        <!-- ボディ: 進捗バー -->
        <v-card-text class="pt-4">
          <div class="d-flex align-center justify-space-between mb-2">
            <div class="text-body-2 text-medium-emphasis d-flex align-center ga-2">
              <v-icon size="18" color="primary">mdi-check-circle-outline</v-icon>
              <span> 回答済 {{ answeredCount }} / {{ totalCount }} </span>
            </div>
            <div class="text-body-2 text-medium-emphasis">
              完了率 {{ Math.round(progress * 100) }}%
            </div>
          </div>

          <v-progress-linear :model-value="progress * 100" height="6" color="primary" rounded />
        </v-card-text>
      </v-card>

      <!-- 問題カード一覧 -->
      <div>
        <v-hover
          v-for="(p, idx) in examData?.試験用紙.問題リスト"
          :key="p.試験用紙問題ＩＤ"
          v-slot="{ isHovering, props: hoverProps }">
          <v-card
            v-bind="hoverProps"
            rounded="lg"
            class="mb-4 question-card"
            :class="[
              { 'answered-card': isAnswered(p) },
              { 'hover-elevated': isHovering && !isAnswered(p) },
            ]"
            elevation="1"
            variant="flat">
            <!-- カードヘッダ: Q番号 / スキル / 難易度 / 回答済 -->
            <div class="d-flex align-start justify-space-between pa-3 question-head">
              <div class="d-flex align-center flex-wrap ga-2">
                <div class="text-body-2 font-weight-medium text-primary">Q{{ idx + 1 }}</div>

                <v-chip size="small" color="primary" variant="tonal" prepend-icon="mdi-tag" label>
                  {{ p.スキル }}
                </v-chip>

                <v-chip
                  size="small"
                  color="secondary"
                  variant="tonal"
                  prepend-icon="mdi-stairs"
                  label>
                  難易度 {{ p.難易度 }}
                </v-chip>
              </div>

              <v-chip
                v-if="isAnswered(p)"
                size="x-small"
                color="primary"
                variant="tonal"
                prepend-icon="mdi-check-circle"
                label>
                回答済
              </v-chip>
            </div>

            <v-divider />

            <v-card-text class="pt-4">
              <!-- 問題文 -->
              <div class="text-subtitle-1 font-weight-medium mb-3">
                {{ p.問題文章 }}
              </div>

              <!-- 選択肢 -->
              <v-radio-group
                v-model="answers[p.試験用紙問題ＩＤ]"
                :disabled="submitting"
                hide-details>
                <v-radio
                  v-for="(c, cIdx) in p.選択肢"
                  :key="c.選択肢ＩＤ"
                  :value="c.選択肢ＩＤ"
                  class="choice-item my-2 pa-3 w-100">
                  <template #label>
                    <div class="d-flex flex-row align-start ga-2 w-100">
                      <!-- <div class="text-body-2 font-weight-medium d-flex flex-column"> -->
                      <div class="d-flex flex-column">{{ choicePrefix(cIdx) }}.</div>
                      <div class="d-flex flex-column">
                        <span>{{ c.選択肢文章 }}</span>
                      </div>
                    </div>
                  </template>
                </v-radio>
              </v-radio-group>
            </v-card-text>
          </v-card>
        </v-hover>
      </div>

      <!-- 画面下アクションバー: 進捗 + 提出ボタン -->
      <v-sheet
        class="mt-8 pa-4 d-flex flex-column flex-md-row align-md-center justify-space-between action-bar border-subtle"
        rounded="lg"
        elevation="1"
        color="surface">
        <div class="text-body-2 text-medium-emphasis mb-4 mb-md-0 d-flex align-center ga-2">
          <v-icon size="20" color="primary">mdi-progress-check</v-icon>
          <span>
            回答済 {{ answeredCount }} / {{ totalCount }} （{{ Math.round(progress * 100) }}%）
          </span>
        </div>

        <v-btn
          color="primary"
          prepend-icon="mdi-send"
          :disabled="!allAnswered || submitting"
          :loading="submitting"
          @click="onSubmit">
          提出
        </v-btn>
      </v-sheet>
    </template>

    <!-- エラーダイアログ -->
    <ErrorDialog v-model:open="errorOpen" :message="errorMessage" />

    <!-- 完了ダイアログ -->
    <v-dialog v-model="doneOpen" max-width="400" close-on-esc close-on-back>
      <v-card class="fixed-dialog">
        <v-toolbar density="comfortable" color="primary" class="text-white">
          <v-toolbar-title>提出完了</v-toolbar-title>
          <v-spacer />
          <v-btn icon @click="doneOpen = false" title="閉じる">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text class="pt-4"> 回答を受け付けました。ありがとうございました。 </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" prepend-icon="mdi-check" @click="doneOpen = false"> OK </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 送信中オーバーレイ -->
    <v-overlay :model-value="submitting" persistent />
  </div>
</template>

<script setup lang="ts">
  import { onMounted, reactive, ref, computed } from 'vue';
  import { useRoute } from 'vue-router';
  import SkeletonExamLoader from '@/components/common/SkeletonExamLoader.vue';
  import ErrorDialog from '@/components/common/ErrorDialog.vue';
  import { useToast } from '@/plugins/toast';
  import {
    fetchExamByLinkId,
    buildSubmissionPayload,
    submitExamAnswers,
  } from '@/composables/useApi';
  import type { ExamSession, ExamProblem } from '@/types/models/Exam';

  const route = useRoute();
  const toast = useToast();

  const breadcrumbs = [
    { title: 'Dashboard', href: '#', disabled: false },
    { title: '試験実施', disabled: true },
  ];

  const loading = ref(true);
  const submitting = ref(false);

  const examData = ref<ExamSession | null>(null);

  // answers[試験用紙問題ＩＤ] = 選択肢ＩＤ
  const answers = reactive<Record<string, string>>({});

  const errorOpen = ref(false);
  const errorMessage = ref('');
  const doneOpen = ref(false);

  // 集計系
  const totalCount = computed(() => {
    return examData.value ? examData.value.試験用紙.問題リスト.length : 0;
  });

  const answeredCount = computed(() => {
    if (!examData.value) return 0;
    return examData.value.試験用紙.問題リスト.filter((p) => !!answers[p.試験用紙問題ＩＤ]).length;
  });

  const progress = computed(() => {
    if (!totalCount.value) return 0;
    return answeredCount.value / totalCount.value;
  });

  const allAnswered = computed(() => {
    if (!examData.value) return false;
    return examData.value.試験用紙.問題リスト.every((p) => !!answers[p.試験用紙問題ＩＤ]);
  });

  function isAnswered(p: ExamProblem): boolean {
    return !!answers[p.試験用紙問題ＩＤ];
  }

  function choicePrefix(idx: number): string {
    // 0->A, 1->B, ...
    return String.fromCharCode(65 + idx);
  }

  onMounted(async () => {
    try {
      loading.value = true;
      const linkId = String(route.query.examLinkId || '');
      const res = await fetchExamByLinkId(linkId);

      if (!res) {
        throw new Error('not found');
      }

      examData.value = res;

      // 初期回答（空）
      res.試験用紙.問題リスト.forEach((p) => {
        answers[p.試験用紙問題ＩＤ] = '';
      });
    } catch (e) {
      errorMessage.value = '試験データを取得できませんでした。';
      errorOpen.value = true;
    } finally {
      loading.value = false;
    }
  });

  async function onSubmit() {
    if (!examData.value) return;
    try {
      submitting.value = true;
      const payload = buildSubmissionPayload(examData.value, answers);
      await submitExamAnswers(payload);

      toast.show('提出しました', 'success');
      doneOpen.value = true;
    } catch (e) {
      errorMessage.value = '送信に失敗しました。もう一度お試しください。';
      errorOpen.value = true;
      toast.show('送信に失敗しました', 'error');
    } finally {
      submitting.value = false;
    }
  }
</script>

<style scoped>
  .fixed-dialog {
    max-height: 60vh;
    overflow-y: auto;
  }

  /* ヒーローカード */
  .hero-card {
    overflow: hidden;
  }
  .hero-header {
    background-image: linear-gradient(
      90deg,
      rgba(25, 118, 210, 0.08) 0%,
      rgba(33, 150, 243, 0.04) 100%
    );
  }
  .hero-meta {
    min-width: 160px;
  }

  /* 問題カード */
  .question-card {
    position: relative;
    transition: box-shadow 0.12s ease;
  }

  /* 回答済みはごく淡いシェード＋左のバー */
  .question-card.answered-card {
    background-color: var(--answered-bg-color) !important;
  }
  .question-card.answered-card::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background-color: rgb(25, 118, 210);
    opacity: 0.4;
    border-top-left-radius: inherit;
    border-bottom-left-radius: inherit;
  }

  /* hover時に少し浮かせる。ただし未回答のときだけ */
  .hover-elevated {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  }

  /* 選択肢: hoverで薄い色に変色、ABCDラベルつき */
  .choice-item {
    border-radius: 6px;
    transition: background-color 0.2s linear;
  }
  .choice-item:hover {
    background-color: var(--hover-bg-color);
  }

  /* アクションバー（進捗＋提出） */
  .action-bar {
    border-radius: 0.75rem;
  }

  /* helpers */
  .w-100 {
    width: 100%;
  }

  /* v-app-bar の下に張り付くヘッダー */
  .hero-sticky {
    position: sticky;
    top: 64px; /* ← AppBarの高さぶん下げる。モバイルは56pxとかに調整してもいい */
    z-index: 10; /* 問題カードより前に出す */
  }

  /* stickyだとカードの角丸と影が常に見えるので、下にだけ影を落として"バー感"を出すならこんな感じもアリ */
  .hero-sticky {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  }

  @media (max-width: 600px) {
    .hero-sticky {
      top: 56px;
    }
  }
  .question-head {
    background-color: rgba(24, 69, 148, 0.1); /* ほんのりprimaryベースの薄い青 */
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
  }
</style>
