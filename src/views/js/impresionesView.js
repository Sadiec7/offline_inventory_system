// impresionesView.js
const obraCtrl = require(path.join(__dirname, '..', 'controllers', 'obraController'));
const compraCtrl = require(path.join(__dirname, '..', 'controllers', 'compraController'));
const insumoCtrl = require(path.join(__dirname, '..', 'controllers', 'insumoController'));
const proveedorCtrl = require(path.join(__dirname, '..', 'controllers', 'proveedorController'));
let obras = [];
let comprasData = [];

function initImpresionesView() {
  console.log('🎯 Inicializando vista de impresiones...');
  
  // Cargar obras para el filtro
  cargarObras();
  
  // Configurar event listeners
  configurarEventListeners();
}

// Función auxiliar para promisificar callbacks
function promisify(callbackBasedFunction) {
  return function(...args) {
    return new Promise((resolve, reject) => {
      callbackBasedFunction(...args, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  };
}

function configurarEventListeners() {
  const btnGenerar = document.getElementById('btnGenerarReporte');
  const btnImprimir = document.getElementById('btnImprimir');
  const btnLimpiar = document.getElementById('btnLimpiar');
  const filtroObra = document.getElementById('filtroObra');
  
  if (btnGenerar) {
    btnGenerar.addEventListener('click', generarReporte);
  }
  
  if (btnImprimir) {
    btnImprimir.addEventListener('click', imprimirReporte);
  }
  
  if (btnLimpiar) {
    btnLimpiar.addEventListener('click', limpiarReporte);
  }
  
  if (filtroObra) {
    filtroObra.addEventListener('change', function() {
      if (this.value) {
        btnGenerar.disabled = false;
      } else {
        btnGenerar.disabled = true;
        btnImprimir.disabled = true;
      }
    });
  }
}

function cargarObras() {
  obraCtrl.listar((err, filas) => {
    if (err) {
      console.error('Error cargando obras:', err);
      Swal.fire('Error', 'No se pudieron cargar las obras', 'error');
      return;
    }
    obras = filas;
    const select = document.getElementById('filtroObra');
    select.innerHTML = '<option value="">Seleccione una obra...</option>';
    obras.forEach(obra => {
      const option = document.createElement('option');
      option.value = obra.id;
      option.textContent = `${obra.codigo} - ${obra.nombre}`;
      select.appendChild(option);
    });
  });
}

function generarReporte() {
  const obraId = document.getElementById('filtroObra').value;
  const fechaInicio = document.getElementById('fechaInicio').value;
  const fechaFin = document.getElementById('fechaFin').value;
  
  if (!obraId) {
    Swal.fire('Error', 'Debe seleccionar una obra', 'warning');
    return;
  }
  
  // Mostrar loading
  const container = document.getElementById('reporteContainer');
  container.innerHTML = `
    <div class="text-center p-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">Generando reporte...</p>
    </div>
  `;
  
  // Promisificar las funciones con callback
  const listarObrasAsync = promisify(obraCtrl.listar);
  const listarComprasPorObraAsync = promisify(compraCtrl.listarPorObra);
  const listarInsumosAsync = promisify(insumoCtrl.listar);
  const listarProveedoresAsync = promisify(proveedorCtrl.listar);
  
  // Obtener datos en paralelo
  Promise.all([
    listarObrasAsync(),
    listarComprasPorObraAsync(obraId),
    listarInsumosAsync(),
    listarProveedoresAsync()
  ])
  .then(([obrasData, compras, insumos, proveedores]) => {
    const obra = obrasData.find(o => o.id == obraId);
    
    if (!obra) {
      throw new Error('Obra no encontrada');
    }
    
    // Filtrar compras por fechas
    let comprasFiltradas = compras;
    if (fechaInicio || fechaFin) {
      comprasFiltradas = compras.filter(compra => {
        const fechaCompra = new Date(compra.fecha);
        const inicio = fechaInicio ? new Date(fechaInicio) : new Date('1900-01-01');
        const fin = fechaFin ? new Date(fechaFin) : new Date('2100-12-31');
        return fechaCompra >= inicio && fechaCompra <= fin;
      });
    }
    
    generarHTMLReporte(obra, comprasFiltradas, proveedores, insumos);
    document.getElementById('btnImprimir').disabled = false;
  })
  .catch(error => {
    console.error('Error generando reporte:', error);
    document.getElementById('reporteContainer').innerHTML = `
      <div class="text-center p-8">
        <div class="text-red-500 text-6xl mb-4">⚠️</div>
        <p class="text-red-600 text-lg">Error al generar el reporte</p>
        <p class="text-gray-600 text-sm mt-2">${error.message || error}</p>
      </div>
    `;
    Swal.fire('Error', 'No se pudo generar el reporte', 'error');
  });
}

function generarHTMLReporte(obra, compras, proveedores, insumos) {
  const fechaActual = new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Crear mapas para búsqueda rápida
  const proveedoresMap = {};
  proveedores.forEach(p => proveedoresMap[p.id] = p);
  
  const insumosMap = {};
  insumos.forEach(i => insumosMap[i.id] = i);
  
  // Calcular total
  const totalCantidad = compras.reduce((sum, c) => sum + (c.cantidad || 0), 0);
  const totalImporte = compras.reduce((sum, c) => sum + (c.importe || 0), 0);
  
  // Generar filas de la tabla
  let filasHTML = '';
  compras.forEach(compra => {
    const proveedor = proveedoresMap[compra.proveedor_id];
    const insumo = insumosMap[compra.insumo_id];
    const fechaFormateada = new Date(compra.fecha).toLocaleDateString('es-MX');
    
    filasHTML += `
      <tr>
        <td style="padding: 6px; border: 1px solid #000; font-size: 11px;">${obra.codigo || 'N/A'}</td>
        <td style="padding: 6px; border: 1px solid #000; font-size: 11px;">${insumo?.nombre || 'N/A'}</td>
        <td style="padding: 6px; border: 1px solid #000; text-align: center; font-size: 11px;">${insumo?.unidad || 'N/A'}</td>
        <td style="padding: 6px; border: 1px solid #000; text-align: right; font-size: 11px;">${compra.cantidad || 0}</td>
        <td style="padding: 6px; border: 1px solid #000; text-align: right; font-size: 11px;">$ ${(compra.importe || 0).toLocaleString('es-MX', {minimumFractionDigits: 2})}</td>
        <td style="padding: 6px; border: 1px solid #000; text-align: center; font-size: 11px;">${fechaFormateada}</td>
        <td style="padding: 6px; border: 1px solid #000; text-align: center; font-size: 11px;">${compra.pedido || 'N/A'}</td>
        <td style="padding: 6px; border: 1px solid #000; font-size: 11px;">${proveedor?.nombre || compra.proveedor_id || 'N/A'}</td>
      </tr>
    `;
  });
  
  const reporteHTML = `
    <div style="max-width: 100%; margin: 0 auto; background: white; padding: 20px; font-family: Arial, sans-serif;">
      <!-- Encabezado -->
      <div style="display: flex; align-items: flex-start; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 15px;">
        <div style="flex: 0 0 100px; margin-right: 20px;">
          <!-- Logo genérico -->
          <div style="width: 80px; height: 60px; border: 2px solid #000; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 10px; text-align: center;">
            <img src="../../assets/cronos logo.jpg" style="max-width: 100%; max-height: 100%;"><br>
          </div>
        </div>
        
        <div style="flex: 1; text-align: center;">
          <div style="font-weight: bold; font-size: 16px; margin-bottom: 5px;">
            Constructora e Inmobiliaria CRONOS S.A de C.V
          </div>
          <div style="font-size: 12px; margin-bottom: 10px;">
            Diego Rivera No. 153 Santiago Miltepec, Toluca, México
          </div>
        </div>
        
        <div style="flex: 0 0 200px; text-align: right;">
          <div style="font-weight: bold; font-size: 12px;">
            Fecha ACTUAL<br>
            ${fechaActual}
          </div>
        </div>
      </div>
      
      <!-- Título del reporte -->
      <div style="text-align: center; font-weight: bold; font-size: 14px; margin: 20px 0; border: 2px solid #000; padding: 8px;">
        Detalle de insumos comprados
      </div>
      
      <!-- Información de la obra -->
      <div style="margin-bottom: 15px;">
        <strong>Obra:</strong> ${obra.codigo} - ${obra.nombre}
      </div>
      
      <!-- Tabla de datos -->
      <table class="reporte-tabla" style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr style="background-color: #f5f5f5;">
            <th style="padding: 8px; border: 1px solid #000; font-size: 11px; font-weight: bold;">Obra</th>
            <th style="padding: 8px; border: 1px solid #000; font-size: 11px; font-weight: bold;">Nombre</th>
            <th style="padding: 8px; border: 1px solid #000; font-size: 11px; font-weight: bold;">Unidad</th>
            <th style="padding: 8px; border: 1px solid #000; font-size: 11px; font-weight: bold;">Cantidad</th>
            <th style="padding: 8px; border: 1px solid #000; font-size: 11px; font-weight: bold;">Importe</th>
            <th style="padding: 8px; border: 1px solid #000; font-size: 11px; font-weight: bold;">Fecha Pedido</th>
            <th style="padding: 8px; border: 1px solid #000; font-size: 11px; font-weight: bold;">No. De Pedido</th>
            <th style="padding: 8px; border: 1px solid #000; font-size: 11px; font-weight: bold;">Proveedor</th>
          </tr>
        </thead>
        <tbody>
          ${filasHTML}
        </tbody>
        <tfoot>
          <tr style="background-color: #f0f0f0; font-weight: bold;">
            <td colspan="3" style="padding: 8px; border: 1px solid #000; text-align: center; font-size: 11px; font-weight: bold;">TOTAL:</td>
            <td style="padding: 8px; border: 1px solid #000; text-align: right; font-size: 11px; font-weight: bold;">${totalCantidad.toLocaleString()}</td>
            <td style="padding: 8px; border: 1px solid #000; text-align: right; font-size: 11px; font-weight: bold;">$ ${totalImporte.toLocaleString('es-MX', {minimumFractionDigits: 2})}</td>
            <td colspan="3" style="padding: 8px; border: 1px solid #000; font-size: 11px;"></td>
          </tr>
        </tfoot>
      </table>
      
      <!-- Información adicional -->
      <div style="margin-top: 20px; font-size: 10px; color: #666;">
        <p><strong>Reporte generado el:</strong> ${new Date().toLocaleString('es-MX')}</p>
        <p><strong>Total de registros:</strong> ${compras.length}</p>
      </div>
    </div>
  `;
  
  document.getElementById('reporteContainer').innerHTML = reporteHTML;
}

function imprimirReporte() {
  const container = document.getElementById('reporteContainer');
  
  if (!container.innerHTML.trim() || container.innerHTML.includes('Seleccione una obra')) {
    Swal.fire('Error', 'No hay ningún reporte para imprimir', 'warning');
    return;
  }
  
  // Configurar la impresión
  const printWindow = window.open('', '_blank');
  const reporteContent = container.innerHTML;
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Reporte de Compras - CRONOS</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          font-size: 12px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        
        th, td {
          border: 1px solid #000;
          padding: 4px;
          text-align: left;
          font-size: 10px;
        }
        
        th {
          background-color: #f5f5f5;
          font-weight: bold;
        }
        
        .text-right {
          text-align: right;
        }
        
        .text-center {
          text-align: center;
        }
        
        @media print {
          body {
            margin: 0;
            padding: 15px;
          }
          
          table {
            page-break-inside: auto;
          }
          
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
        }
      </style>
    </head>
    <body>
      ${reporteContent}
    </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.focus();
  
  // Esperar a que se cargue el contenido y luego imprimir
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
}

function limpiarReporte() {
  // Limpiar filtros
  document.getElementById('filtroObra').value = '';
  document.getElementById('fechaInicio').value = '';
  document.getElementById('fechaFin').value = '';
  
  // Restablecer contenedor
  document.getElementById('reporteContainer').innerHTML = `
    <div class="text-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p class="text-lg">Seleccione una obra y genere un reporte para ver la vista previa</p>
      <p class="text-sm mt-1">Los datos aparecerán aquí una vez generado el reporte</p>
    </div>
  `;
  
  // Deshabilitar botones
  document.getElementById('btnImprimir').disabled = true;
  
  Swal.fire({
    title: 'Limpiado',
    text: 'Se han limpiado todos los filtros y el reporte',
    icon: 'success',
    timer: 1500,
    showConfirmButton: false
  });
}

// Exportar para uso en la vista principal
module.exports = {
  initImpresionesView
};