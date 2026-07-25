'use client';

import { cn } from '@/lib/utils';

type Period = 'morning' | 'noon' | 'evening';

interface PeriodCardProps {
  period: Period;
  label: string;
  timeRange: string;
  icon: string;
  isChecked: boolean;
  isCurrent: boolean;
  onCheckin: () => void;
}

export function PeriodCard({ period, label, timeRange, icon, isChecked, isCurrent, onCheckin }: PeriodCardProps) {
  return (
    <button
      onClick={onCheckin}
      className={cn(
        'relative flex-1 flex flex-col items-center justify-center py-5 px-3 rounded-2xl transition-all active:scale-[0.97]',
        isChecked
          ? 'bg-amber-400/20 border-2 border-amber-400/60'
          : 'bg-white/5 border-2 border-white/10 hover:border-white/20',
        isCurrent && !isChecked && 'border-amber-400/40 animate-pulse',
      )}
    >
      {/* 当前时段指示 */}
      {isCurrent && (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-amber-400 text-black text-[10px] font-bold rounded-full">
          当前
        </span>
      )}

      <span className="text-3xl mb-1">{icon}</span>
      <span className={cn(
        'text-sm font-semibold',
        isChecked ? 'text-amber-300' : 'text-white/80'
      )}>
        {label}
      </span>
      <span className="text-[10px] text-white/40 mt-0.5">{timeRange}</span>

      {isChecked ? (
        <span className="mt-2 text-xs text-amber-300 font-medium flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          已打卡
        </span>
      ) : (
        <span className="mt-2 text-xs text-white/40">点击打卡</span>
      )}
    </button>
  );
}
