import React from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday 
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Todo, WidgetSettings } from '../types';
import { getHoliday } from '../utils/holidays';
import { DEFAULT_CATEGORIES } from '../utils/constants';

interface CalendarViewProps {
  currentMonth: Date;
  selectedDate: string;
  todos: Todo[];
  settings: WidgetSettings;
  onMonthChange: (newMonth: Date) => void;
  onSelectDate: (dateStr: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  currentMonth,
  selectedDate,
  todos,
  settings,
  onMonthChange,
  onSelectDate,
}) => {
  const isLight = settings.theme === 'light';

  // 요일 헤더 생성 (0: 일요일 시작, 1: 월요일 시작)
  const weekDayNames = settings.startDayOfWeek === 1 
    ? ['월', '화', '수', '목', '금', '토', '일']
    : ['일', '월', '화', '수', '목', '금', '토'];

  // 월의 시작/끝 날짜 및 주간 범위 계산
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: settings.startDayOfWeek as 0 | 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: settings.startDayOfWeek as 0 | 1 });

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  // 특정 날짜의 투두 가져오기 매핑
  const todosByDate = React.useMemo(() => {
    const map = new Map<string, Todo[]>();
    todos.forEach((todo) => {
      const list = map.get(todo.date) || [];
      list.push(todo);
      map.set(todo.date, list);
    });
    return map;
  }, [todos]);

  const handlePrevMonth = () => onMonthChange(subMonths(currentMonth, 1));
  const handleNextMonth = () => onMonthChange(addMonths(currentMonth, 1));
  const handleTodayClick = () => {
    const today = new Date();
    onMonthChange(today);
    onSelectDate(format(today, 'yyyy-MM-dd'));
  };

  const categoryColorMap = React.useMemo(() => {
    const map = new Map<string, string>();
    DEFAULT_CATEGORIES.forEach(c => map.set(c.id, c.color));
    return map;
  }, []);

  return (
    <div className="flex-1 flex flex-col p-3 select-none overflow-hidden">
      {/* 캘린더 상단 내비게이션 (년/월 & 이전/오늘/다음) */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span 
            className="text-base font-bold tracking-tight"
            style={{ color: isLight ? '#0f172a' : '#f8fafc' }}
          >
            {format(currentMonth, 'yyyy년 M월')}
          </span>
          <button
            onClick={handleTodayClick}
            className="text-[11px] font-semibold px-2 py-0.5 rounded-md border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 transition-colors"
          >
            오늘
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevMonth}
            className="p-1 rounded-md hover:bg-white/10 transition-colors"
            style={{ color: isLight ? '#475569' : '#cbd5e1' }}
            title="이전 달"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1 rounded-md hover:bg-white/10 transition-colors"
            style={{ color: isLight ? '#475569' : '#cbd5e1' }}
            title="다음 달"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {weekDayNames.map((dayName, idx) => {
          const isSunday = (settings.startDayOfWeek === 0 && idx === 0) || (settings.startDayOfWeek === 1 && idx === 6);
          const isSaturday = (settings.startDayOfWeek === 0 && idx === 6) || (settings.startDayOfWeek === 1 && idx === 5);

          return (
            <div
              key={dayName}
              className={`text-[11px] font-bold py-1 ${
                isSunday
                  ? 'text-rose-400'
                  : isSaturday
                  ? 'text-sky-400'
                  : isLight
                  ? 'text-slate-500'
                  : 'text-slate-400'
              }`}
            >
              {dayName}
            </div>
          );
        })}
      </div>

      {/* 일자 그리드 */}
      <div className="grid grid-cols-7 gap-1 flex-1">
        {calendarDays.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = dateStr === selectedDate;
          const isCurrentToday = isToday(day);
          const holiday = getHoliday(dateStr);
          const dayOfWeek = day.getDay(); // 0: 일, 6: 토
          const isSunday = dayOfWeek === 0;
          const isSaturday = dayOfWeek === 6;

          const dayTodos = todosByDate.get(dateStr) || [];
          const completedCount = dayTodos.filter(t => t.completed).length;
          const totalCount = dayTodos.length;

          // 색상 결정: 공휴일/일요일은 빨강, 토요일은 파랑
          let dateTextColor = isLight ? '#1e293b' : '#e2e8f0';
          if (!isCurrentMonth) {
            dateTextColor = isLight ? '#94a3b8' : '#475569';
          } else if (holiday || isSunday) {
            dateTextColor = '#f43f5e'; // rose-500
          } else if (isSaturday) {
            dateTextColor = '#38bdf8'; // sky-400
          }

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className={`relative flex flex-col items-start justify-start p-1 rounded-xl transition-all duration-150 group text-left min-h-[58px] overflow-hidden ${
                isSelected
                  ? 'bg-indigo-600/30 ring-2 ring-indigo-500 shadow-md backdrop-blur-sm'
                  : 'hover:bg-white/10 dark:hover:bg-white/5'
              } ${isCurrentToday && !isSelected ? 'ring-1 ring-indigo-400/50' : ''}`}
            >
              {/* 날짜 숫자 & 오늘 표시 & 공휴일 */}
              <div className="w-full flex items-center justify-between px-0.5 mb-0.5 leading-none">
                <div className="flex items-center gap-1 min-w-0">
                  <span
                    className={`text-xs font-semibold px-1 rounded ${
                      isCurrentToday
                        ? 'bg-indigo-500 text-white font-bold shadow-xs'
                        : ''
                    }`}
                    style={{ color: isCurrentToday ? '#ffffff' : dateTextColor }}
                  >
                    {format(day, 'd')}
                  </span>
                  {holiday && isCurrentMonth && (
                    <span 
                      className="text-[9px] font-medium text-rose-400 truncate max-w-[48px]"
                      title={holiday.name}
                    >
                      {holiday.name}
                    </span>
                  )}
                </div>

                {/* 오늘 표시 뱃지 */}
                {isCurrentToday && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse shrink-0"></span>
                )}
              </div>

              {/* 일정 내용 미리보기 칩 (최대 2개 노출) */}
              <div className="w-full flex-1 flex flex-col gap-0.5 overflow-hidden">
                {dayTodos.slice(0, 2).map((todo) => {
                  const dotColor = categoryColorMap.get(todo.categoryId) || '#6366f1';
                  return (
                    <div
                      key={todo.id}
                      className={`w-full flex items-center gap-1 px-1 py-0.5 rounded text-[9.5px] truncate font-medium transition-all ${
                        todo.completed ? 'line-through opacity-45' : 'opacity-90'
                      }`}
                      style={{
                        backgroundColor: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.08)',
                        borderLeft: `2.5px solid ${dotColor}`,
                        color: isLight ? '#1e293b' : '#f1f5f9',
                      }}
                      title={todo.time ? `[${todo.time}] ${todo.title}` : todo.title}
                    >
                      {todo.time && (
                        <span className="text-[8.5px] opacity-75 shrink-0 font-mono">
                          {todo.time}
                        </span>
                      )}
                      <span className="truncate">{todo.title}</span>
                    </div>
                  );
                })}

                {totalCount > 2 && (
                  <div className="text-[9px] font-semibold text-indigo-400 dark:text-indigo-300 pl-1 leading-none mt-0.5">
                    +{totalCount - 2}개 더
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

