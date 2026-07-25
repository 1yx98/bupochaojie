'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface CalendarProps {
  currentMonth: string;
  records: Array<{ checkin_date: string; period: string }>;
  onMonthChange: (delta: number) => void;
}

export function Calendar({ currentMonth, records, onMonthChange }: CalendarProps) {
  const { year, month, days } = useMemo(() => {
    const [y, m] = currentMonth.split('-').map(Number);
    const firstDay = new Date(y, m - 1, 1);
    const lastDay = new Date(y, m, 0);
    const startDow = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const todayStr = new Date().toISOString().split('T')[0];

    type DayItem = {
      date: string;
      day: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isFuture: boolean;
      periods: Set<string>;
    };

    const dayItems: DayItem[] = [];

    // 上月补齐
    const prevLastDay = new Date(y, m - 1, 0).getDate();
    for (let i = startDow - 1; i >= 0; i--) {
      const d = prevLastDay - i;
      const mo = m - 1 <= 0 ? 12 : m - 1;
      const yr = m - 1 <= 0 ? y - 1 : y;
      const dateStr = `${yr}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      dayItems.push({ date: dateStr, day: d, isCurrentMonth: false, isToday: false, isFuture: false, periods: new Set() });
    }

    // 当月
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      dayItems.push({
        date: dateStr,
        day: d,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        isFuture: dateStr > todayStr,
        periods: new Set(),
      });
    }

    // 下月补齐
    const remaining = 42 - dayItems.length;
    for (let d = 1; d <= remaining; d++) {
      const mo = m + 1 > 12 ? 1 : m + 1;
      const yr = m + 1 > 12 ? y + 1 : y;
      const dateStr = `${yr}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      dayItems.push({ date: dateStr, day: d, isCurrentMonth: false, isToday: false, isFuture: false, periods: new Set() });
    }

    return { year: y, month: m, days: dayItems };
  }, [currentMonth, records]);

  // 标记打卡状态
  const recordMap = new Map<string, Set<string>>();
  for (const r of records) {
    if (!recordMap.has(r.checkin_date)) recordMap.set(r.checkin_date, new Set());
    recordMap.get(r.checkin_date)!.add(r.period);
  }
  const daysWithStatus = days.map(d => ({
    ...d,
    periods: recordMap.get(d.date) || new Set(),
  }));

  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const getCount = (periods: Set<string>) => periods.size;

  return (
    <div className="w-full">
      {/* 月份导航 */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onMonthChange(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h2 className="text-base font-semibold text-white">{year}年 {monthNames[month - 1]}</h2>
        <button
          onClick={() => onMonthChange(1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>

      {/* 星期标题 */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map(w => (
          <div key={w} className="text-center text-xs font-medium text-white/40 py-1">{w}</div>
        ))}
      </div>

      {/* 日期网格 */}
      <div className="grid grid-cols-7 gap-1">
        {daysWithStatus.map((item) => {
          const count = getCount(item.periods);
          return (
            <div
              key={item.date}
              className={cn(
                'relative aspect-square flex flex-col items-center justify-center rounded-lg text-xs transition-all',
                !item.isCurrentMonth && 'text-white/15',
                item.isCurrentMonth && item.isFuture && 'text-white/30',
                item.isCurrentMonth && !item.isFuture && count === 0 && 'text-white/70',
                item.isToday && item.isCurrentMonth && 'ring-1 ring-amber-400/60',
              )}
            >
              <span className={cn(
                item.isToday && 'font-bold text-amber-300',
                count > 0 && item.isCurrentMonth && 'text-white font-medium',
              )}>
                {item.day}
              </span>
              {/* 打卡指示点 */}
              {item.isCurrentMonth && count > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {(['morning', 'noon', 'evening'] as const).map(p => (
                    <span
                      key={p}
                      className={cn(
                        'w-1 h-1 rounded-full',
                        item.periods.has(p) ? 'bg-amber-400' : 'bg-white/10',
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 图例 */}
      <div className="flex items-center justify-center gap-4 mt-3 text-xs text-white/40">
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" />已打卡</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-white/10" />未打卡</span>
      </div>
    </div>
  );
}
