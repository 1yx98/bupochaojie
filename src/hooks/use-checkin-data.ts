'use client';

import { useState, useEffect, useCallback } from 'react';

interface CheckinTask {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string | null;
  created_at: string;
}

interface CheckinRecord {
  id: string;
  task_id: string;
  checkin_date: string;
  created_at: string;
}

interface CheckinStats {
  total_days: number;
  current_streak: number;
  longest_streak: number;
}

export function useCheckinData() {
  const [tasks, setTasks] = useState<CheckinTask[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [records, setRecords] = useState<CheckinRecord[]>([]);
  const [stats, setStats] = useState<CheckinStats>({ total_days: 0, current_streak: 0, longest_streak: 0 });
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [loading, setLoading] = useState(true);

  // 获取所有任务
  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/tasks');
      const json = await res.json();
      if (json.success) {
        setTasks(json.data);
        if (json.data.length > 0 && !selectedTaskId) {
          setSelectedTaskId(json.data[0].id);
        }
      }
    } catch (err) {
      console.error('获取任务失败:', err);
    }
  }, [selectedTaskId]);

  // 获取打卡记录
  const fetchRecords = useCallback(async () => {
    if (!selectedTaskId) return;
    try {
      const res = await fetch(`/api/checkin?task_id=${selectedTaskId}&month=${currentMonth}`);
      const json = await res.json();
      if (json.success) {
        setRecords(json.data);
      }
    } catch (err) {
      console.error('获取记录失败:', err);
    }
  }, [selectedTaskId, currentMonth]);

  // 获取统计
  const fetchStats = useCallback(async () => {
    if (!selectedTaskId) return;
    try {
      const res = await fetch(`/api/checkin/stats?task_id=${selectedTaskId}`);
      const json = await res.json();
      if (json.success) {
        setStats(json.data);
      }
    } catch (err) {
      console.error('获取统计失败:', err);
    }
  }, [selectedTaskId]);

  // 打卡/取消打卡
  const toggleCheckin = useCallback(async (date: string): Promise<'checked' | 'unchecked' | null> => {
    if (!selectedTaskId) return null;
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: selectedTaskId, checkin_date: date }),
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
  }, [selectedTaskId, fetchRecords, fetchStats]);

  // 创建任务
  const createTask = useCallback(async (data: { name: string; icon: string; color: string; description?: string }) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        await fetchTasks();
        setSelectedTaskId(json.data.id);
      }
      return json;
    } catch (err) {
      console.error('创建任务失败:', err);
      return { success: false, error: '创建失败' };
    }
  }, [fetchTasks]);

  // 更新任务
  const updateTask = useCallback(async (id: string, data: Partial<{ name: string; icon: string; color: string; description: string }>) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        await fetchTasks();
      }
      return json;
    } catch (err) {
      console.error('更新任务失败:', err);
      return { success: false, error: '更新失败' };
    }
  }, [fetchTasks]);

  // 删除任务
  const deleteTask = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        if (selectedTaskId === id) {
          setSelectedTaskId(null);
        }
        await fetchTasks();
      }
      return json;
    } catch (err) {
      console.error('删除任务失败:', err);
      return { success: false, error: '删除失败' };
    }
  }, [selectedTaskId, fetchTasks]);

  // 切换月份
  const changeMonth = useCallback((delta: number) => {
    setCurrentMonth(prev => {
      const [y, m] = prev.split('-').map(Number);
      const date = new Date(y, m - 1 + delta, 1);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    });
  }, []);

  // 初始加载
  useEffect(() => {
    async function init() {
      setLoading(true);
      await fetchTasks();
      setLoading(false);
    }
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 选中任务变化时刷新记录和统计
  useEffect(() => {
    if (selectedTaskId) {
      fetchRecords();
      fetchStats();
    }
  }, [selectedTaskId, currentMonth]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedTask = tasks.find(t => t.id === selectedTaskId) || null;

  return {
    tasks,
    selectedTask,
    selectedTaskId,
    setSelectedTaskId,
    records,
    stats,
    currentMonth,
    loading,
    toggleCheckin,
    createTask,
    updateTask,
    deleteTask,
    changeMonth,
    fetchTasks,
    fetchRecords,
    fetchStats,
  };
}
