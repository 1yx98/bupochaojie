'use client';

import { useState, useEffect } from 'react';
import { useCheckinData } from '@/hooks/use-checkin-data';
import { Calendar } from '@/components/checkin/calendar';
import { StatsCards } from '@/components/checkin/stats-cards';
import { PeriodCard } from '@/components/checkin/period-card';

// 获取当前时段
function getCurrentPeriod(): 'morning' | 'noon' | 'evening' {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'noon';
  return 'evening';
}

export default function CheckinPage() {
  const {
    records,
    stats,
    currentMonth,
    loading,
    todayPeriods,
    toggleCheckin,
    changeMonth,
  } = useCheckinData();

  const [showCongrats, setShowCongrats] = useState(false);
  const currentPeriod = getCurrentPeriod();

  const handleCheckin = async (period: string) => {
    const action = await toggleCheckin(period);
    if (action === 'checked') {
      setShowCongrats(true);
    }
  };

  // 自动关闭恭喜弹窗
  useEffect(() => {
    if (showCongrats) {
      const timer = setTimeout(() => setShowCongrats(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [showCongrats]);

  // 今日完成数
  const todayCount = [todayPeriods.morning, todayPeriods.noon, todayPeriods.evening].filter(Boolean).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-white/50">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white relative">
      {/* 背景壁纸 */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/wallpaper.jpg)' }}
      />
      {/* 遮罩层，让内容可读 */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

      {/* 内容层 */}
      <div className="relative z-10">
      {/* 顶部标题 */}
      <header className="pt-8 pb-4 px-4 text-center">
        <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 bg-clip-text text-transparent">
          不要破戒
        </h1>
        <p className="text-white/40 text-sm mt-1">每日三打卡，坚持就是胜利</p>
      </header>

      <main className="max-w-lg mx-auto px-4 pb-20 space-y-4">
        {/* 今日进度 */}
        <section className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-white/60">今日进度</span>
            <span className="text-sm font-bold text-amber-300">{todayCount}/3</span>
          </div>
          {/* 进度条 */}
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full transition-all duration-500"
              style={{ width: `${(todayCount / 3) * 100}%` }}
            />
          </div>

          {/* 早中晚打卡卡片 */}
          <div className="flex gap-2">
            <PeriodCard
              period="morning"
              label="早上"
              timeRange="5:00-12:00"
              icon="🌅"
              isChecked={todayPeriods.morning}
              isCurrent={currentPeriod === 'morning'}
              onCheckin={() => handleCheckin('morning')}
            />
            <PeriodCard
              period="noon"
              label="中午"
              timeRange="12:00-18:00"
              icon="☀️"
              isChecked={todayPeriods.noon}
              isCurrent={currentPeriod === 'noon'}
              onCheckin={() => handleCheckin('noon')}
            />
            <PeriodCard
              period="evening"
              label="晚上"
              timeRange="18:00-5:00"
              icon="🌙"
              isChecked={todayPeriods.evening}
              isCurrent={currentPeriod === 'evening'}
              onCheckin={() => handleCheckin('evening')}
            />
          </div>
        </section>

        {/* 统计 */}
        <section className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
          <h3 className="text-sm text-white/60 mb-2">数据统计</h3>
          <StatsCards stats={stats} />
        </section>

        {/* 日历 */}
        <section className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
          <Calendar
            currentMonth={currentMonth}
            records={records}
            onMonthChange={changeMonth}
          />
        </section>
      </main>

      {/* 打卡成功恭喜弹窗 */}
      {showCongrats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-gradient-to-b from-purple-900 to-slate-900 rounded-3xl border border-amber-400/30 p-8 mx-4 max-w-sm w-full text-center space-y-4 shadow-2xl shadow-amber-400/10">
            <div className="text-6xl animate-bounce">🎉</div>
            <h3 className="text-2xl font-black bg-gradient-to-r from-amber-300 to-yellow-200 bg-clip-text text-transparent">
              好棒呀
            </h3>
            <p className="text-xl font-bold text-white">你不是废物!</p>
            <p className="text-sm text-white/40">继续保持，坚持就是胜利</p>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
