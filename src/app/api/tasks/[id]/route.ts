import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// PUT /api/tasks/[id] - 更新打卡任务
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, icon, color, description } = body;

    const client = getSupabaseClient();
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (icon !== undefined) updateData.icon = icon;
    if (color !== undefined) updateData.color = color;
    if (description !== undefined) updateData.description = description;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, error: '没有要更新的字段' }, { status: 400 });
    }

    const { data, error } = await client
      .from('checkin_tasks')
      .update(updateData)
      .eq('id', id)
      .select('id, name, icon, color, description, created_at')
      .single();
    if (error) throw new Error(`更新失败: ${error.message}`);
    return NextResponse.json({ success: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// DELETE /api/tasks/[id] - 删除打卡任务
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = getSupabaseClient();
    const { error } = await client
      .from('checkin_tasks')
      .delete()
      .eq('id', id);
    if (error) throw new Error(`删除失败: ${error.message}`);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
