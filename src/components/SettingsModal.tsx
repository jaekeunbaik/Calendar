import React, { useRef } from 'react';
import { 
  X, 
  Moon, 
  Sun, 
  Sparkles, 
  Download, 
  Upload, 
  RefreshCw, 
  Sliders, 
  Monitor, 
  Power 
} from 'lucide-react';
import { WidgetSettings, Todo } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: WidgetSettings;
  todos: Todo[];
  onUpdateSettings: (newSettings: Partial<WidgetSettings>) => void;
  onImportTodos: (importedTodos: Todo[]) => void;
  onResetSampleData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  todos,
  onUpdateSettings,
  onImportTodos,
  onResetSampleData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (window.electronAPI?.setOpacity) {
      window.electronAPI.setOpacity(val);
    }
    onUpdateSettings({ opacity: val });
  };

  const handleAutoLaunchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    if (window.electronAPI?.setAutoLaunch) {
      await window.electronAPI.setAutoLaunch(checked);
    }
    onUpdateSettings({ autoLaunch: checked });
  };

  // JSON 데이터 백업 내보내기
  const handleExport = () => {
    const backupData = {
      settings,
      todos,
      exportDate: new Date().toISOString(),
      version: '1.0.0',
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calendar-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // JSON 데이터 불러오기
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (Array.isArray(data.todos)) {
          onImportTodos(data.todos);
          if (data.settings) {
            onUpdateSettings(data.settings);
          }
          alert('데이터를 성공적으로 복원했습니다!');
        } else {
          alert('올바르지 않은 백업 파일 형식입니다.');
        }
      } catch (err) {
        alert('파일을 읽는 중 오류가 발생했습니다.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in select-none">
      <div 
        className="w-full max-w-sm rounded-2xl p-5 shadow-2xl border flex flex-col gap-4 bg-slate-900/95 border-white/20 text-slate-100"
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold tracking-tight">위젯 설정</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 설정 목록 */}
        <div className="space-y-4 text-xs overflow-y-auto max-h-[70vh] pr-1">
          {/* 1. 투명도 조절 */}
          <div>
            <div className="flex justify-between font-medium mb-1.5 text-slate-300">
              <span>위젯 투명도</span>
              <span className="font-mono text-indigo-400">{Math.round(settings.opacity * 100)}%</span>
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

          {/* 2. 테마 선택 */}
          <div>
            <label className="block font-medium text-slate-300 mb-2">테마</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onUpdateSettings({ theme: 'dark' })}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${
                  settings.theme === 'dark'
                    ? 'border-indigo-500 bg-indigo-500/20 text-white'
                    : 'border-white/10 hover:bg-white/5 text-slate-400'
                }`}
              >
                <Moon className="w-4 h-4 text-indigo-400" />
                <span className="text-[11px] font-semibold">다크</span>
              </button>

              <button
                onClick={() => onUpdateSettings({ theme: 'light' })}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${
                  settings.theme === 'light'
                    ? 'border-indigo-500 bg-indigo-500/20 text-white'
                    : 'border-white/10 hover:bg-white/5 text-slate-400'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="text-[11px] font-semibold">라이트</span>
              </button>

              <button
                onClick={() => onUpdateSettings({ theme: 'glass' })}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${
                  settings.theme === 'glass'
                    ? 'border-indigo-500 bg-indigo-500/20 text-white'
                    : 'border-white/10 hover:bg-white/5 text-slate-400'
                }`}
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-[11px] font-semibold">글래스</span>
              </button>
            </div>
          </div>

          {/* 3. 시작 요일 선택 */}
          <div>
            <label className="block font-medium text-slate-300 mb-1.5">한 주의 시작 요일</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onUpdateSettings({ startDayOfWeek: 0 })}
                className={`py-1.5 rounded-lg border text-xs font-medium transition-all ${
                  settings.startDayOfWeek === 0
                    ? 'border-indigo-500 bg-indigo-500/20 text-white'
                    : 'border-white/10 hover:bg-white/5 text-slate-400'
                }`}
              >
                일요일 시작
              </button>
              <button
                onClick={() => onUpdateSettings({ startDayOfWeek: 1 })}
                className={`py-1.5 rounded-lg border text-xs font-medium transition-all ${
                  settings.startDayOfWeek === 1
                    ? 'border-indigo-500 bg-indigo-500/20 text-white'
                    : 'border-white/10 hover:bg-white/5 text-slate-400'
                }`}
              >
                월요일 시작
              </button>
            </div>
          </div>

          {/* 4. 부팅 시 자동 실행 & 최소화 옵션 */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2">
                <Power className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-300">윈도우 시작 시 자동 실행</span>
              </div>
              <input
                type="checkbox"
                checked={settings.autoLaunch}
                onChange={handleAutoLaunchChange}
                className="w-4 h-4 rounded text-indigo-600 accent-indigo-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2">
                <Monitor className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-300">창 닫기 시 트레이로 최소화</span>
              </div>
              <input
                type="checkbox"
                checked={settings.minimizeToTray}
                onChange={(e) => onUpdateSettings({ minimizeToTray: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 accent-indigo-500 cursor-pointer"
              />
            </label>
          </div>

          {/* 5. 데이터 백업 & 복원 & 초기화 */}
          <div className="pt-2 border-t border-white/10 space-y-2">
            <span className="block font-medium text-slate-400 mb-1">데이터 관리</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleExport}
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                <span>백업 내보내기</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>백업 불러오기</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </div>

            <button
              onClick={() => {
                if (confirm('샘플 데이터로 초기화하시겠습니까? 기존 등록 데이터는 보존됩니다.')) {
                  onResetSampleData();
                }
              }}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 transition-colors text-[11px]"
            >
              <RefreshCw className="w-3 h-3" />
              <span>샘플 데이터 추가하기</span>
            </button>
          </div>
        </div>

        {/* 확인 버튼 */}
        <div className="pt-2 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors text-xs shadow-md"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

