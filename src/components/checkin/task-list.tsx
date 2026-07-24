'use client';

import { cn } from '@/lib/utils';

interface Task {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string | null;
}

interface TaskListProps {
  tasks: Task[];
  selectedTaskId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TaskList({ tasks, selectedTaskId, onSelect, onAdd, onEdit, onDelete }: TaskListProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-muted-foreground">我的习惯</h3>
        <button
          onClick={onAdd}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground text-sm">
          <p>还没有打卡任务</p>
          <p className="text-xs mt-1">点击上方 + 创建第一个习惯</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {tasks.map(task => (
            <div
              key={task.id}
              className={cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all',
                selectedTaskId === task.id
                  ? 'bg-accent shadow-sm'
                  : 'hover:bg-accent/50'
              )}
              onClick={() => onSelect(task.id)}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
                style={{ backgroundColor: `${task.color}20` }}
              >
                {task.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{task.name}</p>
                {task.description && (
                  <p className="text-xs text-muted-foreground truncate">{task.description}</p>
                )}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(task); }}
                  className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-background/80 text-muted-foreground"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                  className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
