export type Priority = 'low' | 'medium' | 'high';

export type Category = {
  id: string;
  name: string;
  color: string;
  icon?: string;
};

export type Todo = {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  completed: boolean;
  priority: Priority;
  categoryId: string;
  createdAt: number;
  updatedAt: number;
};

export type WidgetSettings = {
  alwaysOnTop: boolean;
  opacity: number;
  theme: 'dark' | 'light' | 'glass';
  isMiniMode: boolean;
  bounds: {
    width: number;
    height: number;
    x?: number;
    y?: number;
  };
  autoLaunch: boolean;
  minimizeToTray: boolean;
  startDayOfWeek: number; // 0 for Sunday, 1 for Monday
  clickThrough?: boolean;
};

export type Holiday = {
  name: string;
  date: string; // YYYY-MM-DD
  isSubstitute?: boolean;
};

export interface ElectronAPI {
  closeWidget: () => Promise<void>;
  minimizeWidget: () => Promise<void>;
  setAlwaysOnTop: (flag: boolean) => Promise<boolean>;
  setOpacity: (opacity: number) => Promise<number>;
  setWindowSize: (width: number, height: number) => Promise<void>;
  setIgnoreMouseEvents: (ignore: boolean) => Promise<void>;
  loadSettings: () => Promise<WidgetSettings>;
  saveSettings: (settings: Partial<WidgetSettings>) => Promise<WidgetSettings>;
  loadTodos: () => Promise<Todo[]>;
  saveTodos: (todos: Todo[]) => Promise<boolean>;
  getAutoLaunch: () => Promise<boolean>;
  setAutoLaunch: (enable: boolean) => Promise<boolean>;
  onToggleMiniMode: (callback: () => void) => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
