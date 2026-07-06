<script setup lang="ts">
import type { ActivityStats, DatePreset, Drug } from '../types';
import {
  ArchiveX,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Filter,
  Loader2,
  Pill,
  Printer,
  RefreshCcw,
  Search,
  SearchX,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from 'lucide-vue-next';
import { computed, onMounted, ref } from 'vue';
import { drugService } from '../services/drug-service';

// --- State ---
const activeTab = ref<'added' | 'removed'>('added');
const preset = ref<DatePreset>('30days');
const fromDate = ref<string>('');
const toDate = ref<string>('');

const stats = ref<ActivityStats | null>(null);
const addedDrugs = ref<Drug[]>([]);
const removedDrugs = ref<Drug[]>([]);
const addedPage = ref(1);
const removedPage = ref(1);
const addedTotal = ref(0);
const removedTotal = ref(0);

const isLoadingStats = ref(false);
const isLoadingAdded = ref(false);
const isLoadingRemoved = ref(false);

const searchTerm = ref('');
let searchTimeout: ReturnType<typeof setTimeout> | undefined;

const PAGE_SIZE = 20;

const presets: { key: DatePreset; label: string }[] = [
  { key: '7days', label: '7 วัน' },
  { key: '30days', label: '30 วัน' },
  { key: '3months', label: '3 เดือน' },
  { key: '6months', label: '6 เดือน' },
  { key: 'thisyear', label: 'ปีนี้' },
  { key: 'custom', label: 'กำหนดเอง' },
];

// --- Date Range ---
function getDateRange(p: DatePreset): { from: string; to: string } {
  const today = new Date();
  const toStr = today.toISOString().slice(0, 10);

  if (p === 'custom') {
    return { from: fromDate.value, to: toDate.value };
  }

  const from = new Date(today);
  if (p === '7days') {
    from.setDate(from.getDate() - 7);
  }
  else if (p === '30days') {
    from.setDate(from.getDate() - 30);
  }
  else if (p === '3months') {
    from.setMonth(from.getMonth() - 3);
  }
  else if (p === '6months') {
    from.setMonth(from.getMonth() - 6);
  }
  else if (p === 'thisyear') {
    from.setFullYear(from.getFullYear(), 0, 1);
  }

  return { from: from.toISOString().slice(0, 10), to: toStr };
}

function applyPreset(p: DatePreset): void {
  preset.value = p;
  if (p !== 'custom') {
    const range = getDateRange(p);
    fromDate.value = range.from;
    toDate.value = range.to;
    fetchAll();
  }
}

function toISORange(): { from: string; to: string } {
  return {
    from: `${fromDate.value}T00:00:00.000Z`,
    to: `${toDate.value}T23:59:59.999Z`,
  };
}

// --- Fetch ---
async function fetchStats(): Promise<void> {
  isLoadingStats.value = true;
  try {
    const { from, to } = toISORange();
    stats.value = await drugService.getActivityStats(from, to);
  }
  catch (error) {
    console.error('ActivityView Error [fetchStats]:', error);
  }
  finally {
    isLoadingStats.value = false;
  }
}

async function fetchAdded(page = 1): Promise<void> {
  isLoadingAdded.value = true;
  try {
    const { from, to } = toISORange();
    const result = await drugService.getAddedDrugs({
      page,
      pageSize: PAGE_SIZE,
      from,
      to,
      searchTerm: searchTerm.value,
    });
    addedDrugs.value = result.data;
    addedTotal.value = result.count ?? 0;
    addedPage.value = page;
  }
  catch (error) {
    console.error('ActivityView Error [fetchAdded]:', error);
  }
  finally {
    isLoadingAdded.value = false;
  }
}

async function fetchRemoved(page = 1): Promise<void> {
  isLoadingRemoved.value = true;
  try {
    const { from, to } = toISORange();
    const result = await drugService.getRemovedDrugsInRange({
      page,
      pageSize: PAGE_SIZE,
      from,
      to,
      searchTerm: searchTerm.value,
    });
    removedDrugs.value = result.data;
    removedTotal.value = result.count ?? 0;
    removedPage.value = page;
  }
  catch (error) {
    console.error('ActivityView Error [fetchRemoved]:', error);
  }
  finally {
    isLoadingRemoved.value = false;
  }
}

async function fetchAll(): Promise<void> {
  await Promise.all([fetchStats(), fetchAdded(1), fetchRemoved(1)]);
}

// --- Search & Tab ---
function onSearchChange(): void {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    if (activeTab.value === 'added') {
      fetchAdded(1);
    }
    else {
      fetchRemoved(1);
    }
  }, 300);
}

