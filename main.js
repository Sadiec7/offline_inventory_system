// main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  // Crea la ventana del navegador.
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      // Habilita Node.js en el renderer
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Carga index.html (asume que index.html está en la misma carpeta que main.js)
  mainWindow.loadFile(path.join(__dirname, 'src/index.html'));

  // (Opcional) Abre las DevTools.
  mainWindow.webContents.openDevTools();
}

app.whenReady().then(createWindow);

// Salir completamente cuando se cierran todas las ventanas (excepto en macOS).
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// En macOS, volver a crear ventana cuando se haga clic en el icono en el dock.
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
