import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { Header } from './components/Header';
import { CalendarView } from './components/CalendarView';
import { TodoList } from './components/TodoList';
import { MiniWidget } from './components/MiniWidget';
import { SettingsModal } from './components/SettingsModal';
import { Todo, WidgetSettings } from './types';
import { DEFAULT_SETTINGS } from './utils/constants';
import { loadSettings, saveSettings, loadTodos, saveTodos } from './utils/storage';

export const App: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [todos, setTodos] = useState<Todo[]>([]);
  const [settings, setSettings] = useState<WidgetSettings>(DEFAULT_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMiniMode, setIsMiniMode] = useState(false);

  // 1초마다 시계 갱신
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 초기 설정 및 투두 로드
  useEffect(() => {
    async function init() {
      const savedSettings = await loadSettings();
      setSettings(savedSettings);
      setIsMiniMode(savedSettings.isMiniMode || false);

      const savedTodos = await loadTodos();
      setTodos(savedTodos);
    }
    init();
  }, []);

  // 트레이 메뉴에서 미니 모드 전환 이벤트 수신
  useEffect(() => {
    if (window.electronAPI?.onToggleMiniMode) {
      window.electronAPI.onToggleMiniMode(() => {
        handleToggleMiniMode();
      });
    }
  }, [isMiniMode, settings]);

  // 설정 업데이트 함수
  const handleUpdateSettings = useCallback(async (newSettings: Partial<WidgetSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      saveSettings(updated);
      return updated;
    });
  }, []);

  // 미니 모드 토글 및 윈도우 크기 동기화
  const handleToggleMiniMode = useCallback(() => {
    const nextMini = !isMiniMode;
    setIsMiniMode(nextMini);
    handleUpdateSettings({ isMiniMode: nextMini });

    if (window.electronAPI?.setWindowSize) {
      if (nextMini) {
        window.electronAPI.setWindowSize(340, 460);
      } else {
        window.electronAPI.setWindowSize(860, 600);
      }
    }
  }, [isMiniMode, handleUpdateSettings]);

  // 투두 추가
  const handleAddTodo = useCallback(async (newTodoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = Date.now();
    const newTodo: Todo = {
      ...newTodoData,
      id: `todo-${now}-${Math.random().toString(36).substr(2, 6)}`,
      createdAt: now,
      updatedAt: now,
    };

    setTodos((prev) => {
      const updated = [newTodo, ...prev];
      saveTodos(updated);
      return updated;
    });
  }, []);

  // 투두 상태 토글
  const handleToggleTodo = useCallback(async (id: string) => {
    setTodos((prev) => {
      const updated = prev.map((t) =>
        t.id === id ? { ...t, completed: !t.completed, updatedAt: Date.now() } : t
      );
      saveTodos(updated);
      return updated;
    });
  }, []);

  // 투두 삭제
  const handleDeleteTodo = useCallback(async (id: string) => {
    setTodos((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      saveTodos(updated);
      return updated;
    });
  }, []);

  // 투두 복원 / 임포트
  const handleImportTodos = useCallback(async (importedTodos: Todo[]) => {
    setTodos(importedTodos);
    saveTodos(importedTodos);
  }, []);

  // 샘플 데이터 추가
  const handleResetSampleData = useCallback(async () => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const sampleList: Todo[] = [
      {
        id: `sample-${Date.now()}-1`,
        title: '중요 프로젝트 미팅 준비',
        date: todayStr,
        time: '10:30',
        completed: false,
        priority: 'high',
        categoryId: 'work',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: `sample-${Date.now()}-2`,
        title: '신간 도서 30분 독서하기',
        date: todayStr,
        time: '20:00',
        completed: true,
        priority: 'medium',
        categoryId: 'study',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: `sample-${Date.now()}-3`,
        title: '가벼운 스트레칭 및 산책',
        date: todayStr,
        time: '18:30',
        completed: false,
        priority: 'low',
        categoryId: 'personal',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];

    setTodos((prev) => {
      const updated = [...sampleList, ...prev];
      saveTodos(updated);
      return updated;
    });
  }, []);

  // 테마별 루트 스타일
  const themeClasses = {
    dark: 'bg-slate-900/85 border-white/15 text-slate-100 shadow-2xl backdrop-blur-xl',
    light: 'bg-white/88 border-black/10 text-slate-900 shadow-2xl backdrop-blur-xl',
    glass: 'bg-white/10 border-white/20 text-white shadow-2xl backdrop-blur-2xl',
  };

  return (
    <div className="w-screen h-screen p-2 box-border flex items-center justify-center overflow-hidden bg-transparent select-none">
      <main
        className={`w-full h-full rounded-2xl flex flex-col border overflow-hidden transition-all duration-300 ${themeClasses[settings.theme]}`}
        style={{
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
        }}
      >
        {isMiniMode ? (
          // 미니 위젯 모드
          <MiniWidget
            currentTime={currentTime}
            settings={settings}
            todos={todos}
            onToggleMiniMode={handleToggleMiniMode}
            onUpdateSettings={handleUpdateSettings}
            onAddTodo={handleAddTodo}
            onToggleTodo={handleToggleTodo}
          />
        ) : (
          // 기본 풀 캘린더 모드
          <>
            <Header
              settings={settings}
              currentTime={currentTime}
              onUpdateSettings={handleUpdateSettings}
              onOpenSettings={() => setIsSettingsOpen(true)}
              isMiniMode={isMiniMode}
              onToggleMiniMode={handleToggleMiniMode}
            />

            <div className="flex-1 flex overflow-hidden">
              <CalendarView
                currentMonth={currentMonth}
                selectedDate={selectedDate}
                todos={todos}
                settings={settings}
                onMonthChange={setCurrentMonth}
                onSelectDate={setSelectedDate}
              />

              <TodoList
                selectedDate={selectedDate}
                todos={todos}
                settings={settings}
                onAddTodo={handleAddTodo}
                onToggleTodo={handleToggleTodo}
                onDeleteTodo={handleDeleteTodo}
              />
            </div>
          </>
        )}
      </main>

      {/* 설정 팝업 모달 */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        todos={todos}
        onUpdateSettings={handleUpdateSettings}
        onImportTodos={handleImportTodos}
        onResetSampleData={handleResetSampleData}
      />
    </div>
  );
};

export default App;

