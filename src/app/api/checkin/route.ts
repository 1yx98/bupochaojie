import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// GET /api/checkin?month=YYYY-MM - 获取某月打卡记录
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');

    const client = getSupabaseClient();
    let query = client
      .from('checkin_records')
      .select('id, checkin_date, period, created_at')
      .order('checkin_date', { ascending: false })
      .order('period', { ascending: true });

    if (month) {
      const startDate = `${month}-01`;
      const [y, m] = month.split('-').map(Number);
      const lastDay = new Date(y, m, 0).getDate();
      const endDate = `${month}-${String(lastDay).padStart(2, '0')}`;
      query = query.gte('checkin_date', startDate).lte('checkin_date', endDate);
    }

    const { data, error } = await query;
    if (error) throw new Error(`查询失败: ${error.message}`);
    return NextResponse.json({ success: true, data: data || [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST /api/checkin - 打卡（传入 period: morning/noon/evening）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { period } = body;

    const validPeriods = ['morning', 'noon', 'evening'];
    if (!period || !validPeriods.includes(period)) {
      return NextResponse.json(
        { success: false, error: '无效的时段，可选: morning, noon, evening' },
        { status: 400 }
      );
    }

    // 使用当前日期
    const today = new Date();
    const checkinDate = today.toISOString().split('T')[0];

    const client = getSupabaseClient();

    // 检查是否已打卡
    const { data: existing, error: checkError } = await client
      .from('checkin_records')
      .select('id')
      .eq('checkin_date', checkinDate)
      .eq('period', period)
      .maybeSingle();
    if (checkError) throw new Error(`查询失败: ${checkError.message}`);

    if (existing) {
      // 取消打卡
      const { error: delError } = await client
        .from('checkin_records')
        .delete()
        .eq('id', existing.id);
      if (delError) throw new Error(`取消打卡失败: ${delError.message}`);
      return NextResponse.json({ success: true, action: 'unchecked' });
    } else {
      // 打卡
      const { data, error: insError } = await client
        .from('checkin_records')
        .insert({ checkin_date: checkinDate, period })
        .select('id, checkin_date, period, created_at')
        .single();
      if (insError) throw new Error(`打卡失败: ${insError.message}`);
      return NextResponse.json({ success: true, action: 'checked', data });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
