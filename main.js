const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { exec } = require('child_process');

// Global reference to prevent garbage collection
let mainWindow = null;

// Window configuration
const windowConfig = {
  width: 1200,
  height: 800,
  minWidth: 900,
  minHeight: 600,
  frame: false,
  title: 'god',
  webPreferences: {
    nodeIntegration: true,
    contextIsolation: false,
    webSpeechAPI: true
  },
  backgroundColor: '#121212'
};

// Enable hot reload in development
if (process.env.NODE_ENV === 'development') {
  try {
    require('electron-reloader')(module, {
      debug: true,
      watchRenderer: true
    });
  } catch (err) { 
    console.error('Hot reload error:', err);
  }
}

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow(windowConfig);
  
  // Load the index.html file
  mainWindow.loadFile('index.html');

  // Window event handlers
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App event handlers
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Handlers
// Window control handlers
ipcMain.on('window-control', (event, action) => {
  if (!mainWindow) {
    console.error('Window reference is invalid');
    return;
  }

  try {
    switch (action) {
      case 'minimize':
        mainWindow.minimize();
        break;
      case 'maximize':
        if (mainWindow.isMaximized()) {
          mainWindow.unmaximize();
        } else {
          mainWindow.maximize();
        }
        break;
      case 'close':
        app.quit(); // Use app.quit() instead of mainWindow.close()
        break;
      default:
        console.error('Unknown window control action:', action);
    }
  } catch (error) {
    console.error('Error handling window control:', error);
  }
});

// App launching handler
ipcMain.on('launch-app', (event, appName) => {
  exec(`open -a "${appName}"`, (error) => {
    if (error) {
      event.reply('launch-app-response', { success: false, error: error.message });
    } else {
      event.reply('launch-app-response', { success: true });
    }
  });
});

// Get installed apps handler
ipcMain.handle('get-apps', async () => {
  return new Promise((resolve, reject) => {
    exec('ls /Applications', (error, stdout) => {
      if (error) {
        reject(error);
        return;
      }
      const apps = stdout.split('\n')
        .filter(app => app.endsWith('.app'))
        .map(app => app.replace('.app', ''));
      resolve(apps);
    });
  });
}); 