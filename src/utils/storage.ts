import { Todo, WidgetSettings } from '../types';
import { DEFAULT_SETTINGS } from './constants';
import { format } from 'date-fns';

const LOCAL_STORAGE_SETTINGS_KEY = 'calendar_widget_settings';
const LOCAL_STORAGE_TODOS_KEY = 'calendar_widget_todos';

export async function loadSettings(): Promise<WidgetSettings> {
  if (window.electronAPI?.loadSettings) {
    try {
      const settings = await window.electronAPI.loadSettings();
      return { ...DEFAULT_SETTINGS, ...settings };
    } catch (e) {
      console.warn('Failed to load settings via Electron API:', e);
    }
  }

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Failed to parse settings from localStorage:', e);
  }

  return DEFAULT_SETTINGS;
}

export async function saveSettings(settings: Partial<WidgetSettings>): Promise<WidgetSettings> {
  if (window.electronAPI?.saveSettings) {
    try {
      return await window.electronAPI.saveSettings(settings);
    } catch (e) {
      console.warn('Failed to save settings via Electron API:', e);
    }
  }

  try {
    const current = await loadSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save settings to localStorage:', e);
    return { ...DEFAULT_SETTINGS, ...settings };
  }
}

export async function loadTodos(): Promise<Todo[]> {
  if (window.electronAPI?.loadTodos) {
    try {
      const todos = await window.electronAPI.loadTodos();
      if (Array.isArray(todos)) return todos;
    } catch (e) {
      console.warn('Failed to load todos via Electron API:', e);
    }
  }

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_TODOS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse todos from localStorage:', e);
  }

  // 기본 샘플 데이터 제공 (오늘 날짜 기준)
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const sampleTodos: Todo[] = [
    {
      id: 'sample-1',
      title: '데스크탑 캘린더 위젯 설치 완료 🎉',
      description: '상단 바를 드래그하여 원하는 위치로 이동할 수 있습니다.',
      date: todayStr,
      time: '09:00',
      completed: true,
      priority: 'high',
      categoryId: 'work',
      createdAt: Date.now() - 3600000,
      updatedAt: Date.now() - 3600000,
    },
    {
      id: 'sample-2',
      title: '오늘의 주요 할 일 정리하기',
      description: '클릭하여 완료 상태를 토글하거나 수정/삭제할 수 있습니다.',
      date: todayStr,
      time: '14:00',
      completed: false,
      priority: 'medium',
      categoryId: 'personal',
      createdAt: Date.now() - 1800000,
      updatedAt: Date.now() - 1800000,
    },
  ];

  return sampleTodos;
}

export async function saveTodos(todos: Todo[]): Promise<boolean> {
  if (window.electronAPI?.saveTodos) {
    try {
      return await window.electronAPI.saveTodos(todos);
    } catch (e) {
      console.warn('Failed to save todos via Electron API:', e);
    }
  }

  try {
    localStorage.setItem(LOCAL_STORAGE_TODOS_KEY, JSON.stringify(todos));
    return true;
  } catch (e) {
    console.error('Failed to save todos to localStorage:', e);
    return false;
  }
}

