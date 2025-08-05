const { app, BrowserWindow, ipcMain, dialog } = require('electron');
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

// Registrar el handler IPC para show-save-dialog
function setupIpcHandlers() {
  ipcMain.handle('show-save-dialog', async (event, options) => {
    // Obtenemos la ventana que emitió el mensaje
    const win = BrowserWindow.fromWebContents(event.sender);
    // Mostramos el diálogo de guardar
    const result = await dialog.showSaveDialog(win, options);
    return result;
  });
}

app.whenReady().then(() => {
  setupIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Cierra la app en macOS cuando todas las ventanas se cierran
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
