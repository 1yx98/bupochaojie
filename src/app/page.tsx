'use client';

import { useState } from 'react';
import { useCheckinData } from '@/hooks/use-checkin-data';
import { Calendar } from '@/components/checkin/calendar';
import { TaskList } from '@/components/checkin/task-list';
import { StatsCards } from '@/components/checkin/stats-cards';
import { TaskDialog } from '@/components/checkin/task-dialog';
import { cn } from '@/lib/utils';

export default function CheckinPage() {
  const {
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
  } = useCheckinData();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<{
    id: string;
    name: string;
    icon: string;
    color: string;
    description: string;
  } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const checkedDates = records.map(r => r.checkin_date);

  const handleAddTask = () => {
    setEditingTask(null);
    setDialogOpen(true);
  };

  const handleEditTask = (task: { id: string; name: string; icon: string; color: string; description: string | null }) => {
    setEditingTask({ ...task, description: task.description || '' });
    setDialogOpen(true);
  };

  const handleDeleteTask = (id: string) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (deleteConfirm) {
      await deleteTask(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  const handleDialogSubmit = async (data: { name: string; icon: string; color: string; description: string }) => {
    if (editingTask) {
      await updateTask(editingTask.id, data);
    } else {
      await createTask(data);
    }
  };

  // 今日日期
  const todayStr = new Date().toISOString().split('T')[0];
  const isCheckedToday = checkedDates.includes(todayStr);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部栏 */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            </div>
            <h1 className="text-lg font-bold">赵展扬不要导管</h1>
          </div>
          <div className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' })}
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4 pb-20">
        {/* 任务列表 */}
        <section className="bg-card rounded-2xl border border-border/50 p-4">
          <TaskList
            tasks={tasks}
            selectedTaskId={selectedTaskId}
            onSelect={setSelectedTaskId}
            onAdd={handleAddTask}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
          />
        </section>

        {/* 选中任务的内容 */}
        {selectedTask ? (
          <>
            {/* 今日打卡按钮 */}
            <section className="bg-card rounded-2xl border border-border/50 p-4">
              <button
                onClick={() => toggleCheckin(todayStr)}
                className={cn(
                  'w-full py-4 rounded-xl flex items-center justify-center gap-3 font-medium text-lg transition-all active:scale-[0.98]',
                  isCheckedToday
                    ? 'bg-accent text-accent-foreground'
                    : 'text-white shadow-lg hover:shadow-xl'
                )}
                style={!isCheckedToday ? { backgroundColor: selectedTask.color } : undefined}
              >
                <span className="text-2xl">{selectedTask.icon}</span>
                {isCheckedToday ? (
                  <span>今日已打卡 ✓</span>
                ) : (
                  <span>立即打卡</span>
                )}
              </button>
            </section>

            {/* 统计卡片 */}
            <section className="bg-card rounded-2xl border border-border/50 p-4">
              <StatsCards
                stats={stats}
                taskIcon={selectedTask.icon}
                taskColor={selectedTask.color}
              />
            </section>

            {/* 日历 */}
            <section className="bg-card rounded-2xl border border-border/50 p-4">
              <Calendar
                currentMonth={currentMonth}
                checkedDates={checkedDates}
                taskColor={selectedTask.color}
                onDateClick={toggleCheckin}
                onMonthChange={changeMonth}
              />
            </section>
          </>
        ) : (
          !loading && tasks.length > 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-4xl mb-3">👆</p>
              <p>选择一个任务开始打卡</p>
            </div>
          )
        )}
      </main>

      {/* 任务编辑/创建弹窗 */}
      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleDialogSubmit}
        initialData={editingTask}
        title={editingTask ? '编辑习惯' : '新建习惯'}
      />

      {/* 删除确认弹窗 */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card rounded-2xl border border-border p-6 mx-4 max-w-sm w-full space-y-4">
            <h3 className="text-lg font-semibold">确认删除</h3>
            <p className="text-sm text-muted-foreground">
              删除后，该习惯的所有打卡记录也会被清除，此操作不可撤销。
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
