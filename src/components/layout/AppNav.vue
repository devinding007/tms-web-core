<template>
  <v-navigation-drawer
    v-model="ui.drawerOpen"
    :rail="!ui.pinned"
    :expand-on-hover="!ui.pinned"
    :permanent="lgAndUp"
    :temporary="!lgAndUp">
    <v-list nav density="comfortable">
      <v-list-item prepend-icon="mdi-view-dashboard" title="Dashboard" to="/dashboard" />
      <v-list-item prepend-icon="mdi-account-multiple" title="人材管理" to="/personnel" />
      <v-list-item prepend-icon="mdi-book-open" title="問題管理" to="/questions" />
      <v-list-item prepend-icon="mdi-file-document-multiple" title="試験用紙" to="/exam-papers" />
    </v-list>
  </v-navigation-drawer>
</template>
<script setup lang="ts">
  import { onMounted } from 'vue';
  import { useDisplay } from 'vuetify';
  import { useUiStore } from '@/store/useUiStore';

  const { lgAndUp } = useDisplay(); // ブレークポイント（PC/モバイル）
  const ui = useUiStore();
  onMounted(() => ui.load());
</script>
