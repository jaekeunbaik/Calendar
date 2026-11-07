import { Category, WidgetSettings } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'work', name: '업무', color: '#3b82f6', icon: 'Briefcase' },
  { id: 'personal', name: '개인', color: '#10b981', icon: 'User' },
  { id: 'study', name: '공부', color: '#8b5cf6', icon: 'BookOpen' },
  { id: 'important', name: '중요', color: '#ef4444', icon: 'Star' },
  { id: 'other', name: '기타', color: '#f59e0b', icon: 'Tag' },
];

export const DEFAULT_SETTINGS: WidgetSettings = {
  alwaysOnTop: true,
  opacity: 0.95,
  theme: 'dark',
  isMiniMode: false,
  bounds: {
    width: 860,
    height: 600,
  },
  autoLaunch: false,
  minimizeToTray: true,
  startDayOfWeek: 0, // 0: 일요일, 1: 월요일
};

