import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// GET /api/tasks - 获取所有打卡任务
export async function GET() {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('checkin_tasks')
      .select('id, name, icon, color, description, created_at')
      .order('created_at', { ascending: false });
    if (error) throw new Error(`查询失败: ${error.message}`);
    return NextResponse.json({ success: true, data: data || [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST /api/tasks - 创建打卡任务
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, icon, color, description } = body;
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ success: false, error: '任务名称不能为空' }, { status: 400 });
    }
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('checkin_tasks')
      .insert({
        name: name.trim(),
        icon: icon || '✅',
        color: color || '#6366f1',
        description: description || null,
      })
      .select('id, name, icon, color, description, created_at')
      .single();
    if (error) throw new Error(`创建失败: ${error.message}`);
    return NextResponse.json({ success: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
