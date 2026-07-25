'use client';

import { useState, useEffect, useCallback } from 'react';

interface CheckinRecord {
  id: string;
  checkin_date: string;
  period: string;
  created_at: string;
}

interface CheckinStats {
  total_checkins: number;
  total_days: number;
  current_streak: number;
  longest_streak: number;
  perfect_days: number;
}

export function useCheckinData() {
  const [records, setRecords] = useState<CheckinRecord[]>([]);
  const [stats, setStats] = useState<CheckinStats>({
    total_checkins: 0,
    total_days: 0,
    current_streak: 0,
    longest_streak: 0,
    perfect_days: 0,
  });
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [loading, setLoading] = useState(true);

  const fetchRecords = useCallback(async () => {
    try {
      const res = await fetch(`/api/checkin?month=${currentMonth}`);
      const json = await res.json();
      if (json.success) setRecords(json.data);
    } catch (err) {
      console.error('获取记录失败:', err);
    }
  }, [currentMonth]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/checkin/stats');
      const json = await res.json();
      if (json.success) setStats(json.data);
    } catch (err) {
      console.error('获取统计失败:', err);
    }
  }, []);

  // 打卡/取消打卡
  const toggleCheckin = useCallback(async (period: string): Promise<'checked' | 'unchecked' | null> => {
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period }),
      });
      const json = await res.json();
      if (json.success) {
        await fetchRecords();
        await fetchStats();
        return json.action as 'checked' | 'unchecked';
      }
      return null;
    } catch (err) {
      console.error('打卡失败:', err);
      return null;
    }
  }, [fetchRecords, fetchStats]);

  const changeMonth = useCallback((delta: number) => {
    setCurrentMonth(prev => {
      const [y, m] = prev.split('-').map(Number);
      const date = new Date(y, m - 1 + delta, 1);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    });
  }, []);

  useEffect(() => {
    async function init() {
      setLoading(true);
      await Promise.all([fetchRecords(), fetchStats()]);
      setLoading(false);
    }
    init();
  }, [fetchRecords, fetchStats]);

  // 获取今天各时段的打卡状态
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecords = records.filter(r => r.checkin_date === todayStr);
  const todayPeriods = {
    morning: todayRecords.some(r => r.period === 'morning'),
    noon: todayRecords.some(r => r.period === 'noon'),
    evening: todayRecords.some(r => r.period === 'evening'),
  };

  return {
    records,
    stats,
    currentMonth,
    loading,
    todayPeriods,
    todayStr,
    toggleCheckin,
    changeMonth,
    fetchRecords,
    fetchStats,
  };
}
