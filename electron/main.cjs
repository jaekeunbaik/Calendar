const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, screen } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;
let tray = null;

// 데이터 저장 경로
const userDataPath = app.getPath('userData');
const settingsPath = path.join(userDataPath, 'calendar-settings.json');
const todosPath = path.join(userDataPath, 'calendar-todos.json');

// 기본 설정
const DEFAULT_SETTINGS = {
  alwaysOnTop: true,
  opacity: 0.95,
  theme: 'dark', // 'dark' | 'light' | 'glass'
  isMiniMode: false,
  bounds: {
    width: 860,
    height: 600,
    x: undefined,
    y: undefined
  },
  autoLaunch: false,
  minimizeToTray: true,
  startDayOfWeek: 0, // 0: 일요일, 1: 월요일
};

function readJSON(filePath, fallback) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return fallback;
}

function writeJSON(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// 캘린더 아이콘 생성 (트레이용 16x16 투명 아이콘 DataURL)
function createTrayIcon() {
  // 16x16 PNG (보라색/파란색 캘린더 모양 아이콘)
  // 투명 베이스에 달력 모양의 간단한 PNG base64
  const base64Icon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAEKADAAQAAAABAAAAEAAAAAA0RpwNAAAAh0lEQVQ4y2NgGAWDEvwnxQCG/6Tphhkkq0k0jC7Cq0k0DJdFhA2gm8VghgqWk2UY0YbhMoFhFs0wA8j3g9j15Gskm1Y0bCYyLSDZjEEYZBFpGj9MhBkwK+HRPxLNwKsZp3p0jC6Gy+Mwg6b2k9UqfLqQjG+SZs7/pBvGMEiKj2hpH90wUAAA8vQh8+c1G2AAAAAASUVORK5CYII=';
  return nativeImage.createFromDataURL(base64Icon);
}

function createWindow() {
  const savedSettings = { ...DEFAULT_SETTINGS, ...readJSON(settingsPath, {}) };
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  const initialWidth = savedSettings.isMiniMode ? 340 : 860;
  const initialHeight = savedSettings.isMiniMode ? 460 : 620;

  let x = savedSettings.bounds?.x;
  let y = savedSettings.bounds?.y;

  // 위치가 설정되지 않았거나 화면 밖인 경우 화면 중앙에 보기 좋게 배치
  if (x === undefined || y === undefined || x < 0 || x > screenWidth - 100 || y < 0 || y > screenHeight - 100) {
    x = Math.round((screenWidth - initialWidth) / 2);
    y = Math.round((screenHeight - initialHeight) / 2);
  }

  mainWindow = new BrowserWindow({
    width: initialWidth,
    height: initialHeight,
    x: x,
    y: y,
    minWidth: savedSettings.isMiniMode ? 300 : 700,
    minHeight: savedSettings.isMiniMode ? 380 : 480,
    frame: false,
    transparent: true,
    hasShadow: true,
    alwaysOnTop: savedSettings.alwaysOnTop ?? true,
    skipTaskbar: false,
    resizable: true,
    title: '데스크탑 캘린더',
    show: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      backgroundThrottling: false, // 백그라운드에서도 시계/타이머 정지 안 되도록
    },
  });

  mainWindow.setOpacity(savedSettings.opacity || 0.95);

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.show();
    mainWindow.focus();
    console.log('[Main] did-finish-load! Bounds:', mainWindow.getBounds(), 'Visible:', mainWindow.isVisible());
  });

  mainWindow.webContents.on('console-message', (_event, level, message) => {
    console.log(`[Renderer] ${message}`);
  });

  const isDev = process.env.NODE_ENV === 'development';
  const distPath = path.join(__dirname, '../dist/index.html');

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else if (fs.existsSync(distPath)) {
    mainWindow.loadFile(distPath);
  } else {
    mainWindow.loadURL('http://localhost:5173');
  }

  // 위치/크기 변경 시 저장
  const saveBounds = () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    const bounds = mainWindow.getBounds();
    const curSettings = readJSON(settingsPath, DEFAULT_SETTINGS);
    curSettings.bounds = bounds;
    writeJSON(settingsPath, curSettings);
  };

  mainWindow.on('resize', saveBounds);
  mainWindow.on('move', saveBounds);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  const icon = createTrayIcon();
  tray = new Tray(icon);
  tray.setToolTip('바탕화면 캘린더 & 할 일');

  const updateContextMenu = () => {
    const isVisible = mainWindow && mainWindow.isVisible();
    const settings = readJSON(settingsPath, DEFAULT_SETTINGS);

    const contextMenu = Menu.buildFromTemplate([
      {
        label: isVisible ? '위젯 숨기기' : '위젯 표시하기',
        click: () => {
          if (!mainWindow) {
            createWindow();
            return;
          }
          if (mainWindow.isVisible()) {
            mainWindow.hide();
          } else {
            mainWindow.show();
            mainWindow.focus();
          }
          updateContextMenu();
        }
      },
      {
        label: '항상 위에 고정',
        type: 'checkbox',
        checked: mainWindow ? mainWindow.isAlwaysOnTop() : settings.alwaysOnTop,
        click: (item) => {
          if (mainWindow) {
            mainWindow.setAlwaysOnTop(item.checked);
          }
          const curSettings = readJSON(settingsPath, DEFAULT_SETTINGS);
          curSettings.alwaysOnTop = item.checked;
          writeJSON(settingsPath, curSettings);
        }
      },
      {
        label: '미니 위젯 모드 전환',
        click: () => {
          if (mainWindow) {
            mainWindow.webContents.send('toggle-mini-mode');
          }
        }
      },
      {
        label: '위치 화면 중앙으로 재배치',
        click: () => {
          if (mainWindow) {
            mainWindow.center();
          }
        }
      },
      { type: 'separator' },
      {
        label: '시작 시 자동 실행',
        type: 'checkbox',
        checked: app.getLoginItemSettings().openAtLogin,
        click: (item) => {
          app.setLoginItemSettings({
            openAtLogin: item.checked,
            path: process.execPath,
          });
          const curSettings = readJSON(settingsPath, DEFAULT_SETTINGS);
          curSettings.autoLaunch = item.checked;
          writeJSON(settingsPath, curSettings);
        }
      },
      { type: 'separator' },
      {
        label: '캘린더 종료',
        click: () => {
          app.isQuitting = true;
          app.quit();
        }
      }
    ]);

    tray.setContextMenu(contextMenu);
  };

  tray.on('double-click', () => {
    if (!mainWindow) {
      createWindow();
      return;
    }
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
    updateContextMenu();
  });

  tray.on('right-click', () => {
    updateContextMenu();
  });

  updateContextMenu();
}

