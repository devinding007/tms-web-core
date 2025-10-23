<template>
  <v-app-bar flat>
    <v-app-bar-nav-icon @click="ui.toggleDrawer()" />
    <v-toolbar-title class="font-semibold">TMS Web Demo v2</v-toolbar-title>
    <v-spacer />

    <v-btn icon :title="ui.pinned ? 'ピン固定を解除' : 'ピン固定する'" @click="ui.togglePin()">
      <v-icon>{{ ui.pinned ? 'mdi-pin' : 'mdi-pin-outline' }}</v-icon>
    </v-btn>
    <v-btn icon :to="{ path: '/dashboard' }" title="Dashboard"
      ><v-icon>mdi-view-dashboard</v-icon></v-btn
    >
    <v-btn icon :to="{ path: '/personnel' }" title="人材管理"
      ><v-icon>mdi-account-multiple</v-icon></v-btn
    >
    <v-btn icon :to="{ path: '/questions' }" title="問題管理"><v-icon>mdi-book-open</v-icon></v-btn>

    <v-btn icon :to="{ path: '/exam-papers' }" title="試験用紙管理"
      ><v-icon>mdi-file-document-multiple</v-icon></v-btn
    >
    <v-snackbar
      v-model="snackbarModel"
      location="top right"
      :timeout="2000"
      :color="toast.color"
      variant="tonal">
      {{ toast.message }}
    </v-snackbar>
  </v-app-bar>
</template>
<script setup lang="ts">
  import { computed } from 'vue';
  import { useToastState } from '@/plugins/toast';
  import { useUiStore } from '@/store/useUiStore';
  const toast = useToastState();
  const snackbarModel = computed({
    get: () => toast.open.value,
    set: (v: boolean) => (toast.open.value = v),
  });
  const ui = useUiStore();
</script>
