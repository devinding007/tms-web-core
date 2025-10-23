<template>
  <div>
    <v-breadcrumbs
      :items="[
        { title: 'Dashboard', to: '/dashboard' },
        { title: '試験用紙' },
      ]" /><ExamPaperListView class="mt-2" />
  </div>
</template>
<script setup lang="ts">
  import ExamPaperListView from '@/modules/examPaper/ExamPaperListView.vue';
</script>
