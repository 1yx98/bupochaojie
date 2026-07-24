'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface CalendarProps {
  currentMonth: string; // YYYY-MM
  checkedDates: string[]; // YYYY-MM-DD 格式的日期数组
  taskColor: string;
  onDateClick: (date: string) => void;
  onMonthChange: (delta: number) => void;
}

export function Calendar({ currentMonth, checkedDates, taskColor, onDateClick, onMonthChange }: CalendarProps) {
  const { year, month, days, today } = useMemo(() => {
    const [y, m] = currentMonth.split('-').map(Number);
    const firstDay = new Date(y, m - 1, 1);
    const lastDay = new Date(y, m, 0);
    const startDow = firstDay.getDay(); // 0=Sun
    const daysInMonth = lastDay.getDate();

    const todayStr = new Date().toISOString().split('T')[0];

    const dayItems: Array<{ date: string; day: number; isCurrentMonth: boolean; isToday: boolean; isChecked: boolean; isFuture: boolean }> = [];

    // 上月补齐
    const prevMonthLastDay = new Date(y, m - 1, 0).getDate();
    for (let i = startDow - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const dateStr = `${y}-${String(m - 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      dayItems.push({ date: dateStr, day: d, isCurrentMonth: false, isToday: false, isChecked: false, isFuture: false });
    }

    // 当月
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      dayItems.push({
        date: dateStr,
        day: d,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        isChecked: false,
        isFuture: dateStr > todayStr,
      });
    }

    // 下月补齐到 42 格
    const remaining = 42 - dayItems.length;
    for (let d = 1; d <= remaining; d++) {
      const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      dayItems.push({ date: dateStr, day: d, isCurrentMonth: false, isToday: false, isChecked: false, isFuture: false });
    }

    return { year: y, month: m, days: dayItems, today: todayStr };
  }, [currentMonth, checkedDates]);

  // 标记已打卡日期
  const checkedSet = new Set(checkedDates);
  const daysWithStatus = days.map(d => ({ ...d, isChecked: checkedSet.has(d.date) }));

  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className="w-full">
      {/* 月份导航 */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onMonthChange(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h2 className="text-lg font-semibold">{year}年 {monthNames[month - 1]}</h2>
        <button
          onClick={() => onMonthChange(1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>

      {/* 星期标题 */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map(w => (
          <div key={w} className="text-center text-xs font-medium text-muted-foreground py-1">
            {w}
          </div>
        ))}
      </div>

      {/* 日期网格 */}
      <div className="grid grid-cols-7 gap-1">
        {daysWithStatus.map((item) => (
          <button
            key={item.date}
            onClick={() => item.isCurrentMonth && !item.isFuture ? onDateClick(item.date) : undefined}
            disabled={!item.isCurrentMonth || item.isFuture}
            className={cn(
              'relative aspect-square flex items-center justify-center rounded-lg text-sm transition-all',
              !item.isCurrentMonth && 'text-muted-foreground/30 cursor-default',
              item.isCurrentMonth && item.isFuture && 'text-muted-foreground/50 cursor-default',
              item.isCurrentMonth && !item.isFuture && !item.isChecked && 'hover:bg-accent cursor-pointer',
              item.isChecked && 'text-white font-medium shadow-sm',
              item.isToday && item.isCurrentMonth && !item.isChecked && 'ring-2 ring-primary/50 font-semibold',
            )}
            style={item.isChecked ? { backgroundColor: taskColor } : undefined}
          >
            {item.day}
            {item.isChecked && (
              <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2">
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