// IPC 통신 핸들러 등록
function registerIpcHandlers() {
  ipcMain.handle('widget:close', () => {
    const settings = readJSON(settingsPath, DEFAULT_SETTINGS);
    if (settings.minimizeToTray && mainWindow) {
      mainWindow.hide();
    } else {
      app.isQuitting = true;
      app.quit();
    }
  });

  ipcMain.handle('widget:minimize', () => {
    if (mainWindow) {
      mainWindow.hide();
    }
  });

  ipcMain.handle('widget:set-always-on-top', (_event, flag) => {
    if (mainWindow) {
      mainWindow.setAlwaysOnTop(flag);
    }
    const curSettings = readJSON(settingsPath, DEFAULT_SETTINGS);
    curSettings.alwaysOnTop = flag;
    writeJSON(settingsPath, curSettings);
    return flag;
  });

  ipcMain.handle('widget:set-opacity', (_event, opacity) => {
    if (mainWindow) {
      mainWindow.setOpacity(opacity);
    }
    const curSettings = readJSON(settingsPath, DEFAULT_SETTINGS);
    curSettings.opacity = opacity;
    writeJSON(settingsPath, curSettings);
    return opacity;
  });

  ipcMain.handle('widget:set-size', (_event, width, height) => {
    if (mainWindow) {
      if (width < 500) {
        mainWindow.setMinimumSize(280, 350);
      } else {
        mainWindow.setMinimumSize(600, 450);
      }
      mainWindow.setSize(width, height, true);
    }
  });

  ipcMain.handle('widget:set-ignore-mouse-events', (_event, ignore) => {
    if (mainWindow) {
      mainWindow.setIgnoreMouseEvents(ignore, { forward: true });
    }
  });

  ipcMain.handle('settings:load', () => {
    const settings = readJSON(settingsPath, DEFAULT_SETTINGS);
    settings.autoLaunch = app.getLoginItemSettings().openAtLogin;
    return settings;
  });

  ipcMain.handle('settings:save', (_event, newSettings) => {
    const curSettings = readJSON(settingsPath, DEFAULT_SETTINGS);
    const updated = { ...curSettings, ...newSettings };
    writeJSON(settingsPath, updated);
    return updated;
  });

  ipcMain.handle('todos:load', () => {
    return readJSON(todosPath, []);
  });

  ipcMain.handle('todos:save', (_event, todos) => {
    writeJSON(todosPath, todos);
    return true;
  });

  ipcMain.handle('app:get-auto-launch', () => {
    return app.getLoginItemSettings().openAtLogin;
  });

  ipcMain.handle('app:set-auto-launch', (_event, enable) => {
    app.setLoginItemSettings({
      openAtLogin: enable,
      path: process.execPath,
    });
    return enable;
  });
}

// 싱글 인스턴스 락 (중복 실행 방지)
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      if (!mainWindow.isVisible()) mainWindow.show();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    registerIpcHandlers();
    createWindow();
    createTray();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });

  app.on('before-quit', () => {
    app.isQuitting = true;
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin' && app.isQuitting) {
      app.quit();
    }
  });
}
