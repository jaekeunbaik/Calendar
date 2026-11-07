const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // 윈도우 조작
  closeWidget: () => ipcRenderer.invoke('widget:close'),
  minimizeWidget: () => ipcRenderer.invoke('widget:minimize'),
  setAlwaysOnTop: (flag) => ipcRenderer.invoke('widget:set-always-on-top', flag),
  setOpacity: (opacity) => ipcRenderer.invoke('widget:set-opacity', opacity),
  setWindowSize: (width, height) => ipcRenderer.invoke('widget:set-size', width, height),
  setIgnoreMouseEvents: (ignore) => ipcRenderer.invoke('widget:set-ignore-mouse-events', ignore),
  
  // 설정 & 데이터 입출력
  loadSettings: () => ipcRenderer.invoke('settings:load'),
  saveSettings: (settings) => ipcRenderer.invoke('settings:save', settings),
  loadTodos: () => ipcRenderer.invoke('todos:load'),
  saveTodos: (todos) => ipcRenderer.invoke('todos:save', todos),
  
  // 시작 프로그램 등록
  getAutoLaunch: () => ipcRenderer.invoke('app:get-auto-launch'),
  setAutoLaunch: (enable) => ipcRenderer.invoke('app:set-auto-launch', enable),

  // 단축키/이벤트 리스너
  onToggleMiniMode: (callback) => {
    ipcRenderer.on('toggle-mini-mode', () => callback());
  }
});
