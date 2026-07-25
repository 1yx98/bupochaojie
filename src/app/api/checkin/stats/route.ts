import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// GET /api/checkin/stats - 获取统计信息
export async function GET() {
  try {
    const client = getSupabaseClient();

    // 获取所有打卡记录
    const { data: records, error } = await client
      .from('checkin_records')
      .select('checkin_date, period')
      .order('checkin_date', { ascending: true });
    if (error) throw new Error(`查询失败: ${error.message}`);

    if (!records || records.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          total_checkins: 0,
          total_days: 0,
          current_streak: 0,
          longest_streak: 0,
          perfect_days: 0,
        },
      });
    }

    // 按日期分组
    const dateMap = new Map<string, Set<string>>();
    for (const r of records) {
      if (!dateMap.has(r.checkin_date)) {
        dateMap.set(r.checkin_date, new Set());
      }
      dateMap.get(r.checkin_date)!.add(r.period);
    }

    const dates = Array.from(dateMap.keys()).sort();
    const totalCheckins = records.length;
    const totalDays = dates.length;

    // 完美天数（一天三次全打）
    const perfectDays = dates.filter(d => dateMap.get(d)!.size >= 3).length;

    // 连续天数（按天算，至少打一次卡就算当天有效）
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let currentStreak = 0;
    const lastDate = dates[dates.length - 1];

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

    // 最长连续
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
        total_checkins: totalCheckins,
        total_days: totalDays,
        current_streak: currentStreak,
        longest_streak: longestStreak,
        perfect_days: perfectDays,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
