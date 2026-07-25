'use client';

interface StatsProps {
  stats: {
    total_checkins: number;
    total_days: number;
    current_streak: number;
    longest_streak: number;
    perfect_days: number;
  };
}

export function StatsCards({ stats }: StatsProps) {
  const items = [
    { label: '累计打卡', value: stats.total_checkins, unit: '次' },
    { label: '打卡天数', value: stats.total_days, unit: '天' },
    { label: '连续打卡', value: stats.current_streak, unit: '天' },
    { label: '最长连续', value: stats.longest_streak, unit: '天' },
    { label: '完美天数', value: stats.perfect_days, unit: '天' },
  ];

  return (
    <div className="grid grid-cols-5 gap-2">
      {items.map(item => (
        <div key={item.label} className="flex flex-col items-center py-2">
          <span className="text-xl font-bold text-amber-300">{item.value}</span>
          <span className="text-[10px] text-white/50 mt-0.5">{item.unit}{item.label}</span>
        </div>
      ))}
    </div>
  );
}
