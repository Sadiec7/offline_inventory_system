const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,            // permite require() en renderer
      contextIsolation: false,          // desactiva sandbox
      nodeIntegrationInSubFrames: true  // permite require() dentro de <iframe>
    }
  });

  win.webContents.openDevTools();
  win.loadFile(path.join(__dirname, 'src', 'views', 'login.html'));
}

app.whenReady().then(createWindow);
