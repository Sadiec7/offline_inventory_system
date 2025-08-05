// src/views/js/importar_exportarView.js
const { ipcRenderer } = require('electron');

const sqlite3         = require('sqlite3').verbose();
const ExcelJS         = require('exceljs');

window.initImportar_exportarView = function () {
  let currentSection = 'export';

  setupTabs();
  setupDropZones();
  setupEventListeners();

  /*** 1) PESTAÑAS ***/
  function setupTabs() {
    const tabExport = document.getElementById('tab-export');
    const tabImport = document.getElementById('tab-import');
    const exportSec = document.getElementById('export-section');
    const importSec = document.getElementById('import-section');

    tabExport.addEventListener('click', () => {
      currentSection = 'export';
      toggleTab(tabExport, true);
      toggleTab(tabImport, false);
      showSection(exportSec, true);
      showSection(importSec, false);
    });
    tabImport.addEventListener('click', () => {
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
    dz.addEventListener('click',   () => fi.click());
    fi.addEventListener('change', e => e.target.files[0] && handler(e.target.files[0]));
    dz.addEventListener('dragover', e => {
      e.preventDefault();
      dz.classList.add('border-blue-400','bg-blue-50');
    });
    dz.addEventListener('dragleave', () => {
      dz.classList.remove('border-blue-400','bg-blue-50');
    });
    dz.addEventListener('drop', e => {
      e.preventDefault();
      dz.classList.remove('border-blue-400','bg-blue-50');
      e.dataTransfer.files[0] && handler(e.dataTransfer.files[0]);
    });
  }

  /*** 3) BOTONES DE EXPORT ***/
  function setupEventListeners() {
    document.getElementById('export-sqlite').addEventListener('click', exportSQLite);
    document.getElementById('export-excel').addEventListener('click', exportExcel);
  }

  /*** 4) HELPERS UI ***/
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

  /*** 5) EXPORTAR SQLITE ***/
  async function exportSQLite() {
    const dbFile = path.join(process.cwd(), 'inventario.sqlite');
    showStatus('export', '⏳ Exportando SQLite...', 'info');
    showProgress('export');

    const { canceled, filePath } = await ipcRenderer.invoke('show-save-dialog', {
      title: 'Guardar backup SQLite',
      defaultPath: 'backup.sqlite'
    });
    if (!canceled) {
      fs.copyFile(dbFile, filePath, err => {
        if (err) showStatus('export', '❌ ' + err.message, 'error');
        else {
          showStatus('export', '✅ Backup SQLite creado', 'success');
          addToHistory('export', '💾 backup.sqlite');
        }
      });
    }
  }

  /*** 6) EXPORTAR A EXCEL ***/
  async function exportExcel() {
    const dbPath = path.join(process.cwd(), 'inventario.sqlite');
    const tables = Array.from(
      document.querySelectorAll('input[type="checkbox"]:checked'),
      cb => cb.value
    );
    if (!tables.length) {
      showStatus('export', '⚠️ Selecciona al menos una tabla', 'warning');
      return;
    }
    showStatus('export', `⏳ Exportando ${tables.length} tabla(s)...`, 'info');
    showProgress('export');

    const db = new sqlite3.Database(dbPath);
    const wb = new ExcelJS.Workbook();
    let pending = tables.length;

    tables.forEach(tab => {
      db.all(`SELECT * FROM ${tab}`, (err, rows) => {
        if (!err) {
          const ws = wb.addWorksheet(tab);
          if (rows.length) {
            ws.columns = Object.keys(rows[0]).map(k => ({ header: k, key: k }));
            rows.forEach(r => ws.addRow(r));
          }
        }
        if (--pending === 0) {
          ipcRenderer.invoke('show-save-dialog', {
            title: 'Guardar archivo Excel',
            defaultPath: 'export.xlsx',
            filters: [{ name: 'Excel', extensions: ['xlsx'] }]
          }).then(({ canceled, filePath }) => {
            if (!canceled) {
              wb.xlsx.writeFile(filePath).then(() => {
                showStatus('export', '✅ Excel exportado', 'success');
                addToHistory('export', `📊 ${tables.length} tabla(s)`);
                db.close();
              });
            }
          });
        }
      });
    });
  }

  /*** 7) IMPORTAR SQLITE ***/
  function handleSQLiteFile(file) {
    const dest = path.join(process.cwd(), 'inventario.sqlite');
    if (!/\.(sqlite|db)$/i.test(file.name)) {
      showStatus('import', '❌ Solo .sqlite/.db', 'error');
      return;
    }
    showStatus('import', '⏳ Importando SQLite...', 'info');
    showProgress('import');

    fs.copyFile(file.path, dest, err => {
      if (err) showStatus('import', '❌ ' + err.message, 'error');
      else {
        showStatus('import', '✅ Importación SQLite completa', 'success');
        addToHistory('import', '💾 ' + file.name);
      }
    });
  }
};