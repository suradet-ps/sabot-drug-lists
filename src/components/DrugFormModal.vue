<script setup lang="ts">
import type { Drug, DrugFormData } from '../types';
import { X } from 'lucide-vue-next';

import { computed, ref, watch } from 'vue';

type Props = {
  show?: boolean;
  drug?: Drug | null;
};

const props = withDefaults(defineProps<Props>(), {
  show: false,
  drug: null,
});

const emit = defineEmits<{
  close: [];
  save: [drugData: DrugFormData];
}>();

function defaultForm(): DrugFormData {
  return {
    drug_code: '',
    trade_name: '',
    generic_name: '',
    account: 'ก',
    price_opd: 0,
    category: '',
    is_active: true,
    remarks: '',
    notes: '',
  };
}

const form = ref<DrugFormData>(defaultForm());

const isEditMode = computed<boolean>(() => !!props.drug?.id);

watch(
  () => props.drug,
  (newDrug) => {
    form.value = newDrug ? { ...newDrug } : defaultForm();
  },
  { immediate: true },
);

function handleSubmit(): void {
  if (!form.value.drug_code || !form.value.trade_name) {
    alert('กรุณากรอกรหัสเวชภัณฑ์และชื่อเวชภัณฑ์');
    return;
  }
  emit('save', form.value);
}
</script>

<template>
  <Transition name="modal">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" @click="$emit('close')" />

      <!-- Modal Panel -->
      <div
        class="modal-panel relative bg-white w-full max-w-lg rounded-3xl shadow-2xl shadow-slate-900/20 overflow-hidden transform border border-slate-100 flex flex-col max-h-[90vh]"
      >
        <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <h3 class="font-semibold text-slate-900 text-lg">
            {{ isEditMode ? 'แก้ไขข้อมูลยา' : 'เพิ่มรายการยาใหม่' }}
          </h3>
          <button
            class="p-2 hover:bg-slate-200/50 rounded-full transition-colors text-slate-400 hover:text-slate-600"
            @click="$emit('close')"
          >
            <X :size="20" />
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 overflow-y-auto">
          <form class="space-y-4" @submit.prevent="handleSubmit">
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <label for="drug-code" class="text-xs font-bold text-slate-500 uppercase tracking-wider">รหัสเวชภัณฑ์
                  *</label>
                <input
                  id="drug-code"
                  v-model="form.drug_code" type="text" required
                  class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                >
              </div>
              <div class="space-y-1">
                <label for="trade-name" class="text-xs font-bold text-slate-500 uppercase tracking-wider">ชื่อเวชภัณฑ์ (Trade
                  Name) *</label>
                <input
                  id="trade-name"
                  v-model="form.trade_name" type="text" required
                  class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                >
              </div>
            </div>

            <div class="space-y-1">
              <label for="generic-name" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Generic Name</label>
              <input
                id="generic-name"
                v-model="form.generic_name" type="text"
                class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              >
            </div>

            <div class="grid grid-cols-3 gap-4">
              <div class="space-y-1">
                <label for="account" class="text-xs font-bold text-slate-500 uppercase tracking-wider">บัญชี</label>
                <input
                  id="account"
                  v-model="form.account" type="text"
                  class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center focus:bg-white focus:border-blue-500 outline-none transition-all"
                >
              </div>
              <div class="space-y-1 col-span-2">
                <label for="price-opd" class="text-xs font-bold text-slate-500 uppercase tracking-wider">ราคา OPD</label>
                <input
                  id="price-opd"
                  v-model.number="form.price_opd" type="number" step="0.01"
                  class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                >
              </div>
            </div>

            <div class="space-y-1">
              <label for="category" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
              <input
                id="category"
                v-model="form.category" type="text"
                class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              >
            </div>

            <!-- Notes: หมายเหตุการเพิ่มยา (แยกจาก remarks ที่ใช้สำหรับเหตุผลการนำออก) -->
            <div class="space-y-1">
              <label for="drug-notes" class="text-xs font-bold text-slate-500 uppercase tracking-wider">
                หมายเหตุ / Notes
                <span class="normal-case font-normal text-slate-400 ml-1">(ไม่จำเป็น)</span>
              </label>
              <textarea
                id="drug-notes"
                v-model="form.notes" rows="2"
                class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none transition-all text-sm"
                placeholder="เช่น ยาทดแทน X, นำเข้าใหม่จากการประมูล 2568..."
              />
            </div>

            <!-- Footer Buttons -->
            <div class="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
              <button
                type="button"
                class="px-5 py-2.5 rounded-xl font-medium text-sm text-slate-500 hover:text-slate-900 hover:bg-slate-100/50 transition-all"
                @click="$emit('close')"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                class="px-5 py-2.5 rounded-xl font-medium text-sm bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20 hover:shadow-slate-900/30 transition-all"
              >
                บันทึกข้อมูล
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Transition>
</template>
