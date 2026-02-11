// views/comprasInsumosView.js - VERSIÓN CON FIX DE FOCUS PARA ELECTRON
window.initComprasInsumosView = function() {

const compraCtrl = require(path.join(__dirname, '..', 'controllers', 'compraController'));
const obraCtrl = require(path.join(__dirname, '..', 'controllers', 'obraController'));
const insumoCtrl = require(path.join(__dirname, '..', 'controllers', 'insumoController'));
const proveedorCtrl = require(path.join(__dirname, '..', 'controllers', 'proveedorController'));
const categoriaCtrl = require(path.join(__dirname, '..', 'controllers', 'categoriaInsumoController'));

  const obraSel       = document.getElementById('obra_id');
  const categoriaSel  = document.getElementById('categoria_id');
  const insumoSel     = document.getElementById('insumo_id');
  const proveedorSel  = document.getElementById('proveedor_id');
  const listaEl       = document.getElementById('listaCompras');
  const btnNuevo      = document.getElementById('nuevo');
  const btnGuardar    = document.getElementById('guardar');
  const modalDet      = document.getElementById('modalDetalle');
  const contenidoDet  = document.getElementById('contenidoDetalle');
  const cerrarDet     = document.getElementById('cerrarDetalle');
  const modalEd       = document.getElementById('modalEditar');
  const contenidoEd   = document.getElementById('contenidoEditar');
  const cerrarEd      = document.getElementById('cerrarEditar');
  const inputBuscar   = document.getElementById('buscarCompra');
  const btnBuscar     = document.getElementById('btnBuscar');
  const datalist      = document.getElementById('comprasData');

  let comprasGlobal = [];
  let insumosGlobal = [];
  let categoriasGlobal = [];

  // ============================================
  // FIX PARA ELECTRON - RESTAURAR FOCUS
  // ============================================
  function restoreInputFocus() {
    // Forzar que todos los inputs vuelvan a ser interactivos
    const allInputs = document.querySelectorAll('input, select, textarea, button');
    allInputs.forEach(input => {
      // Remover y re-agregar el atributo tabindex para forzar re-render
      const currentTabIndex = input.tabIndex;
      input.tabIndex = -1;
      setTimeout(() => {
        input.tabIndex = currentTabIndex >= 0 ? currentTabIndex : 0;
        input.blur();
        // Forzar re-render del elemento
        input.style.pointerEvents = 'none';
        setTimeout(() => {
          input.style.pointerEvents = 'auto';
        }, 0);
      }, 0);
    });
    
    // Forzar re-paint de la ventana
    document.body.style.transform = 'translateZ(0)';
    setTimeout(() => {
      document.body.style.transform = '';
    }, 10);
  }

  // ============================================
  // SISTEMA DE NOTIFICACIONES (SIN MODALES)
  // ============================================
  function showNotification(message, type = 'info') {
    let container = document.getElementById('notification-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'notification-container';
      container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 400px;
      `;
      document.body.appendChild(container);
    }

    const notification = document.createElement('div');
    const colors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500'
    };
    
    notification.className = `${colors[type] || colors.info} text-white px-6 py-4 rounded-lg shadow-lg flex items-center justify-between animate-slide-in`;
    notification.innerHTML = `
      <span>${message}</span>
      <button class="ml-4 text-white hover:text-gray-200 font-bold text-xl" onclick="this.parentElement.remove()">×</button>
    `;
    
    container.appendChild(notification);

    // IMPORTANTE: Restaurar focus después de mostrar notificación
    setTimeout(() => {
      restoreInputFocus();
    }, 50);

    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      notification.style.transition = 'all 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  }

  // ============================================
  // CONFIRMACIÓN INLINE (SIN MODAL)
  // ============================================
  function showConfirm(message, onConfirm, onCancel, targetElement) {
    // En lugar de modal, crear confirmación inline junto al elemento
    const confirmBox = document.createElement('div');
    confirmBox.className = 'fixed z-[10000] bg-white rounded-lg shadow-2xl p-4 border-2 border-yellow-400';
    confirmBox.style.cssText = `
      max-width: 350px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    `;
    
    confirmBox.innerHTML = `
      <div class="flex items-start gap-3 mb-4">
        <div class="flex-shrink-0">
          <svg class="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <div class="flex-1">
          <p class="text-gray-800 font-medium">${message}</p>
        </div>
      </div>
      <div class="flex gap-2">
        <button id="confirmCancel" class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded transition">
          Cancelar
        </button>
        <button id="confirmOk" class="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition">
          Confirmar
        </button>
      </div>
    `;
    
    document.body.appendChild(confirmBox);

    const btnCancel = confirmBox.querySelector('#confirmCancel');
    const btnOk = confirmBox.querySelector('#confirmOk');

    btnCancel.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      confirmBox.remove();
      if (onCancel) onCancel();
      restoreInputFocus();
    };

    btnOk.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      confirmBox.remove();
      if (onConfirm) onConfirm();
      restoreInputFocus();
    };

    // Auto-remover al hacer click fuera (con timeout para evitar que se cierre inmediatamente)
    setTimeout(() => {
      const clickOutside = (e) => {
        if (!confirmBox.contains(e.target)) {
          confirmBox.remove();
          if (onCancel) onCancel();
          restoreInputFocus();
          document.removeEventListener('click', clickOutside);
        }
      };
      document.addEventListener('click', clickOutside);
    }, 100);
  }

  // Eventos básicos
  cerrarDet.onclick   = () => {
    modalDet.classList.add('hidden');
    restoreInputFocus();
  };
  cerrarEd.onclick    = () => {
    modalEd.classList.add('hidden');
    restoreInputFocus();
  };
  btnNuevo.onclick    = limpiar;
  btnGuardar.onclick  = guardar;

  // Evento para filtrar insumos por categoría
  categoriaSel.addEventListener('change', function() {
    const categoriaId = parseInt(this.value);
    if (categoriaId) {
      cargarInsumosPorCategoria(categoriaId);
    } else {
      insumoSel.innerHTML = '<option disabled selected>Primero selecciona una categoría…</option>';
      insumoSel.disabled = true;
    }
  });

  // Carga inicial de datos
  cargarObras();
  cargarCategorias();
  cargarInsumos();
  cargarProveedores();
  cargarCompras();

  // Eventos para cálculo automático de importe
  document.getElementById('cantidad').addEventListener('input', calcularImporte);
  document.getElementById('precio').addEventListener('input', calcularImporte);

  // Función para calcular importe automático
  function calcularImporte() {
    const cantidad = parseFloat(document.getElementById('cantidad').value) || 0;
    const precio = parseFloat(document.getElementById('precio').value) || 0;
    const importe = cantidad * precio;
    document.getElementById('importe').value = importe.toFixed(2);
  }

  // Funciones de carga
  function cargarObras() {
    obraCtrl.listar((err, filas) => {
      if (err) {
        obraSel.innerHTML = `<option disabled>Error al cargar obras</option>`;
        return;
      }
      obraSel.innerHTML = '<option disabled selected>Selecciona una obra…</option>' +
        (Array.isArray(filas) && filas.length
          ? filas.map(o => `<option value="${o.id}">${o.nombre}</option>`).join('')
          : `<option disabled>No hay obras</option>`);
    });
  }

  function cargarCategorias() {
    categoriaCtrl.listar((err, filas) => {
      if (err) {
        categoriaSel.innerHTML = `<option disabled>Error al cargar categorías</option>`;
        console.error('Error al cargar categorías:', err);
        return;
      }
      categoriasGlobal = Array.isArray(filas) ? filas : [];
      categoriaSel.innerHTML = '<option disabled selected>Selecciona una categoría…</option>' +
        (categoriasGlobal.length
          ? categoriasGlobal.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('')
          : `<option disabled>No hay categorías</option>`);
    });
  }

  function cargarInsumos() {
    insumoCtrl.listar((err, filas) => {
      if (err) {
        console.error('Error al cargar insumos:', err);
        return;
      }
      insumosGlobal = Array.isArray(filas) ? filas : [];
    });
  }

  function cargarInsumosPorCategoria(categoriaId) {
    const insumosFiltrados = insumosGlobal.filter(insumo => insumo.categoria_id === categoriaId);
    
    if (insumosFiltrados.length === 0) {
      insumoSel.innerHTML = '<option disabled selected>No hay insumos en esta categoría</option>';
      insumoSel.disabled = true;
    } else {
      insumoSel.innerHTML = '<option disabled selected>Selecciona un insumo…</option>' +
        insumosFiltrados.map(i => `<option value="${i.id}">${i.nombre} (${i.unidad || 'unidad'})</option>`).join('');
      insumoSel.disabled = false;
    }
  }

  function cargarProveedores() {
    proveedorCtrl.list()
      .then(rows => {
        proveedorSel.innerHTML = '<option disabled selected>Selecciona un proveedor…</option>' +
          rows.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('');
      })
      .catch(err => {
        proveedorSel.innerHTML = `<option disabled>Error al cargar proveedores</option>`;
        console.error('Error al cargar proveedores:', err);
      });
  }

  function cargarCompras() {
    compraCtrl.listar((err, filas) => {
      if (err) {
        listaEl.innerHTML = `<li class="p-4 text-red-500">Error al cargar compras</li>`;
        return;
      }
      comprasGlobal = Array.isArray(filas) ? filas : [];
      renderCompras(comprasGlobal);
      if (datalist) {
        datalist.innerHTML = comprasGlobal.map(c => `<option value="${c.nombre}">`).join('');
      }
    });
  }

  // Renderización
  function renderCompras(data) {
    if (!data.length) {
      listaEl.innerHTML = `<li class="p-4">No hay compras</li>`;
      return;
    }
    listaEl.innerHTML = data.map(c => `
      <li class="bg-white rounded-lg shadow p-4 mb-4 flex justify-between hover:shadow-md transition">
        <div class="flex-1 cursor-pointer" onclick="showDetalle(${c.id})">
          <div class="font-semibold">${c.nombre || 'Sin nombre'}</div>
          <div class="text-sm text-gray-600">${c.fecha}</div>
          <div class="text-sm">Cantidad: ${c.cantidad} × $${c.precio} = $${c.importe}</div>
          <div class="text-xs text-gray-500">Pedido: ${c.pedido || 'N/A'}</div>
        </div>
        <div class="ml-4 flex flex-col space-y-2">
          <button class="text-green-600 hover:text-green-800 text-sm" onclick="showEditar(${c.id})">Editar</button>
          <button class="text-red-500 hover:text-red-700 text-sm" data-id="${c.id}">Eliminar</button>
        </div>
      </li>
    `).join('');
    
    listaEl.querySelectorAll('button[data-id]').forEach(b => {
      b.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        showConfirm(
          '¿Estás seguro de eliminar esta compra?',
          () => {
            compraCtrl.eliminar(Number(b.dataset.id), (err) => {
              if (err) {
                showNotification('Error al eliminar: ' + err.message, 'error');
              } else {
                showNotification('Compra eliminada exitosamente', 'success');
                cargarCompras();
              }
            });
          },
          null,
          b
        );
      };
    });
  }

  // Búsqueda interna
  if (btnBuscar && inputBuscar) {
    btnBuscar.onclick = () => {
      const filtro = inputBuscar.value.toLowerCase();
      const filtrados = comprasGlobal.filter(c => 
        c.nombre?.toLowerCase().includes(filtro) ||
        c.pedido?.toLowerCase().includes(filtro)
      );
      renderCompras(filtrados);
    };
    
    inputBuscar.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        btnBuscar.click();
      }
    });
  }

  // --- Modal Detalle ---
  window.showDetalle = function(id) {
    contenidoDet.innerText = 'Cargando detalle…';
    compraCtrl.listar((err, filas) => {
      const c = Array.isArray(filas) ? filas.find(x => x.id === id) : null;
      if (!c) {
        contenidoDet.innerHTML = '<p class="text-red-500">Compra no encontrada</p>';
        modalDet.classList.remove('hidden');
        restoreInputFocus();
        return;
      }

      Promise.all([
        new Promise((res, rej) => obraCtrl.listar((e, r) => e ? rej(e) : res(r))),
        new Promise((res, rej) => insumoCtrl.listar((e, r) => e ? rej(e) : res(r))),
        proveedorCtrl.list()
      ])
      .then(([obras, insumos, proveedores]) => {
        const obra = (obras || []).find(o => o.id === c.obra_id);
        const insumo = (insumos || []).find(i => i.id === c.insumo_id);
        const prov = (proveedores || []).find(p => p.id === c.proveedor_id);

        contenidoDet.innerHTML = `
          <h2 class="text-2xl font-bold mb-4">Compra #${c.id}</h2>
          <div class="space-y-3">
            <p><strong>Obra:</strong> ${obra ? obra.nombre : 'Desconocida'}</p>
            <p><strong>Insumo:</strong> ${insumo ? insumo.nombre : 'Desconocido'}</p>
            <p><strong>Nombre:</strong> ${c.nombre || 'N/A'}</p>
            <p><strong>Fecha:</strong> ${c.fecha}</p>
            <p><strong>Pedido:</strong> ${c.pedido || 'N/A'}</p>
            <p><strong>Cantidad:</strong> ${c.cantidad}</p>
            <p><strong>Precio:</strong> $${c.precio}</p>
            <p><strong>Importe:</strong> $${c.importe}</p>
            <p><strong>Proveedor:</strong> ${prov ? prov.nombre : 'Desconocido'}</p>
          </div>
        `;
        modalDet.classList.remove('hidden');
        restoreInputFocus();
      })
      .catch(err => {
        console.error(err);
        contenidoDet.innerHTML = '<p class="text-red-500">Error al cargar datos relacionados</p>';
        modalDet.classList.remove('hidden');
        restoreInputFocus();
      });
    });
  };

  // --- Modal Editar ---
  window.showEditar = function(id) {
    contenidoEd.innerText = 'Cargando formulario de edición…';
    
    Promise.all([
      new Promise((res, rej) => compraCtrl.listar((e, r) => e ? rej(e) : res(r))),
      new Promise((res, rej) => obraCtrl.listar((e, r) => e ? rej(e) : res(r))),
      new Promise((res, rej) => insumoCtrl.listar((e, r) => e ? rej(e) : res(r))),
      proveedorCtrl.list(),
      new Promise((res, rej) => categoriaCtrl.listar((e, r) => e ? rej(e) : res(r)))
    ])
    .then(([compras, obras, insumos, proveedores, categorias]) => {
      const c = (compras || []).find(x => x.id === id);
      if (!c) {
        contenidoEd.innerHTML = '<p class="text-red-500">Compra no encontrada</p>';
        modalEd.classList.remove('hidden');
        restoreInputFocus();
        return;
      }

      const insumoActual = insumos.find(i => i.id === c.insumo_id);
      const categoriaActual = insumoActual ? insumoActual.categoria_id : null;

      contenidoEd.innerHTML = `
        <h2 class="text-2xl font-bold mb-6">Editar Compra #${c.id}</h2>
        <div class="space-y-4">
          <label class="block">
            <span class="block mb-1 font-medium">Obra:</span>
            <select id="edit_obra" class="w-full p-2 border rounded">
              ${obras.map(o => `<option value="${o.id}"${o.id === c.obra_id ? ' selected' : ''}>${o.nombre}</option>`).join('')}
            </select>
          </label>
          
          <label class="block">
            <span class="block mb-1 font-medium">Categoría de Insumo:</span>
            <select id="edit_categoria" class="w-full p-2 border rounded">
              <option disabled>Selecciona una categoría…</option>
              ${categorias.map(cat => `<option value="${cat.id}"${cat.id === categoriaActual ? ' selected' : ''}>${cat.nombre}</option>`).join('')}
            </select>
          </label>
          
          <label class="block">
            <span class="block mb-1 font-medium">Insumo:</span>
            <select id="edit_insumo" class="w-full p-2 border rounded">
              ${insumos
                .filter(i => i.categoria_id === categoriaActual)
                .map(i => `<option value="${i.id}"${i.id === c.insumo_id ? ' selected' : ''}>${i.nombre} (${i.unidad || 'unidad'})</option>`)
                .join('')}
            </select>
          </label>
          
          <label class="block">
            <span class="block mb-1 font-medium">Nombre:</span>
            <input id="edit_nombre" type="text" value="${c.nombre || ''}" class="w-full p-2 border rounded"/>
          </label>
          
          <label class="block">
            <span class="block mb-1 font-medium">Fecha:</span>
            <input id="edit_fecha" type="date" value="${c.fecha}" class="w-full p-2 border rounded"/>
          </label>
          
          <label class="block">
            <span class="block mb-1 font-medium">Pedido:</span>
            <input id="edit_pedido" type="text" value="${c.pedido || ''}" class="w-full p-2 border rounded"/>
          </label>
          
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block mb-1 font-medium">Cantidad:</label>
              <input id="edit_cantidad" type="number" step="0.01" value="${c.cantidad}" class="w-full p-2 border rounded"/>
            </div>
            <div>
              <label class="block mb-1 font-medium">Precio:</label>
              <input id="edit_precio" type="number" step="0.01" value="${c.precio}" class="w-full p-2 border rounded"/>
            </div>
            <div>
              <label class="block mb-1 font-medium">Importe:</label>
              <input id="edit_importe" type="number" step="0.01" value="${c.importe}" class="w-full p-2 border rounded" readonly/>
            </div>
          </div>
          
          <label class="block">
            <span class="block mb-1 font-medium">Proveedor:</span>
            <select id="edit_proveedor" class="w-full p-2 border rounded">
              ${proveedores.map(p => `<option value="${p.id}"${p.id === c.proveedor_id ? ' selected' : ''}>${p.nombre}</option>`).join('')}
            </select>
          </label>
        </div>
        
        <div class="flex justify-end space-x-2 mt-6">
          <button id="cancelEd" class="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded transition">Cancelar</button>
          <button id="saveEd" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition">Actualizar</button>
        </div>
      `;
      
      document.getElementById('edit_categoria').addEventListener('change', function() {
        const categoriaId = parseInt(this.value);
        const insumosFiltrados = insumos.filter(i => i.categoria_id === categoriaId);
        const editInsumoSel = document.getElementById('edit_insumo');
        
        editInsumoSel.innerHTML = '<option disabled selected>Selecciona un insumo…</option>' +
          insumosFiltrados.map(i => `<option value="${i.id}">${i.nombre} (${i.unidad || 'unidad'})</option>`).join('');
      });
      
      function calcularImporteEditar() {
        const cantidad = parseFloat(document.getElementById('edit_cantidad').value) || 0;
        const precio = parseFloat(document.getElementById('edit_precio').value) || 0;
        const importe = cantidad * precio;
        document.getElementById('edit_importe').value = importe.toFixed(2);
      }
      
      document.getElementById('edit_cantidad').addEventListener('input', calcularImporteEditar);
      document.getElementById('edit_precio').addEventListener('input', calcularImporteEditar);
      
      calcularImporteEditar();
      
      document.getElementById('cancelEd').onclick = () => {
        modalEd.classList.add('hidden');
        restoreInputFocus();
      };
      
      document.getElementById('saveEd').onclick = () => {
        const obraId = parseInt(document.getElementById('edit_obra').value, 10);
        const insumoId = parseInt(document.getElementById('edit_insumo').value, 10);
        const proveedorId = parseInt(document.getElementById('edit_proveedor').value, 10);
        
        if (!obraId || !insumoId || !proveedorId) {
          showNotification('Por favor completa todos los campos obligatorios', 'warning');
          return;
        }
        
        const upd = {
          obra_id:     obraId,
          insumo_id:   insumoId,
          nombre:      document.getElementById('edit_nombre').value.trim(),
          fecha:       document.getElementById('edit_fecha').value,
          pedido:      document.getElementById('edit_pedido').value.trim(),
          cantidad:    parseFloat(document.getElementById('edit_cantidad').value) || 0,
          precio:      parseFloat(document.getElementById('edit_precio').value) || 0,
          importe:     parseFloat(document.getElementById('edit_importe').value) || 0,
          proveedor_id: proveedorId
        };
        
        compraCtrl.editar(c.id, upd, (err, result) => {
          if (err) {
            console.error('Error al actualizar:', err);
            showNotification('Error al actualizar: ' + err.message, 'error');
          } else {
            showNotification('Compra actualizada exitosamente', 'success');
            modalEd.classList.add('hidden');
            cargarCompras();
            restoreInputFocus();
          }
        });
      };

      modalEd.classList.remove('hidden');
      
      // IMPORTANTE: Restaurar focus después de abrir modal
      setTimeout(() => {
        restoreInputFocus();
      }, 100);
    })
    .catch(err => {
      console.error('Error al cargar datos para editar:', err);
      contenidoEd.innerHTML = '<p class="text-red-500">Error al cargar datos</p>';
      modalEd.classList.remove('hidden');
      restoreInputFocus();
    });
  };

  // Funciones guardar y limpiar
  function guardar() {
    if (!obraSel.value || obraSel.selectedIndex === 0) {
      showNotification('Por favor selecciona una obra', 'warning');
      setTimeout(() => obraSel.focus(), 100);
      return;
    }
    
    if (!categoriaSel.value || categoriaSel.selectedIndex === 0) {
      showNotification('Por favor selecciona una categoría', 'warning');
      setTimeout(() => categoriaSel.focus(), 100);
      return;
    }
    
    if (!insumoSel.value || insumoSel.disabled || insumoSel.selectedIndex === 0) {
      showNotification('Por favor selecciona un insumo', 'warning');
      if (!insumoSel.disabled) setTimeout(() => insumoSel.focus(), 100);
      return;
    }
    
    if (!proveedorSel.value || proveedorSel.selectedIndex === 0) {
      showNotification('Por favor selecciona un proveedor', 'warning');
      setTimeout(() => proveedorSel.focus(), 100);
      return;
    }

    const cantidad = parseFloat(document.getElementById('cantidad').value);
    const precio = parseFloat(document.getElementById('precio').value);
    
    if (!cantidad || cantidad <= 0) {
      showNotification('Ingresa una cantidad válida', 'warning');
      setTimeout(() => document.getElementById('cantidad').focus(), 100);
      return;
    }
    
    if (!precio || precio <= 0) {
      showNotification('Ingresa un precio válido', 'warning');
      setTimeout(() => document.getElementById('precio').focus(), 100);
      return;
    }
    
    calcularImporte();
    
    const data = {
      obra_id:     parseInt(obraSel.value, 10),
      insumo_id:   parseInt(insumoSel.value, 10),
      nombre:      document.getElementById('nombre').value.trim(),
      fecha:       document.getElementById('fecha').value,
      pedido:      document.getElementById('pedido').value.trim(),
      cantidad:    cantidad,
      precio:      precio,
      importe:     parseFloat(document.getElementById('importe').value) || 0,
      proveedor_id: parseInt(proveedorSel.value, 10)
    };
    
    const btnGuardarOriginal = btnGuardar.textContent;
    btnGuardar.textContent = 'Guardando...';
    btnGuardar.disabled = true;
    
    compraCtrl.guardar(data, err => {
      btnGuardar.textContent = btnGuardarOriginal;
      btnGuardar.disabled = false;
      
      if (err) {
        console.error('Error al guardar:', err);
        showNotification('Error al guardar: ' + err.message, 'error');
      } else {
        showNotification('Compra guardada exitosamente', 'success');
        limpiar();
        cargarCompras();
      }
      
      // IMPORTANTE: Restaurar focus después de guardar
      setTimeout(() => {
        restoreInputFocus();
      }, 100);
    });
  }

  function limpiar() {
    ['nombre','fecha','pedido','cantidad','precio','importe']
      .forEach(id => {
        const element = document.getElementById(id);
        if (element) element.value = '';
      });
    
    if (obraSel) obraSel.selectedIndex = 0;
    if (categoriaSel) categoriaSel.selectedIndex = 0;
    if (proveedorSel) proveedorSel.selectedIndex = 0;
    
    if (insumoSel) {
      insumoSel.innerHTML = '<option disabled selected>Primero selecciona una categoría…</option>';
      insumoSel.disabled = true;
    }
    
    const fechaInput = document.getElementById('fecha');
    if (fechaInput) {
      const hoy = new Date().toISOString().split('T')[0];
      fechaInput.value = hoy;
    }
    
    // Restaurar focus después de limpiar
    setTimeout(() => {
      restoreInputFocus();
    }, 50);
  }

  // Inicializar fecha
  const fechaInput = document.getElementById('fecha');
  if (fechaInput) {
    const hoy = new Date().toISOString().split('T')[0];
    fechaInput.value = hoy;
  }

  // Estilos
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slide-in {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    .animate-slide-in {
      animation: slide-in 0.3s ease-out;
    }
  `;
  document.head.appendChild(style);

  // Llamar restore focus al inicializar
  setTimeout(() => {
    restoreInputFocus();
  }, 500);
};