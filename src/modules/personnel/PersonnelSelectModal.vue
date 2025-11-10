<template>
  <v-dialog v-model="model" width="1000" :scrim="true" close-on-esc close-on-back>
    <v-card class="fixed-dialog">
      <v-toolbar color="primary" density="comfortable" class="text-white">
        <v-toolbar-title>人材一覧（参照モード）</v-toolbar-title>
        <v-spacer /><v-btn icon @click="model = false"><v-icon>mdi-close</v-icon></v-btn>
      </v-toolbar>
      <v-card-text><PersonnelListView mode="select" @selected="onSelected" /></v-card-text>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
  import { computed } from 'vue';
  import PersonnelListView from './PersonnelListView.vue';
  import { Personnel } from '@/types/models/Personnel';
  const props = defineProps<{ open: boolean }>();
  const emit = defineEmits<{
    (e: 'update:open', v: boolean): void;
    (e: 'selected', v: Personnel): void;
  }>();
  const model = computed({ get: () => props.open, set: (v: boolean) => emit('update:open', v) });
  function onSelected(v: Personnel) {
    emit('selected', v);
    model.value = false;
  }
</script>
