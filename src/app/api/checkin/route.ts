import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// GET /api/checkin?task_id=xxx&month=2025-07 - 获取打卡记录
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('task_id');
    const month = searchParams.get('month'); // format: YYYY-MM

    if (!taskId) {
      return NextResponse.json({ success: false, error: '缺少 task_id 参数' }, { status: 400 });
    }

    const client = getSupabaseClient();
    let query = client
      .from('checkin_records')
      .select('id, task_id, checkin_date, created_at')
      .eq('task_id', taskId)
      .order('checkin_date', { ascending: false });

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

// POST /api/checkin - 打卡（toggle 模式：已打卡则取消，未打卡则打卡）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { task_id, checkin_date } = body;

    if (!task_id || !checkin_date) {
      return NextResponse.json({ success: false, error: '缺少 task_id 或 checkin_date 参数' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // 检查当天是否已打卡
    const { data: existing, error: checkError } = await client
      .from('checkin_records')
      .select('id')
      .eq('task_id', task_id)
      .eq('checkin_date', checkin_date)
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
        .insert({ task_id, checkin_date })
        .select('id, task_id, checkin_date, created_at')
        .single();
      if (insError) throw new Error(`打卡失败: ${insError.message}`);
      return NextResponse.json({ success: true, action: 'checked', data });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
