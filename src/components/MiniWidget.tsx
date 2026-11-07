import React, { useState } from 'react';
import { 
  Maximize2, 
  Pin, 
  PinOff, 
  Minus, 
  X, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Calendar 
} from 'lucide-react';
import { Todo, WidgetSettings } from '../types';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { getHoliday } from '../utils/holidays';
import { DEFAULT_CATEGORIES } from '../utils/constants';

interface MiniWidgetProps {
  currentTime: Date;
  settings: WidgetSettings;
  todos: Todo[];
  onToggleMiniMode: () => void;
  onUpdateSettings: (newSettings: Partial<WidgetSettings>) => void;
  onAddTodo: (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onToggleTodo: (id: string) => void;
}

export const MiniWidget: React.FC<MiniWidgetProps> = ({
  currentTime,
  settings,
  todos,
  onToggleMiniMode,
  onUpdateSettings,
  onAddTodo,
  onToggleTodo,
}) => {
  const [quickTitle, setQuickTitle] = useState('');
  const isLight = settings.theme === 'light';

  const todayStr = format(currentTime, 'yyyy-MM-dd');
  const holiday = getHoliday(todayStr);

  const todayTodos = todos.filter((t) => t.date === todayStr);
  const completedCount = todayTodos.filter((t) => t.completed).length;

  const handleToggleAlwaysOnTop = () => {
    const nextVal = !settings.alwaysOnTop;
    if (window.electronAPI?.setAlwaysOnTop) {
      window.electronAPI.setAlwaysOnTop(nextVal);
    }
    onUpdateSettings({ alwaysOnTop: nextVal });
  };

  const handleMinimize = () => {
    if (window.electronAPI?.minimizeWidget) {
      window.electronAPI.minimizeWidget();
    }
  };

  const handleClose = () => {
    if (window.electronAPI?.closeWidget) {
      window.electronAPI.closeWidget();
    }
  };

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    onAddTodo({
      title: quickTitle.trim(),
      date: todayStr,
      completed: false,
      priority: 'medium',
      categoryId: 'work',
    });

    setQuickTitle('');
  };

  return (
    <div className="w-full h-full flex flex-col p-3 select-none">
      {/* 미니 위젯 상단 드래그 헤더 */}
      <div className="drag-region flex items-center justify-between pb-2 mb-2 border-b border-white/10">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span 
            className="text-[11px] font-bold tracking-tight"
            style={{ color: isLight ? '#0f172a' : '#f8fafc' }}
          >
            오늘의 일정
          </span>
        </div>

        <div className="no-drag flex items-center gap-1">
          {/* 전체 화면으로 확장 */}
          <button
            onClick={onToggleMiniMode}
            title="캘린더 펼치기"
            className="p-1 rounded-md hover:bg-white/10 transition-colors text-slate-300 hover:text-white"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {/* 항상 위에 고정 */}
          <button
            onClick={handleToggleAlwaysOnTop}
            title={settings.alwaysOnTop ? '고정 해제' : '항상 위에 고정'}
            className={`p-1 rounded-md transition-colors ${
              settings.alwaysOnTop ? 'text-indigo-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            {settings.alwaysOnTop ? <Pin className="w-3.5 h-3.5 rotate-45" /> : <PinOff className="w-3.5 h-3.5" />}
          </button>

          {/* 숨기기 */}
          <button
            onClick={handleMinimize}
            title="숨기기"
            className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          {/* 닫기 */}
          <button
            onClick={handleClose}
            title="닫기"
            className="p-1 rounded-md hover:bg-rose-500/80 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 디지털 시계 및 날짜 디스플레이 */}
      <div className="mb-3 px-1 text-center flex flex-col items-center">
        <div 
          className="text-3xl font-extrabold tracking-tight font-mono text-indigo-400 dark:text-indigo-300 drop-shadow-sm"
        >
          {format(currentTime, 'HH:mm:ss')}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span 
            className="text-xs font-semibold"
            style={{ color: isLight ? '#334155' : '#cbd5e1' }}
          >
            {format(currentTime, 'yyyy년 M월 d일 (EEE)', { locale: ko })}
          </span>
          {holiday && (
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
              {holiday.name}
            </span>
          )}
        </div>
      </div>

      {/* 빠른 할 일 입력 */}
      <form onSubmit={handleQuickAdd} className="mb-2.5 flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
        <input
          type="text"
          placeholder="오늘 할 일 빠르게 등록..."
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          className="flex-1 bg-transparent text-xs px-1.5 py-0.5 outline-none placeholder:text-slate-500"
          style={{ color: isLight ? '#0f172a' : '#f8fafc' }}
        />
        <button
          type="submit"
          disabled={!quickTitle.trim()}
          className="p-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white transition-all shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* 오늘의 할 일 리스트 */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-0.5">
        <div className="flex justify-between items-center text-[10px] text-slate-400 px-1 mb-1">
          <span>오늘 일정 ({todayTodos.length})</span>
          <span>{completedCount}/{todayTodos.length} 완료</span>
        </div>

        {todayTodos.length === 0 ? (
          <div className="h-32 flex flex-col items-center justify-center text-slate-500 text-center">
            <Calendar className="w-6 h-6 mb-1 opacity-30 text-indigo-400" />
            <p className="text-[11px]">오늘 예정된 일정이 없습니다.</p>
          </div>
        ) : (
          todayTodos.map((todo) => {
            const cat = DEFAULT_CATEGORIES.find((c) => c.id === todo.categoryId);

            return (
              <div
                key={todo.id}
                onClick={() => onToggleTodo(todo.id)}
                className={`flex items-center gap-2 p-1.5 rounded-lg cursor-pointer transition-all border ${
                  todo.completed
                    ? 'bg-white/5 border-transparent opacity-50'
                    : 'bg-white/10 dark:bg-white/5 hover:bg-white/15 border-white/5'
                }`}
              >
                {todo.completed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-slate-400 hover:text-indigo-400 shrink-0" />
                )}
                <span
                  className={`text-xs truncate flex-1 ${
                    todo.completed ? 'line-through text-slate-400' : isLight ? 'text-slate-800' : 'text-slate-100'
                  }`}
                >
                  {todo.title}
                </span>
                {todo.time && (
                  <span className="text-[9px] text-slate-400 flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {todo.time}
                  </span>
                )}
                {cat && (
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

