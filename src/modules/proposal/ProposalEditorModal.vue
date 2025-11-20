<template>
  <v-dialog
    v-model="dialogModel"
    :max-width="isFullscreen ? undefined : 1200"
    :fullscreen="isFullscreen"
    scrollable>
    <v-card class="d-flex flex-column h-100">
      <v-toolbar density="comfortable" color="primary" class="text-white">
        <v-toolbar-title>要員提案</v-toolbar-title>
        <v-spacer />
        <v-btn icon variant="text" @click="isFullscreen = !isFullscreen">
          <v-icon>
            {{ isFullscreen ? 'mdi-window-restore' : 'mdi-window-maximize' }}
          </v-icon>
        </v-btn>
        <v-btn icon variant="text" @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="flex-grow-1 overflow-y-auto">
        <ProposalEditor ref="editorRef" :proposal="proposal" @save="onSave" :saving="saving" />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" prepend-icon="mdi-close" @click="close"> 閉じる </v-btn>

        <v-btn
          color="primary"
          prepend-icon="mdi-content-save"
          :disabled="!editorRef?.canSave"
          :loading="saving"
          @click="save">
          保存
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue';
  import ProposalEditor from '@/modules/proposal/ProposalEditor.vue';
  import type { Proposal } from '@/types/models/Proposal';
  const isFullscreen = ref(false);

  const props = withDefaults(
    defineProps<{
      open: boolean;
      proposal: Proposal | null;
      saving?: boolean;
    }>(),
    {
      saving: false,
    }
  );
  const editorRef = ref<InstanceType<typeof ProposalEditor> | null>(null);

  const emit = defineEmits<{
    (e: 'update:open', v: boolean): void;
    (e: 'save', v: Proposal): void;
  }>();

  const dialogModel = computed({
    get: () => props.open,
    set: (v: boolean) => emit('update:open', v),
  });

  function close() {
    emit('update:open', false);
  }

  function onSave(p: Proposal) {
    // Editor からの save をそのまま外に出す
    emit('save', p);
  }

  function save() {
    console.log('保存よ');
    if (editorRef.value && editorRef.value.canSave) {
      console.log('保存よ２');
      editorRef.value.onSave();
    }
  }
</script>
