const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const isDev = !app.isPackaged;

let mainWindow;

// Disable hardware acceleration to avoid cache issues
app.disableHardwareAcceleration();

function createWindow() {
  // Create the browser window with responsive sizing
  const fs = require('fs');
  const windowConfig = {
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
      enableRemoteModule: false,
    },
  };

  // Load custom icon if available
  const iconPath = path.join(__dirname, 'public', "dt.ico");
  if (fs.existsSync(iconPath)) {
    windowConfig.icon = iconPath;
  }
  console.log(iconPath);

  mainWindow = new BrowserWindow(windowConfig);

  // Hide the menu bar
  Menu.setApplicationMenu(null);

  // Enable DevTools in development
  if (isDev) {
    // Wait for dev server to start - try multiple ports
    const devServerURL = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
    mainWindow.loadURL(devServerURL).catch(() => {
      // Fallback to port 5174 if 5173 is in use
      mainWindow.loadURL('http://localhost:5174');
    });
    // Uncomment to open dev tools automatically
    // mainWindow.webContents.openDevTools();
  } else {
    // Load from build
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Open DevTools on F12 in development
  if (isDev) {
    mainWindow.webContents.on('before-input-event', (event, input) => {
      if (input.control && input.shift && input.key.toLowerCase() === 'i') {
        mainWindow.webContents.toggleDevTools();
        event.preventDefault();
      }
      if (input.key === 'F12') {
        mainWindow.webContents.toggleDevTools();
        event.preventDefault();
      }
    });
  }
}

// App event listeners
app.on('ready', createWindow);

app.on('window-all-closed', () => {
  // On macOS, applications stay active until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS, re-create window when dock icon is clicked
  if (mainWindow === null) {
    createWindow();
  }
});

// Quit when all windows are closed (for Windows/Linux)
if (process.platform !== 'darwin') {
  app.on('window-all-closed', () => {
    app.quit();
  });
}
