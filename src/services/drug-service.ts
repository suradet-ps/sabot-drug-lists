import type {
  ActivityStats,
  Drug,
  DrugFormData,
  DrugStatus,
  GetActivityParams,
  GetDrugsParams,
  GetDrugsResult,
  UpdateStatusParams,
} from '../types';
import { supabase } from './supabase-client';

const DRUGS_TABLE = 'drugs';

export const drugService = {
  /**
   * ดึงข้อมูลรายการยาแบบ Pagination และ Filtering
   */
  async getDrugs({
    page = 1,
    pageSize = 20,
    status = 'active' as DrugStatus,
    category = 'all',
    searchTerm = '',
  }: GetDrugsParams = {}): Promise<GetDrugsResult> {
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // เริ่มสร้าง Query — ใช้ const chain แทน let reassignment เพื่อความถูกต้องด้านประเภท
      const base = supabase.from(DRUGS_TABLE).select('*', { count: 'exact' });

      // Logic แยกสถานะ (Active vs Decommissioned)
      const withStatus
        = status === 'decommissioned'
          ? base
              .eq('is_active', false)
              .not('remarks', 'is', null)
              .order('decommissioned_at', { ascending: false })
          : base.eq('is_active', true).order('drug_code', { ascending: true });

      // Logic กรองตามหมวดหมู่
      const withCategory
        = category && category !== 'all' ? withStatus.eq('category', category) : withStatus;

      // Logic ค้นหา (Search)
      const term = `%${searchTerm.trim()}%`;
      const withSearch = searchTerm
        ? withCategory.or(
            `trade_name.ilike.${term},generic_name.ilike.${term},drug_code.ilike.${term},remarks.ilike.${term}`,
          )
        : withCategory;

      // Pagination + Execute
      const { data, count, error } = await withSearch.range(from, to);

      if (error)
        throw error;

      // FIX: Supabase client without generated DB types returns `any` for query results.
      // Runtime guarantee: the `drugs` table schema in Supabase matches the Drug type definition.
      return { data: (data ?? []) as Drug[], count };
    }
    catch (error) {
      console.error('DrugService Error [getDrugs]:', error);
      throw error;
    }
  },

  /**
   * ดึงหมวดหมู่ยาที่ไม่ซ้ำกัน (สำหรับ Dropdown filter)
   */
  async getCategories(): Promise<string[]> {
    try {
      const { data, error } = await supabase.rpc('get_unique_categories', {
        status_filter: 'active',
      });
      if (error)
        throw error;

      // FIX: RPC without generated DB types returns `any`.
      // Runtime guarantee: the procedure returns Array<{ category: string }>.
      return (data as Array<{ category: string }>).map(item => item.category);
    }
    catch (error) {
      console.error('DrugService Error [getCategories]:', error);
      throw error;
    }
  },

  /**
   * เพิ่ม หรือ แก้ไขข้อมูลยา (รองรับทั้งรายการเดียวและ Array)
   */
  async upsertDrugs(payload: DrugFormData | DrugFormData[]): Promise<true> {
    try {
      const { error } = await supabase.from(DRUGS_TABLE).upsert(payload, {
        onConflict: 'drug_code',
      });

      if (error)
        throw error;
      return true;
    }
    catch (error) {
      console.error('DrugService Error [upsertDrugs]:', error);
      throw error;
    }
  },

  /**
   * เปลี่ยนสถานะยา (Decommission / Recommission)
   */
  async updateStatus(id: string, { isActive, remarks = null }: UpdateStatusParams): Promise<true> {
    try {
      const updatePayload = {
        is_active: isActive,
        remarks,
        decommissioned_at: isActive ? null : new Date().toISOString(), // Logic เวลาอัตโนมัติ
      };

      const { error } = await supabase.from(DRUGS_TABLE).update(updatePayload).eq('id', id);

      if (error)
        throw error;
      return true;
    }
    catch (error) {
      console.error('DrugService Error [updateStatus]:', error);
      throw error;
    }
  },

  /**
   * ดึงสถิติกิจกรรมยา (ยาที่เพิ่ม / ถอดออก / คงเหลือ) ในช่วงเวลาที่กำหนด
   * เรียก PostgreSQL function get_activity_stats ผ่าน RPC
   */
  async getActivityStats(from: string, to: string): Promise<ActivityStats> {
    try {
      const { data, error } = await supabase.rpc('get_activity_stats', {
        p_from_date: from,
        p_to_date: to,
      });

      if (error)
        throw error;

      // Runtime guarantee: the function returns JSON ตรงกับ ActivityStats shape
      return data as ActivityStats;
    }
    catch (error) {
      console.error('DrugService Error [getActivityStats]:', error);
      throw error;
    }
  },

  /**
   * ดึงรายการยาที่เพิ่มใหม่ในช่วงเวลาที่กำหนด พร้อม Pagination และ Search
   * กรองจาก created_at ที่อยู่ในช่วง from–to
   */
  async getAddedDrugs({
    page = 1,
    pageSize = 20,
    from,
    to,
    searchTerm = '',
  }: GetActivityParams): Promise<GetDrugsResult> {
    try {
      const offset = (page - 1) * pageSize;
      const limit = offset + pageSize - 1;

      // Base query — กรองเฉพาะยาที่มี created_at อยู่ในช่วงที่กำหนด
      const base = supabase
        .from(DRUGS_TABLE)
        .select('*', { count: 'exact' })
        .not('created_at', 'is', null)
        .gte('created_at', from)
        .lte('created_at', to)
        .order('created_at', { ascending: false });

      // Logic ค้นหาแบบ Full-text บน trade_name / generic_name / drug_code
      const term = `%${searchTerm.trim()}%`;
      const withSearch = searchTerm
        ? base.or(
            `trade_name.ilike.${term},generic_name.ilike.${term},drug_code.ilike.${term}`,
          )
        : base;

      const { data, count, error } = await withSearch.range(offset, limit);

      if (error)
        throw error;

      return { data: (data ?? []) as Drug[], count };
    }
    catch (error) {
      console.error('DrugService Error [getAddedDrugs]:', error);
      throw error;
    }
  },

  /**
   * ดึงรายการยาที่ถูกถอดออกในช่วงเวลาที่กำหนด พร้อม Pagination และ Search
   * กรองจาก decommissioned_at ที่อยู่ในช่วง from–to และ is_active = false
   */
  async getRemovedDrugsInRange({
    page = 1,
    pageSize = 20,
    from,
    to,
    searchTerm = '',
  }: GetActivityParams): Promise<GetDrugsResult> {
    try {
      const offset = (page - 1) * pageSize;
      const limit = offset + pageSize - 1;

      // Base query — กรองเฉพาะยาที่ไม่ active และมี decommissioned_at อยู่ในช่วงที่กำหนด
      const base = supabase
        .from(DRUGS_TABLE)
        .select('*', { count: 'exact' })
        .eq('is_active', false)
        .not('decommissioned_at', 'is', null)
        .gte('decommissioned_at', from)
        .lte('decommissioned_at', to)
        .order('decommissioned_at', { ascending: false });

      // Logic ค้นหาแบบ Full-text บน trade_name / generic_name / drug_code
      const term = `%${searchTerm.trim()}%`;
      const withSearch = searchTerm
        ? base.or(
            `trade_name.ilike.${term},generic_name.ilike.${term},drug_code.ilike.${term}`,
          )
        : base;

      const { data, count, error } = await withSearch.range(offset, limit);

      if (error)
        throw error;

      return { data: (data ?? []) as Drug[], count };
    }
    catch (error) {
      console.error('DrugService Error [getRemovedDrugsInRange]:', error);
      throw error;
    }
  },
};
