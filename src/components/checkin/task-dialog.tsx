'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface TaskFormData {
  name: string;
  icon: string;
  color: string;
  description: string;
}

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TaskFormData) => void;
  initialData?: TaskFormData | null;
  title: string;
}

const ICON_OPTIONS = ['✅', '📚', '🏃', '💧', '🧘', '💪', '🎯', '✍️', '🎵', '🌅', '🥗', '💤', '🧹', '💊', '📝', '🎨'];
const COLOR_OPTIONS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'];

export function TaskDialog({ open, onOpenChange, onSubmit, initialData, title }: TaskDialogProps) {
  const [form, setForm] = useState<TaskFormData>({
    name: '',
    icon: '✅',
    color: '#6366f1',
    description: '',
  });

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else {
      setForm({ name: '', icon: '✅', color: '#6366f1', description: '' });
    }
  }, [initialData, open]);

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    onSubmit(form);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* 名称 */}
          <div className="space-y-2">
            <Label>习惯名称</Label>
            <Input
              placeholder="例如：每天阅读30分钟"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              maxLength={50}
            />
          </div>

          {/* 图标选择 */}
          <div className="space-y-2">
            <Label>图标</Label>
            <div className="flex flex-wrap gap-1.5">
              {ICON_OPTIONS.map(icon => (
                <button
                  key={icon}
                  onClick={() => setForm(prev => ({ ...prev, icon }))}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all ${
                    form.icon === icon ? 'bg-accent ring-2 ring-primary scale-110' : 'hover:bg-accent/50'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* 颜色选择 */}
          <div className="space-y-2">
            <Label>主题色</Label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map(color => (
                <button
                  key={color}
                  onClick={() => setForm(prev => ({ ...prev, color }))}
                  className={`w-7 h-7 rounded-full transition-all ${
                    form.color === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* 描述 */}
          <div className="space-y-2">
            <Label>描述（可选）</Label>
            <Textarea
              placeholder="添加一些描述..."
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              maxLength={200}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={handleSubmit} disabled={!form.name.trim()}>
            {initialData ? '保存' : '创建'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
