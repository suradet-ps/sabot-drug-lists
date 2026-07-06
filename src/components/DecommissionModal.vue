<script setup lang="ts">
import type { Drug } from '../types';
import { AlertCircle, X } from 'lucide-vue-next';

import { ref } from 'vue';

type Props = {
  show: boolean;
  drug: Drug;
};

type ConfirmPayload = {
  drug: Drug;
  remarks: string;
};

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  confirm: [payload: ConfirmPayload];
}>();

const remarks = ref<string>('');

function handleConfirm(): void {
  if (!remarks.value.trim()) {
    alert('กรุณากรอกเหตุผลในการนำออก');
    return;
  }
  emit('confirm', { drug: props.drug, remarks: remarks.value });
  remarks.value = '';
}
</script>

<template>
  <Transition name="modal">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" @click="$emit('close')" />

      <div
        class="modal-panel relative bg-white w-full max-w-lg rounded-3xl shadow-2xl shadow-slate-900/20 overflow-hidden transform border border-slate-100"
      >
        <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 class="font-semibold text-slate-900 text-lg">
            ยืนยันการนำออก
          </h3>
          <button
            class="p-2 hover:bg-slate-200/50 rounded-full transition-colors text-slate-400 hover:text-slate-600"
            @click="$emit('close')"
          >
            <X :size="20" />
          </button>
        </div>

        <div class="p-6">
          <form class="space-y-5" @submit.prevent="handleConfirm">
            <div
              class="bg-amber-50 text-amber-800 p-4 rounded-xl flex gap-3 items-start border border-amber-100"
            >
              <AlertCircle class="shrink-0 mt-0.5" :size="20" />
              <div class="text-sm">
                <p class="font-bold">
                  คุณกำลังจะนำรายการยาออก
                </p>
                <p class="mt-1">
                  รายการ: <strong>{{ drug.trade_name }}</strong> ({{ drug.drug_code }})
                </p>
              </div>
            </div>

            <div class="space-y-2">
              <label for="decommission-remarks" class="text-sm font-bold text-slate-700">ระบุเหตุผลในการนำออก *</label>
              <textarea
                id="decommission-remarks"
                v-model="remarks" rows="3" required
                class="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none resize-none transition-all"
                placeholder="เช่น บริษัทเลิกผลิต, ยาหมดอายุ, เปลี่ยนบริษัทประมูล..."
              />
            </div>

            <div class="pt-2 flex justify-end gap-3">
              <button
                type="button"
                class="px-5 py-2.5 rounded-xl font-medium text-sm text-slate-500 hover:text-slate-900 hover:bg-slate-100/50 transition-all"
                @click="$emit('close')"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                class="px-5 py-2.5 rounded-xl font-medium text-sm bg-red-50 text-red-600 hover:bg-red-100 border border-transparent transition-all"
              >
                ยืนยันนำออก
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Transition>
</template>
