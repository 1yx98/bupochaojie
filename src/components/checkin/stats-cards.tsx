'use client';

interface Stats {
  total_days: number;
  current_streak: number;
  longest_streak: number;
}

interface StatsCardsProps {
  stats: Stats;
  taskIcon: string;
  taskColor: string;
}

export function StatsCards({ stats, taskIcon, taskColor }: StatsCardsProps) {
  const items = [
    { label: '累计打卡', value: stats.total_days, suffix: '天' },
    { label: '连续打卡', value: stats.current_streak, suffix: '天' },
    { label: '最长连续', value: stats.longest_streak, suffix: '天' },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map(item => (
        <div
          key={item.label}
          className="flex flex-col items-center justify-center py-3 px-2 rounded-xl bg-card border border-border/50"
        >
          <span className="text-2xl font-bold" style={{ color: taskColor }}>
            {item.value}
          </span>
          <span className="text-xs text-muted-foreground mt-0.5">{item.suffix}{item.label}</span>
        </div>
      ))}
    </div>
  );
}
