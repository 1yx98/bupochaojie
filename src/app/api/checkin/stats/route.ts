import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// GET /api/checkin/stats?task_id=xxx - 获取某任务的统计信息
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('task_id');

    if (!taskId) {
      return NextResponse.json({ success: false, error: '缺少 task_id 参数' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // 获取所有打卡记录
    const { data: records, error } = await client
      .from('checkin_records')
      .select('checkin_date')
      .eq('task_id', taskId)
      .order('checkin_date', { ascending: true });
    if (error) throw new Error(`查询失败: ${error.message}`);

    if (!records || records.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          total_days: 0,
          current_streak: 0,
          longest_streak: 0,
        },
      });
    }

    const dates = records.map((r: { checkin_date: string }) => r.checkin_date).sort();
    const totalDays = dates.length;

    // 计算当前连续打卡天数
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let currentStreak = 0;
    const lastDate = dates[dates.length - 1];

    // 只有今天或昨天打卡了才有当前连续
    if (lastDate === todayStr || lastDate === yesterdayStr) {
      currentStreak = 1;
      let checkDate = new Date(lastDate);
      for (let i = dates.length - 2; i >= 0; i--) {
        checkDate.setDate(checkDate.getDate() - 1);
        const expected = checkDate.toISOString().split('T')[0];
        if (dates[i] === expected) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // 计算最长连续打卡天数
    let longestStreak = 1;
    let tempStreak = 1;
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1]);
      const curr = new Date(dates[i]);
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        total_days: totalDays,
        current_streak: currentStreak,
        longest_streak: longestStreak,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
