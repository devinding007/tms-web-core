import { ref, readonly } from 'vue';
const message = ref('');
const color = ref<'success' | 'error' | 'info'>('info');
const open = ref(false);
export function useToast() {
  const show = (msg: string, level: 'success' | 'error' | 'info' = 'info') => {
    message.value = msg;
    color.value = level;
    open.value = true;
  };
  return { show };
}
export function useToastState() {
  return {
    message: readonly(message), // message は readonly のままでもOK
    color: readonly(color), // ← readonly を外す
    open, // v-model 用にそのまま
  };
}
