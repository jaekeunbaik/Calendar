import React, { useState } from 'react';
import { 
  Plus, 
  Check, 
  Trash2, 
  Clock, 
  AlertCircle, 
  Filter, 
  Calendar,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { Todo, Priority, WidgetSettings } from '../types';
import { DEFAULT_CATEGORIES } from '../utils/constants';
import { getHoliday } from '../utils/holidays';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

interface TodoListProps {
  selectedDate: string; // YYYY-MM-DD
  todos: Todo[];
  settings: WidgetSettings;
  onAddTodo: (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
}

export const TodoList: React.FC<TodoListProps> = ({
  selectedDate,
  todos,
  settings,
  onAddTodo,
  onToggleTodo,
  onDeleteTodo,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('medium');
  const [newCategory, setNewCategory] = useState<string>('work');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  const isLight = settings.theme === 'light';

  // 선택된 날짜 파싱 및 휴일 확인
  const parsedDate = parseISO(selectedDate);
  const formattedDate = format(parsedDate, 'M월 d일 (EEE)', { locale: ko });
  const holiday = getHoliday(selectedDate);

  // 해당 날짜의 투두 목록 필터링
  const dateTodos = todos.filter((t) => t.date === selectedDate);
  const totalCount = dateTodos.length;
  const completedCount = dateTodos.filter((t) => t.completed).length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const filteredTodos = dateTodos.filter((t) => {
    if (filterStatus === 'active' && t.completed) return false;
    if (filterStatus === 'completed' && !t.completed) return false;
    if (selectedCategoryFilter !== 'all' && t.categoryId !== selectedCategoryFilter) return false;
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddTodo({
      title: newTitle.trim(),
      date: selectedDate,
      time: newTime || undefined,
      priority: newPriority,
      categoryId: newCategory,
      completed: false,
    });

    setNewTitle('');
    setNewTime('');
  };

  const priorityStyles: Record<Priority, { label: string; color: string; border: string }> = {
    high: { label: '높음', color: 'text-rose-400 bg-rose-500/10', border: 'border-rose-500/30' },
    medium: { label: '보통', color: 'text-amber-400 bg-amber-500/10', border: 'border-amber-500/30' },
    low: { label: '낮음', color: 'text-emerald-400 bg-emerald-500/10', border: 'border-emerald-500/30' },
  };

  return (
    <div 
      className="w-80 flex flex-col border-l border-white/10 dark:border-white/10 p-3 select-none overflow-hidden"
      style={{ backgroundColor: isLight ? 'rgba(248, 250, 252, 0.4)' : 'rgba(15, 23, 42, 0.3)' }}
    >
      {/* 날짜 헤더 & 진행도 */}
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span 
              className="text-sm font-bold tracking-tight"
              style={{ color: isLight ? '#0f172a' : '#f8fafc' }}
            >
              {formattedDate}
            </span>
            {holiday && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                {holiday.name}
              </span>
            )}
          </div>
          <span 
            className="text-[11px] font-medium"
            style={{ color: isLight ? '#64748b' : '#94a3b8' }}
          >
            {completedCount}/{totalCount} 완료
          </span>
        </div>

        {/* 프로그레스 바 */}
        <div className="w-full h-1 bg-white/10 dark:bg-white/10 rounded-full mt-2 overflow-hidden">
          <div 
            className="h-full bg-indigo-500 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 상태 필터 탭 */}
      <div className="flex items-center gap-1 mb-2">
        {(['all', 'active', 'completed'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-2 py-0.5 text-[11px] font-semibold rounded-md transition-colors ${
              filterStatus === status
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'hover:bg-white/10 text-slate-400'
            }`}
          >
            {status === 'all' ? '전체' : status === 'active' ? '진행 중' : '완료됨'}
          </button>
        ))}
      </div>

      {/* 일정 입력 폼 */}
      <form onSubmit={handleSubmit} className="mb-3 flex flex-col gap-1.5 p-2 rounded-xl bg-white/5 dark:bg-black/20 border border-white/10">
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            placeholder="새로운 할 일 또는 일정 입력..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="flex-1 bg-transparent text-xs outline-none px-1 py-1 placeholder:text-slate-500"
            style={{ color: isLight ? '#0f172a' : '#f8fafc' }}
          />
          <button
            type="submit"
            disabled={!newTitle.trim()}
            className="p-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white transition-all shadow-xs"
            title="추가"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/5">
          {/* 시간 입력 */}
          <div className="flex items-center gap-1 text-slate-400">
            <Clock className="w-3 h-3" />
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="bg-transparent text-[11px] outline-none text-slate-300"
            />
          </div>

          <div className="flex items-center gap-1">
            {/* 우선순위 선택 */}
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as Priority)}
              className="bg-transparent text-[10px] outline-none text-slate-300 cursor-pointer"
            >
              <option value="low" className="bg-slate-800 text-emerald-400">우선순위: 낮음</option>
              <option value="medium" className="bg-slate-800 text-amber-400">우선순위: 보통</option>
              <option value="high" className="bg-slate-800 text-rose-400">우선순위: 높음</option>
            </select>

            {/* 카테고리 선택 */}
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="bg-transparent text-[10px] outline-none text-slate-300 cursor-pointer"
            >
              {DEFAULT_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-slate-800 text-white">
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </form>

      {/* 일정 목록 */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5">
        {filteredTodos.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500">
            <Calendar className="w-8 h-8 mb-2 opacity-30 text-indigo-400" />
            <p className="text-xs font-medium">등록된 일정이 없습니다.</p>
            <p className="text-[10px] opacity-70 mt-0.5">새로운 할 일을 추가해보세요!</p>
          </div>
        ) : (
          filteredTodos.map((todo) => {
            const cat = DEFAULT_CATEGORIES.find((c) => c.id === todo.categoryId);
            const pri = priorityStyles[todo.priority];

            return (
              <div
                key={todo.id}
                className={`group flex items-start gap-2 p-2 rounded-xl transition-all duration-150 border ${
                  todo.completed
                    ? 'bg-white/5 border-transparent opacity-60'
                    : 'bg-white/10 dark:bg-white/5 hover:bg-white/15 dark:hover:bg-white/10 border-white/5 shadow-xs'
                }`}
              >
                {/* 완료 체크박스 버튼 */}
                <button
                  onClick={() => onToggleTodo(todo.id)}
                  className="mt-0.5 text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  {todo.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-400 hover:text-indigo-400" />
                  )}
                </button>

                {/* 텍스트 내용 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-xs break-all leading-tight ${
                        todo.completed
                          ? 'line-through text-slate-400'
                          : isLight
                          ? 'text-slate-800'
                          : 'text-slate-100'
                      }`}
                    >
                      {todo.title}
                    </span>
                  </div>

                  {/* 메타 태그 (시간, 우선순위, 카테고리) */}
                  <div className="flex items-center gap-1 mt-1 text-[10px]">
                    {todo.time && (
                      <span className="flex items-center gap-0.5 text-slate-400">
                        <Clock className="w-2.5 h-2.5" />
                        {todo.time}
                      </span>
                    )}

                    {cat && (
                      <span 
                        className="px-1 py-0.2 rounded font-medium"
                        style={{ backgroundColor: `${cat.color}25`, color: cat.color }}
                      >
                        {cat.name}
                      </span>
                    )}

                    <span className={`px-1 py-0.2 rounded font-medium ${pri.color}`}>
                      {pri.label}
                    </span>
                  </div>
                </div>

                {/* 삭제 버튼 */}
                <button
                  onClick={() => onDeleteTodo(todo.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all"
                  title="삭제"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