function onTabChange(tab: 'added' | 'removed'): void {
  activeTab.value = tab;
  searchTerm.value = '';
  if (tab === 'added') {
    fetchAdded(1);
  }
  else {
    fetchRemoved(1);
  }
}

// --- Computed ---
const addedTotalPages = computed(() => Math.ceil(addedTotal.value / PAGE_SIZE));
const removedTotalPages = computed(() => Math.ceil(removedTotal.value / PAGE_SIZE));

// --- Format ---
function formatDate(dateString: string | null | undefined): string {
  if (!dateString)
    return '';
  return new Date(dateString).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString)
    return '';
  return new Date(dateString).toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// --- Print ---
function handlePrint(): void {
  window.print();
}

// --- Lifecycle ---
onMounted(() => {
  applyPreset('30days');
});
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-20">
    <!-- ── PRINT ONLY: Hospital Header ── -->
    <div class="print-only">
      <div class="text-center border-b-2 border-slate-800 pb-5 mb-6">
        <h1 class="text-2xl font-bold tracking-tight">
          โรงพยาบาลสระโบสถ์
        </h1>
        <h2 class="text-lg font-semibold mt-1 text-slate-700">
          บันทึกการเปลี่ยนแปลงรายการยา
        </h2>
        <p class="text-sm text-slate-500 mt-2">
          ช่วงเวลา: {{ formatDate(fromDate) }} ถึง {{ formatDate(toDate) }}
        </p>
        <div class="flex items-center justify-center gap-8 mt-3 text-sm text-slate-700">
          <span>ยาทั้งหมด: <strong>{{ stats?.total_active ?? '--' }}</strong> รายการ</span>
          <span>ยาเข้าใหม่: <strong>{{ stats?.added_count ?? '--' }}</strong> รายการ</span>
          <span>ยาที่นำออก: <strong>{{ stats?.removed_count ?? '--' }}</strong> รายการ</span>
        </div>
      </div>
    </div>

    <!-- ── SCREEN ONLY: Header ── -->
    <div class="no-print flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div class="flex items-start gap-4">
        <div
          class="hidden md:flex w-12 h-12 bg-indigo-50 rounded-2xl items-center justify-center text-indigo-600 shadow-sm border border-indigo-100 shrink-0"
        >
          <ClipboardList :size="24" />
        </div>
        <div>
          <h2 class="text-2xl font-bold text-slate-900 tracking-tight">
            บันทึกการเปลี่ยนแปลง
          </h2>
          <p class="text-slate-500 text-sm mt-1">
            ติดตามยาที่เข้า-ออกจากบัญชียา เหมาะสำหรับใช้ทบทวนในการประชุมทีมระบบยา
          </p>
        </div>
      </div>
      <button
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-sm shrink-0"
        @click="handlePrint"
      >
        <Printer :size="16" />
        พิมพ์รายงาน
      </button>
    </div>

    <!-- ── SCREEN ONLY: Date Range Controls ── -->
    <div class="no-print bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Calendar :size="15" class="text-indigo-500" />
          ช่วงเวลา
        </div>
        <button
          class="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-indigo-50"
          @click="fetchAll"
        >
          <RefreshCcw :size="13" />
          รีเฟรช
        </button>
      </div>

      <!-- Preset Buttons -->
      <div class="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          v-for="item in presets" :key="item.key"
          class="px-3.5 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all" :class="preset === item.key
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          " @click="applyPreset(item.key)"
        >
          {{ item.label }}
        </button>
      </div>

      <!-- Custom Date Inputs -->
      <Transition name="expand">
        <div
          v-if="preset === 'custom'"
          class="flex flex-col sm:flex-row items-end gap-3 pt-4 mt-4 border-t border-slate-100"
        >
          <div class="flex-1 min-w-0">
            <label for="date-from" class="block text-xs font-medium text-slate-500 mb-1.5">จาก:</label>
            <input
              id="date-from"
              v-model="fromDate" type="date"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            >
          </div>
          <div class="flex-1 min-w-0">
            <label for="date-to" class="block text-xs font-medium text-slate-500 mb-1.5">ถึง:</label>
            <input
              id="date-to"
              v-model="toDate" type="date"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            >
          </div>
          <button
            class="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/25 transition-all active:scale-95 shrink-0"
            @click="fetchAll"
          >
            <Filter :size="14" />
            ค้นหา
          </button>
        </div>
      </Transition>
    </div>

    <!-- ── SCREEN ONLY: Stats Banner ── -->
    <div class="no-print grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <!-- Total Active -->
      <div class="bg-linear-to-br from-blue-50 to-indigo-50/60 rounded-2xl border border-blue-100/70 p-5 shadow-sm">
        <div class="flex items-start justify-between mb-3">
          <div class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
            <Pill :size="20" />
          </div>
          <span class="text-xs font-semibold text-blue-500 bg-blue-100/80 px-2.5 py-0.5 rounded-full">Live</span>
        </div>
        <div v-if="isLoadingStats" class="animate-pulse">
          <div class="h-9 bg-blue-200/50 rounded-xl w-20 mb-2" />
          <div class="h-4 bg-blue-100/70 rounded-lg w-28 mb-1" />
          <div class="h-3 bg-blue-100/50 rounded-lg w-36" />
        </div>
        <template v-else>
          <div class="text-3xl font-bold text-blue-700 tracking-tight mb-1">
            {{ stats?.total_active ?? '--' }}
          </div>
          <div class="text-sm font-semibold text-blue-600">
            รายการยาทั้งหมด
          </div>
          <div class="text-xs text-blue-400 mt-0.5">
            ยาที่ใช้งานอยู่ในปัจจุบัน
          </div>
        </template>
      </div>

      <!-- Added in Range -->
      <div
        class="bg-linear-to-br from-emerald-50 to-green-50/60 rounded-2xl border border-emerald-100/70 p-5 shadow-sm"
      >
        <div class="flex items-start justify-between mb-3">
          <div class="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
            <TrendingUp :size="20" />
          </div>
          <Sparkles :size="16" class="text-emerald-400 mt-1.5" />
        </div>
        <div v-if="isLoadingStats" class="animate-pulse">
          <div class="h-9 bg-emerald-200/50 rounded-xl w-16 mb-2" />
          <div class="h-4 bg-emerald-100/70 rounded-lg w-24 mb-1" />
          <div class="h-3 bg-emerald-100/50 rounded-lg w-40" />
        </div>
        <template v-else>
          <div class="text-3xl font-bold text-emerald-700 tracking-tight mb-1">
            {{ stats ? `+${stats.added_count}` : '--' }}
          </div>
          <div class="text-sm font-semibold text-emerald-600">
            ยาเข้าใหม่
          </div>
          <div class="text-xs text-emerald-400 mt-0.5">
            {{ formatDate(fromDate) }} – {{ formatDate(toDate) }}
          </div>
        </template>
      </div>

      <!-- Removed in Range -->
      <div class="bg-linear-to-br from-red-50 to-rose-50/60 rounded-2xl border border-red-100/70 p-5 shadow-sm">
        <div class="flex items-start justify-between mb-3">
          <div class="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-red-500">
            <TrendingDown :size="20" />
          </div>
          <ArchiveX :size="16" class="text-red-400 mt-1.5" />
        </div>
        <div v-if="isLoadingStats" class="animate-pulse">
          <div class="h-9 bg-red-200/50 rounded-xl w-16 mb-2" />
          <div class="h-4 bg-red-100/70 rounded-lg w-24 mb-1" />
          <div class="h-3 bg-red-100/50 rounded-lg w-40" />
        </div>
        <template v-else>
          <div class="text-3xl font-bold text-red-700 tracking-tight mb-1">
            {{ stats ? `-${stats.removed_count}` : '--' }}
          </div>
          <div class="text-sm font-semibold text-red-600">
            ยาที่นำออก
          </div>
          <div class="text-xs text-red-400 mt-0.5">
            {{ formatDate(fromDate) }} – {{ formatDate(toDate) }}
          </div>
        </template>
      </div>
    </div>

    <!-- ── SCREEN ONLY: Search + Tabs + Drug List + Pagination ── -->
    <div class="no-print">
      <!-- Search Bar -->
      <div class="relative mb-5">
        <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" :size="16" />
        <input
          id="activity-search"
          v-model="searchTerm" type="text" placeholder="ค้นหาชื่อยา, รหัสยา..."
          class="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm transition-all"
          @input="onSearchChange"
        >
      </div>

      <!-- Tab Switcher -->
      <div class="flex border-b border-slate-200 mb-5">
        <button
          class="px-5 py-3 text-sm font-medium transition-all relative" :class="activeTab === 'added'
            ? 'text-indigo-600 font-semibold'
            : 'text-slate-500 hover:text-slate-700'
          " @click="onTabChange('added')"
        >
          ยาเข้าใหม่ ({{ addedTotal }})
          <span
            v-if="activeTab === 'added'"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full"
          />
        </button>
        <button
          class="px-5 py-3 text-sm font-medium transition-all relative" :class="activeTab === 'removed'
            ? 'text-indigo-600 font-semibold'
            : 'text-slate-500 hover:text-slate-700'
          " @click="onTabChange('removed')"
        >
          ยาที่นำออก ({{ removedTotal }})
          <span
            v-if="activeTab === 'removed'"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full"
          />
        </button>
      </div>

      <!-- Drug Lists with Transition -->
      <Transition name="tab-fade" mode="out-in">
        <!-- ── ADDED Tab ── -->
        <div v-if="activeTab === 'added'" key="added">
          <!-- Loading -->
          <div v-if="isLoadingAdded" class="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 class="animate-spin mb-3 text-indigo-500" :size="32" />
            <p class="text-sm">
              กำลังโหลดข้อมูล...
            </p>
          </div>

          <!-- Empty -->
          <div
            v-else-if="addedDrugs.length === 0"
            class="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-2xl border border-slate-100"
          >
            <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <SearchX :size="28" class="opacity-50" />
            </div>
            <p class="text-base font-medium text-slate-600">
              ไม่พบยาเข้าใหม่ในช่วงเวลานี้
            </p>
            <p class="text-sm mt-1">
              ลองปรับช่วงเวลาหรือคำค้นหาใหม่
            </p>
          </div>

          <!-- Drug Cards -->
          <div v-else class="flex flex-col gap-3">
            <div
              v-for="drug in addedDrugs" :key="drug.id"
              class="bg-white rounded-2xl border border-slate-100 p-4 hover:border-emerald-200 hover:shadow-md transition-all shadow-sm"
            >
              <div class="flex items-start gap-4">
                <!-- Icon -->
                <div
                  class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5"
                >
                  <Pill :size="20" />
                </div>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <!-- Name & Badges -->
                  <div class="flex items-center flex-wrap gap-2 mb-1.5">
                    <span class="font-bold text-slate-900 text-base leading-tight">
                      {{ drug.trade_name }}
                    </span>
                    <span
                      v-if="drug.account"
                      class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100"
                    >
                      บัญชี {{ drug.account }}
                    </span>
                    <span
                      v-if="drug.category"
                      class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500"
                    >
                      {{ drug.category }}
                    </span>
                  </div>

                  <!-- Meta row -->
                  <div class="flex flex-wrap gap-x-3 gap-y-1 items-center text-sm text-slate-500 mb-2.5">
                    <span
                      class="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-slate-500"
                    >
                      {{ drug.drug_code }}
                    </span>
                    <span v-if="drug.generic_name">{{ drug.generic_name }}</span>
                  </div>

                  <!-- Added At -->
                  <div class="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                    <Calendar :size="13" />
                    เพิ่มเข้าเมื่อ: {{ formatDateTime(drug.created_at) }}
                  </div>

                  <!-- Notes -->
                  <div
                    v-if="drug.notes"
                    class="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-800 leading-relaxed"
                  >
                    <span class="font-semibold text-amber-600">📝 หมายเหตุ:</span>
                    {{ drug.notes }}
                  </div>
                </div>

                <!-- Price -->
                <div class="text-right shrink-0">
                  <div class="text-sm font-bold text-slate-900">
                    ฿{{ (drug.price_opd || 0).toFixed(2) }}
                  </div>
                  <div class="text-xs text-slate-400 mt-0.5">
                    ราคา OPD
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Added Pagination -->
          <div
            v-if="!isLoadingAdded && addedTotalPages > 1"
            class="flex items-center justify-between text-sm text-slate-500 mt-5"
          >
            <p>หน้า {{ addedPage }} จาก {{ addedTotalPages }} (รวม {{ addedTotal }} รายการ)</p>
            <div class="flex gap-2">
              <button
                :disabled="addedPage === 1"
                class="p-2 border border-slate-200 rounded-lg hover:bg-white bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                @click="fetchAdded(addedPage - 1)"
              >
                <ChevronLeft :size="16" />
              </button>
              <button
                :disabled="addedPage >= addedTotalPages"
                class="p-2 border border-slate-200 rounded-lg hover:bg-white bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                @click="fetchAdded(addedPage + 1)"
              >
                <ChevronRight :size="16" />
              </button>
            </div>
          </div>
        </div>

        <!-- ── REMOVED Tab ── -->
        <div v-else key="removed">
          <!-- Loading -->
          <div v-if="isLoadingRemoved" class="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 class="animate-spin mb-3 text-indigo-500" :size="32" />
            <p class="text-sm">
              กำลังโหลดข้อมูล...
            </p>
          </div>

          <!-- Empty -->
          <div
            v-else-if="removedDrugs.length === 0"
            class="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-2xl border border-slate-100"
          >
            <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <SearchX :size="28" class="opacity-50" />
            </div>
            <p class="text-base font-medium text-slate-600">
              ไม่พบยาที่นำออกในช่วงเวลานี้
            </p>
            <p class="text-sm mt-1">
              ลองปรับช่วงเวลาหรือคำค้นหาใหม่
            </p>
          </div>

          <!-- Drug Cards -->
          <div v-else class="flex flex-col gap-3">
            <div
              v-for="drug in removedDrugs" :key="drug.id"
              class="bg-white rounded-2xl border border-slate-100 p-4 hover:border-red-200 hover:shadow-md transition-all shadow-sm"
            >
              <div class="flex items-start gap-4">
                <!-- Icon -->
                <div
                  class="w-10 h-10 rounded-xl bg-red-100 text-red-500 flex items-center justify-center shrink-0 mt-0.5"
                >
                  <Pill :size="20" />
                </div>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <!-- Name & Badges -->
                  <div class="flex items-center flex-wrap gap-2 mb-1.5">
                    <span class="font-bold text-slate-900 text-base leading-tight">
                      {{ drug.trade_name }}
                    </span>
                    <span
                      v-if="drug.account"
                      class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100"
                    >
                      บัญชี {{ drug.account }}
                    </span>
                    <span
                      v-if="drug.category"
                      class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500"
                    >
                      {{ drug.category }}
                    </span>
                  </div>

                  <!-- Meta row -->
                  <div class="flex flex-wrap gap-x-3 gap-y-1 items-center text-sm text-slate-500 mb-2.5">
                    <span
                      class="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-slate-500"
                    >
                      {{ drug.drug_code }}
                    </span>
                    <span v-if="drug.generic_name">{{ drug.generic_name }}</span>
                  </div>

                  <!-- Removed At -->
                  <div class="inline-flex items-center gap-1.5 text-xs text-red-500 font-semibold">
                    <Calendar :size="13" />
                    นำออกเมื่อ: {{ formatDateTime(drug.decommissioned_at) }}
                  </div>

                  <!-- Remarks (Reason) -->
                  <div
                    v-if="drug.remarks"
                    class="mt-3 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700 leading-relaxed"
                  >
                    <span class="font-semibold text-red-600">เหตุผล:</span>
                    {{ drug.remarks }}
                  </div>
                </div>

                <!-- Price (struck through) -->
                <div class="text-right shrink-0">
                  <div class="text-sm font-bold text-slate-400 line-through">
                    ฿{{ (drug.price_opd || 0).toFixed(2) }}
                  </div>
                  <div class="text-xs text-slate-400 mt-0.5">
                    ราคา OPD
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Removed Pagination -->
          <div
            v-if="!isLoadingRemoved && removedTotalPages > 1"
            class="flex items-center justify-between text-sm text-slate-500 mt-5"
          >
            <p>หน้า {{ removedPage }} จาก {{ removedTotalPages }} (รวม {{ removedTotal }} รายการ)</p>
            <div class="flex gap-2">
              <button
                :disabled="removedPage === 1"
                class="p-2 border border-slate-200 rounded-lg hover:bg-white bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                @click="fetchRemoved(removedPage - 1)"
              >
                <ChevronLeft :size="16" />
              </button>
              <button
                :disabled="removedPage >= removedTotalPages"
                class="p-2 border border-slate-200 rounded-lg hover:bg-white bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                @click="fetchRemoved(removedPage + 1)"
              >
                <ChevronRight :size="16" />
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- ── PRINT ONLY: Drug Tables ── -->
    <div class="print-only">
      <!-- Added Drugs Table -->
      <div class="mb-10">
        <h3 class="text-base font-bold border-b-2 border-slate-800 pb-2 mb-4">
          ยาเข้าใหม่ ({{ addedTotal }} รายการ)
        </h3>
        <p v-if="addedDrugs.length === 0" class="text-sm text-slate-500 py-4 text-center">
          ไม่มีรายการในช่วงเวลานี้
        </p>
        <table v-else class="w-full text-sm border-collapse">
          <thead>
            <tr class="border-b-2 border-slate-400">
              <th class="text-left py-2 pr-3 font-semibold text-slate-800">
                ชื่อยา / Generic
              </th>
              <th class="text-left py-2 pr-3 font-semibold text-slate-800">
                รหัสยา
              </th>
              <th class="text-left py-2 pr-3 font-semibold text-slate-800">
                บัญชี
              </th>
              <th class="text-left py-2 pr-3 font-semibold text-slate-800">
                วันที่เพิ่ม
              </th>
              <th class="text-right py-2 font-semibold text-slate-800">
                ราคา OPD
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="drug in addedDrugs" :key="drug.id" class="border-b border-slate-200">
              <td class="py-2 pr-3">
                <div class="font-semibold text-slate-900">
                  {{ drug.trade_name }}
                </div>
                <div class="text-xs text-slate-500">
                  {{ drug.generic_name }}
                </div>
              </td>
              <td class="py-2 pr-3 font-mono text-xs text-slate-600">
                {{ drug.drug_code }}
              </td>
              <td class="py-2 pr-3 text-slate-700">
                {{ drug.account }}
              </td>
              <td class="py-2 pr-3 text-slate-600">
                {{ formatDate(drug.created_at) }}
              </td>
              <td class="py-2 text-right font-semibold text-slate-900">
                ฿{{ (drug.price_opd || 0).toFixed(2) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Removed Drugs Table -->
      <div>
        <h3 class="text-base font-bold border-b-2 border-slate-800 pb-2 mb-4">
          ยาที่นำออก ({{ removedTotal }} รายการ)
        </h3>
        <p v-if="removedDrugs.length === 0" class="text-sm text-slate-500 py-4 text-center">
          ไม่มีรายการในช่วงเวลานี้
        </p>
        <table v-else class="w-full text-sm border-collapse">
          <thead>
            <tr class="border-b-2 border-slate-400">
              <th class="text-left py-2 pr-3 font-semibold text-slate-800">
                ชื่อยา / Generic
              </th>
              <th class="text-left py-2 pr-3 font-semibold text-slate-800">
                รหัสยา
              </th>
              <th class="text-left py-2 pr-3 font-semibold text-slate-800">
                บัญชี
              </th>
              <th class="text-left py-2 pr-3 font-semibold text-slate-800">
                เหตุผลที่นำออก
              </th>
              <th class="text-left py-2 font-semibold text-slate-800">
                วันที่นำออก
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="drug in removedDrugs" :key="drug.id" class="border-b border-slate-200">
              <td class="py-2 pr-3">
                <div class="font-semibold text-slate-900">
                  {{ drug.trade_name }}
                </div>
                <div class="text-xs text-slate-500">
                  {{ drug.generic_name }}
                </div>
              </td>
              <td class="py-2 pr-3 font-mono text-xs text-slate-600">
                {{ drug.drug_code }}
              </td>
              <td class="py-2 pr-3 text-slate-700">
                {{ drug.account }}
              </td>
              <td class="py-2 pr-3 text-slate-600">
                {{ drug.remarks || '–' }}
              </td>
              <td class="py-2 text-slate-600">
                {{ formatDate(drug.decommissioned_at) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media print {
  .no-print {
    display: none !important;
  }

  .print-only {
    display: block !important;
  }
}

.print-only {
  display: none;
}

/* Tab Transition */
.tab-fade-enter-active,
.tab-fade-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.tab-fade-enter-from,
.tab-fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

/* Custom date expand */
.expand-enter-active,
.expand-leave-active {
  transition: opacity 0.2s ease;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
}
</style>
