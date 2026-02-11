const provCtrl = require(path.join(__dirname, '..', 'controllers', 'proveedorController'));

window.initProveedoresView = async function() {
  const tblBody     = document.getElementById('tblProveedores');
  const modal       = document.getElementById('modalForm');
  const form        = document.getElementById('proveedorForm');
  const formTitle   = document.getElementById('formTitle');
  const btnNuevo    = document.getElementById('btnNuevo');
  const btnCancelar = document.getElementById('btnCancelar');
  const inpId       = document.getElementById('proveedorId');
  const inpNombre   = document.getElementById('nombre');
  const inpRfc      = document.getElementById('rfc');
  const inpDir      = document.getElementById('direccion');
  const inpTel      = document.getElementById('telefono');
  const inputBuscar = document.getElementById('buscarProveedor');
  const btnBuscar   = document.getElementById('btnBuscar');

  let proveedoresGlobal = []; // Para filtrar localmente

  // ============================================
  // FIX PARA ELECTRON - RESTAURAR FOCUS
  // ============================================
  function restoreInputFocus() {
    const allInputs = document.querySelectorAll('input, select, textarea, button');
    allInputs.forEach(input => {
      const currentTabIndex = input.tabIndex;
      input.tabIndex = -1;
      setTimeout(() => {
        input.tabIndex = currentTabIndex >= 0 ? currentTabIndex : 0;
        input.blur();
        input.style.pointerEvents = 'none';
        setTimeout(() => {
          input.style.pointerEvents = 'auto';
        }, 0);
      }, 0);
    });
    
    document.body.style.transform = 'translateZ(0)';
    setTimeout(() => {
      document.body.style.transform = '';
    }, 10);
  }

  // ============================================
  // SISTEMA DE NOTIFICACIONES
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
  // CONFIRMACIÓN INLINE
  // ============================================
  function showConfirm(message, onConfirm, onCancel) {
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

    const btnCancelConfirm = confirmBox.querySelector('#confirmCancel');
    const btnOk = confirmBox.querySelector('#confirmOk');

    btnCancelConfirm.onclick = (e) => {
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

  // ============================================
  // FUNCIONES PRINCIPALES
  // ============================================

  // Función para mostrar el modal
  function showModal(isEdit = false, data = {}) {
    form.reset();
    if (isEdit) {
      formTitle.textContent = 'Editar Proveedor';
      inpId.value     = data.id;
      inpNombre.value = data.nombre;
      inpRfc.value    = data.rfc;
      inpDir.value    = data.direccion || '';
      inpTel.value    = data.telefono || '';
    } else {
      formTitle.textContent = 'Nuevo Proveedor';
      inpId.value = '';
    }
    modal.classList.remove('hidden');
    
    // Restaurar focus al abrir modal
    setTimeout(() => {
      restoreInputFocus();
      inpNombre.focus();
    }, 100);
  }

  // Ocultar modal
  btnCancelar.addEventListener('click', () => {
    modal.classList.add('hidden');
    restoreInputFocus();
  });

  // Nuevo proveedor
  btnNuevo.addEventListener('click', () => {
    showModal(false);
  });

  // Guardar (alta o edición) - REEMPLAZO DE Swal.fire
  form.addEventListener('submit', async e => {
    e.preventDefault();
    
    const payload = {
      nombre:    inpNombre.value.trim(),
      rfc:       inpRfc.value.trim(),
      direccion: inpDir.value.trim(),
      telefono:  inpTel.value.trim()
    };

    // Validaciones
    if (!payload.nombre) {
      showNotification('Por favor ingresa el nombre del proveedor', 'warning');
      setTimeout(() => inpNombre.focus(), 100);
      return;
    }

    if (!payload.rfc) {
      showNotification('Por favor ingresa el RFC del proveedor', 'warning');
      setTimeout(() => inpRfc.focus(), 100);
      return;
    }

    try {
      if (inpId.value) {
        // edición
        await provCtrl.update(+inpId.value, payload);
        showNotification('Proveedor actualizado exitosamente', 'success');
      } else {
        // alta
        await provCtrl.add(payload);
        showNotification('Proveedor creado exitosamente', 'success');
      }
      modal.classList.add('hidden');
      await refreshTable();
      
      setTimeout(() => restoreInputFocus(), 100);
    } catch (err) {
      console.error('Error al guardar proveedor:', err);
      showNotification('Error: ' + err.message, 'error');
    }
  });

  // Función para renderizar la tabla (usado también para búsqueda)
  function renderTable(lista) {
    tblBody.innerHTML = '';
    
    if (!lista || lista.length === 0) {
      tblBody.innerHTML = `
        <tr>
          <td colspan="5" class="px-6 py-8 text-center text-gray-500">
            No se encontraron proveedores
          </td>
        </tr>
      `;
      return;
    }

    lista.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap" data-label="Nombre:">
          <div class="truncate-text" title="${p.nombre}">${p.nombre}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap" data-label="RFC:">
          <div class="truncate-text" title="${p.rfc}">${p.rfc}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap" data-label="Dirección:">
          <div class="truncate-text" title="${p.direccion || ''}">${p.direccion || ''}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap" data-label="Teléfono:">
          <div class="truncate-text" title="${p.telefono || ''}">${p.telefono || ''}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-center" data-label="Acciones:">
          <button data-id="${p.id}" class="edit text-blue-600 hover:underline mr-2">Editar</button>
          <button data-id="${p.id}" class="del text-red-600 hover:underline">Eliminar</button>
        </td>`;
      tblBody.appendChild(tr);
    });

    // Eventos Editar
    tblBody.querySelectorAll('.edit').forEach(btn =>
      btn.addEventListener('click', async e => {
        const id = +e.target.dataset.id;
        try {
          const data = await provCtrl.get(id);
          showModal(true, data);
        } catch (err) {
          console.error('Error al cargar proveedor:', err);
          showNotification('Error al cargar proveedor: ' + err.message, 'error');
        }
      })
    );

    // Eventos Eliminar - REEMPLAZO DE confirm()
    tblBody.querySelectorAll('.del').forEach(btn =>
      btn.addEventListener('click', async e => {
        const id = +e.target.dataset.id;
        const proveedor = lista.find(p => p.id === id);
        const nombreProveedor = proveedor ? proveedor.nombre : 'este proveedor';
        
        showConfirm(
          `¿Eliminar a ${nombreProveedor}? Esta acción no se puede deshacer.`,
          async () => {
            try {
              await provCtrl.remove(id);
              showNotification('Proveedor eliminado exitosamente', 'success');
              await refreshTable();
            } catch (err) {
              console.error('Error al eliminar:', err);
              showNotification('Error al eliminar: ' + err.message, 'error');
            }
          }
        );
      })
    );
  }

  // Refrescar la tabla (cargar todos los proveedores)
  async function refreshTable() {
    try {
      const list = await provCtrl.list();
      proveedoresGlobal = list; // Guardar para búsqueda
      renderTable(list);
      
      // Limpiar búsqueda al refrescar
      if (inputBuscar) {
        inputBuscar.value = '';
      }
    } catch (err) {
      console.error('Error al cargar proveedores:', err);
      showNotification('Error al cargar proveedores: ' + err.message, 'error');
      tblBody.innerHTML = `
        <tr>
          <td colspan="5" class="px-6 py-8 text-center text-red-500">
            Error al cargar proveedores
          </td>
        </tr>
      `;
    }
  }

  // ============================================
  // BÚSQUEDA
  // ============================================
  if (btnBuscar && inputBuscar) {
    btnBuscar.addEventListener('click', () => {
      const filtro = inputBuscar.value.toLowerCase().trim();
      
      if (!filtro) {
        renderTable(proveedoresGlobal);
        return;
      }

      const filtrados = proveedoresGlobal.filter(p => 
        p.nombre.toLowerCase().includes(filtro) ||
        p.rfc.toLowerCase().includes(filtro) ||
        (p.direccion && p.direccion.toLowerCase().includes(filtro)) ||
        (p.telefono && p.telefono.toLowerCase().includes(filtro))
      );
      
      renderTable(filtrados);
      
      if (filtrados.length === 0) {
        showNotification(`No se encontraron resultados para "${filtro}"`, 'info');
      }
    });

    // Buscar al presionar Enter
    inputBuscar.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        btnBuscar.click();
      }
    });

    // Restaurar lista completa cuando se borra el texto
    inputBuscar.addEventListener('input', (e) => {
      if (e.target.value.trim() === '') {
        renderTable(proveedoresGlobal);
      }
    });
  }

  // ============================================
  // ESTILOS DE ANIMACIÓN
  // ============================================
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

  // ============================================
  // INICIALIZACIÓN
  // ============================================
  await refreshTable();
  
  // Restaurar focus inicial
  setTimeout(() => {
    restoreInputFocus();
  }, 500);
};