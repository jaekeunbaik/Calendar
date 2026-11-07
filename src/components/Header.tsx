import React, { useState } from 'react';
import { 
  Pin, 
  PinOff, 
  Settings, 
  Minus, 
  X, 
  Maximize2, 
  Minimize2, 
  Sun, 
  Moon, 
  Sparkles,
  Sliders
} from 'lucide-react';
import { WidgetSettings } from '../types';

interface HeaderProps {
  settings: WidgetSettings;
  currentTime: Date;
  onUpdateSettings: (newSettings: Partial<WidgetSettings>) => void;
  onOpenSettings: () => void;
  isMiniMode: boolean;
  onToggleMiniMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  currentTime,
  onUpdateSettings,
  onOpenSettings,
  isMiniMode,
  onToggleMiniMode,
}) => {
  const [showOpacitySlider, setShowOpacitySlider] = useState(false);

  const handleToggleAlwaysOnTop = () => {
    const nextVal = !settings.alwaysOnTop;
    if (window.electronAPI?.setAlwaysOnTop) {
      window.electronAPI.setAlwaysOnTop(nextVal);
    }
    onUpdateSettings({ alwaysOnTop: nextVal });
  };

  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (window.electronAPI?.setOpacity) {
      window.electronAPI.setOpacity(val);
    }
    onUpdateSettings({ opacity: val });
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

  // Cycle themes: dark -> light -> glass -> dark
  const handleThemeCycle = () => {
    const themeCycle: Array<'dark' | 'light' | 'glass'> = ['dark', 'light', 'glass'];
    const curIdx = themeCycle.indexOf(settings.theme);
    const nextTheme = themeCycle[(curIdx + 1) % themeCycle.length];
    onUpdateSettings({ theme: nextTheme });
  };

  const timeString = currentTime.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const isLight = settings.theme === 'light';

  return (
    <header className="drag-region w-full h-11 px-3 flex items-center justify-between select-none border-b transition-colors duration-200 border-white/10 dark:border-white/10">
      {/* 왼쪽: 로고 & 타이틀 & 시계 */}
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-md bg-indigo-500/80 flex items-center justify-center text-white text-[11px] font-bold shadow-sm">
          📅
        </div>
        <span className="text-xs font-semibold tracking-tight text-slate-100 dark:text-slate-100" style={{ color: isLight ? '#0f172a' : '#f8fafc' }}>
          데스크탑 캘린더
        </span>
        <div 
          className="ml-1 text-[11px] font-mono px-1.5 py-0.5 rounded backdrop-blur-md bg-white/10 dark:bg-black/20 text-indigo-400 dark:text-indigo-300 font-medium"
          style={{ color: isLight ? '#4f46e5' : '#818cf8' }}
        >
          {timeString}
        </div>
      </div>

      {/* 오른쪽: 조작 컨트롤 버튼들 */}
      <div className="no-drag flex items-center gap-1">
        {/* 투명도 조절 팝오버 토글 */}
        <div className="relative">
          <button
            onClick={() => setShowOpacitySlider(!showOpacitySlider)}
            title={`투명도 조절 (${Math.round(settings.opacity * 100)}%)`}
            className="p-1.5 rounded-lg hover:bg-white/10 dark:hover:bg-white/10 transition-colors text-slate-300 hover:text-white"
            style={{ color: isLight ? '#475569' : '#cbd5e1' }}
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          {showOpacitySlider && (
            <div 
              className="absolute right-0 top-8 z-50 p-2.5 rounded-xl shadow-2xl border backdrop-blur-xl flex flex-col gap-1 w-36 bg-slate-900/90 border-white/20 text-white"
            >
              <div className="flex justify-between text-[11px] text-slate-300 font-medium">
                <span>투명도</span>
                <span>{Math.round(settings.opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="1.0"
                step="0.05"
                value={settings.opacity}
                onChange={handleOpacityChange}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          )}
        </div>

        {/* 테마 변경 버튼 */}
        <button
          onClick={handleThemeCycle}
          title={`테마 전환 (현재: ${settings.theme === 'dark' ? '다크' : settings.theme === 'light' ? '라이트' : '글래스'})`}
          className="p-1.5 rounded-lg hover:bg-white/10 dark:hover:bg-white/10 transition-colors"
          style={{ color: isLight ? '#475569' : '#cbd5e1' }}
        >
          {settings.theme === 'light' ? (
            <Sun className="w-3.5 h-3.5 text-amber-500" />
          ) : settings.theme === 'dark' ? (
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          )}
        </button>

        {/* 미니 위젯 모드 토글 */}
        <button
          onClick={onToggleMiniMode}
          title={isMiniMode ? '캘린더 펼치기' : '미니 위젯 모드'}
          className="p-1.5 rounded-lg hover:bg-white/10 dark:hover:bg-white/10 transition-colors"
          style={{ color: isLight ? '#475569' : '#cbd5e1' }}
        >
          {isMiniMode ? (
            <Maximize2 className="w-3.5 h-3.5" />
          ) : (
            <Minimize2 className="w-3.5 h-3.5" />
          )}
        </button>

        {/* 항상 위에 고정 토글 */}
        <button
          onClick={handleToggleAlwaysOnTop}
          title={settings.alwaysOnTop ? '항상 위에 고정 해제' : '항상 위에 고정'}
          className={`p-1.5 rounded-lg transition-colors ${
            settings.alwaysOnTop 
              ? 'bg-indigo-500 text-white shadow-sm' 
              : 'hover:bg-white/10 dark:hover:bg-white/10'
          }`}
          style={{ color: settings.alwaysOnTop ? '#ffffff' : isLight ? '#475569' : '#cbd5e1' }}
        >
          {settings.alwaysOnTop ? (
            <Pin className="w-3.5 h-3.5 rotate-45" />
          ) : (
            <PinOff className="w-3.5 h-3.5" />
          )}
        </button>

        {/* 환경설정 열기 */}
        <button
          onClick={onOpenSettings}
          title="설정"
          className="p-1.5 rounded-lg hover:bg-white/10 dark:hover:bg-white/10 transition-colors"
          style={{ color: isLight ? '#475569' : '#cbd5e1' }}
        >
          <Settings className="w-3.5 h-3.5" />
        </button>

        {/* 트레이 / 최소화 버튼 */}
        <button
          onClick={handleMinimize}
          title="숨기기"
          className="p-1.5 rounded-lg hover:bg-white/10 dark:hover:bg-white/10 transition-colors"
          style={{ color: isLight ? '#475569' : '#cbd5e1' }}
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        {/* 닫기 버튼 */}
        <button
          onClick={handleClose}
          title="닫기"
          className="p-1.5 rounded-lg hover:bg-red-500/80 hover:text-white transition-colors"
          style={{ color: isLight ? '#475569' : '#cbd5e1' }}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};

