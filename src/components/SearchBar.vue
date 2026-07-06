<script setup lang="ts">
import { Search } from 'lucide-vue-next';

defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

// FIX: $event.target is typed as EventTarget | null in strict templates.
// Runtime guarantee: this handler is only ever bound to an <input> element.
function onInput(event: Event): void {
  emit('update:modelValue', (event.target as HTMLInputElement).value);
}
</script>

<template>
  <div class="relative w-full">
    <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" :size="18" />
    <input
      id="drug-search"
      type="text" :value="modelValue" placeholder="ค้นหาชื่อยา, รหัสเวชภัณฑ์, Generic name..."
      class="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
      @input="onInput"
    >
  </div>
</template>
