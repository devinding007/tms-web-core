<template>
  <v-breadcrumbs
    :items="[{ title: 'Dashboard', to: '/' }, { title: 'Exam Runs' }]"
    class="mt-2" /><ExamRunListView />
</template>
<script setup lang="ts">
  import ExamRunListView from '@/modules/examRun/ExamRunListView.vue';
</script>
