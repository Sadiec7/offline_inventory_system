// src/views/js/importar_exportarView.js
const { ipcRenderer } = require('electron');
const fs = require('fs');

const sqlite3 = require('sqlite3').verbose();
const ExcelJS = require('exceljs');

window.initImportar_exportarView = function () {
  let currentSection = 'export';
  let isProcessing = false;

  setupTabs();
  setupDropZones();
  setupEventListeners();
  createGlobalLoadingOverlay();

  /*** 1) PESTAÑAS ***/
  function setupTabs() {
    const tabExport = document.getElementById('tab-export');
    const tabImport = document.getElementById('tab-import');
    const exportSec = document.getElementById('export-section');
    const importSec = document.getElementById('import-section');

    tabExport.addEventListener('click', () => {
      if (isProcessing) return;
      currentSection = 'export';
      toggleTab(tabExport, true);
      toggleTab(tabImport, false);
      showSection(exportSec, true);
      showSection(importSec, false);
    });

    tabImport.addEventListener('click', () => {
      if (isProcessing) return;
      currentSection = 'import';
      toggleTab(tabImport, true);
      toggleTab(tabExport, false);
      showSection(importSec, true);
      showSection(exportSec, false);
    });
  }
  
  function toggleTab(el, active) {
    if (active) {
      el.classList.add('text-blue-600','border-blue-600','bg-white');
      el.classList.remove('text-gray-600','border-transparent');
    } else {
      el.classList.add('text-gray-600','border-transparent');
      el.classList.remove('text-blue-600','border-blue-600','bg-white');
    }
  }
  
  function showSection(el, visible) {
    el.classList[visible ? 'remove' : 'add']('hidden');
    if (visible) el.classList.add('flex');
  }

  /*** 2) DRAG & DROP ***/
  function setupDropZones() {
    setupDropZone('sqlite-drop-zone', 'sqlite-file-input', handleSQLiteFile);
  }
  
  function setupDropZone(dzId, fiId, handler) {
    const dz = document.getElementById(dzId);
    const fi = document.getElementById(fiId);
    
    dz.addEventListener('click', () => {
      if (isProcessing) return;
      fi.click();
    });
    
    fi.addEventListener('change', e => {
      if (e.target.files[0] && !isProcessing) {
        handler(e.target.files[0]);
      }
    });
    
    dz.addEventListener('dragover', e => {
      if (isProcessing) return;
      e.preventDefault();
      dz.classList.add('border-blue-400','bg-blue-50');
    });
    
    dz.addEventListener('dragleave', () => {
      dz.classList.remove('border-blue-400','bg-blue-50');
    });
    
    dz.addEventListener('drop', e => {
      if (isProcessing) return;
      e.preventDefault();
      dz.classList.remove('border-blue-400','bg-blue-50');
      if (e.dataTransfer.files[0]) {
        handler(e.dataTransfer.files[0]);
      }
    });
  }

  /*** 3) BOTONES DE EXPORT ***/
  function setupEventListeners() {
    document.getElementById('export-sqlite').addEventListener('click', () => {
      if (!isProcessing) exportSQLite();
    });
    document.getElementById('export-excel').addEventListener('click', () => {
      if (!isProcessing) exportExcel();
    });
  }

  /*** 4) OVERLAY DE CARGA GLOBAL ***/
  function createGlobalLoadingOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'global-loading';
    overlay.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 hidden';
    overlay.innerHTML = `
      <div class="flex items-center justify-center h-full">
        <div class="bg-white rounded-lg p-8 shadow-2xl flex flex-col items-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">Procesando...</h3>
          <p id="loading-message" class="text-gray-600 text-center">Preparando operación</p>
          <div class="w-64 bg-gray-200 rounded-full h-2 mt-4">
            <div id="global-progress-bar" class="bg-blue-600 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  function showGlobalLoading(message, show = true) {
    const overlay = document.getElementById('global-loading');
    const messageEl = document.getElementById('loading-message');
    const progressBar = document.getElementById('global-progress-bar');
    
    if (show) {
      messageEl.textContent = message;
      progressBar.style.width = '0%';
      overlay.classList.remove('hidden');
      isProcessing = true;
      disableButtons(true);
      
      // Animación de progreso suave
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 90) progress = 90;
        progressBar.style.width = progress + '%';
      }, 200);
      
      // Guardar interval para poder limpiarlo
      overlay.progressInterval = interval;
    } else {
      // Completar progreso
      if (overlay.progressInterval) {
        clearInterval(overlay.progressInterval);
      }
      progressBar.style.width = '100%';
      
      setTimeout(() => {
        overlay.classList.add('hidden');
        isProcessing = false;
        disableButtons(false);
        progressBar.style.width = '0%';
      }, 500);
    }
  }

  function updateGlobalLoadingMessage(message) {
    const messageEl = document.getElementById('loading-message');
    if (messageEl) {
      messageEl.textContent = message;
    }
  }

  function disableButtons(disabled) {
    const buttons = document.querySelectorAll('button:not([data-keep-enabled])');
    buttons.forEach(btn => {
      btn.disabled = disabled;
      if (disabled) {
        btn.classList.add('opacity-50', 'cursor-not-allowed');
      } else {
        btn.classList.remove('opacity-50', 'cursor-not-allowed');
      }
    });
  }

  /*** 5) HELPERS UI ***/
  function showStatus(type, msg, level = 'info') {
    const st  = document.getElementById(`${type}-status`);
    const tx  = document.getElementById(`${type}-message`);
    const cfg = {
      info:    ['bg-blue-50','border-blue-200','text-blue-800'],
      success: ['bg-green-50','border-green-200','text-green-800'],
      error:   ['bg-red-50','border-red-200','text-red-800'],
      warning: ['bg-yellow-50','border-yellow-200','text-yellow-800']
    }[level];
    st.className = `p-4 rounded-lg mb-6 border ${cfg[0]} ${cfg[1]}`;
    tx.className = `font-semibold ${cfg[2]}`;
    tx.textContent = msg;
    st.classList.remove('hidden');
    setTimeout(() => st.classList.add('hidden'), 5000);
  }
  
  function showProgress(type, on = true) {
    const pr = document.getElementById(`${type}-progress`);
    const br = document.getElementById(`${type}-progress-bar`);
    if (on) {
      pr.classList.remove('hidden');
      let w = 0;
      const iv = setInterval(() => {
        w += 10; br.style.width = w + '%';
        if (w >= 100) {
          clearInterval(iv);
          setTimeout(() => {
            pr.classList.add('hidden');
            br.style.width = '0%';
          }, 500);
        }
      }, 150);
    } else {
      pr.classList.add('hidden');
      br.style.width = '0%';
    }
  }

  function addToHistory(type, message) {
    const hist = document.getElementById(`${type}-history`);
    if (!hist) {
      console.warn(`Historial ${type}-history no encontrado`);
      return;
    }

    // Si el primer elemento es solo un placeholder (clase text-gray-500), lo quitamos
    const firstEl = hist.firstElementChild;
    if (firstEl && firstEl.classList.contains('text-gray-500')) {
      hist.innerHTML = '';
    }

    const ts   = new Date().toLocaleString();
    const item = document.createElement('div');
    item.className = 'text-sm text-gray-600 p-2 bg-white rounded border';
    item.innerHTML = `
      <div class="flex justify-between">
        <span>${message}</span>
        <span class="text-xs text-gray-400">${ts}</span>
      </div>
    `;

    hist.insertBefore(item, hist.firstChild);
    // Mantenemos solo los últimos 5
    while (hist.children.length > 5) {
      hist.removeChild(hist.lastChild);
    }
  }

  /*** 6) FUNCIÓN AUXILIAR PARA SLEEP ***/
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /*** 7) EXPORTAR SQLITE (MEJORADO) ***/
  async function exportSQLite() {
    const dbFile = path.join(__dirname, '..', '..', 'inventario.sqlite');
    
    showGlobalLoading('Iniciando exportación de base de datos SQLite...');
    
    try {
      // Verificar que existe la base de datos
      await sleep(300);
      updateGlobalLoadingMessage('Verificando integridad de la base de datos...');
      
      await sleep(500);
      updateGlobalLoadingMessage('Preparando archivo de exportación...');

      const { canceled, filePath } = await ipcRenderer.invoke('show-save-dialog', {
        title: 'Guardar backup SQLite',
        defaultPath: 'backup.sqlite'
      });

      if (!canceled) {
        await sleep(400);
        updateGlobalLoadingMessage('Copiando datos...');
        
        // Usar promesa para fs.copyFile
        await new Promise((resolve, reject) => {
          fs.copyFile(dbFile, filePath, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });

        await sleep(300);
        updateGlobalLoadingMessage('Finalizando exportación...');
        await sleep(200);

        showGlobalLoading('', false);
        showStatus('export', '✅ Backup SQLite creado exitosamente', 'success');
        addToHistory('export', '💾 backup.sqlite');
      } else {
        showGlobalLoading('', false);
      }
    } catch (err) {
      showGlobalLoading('', false);
      showStatus('export', '❌ ' + err.message, 'error');
    }
  }

  /*** 8) EXPORTAR A EXCEL (MEJORADO) ***/
  async function exportExcel() {
    const dbPath = path.join(__dirname, '..', '..', 'inventario.sqlite');
    const tables = Array.from(
      document.querySelectorAll('input[type="checkbox"]:checked'),
      cb => cb.value
    );
    
    if (!tables.length) {
      showStatus('export', '⚠️ Selecciona al menos una tabla', 'warning');
      return;
    }

    showGlobalLoading(`Iniciando exportación de ${tables.length} tabla(s) a Excel...`);

    try {
      await sleep(200);
      updateGlobalLoadingMessage('Conectando a la base de datos...');

      const db = new sqlite3.Database(dbPath);
      const wb = new ExcelJS.Workbook();

      await sleep(400);
      updateGlobalLoadingMessage('Leyendo estructura de tablas...');

      // Procesar cada tabla de forma asíncrona
      for (let i = 0; i < tables.length; i++) {
        const tableName = tables[i];
        updateGlobalLoadingMessage(`Procesando tabla: ${tableName}...`);
        
        await new Promise((resolve, reject) => {
          db.all(`SELECT * FROM ${tableName}`, (err, rows) => {
            if (err) {
              reject(err);
            } else {
              const ws = wb.addWorksheet(tableName);
              if (rows.length) {
                ws.columns = Object.keys(rows[0]).map(k => ({ header: k, key: k }));
                rows.forEach(r => ws.addRow(r));
              }
              resolve();
            }
          });
        });

        await sleep(200); // Pequeña pausa entre tablas
      }

      await sleep(300);
      updateGlobalLoadingMessage('Generando archivo Excel...');

      const { canceled, filePath } = await ipcRenderer.invoke('show-save-dialog', {
        title: 'Guardar archivo Excel',
        defaultPath: 'export.xlsx',
        filters: [{ name: 'Excel', extensions: ['xlsx'] }]
      });

      if (!canceled) {
        await sleep(400);
        updateGlobalLoadingMessage('Guardando archivo...');
        
        await wb.xlsx.writeFile(filePath);
        
        await sleep(300);
        updateGlobalLoadingMessage('Finalizando proceso...');
        await sleep(200);

        showGlobalLoading('', false);
        showStatus('export', '✅ Excel exportado exitosamente', 'success');
        addToHistory('export', `📊 ${tables.length} tabla(s) exportadas`);
      } else {
        showGlobalLoading('', false);
      }

      db.close();
    } catch (err) {
      showGlobalLoading('', false);
      showStatus('export', '❌ Error al exportar: ' + err.message, 'error');
    }
  }

  /*** 9) IMPORTAR SQLITE (MEJORADO) ***/
  async function handleSQLiteFile(file) {
    const dest = path.join(__dirname, '..', '..', 'inventario.sqlite');
    
    if (!/\.(sqlite|db)$/i.test(file.name)) {
      showStatus('import', '❌ Solo archivos .sqlite/.db', 'error');
      return;
    }

    showGlobalLoading('Validando archivo SQLite...');

    try {
      await sleep(300);
      updateGlobalLoadingMessage('Verificando integridad del archivo...');
      
      await sleep(500);
      updateGlobalLoadingMessage('Creando respaldo de seguridad...');
      
      await sleep(700);
      updateGlobalLoadingMessage('Importando base de datos...');

      // Usar promesa para fs.copyFile
      await new Promise((resolve, reject) => {
        fs.copyFile(file.path, dest, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      await sleep(400);
      updateGlobalLoadingMessage('Verificando importación...');
      
      await sleep(300);
      updateGlobalLoadingMessage('Finalizando proceso...');
      await sleep(200);

      showGlobalLoading('', false);
      showStatus('import', '✅ Importación SQLite completa', 'success');
      addToHistory('import', '💾 ' + file.name);
    } catch (err) {
      showGlobalLoading('', false);
      showStatus('import', '❌ ' + err.message, 'error');
    }
  }

  /*** 10) FUNCIONES DE CARGA GLOBAL ***/
  function createGlobalLoadingOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'global-loading';
    overlay.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 hidden';
    overlay.innerHTML = `
      <div class="flex items-center justify-center h-full">
        <div class="bg-white rounded-lg p-8 shadow-2xl flex flex-col items-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">Procesando...</h3>
          <p id="loading-message" class="text-gray-600 text-center">Preparando operación</p>
          <div class="w-64 bg-gray-200 rounded-full h-2 mt-4">
            <div id="global-progress-bar" class="bg-blue-600 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  function showGlobalLoading(message, show = true) {
    const overlay = document.getElementById('global-loading');
    const messageEl = document.getElementById('loading-message');
    const progressBar = document.getElementById('global-progress-bar');
    
    if (show) {
      messageEl.textContent = message;
      progressBar.style.width = '0%';
      overlay.classList.remove('hidden');
      isProcessing = true;
      disableButtons(true);
      
      // Animación de progreso suave
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 90) progress = 90;
        progressBar.style.width = progress + '%';
      }, 200);
      
      // Guardar interval para poder limpiarlo
      overlay.progressInterval = interval;
    } else {
      // Completar progreso
      if (overlay.progressInterval) {
        clearInterval(overlay.progressInterval);
      }
      progressBar.style.width = '100%';
      
      setTimeout(() => {
        overlay.classList.add('hidden');
        isProcessing = false;
        disableButtons(false);
        progressBar.style.width = '0%';
      }, 500);
    }
  }

  function updateGlobalLoadingMessage(message) {
    const messageEl = document.getElementById('loading-message');
    if (messageEl) {
      messageEl.textContent = message;
    }
  }

  function disableButtons(disabled) {
    const buttons = document.querySelectorAll('button:not([data-keep-enabled])');
    buttons.forEach(btn => {
      btn.disabled = disabled;
      if (disabled) {
        btn.classList.add('opacity-50', 'cursor-not-allowed');
      } else {
        btn.classList.remove('opacity-50', 'cursor-not-allowed');
      }
    });
  }

  /*** 11) FUNCIÓN AUXILIAR PARA SLEEP ***/
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /*** 12) MANEJO DE ERRORES GLOBAL ***/
  window.addEventListener('error', function(e) {
    if (isProcessing) {
      showGlobalLoading('', false);
      showStatus(currentSection, '❌ Error inesperado durante el proceso', 'error');
    }
  });

  // Prevenir cierre accidental durante procesamiento
  window.addEventListener('beforeunload', function(e) {
    if (isProcessing) {
      e.preventDefault();
      e.returnValue = 'Hay una operación en progreso. ¿Estás seguro de que quieres salir?';
      return e.returnValue;
    }
  });

  console.log('📊 Sistema de Exportar/Importar inicializado con carga mejorada');
};