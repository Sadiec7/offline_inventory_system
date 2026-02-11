(() => {
  'use strict';
  console.log('[insumosView.js] cargado correctamente');

  const path = require('path');
  const insumoController = require(path.join(__dirname, '..', 'controllers', 'insumoController.js'));
  const categoriaInsumoController = require(path.join(__dirname, '..', 'controllers', 'categoriaInsumoController.js'));

window.initInsumosView = function () {
  console.log('[initInsumosView] Ejecutando vista de insumos...');
  let idSel = null;
  let insumos = [];
  let categorias = [];

  // Elementos del DOM
  const ul = document.getElementById('listaInsumos');
  const btnGuardar = document.getElementById('guardar');
  const btnNuevo = document.getElementById('nuevo');
  const btnBuscar = document.getElementById("btnBuscar");
  const inputBuscar = document.getElementById("buscarInsumo");
  const selectCategoria = document.getElementById('categoria_id');

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

  // Cargar categorías primero
  function cargarCategorias() {
    console.log('[insumosView.js] cargando categorías...');
    categoriaInsumoController.listar((err, rows) => {
      if (err) {
        console.error('Error cargando categorías:', err);
        showNotification('Error al cargar categorías: ' + err.message, 'error');
        return;
      }
      
      categorias = rows || [];
      
      if (selectCategoria) {
        selectCategoria.innerHTML = '<option value="">Seleccionar categoría...</option>';
        categorias.forEach(cat => {
          const option = document.createElement('option');
          option.value = cat.id;
          option.textContent = cat.nombre;
          selectCategoria.appendChild(option);
        });
      }
    });
  }

  function cargarLista() {
    console.log('[insumosView.js] ejecutando insumoController.listar...');
    insumoController.listar((err, rows) => {
      console.log('[insumosView.js] resultado de listar:', { err, rows });

      if (!ul) {
        console.warn('[insumosView.js] No se encontró #listaInsumos');
        return;
      }

      ul.innerHTML = '';

      if (err) {
        ul.innerHTML = `<li class="text-red-600 p-4">Error cargando insumos: ${err.message}</li>`;
        showNotification('Error al cargar insumos: ' + err.message, 'error');
        return;
      }

      if (!rows || rows.length === 0) {
        ul.innerHTML = `<li class="italic text-gray-500 p-4">No se han detectado insumos registrados</li>`;
        return;
      }

      insumos = rows;
      renderLista(insumos);

      // Llenar datalist
      const datalist = document.getElementById("insumosData");
      if (datalist) {
        datalist.innerHTML = "";
        rows.forEach(i => {
          const opt = document.createElement("option");
          opt.value = i.nombre;
          datalist.appendChild(opt);
        });
      }
    });
  }

  function renderLista(lista) {
    if (!ul) return;
    
    ul.innerHTML = '';
    
    if (!lista || lista.length === 0) {
      ul.innerHTML = `<li class="italic text-gray-500 p-4">No se encontraron resultados</li>`;
      return;
    }

    lista.forEach(i => {
      // Buscar el nombre de la categoría
      const categoria = categorias.find(cat => cat.id === i.categoria_id);
      const categoriaNombre = categoria ? categoria.nombre : 'Sin categoría';

      const li = document.createElement('li');
      li.className = 'bg-white rounded-lg shadow p-4 mb-4 flex justify-between hover:shadow-md transition cursor-pointer';
      li.innerHTML = `
        <div class="flex-1">
          <div class="font-semibold">${i.nombre}</div>
          <div class="text-sm text-gray-600">Unidad: ${i.unidad}</div>
          <div class="text-sm text-gray-600">Categoría: ${categoriaNombre}</div>
          <div class="text-xs text-gray-400">ID: ${i.id}</div>
        </div>
        <div class="ml-4 flex flex-col space-y-2">
          <button class="text-red-500 hover:text-red-700" data-id="${i.id}">Eliminar</button>
        </div>
      `;

      // Evento para seleccionar insumo
      li.onclick = (e) => {
        if (e.target.tagName === 'BUTTON') return;
        
        idSel = i.id;
        document.getElementById('nombre').value = i.nombre || '';
        document.getElementById('unidad').value = i.unidad || '';
        if (selectCategoria) {
          selectCategoria.value = i.categoria_id || '';
        }
        
        // Marcar visualmente el elemento seleccionado
        document.querySelectorAll('#listaInsumos li').forEach(item => {
          item.classList.remove('ring-2', 'ring-blue-500');
        });
        li.classList.add('ring-2', 'ring-blue-500');
        
        // Restaurar focus después de seleccionar
        setTimeout(() => restoreInputFocus(), 50);
      };

      // Evento para eliminar - REEMPLAZO DE confirm()
      const btnEliminar = li.querySelector('button[data-id]');
      btnEliminar.onclick = e => {
        e.stopPropagation();
        const insumoId = parseInt(btnEliminar.dataset.id);
        
        showConfirm(
          '¿Eliminar este insumo? Esta acción no se puede deshacer.',
          () => {
            // Confirmar eliminación
            insumoController.eliminar(insumoId, (err) => {
              if (err) {
                console.error('Error al eliminar:', err);
                showNotification('Error al eliminar el insumo: ' + (err.message || err), 'error');
              } else {
                showNotification('Insumo eliminado exitosamente', 'success');
                cargarLista();
                limpiarFormulario();
              }
            });
          }
        );
      };

      ul.appendChild(li);
    });
  }

  function limpiarFormulario() {
    idSel = null;
    ['nombre', 'unidad'].forEach(k => {
      const el = document.getElementById(k);
      if (el) el.value = '';
    });
    if (selectCategoria) {
      selectCategoria.value = '';
    }
    
    // Quitar selección visual
    document.querySelectorAll('#listaInsumos li').forEach(item => {
      item.classList.remove('ring-2', 'ring-blue-500');
    });
    
    // Restaurar focus
    setTimeout(() => restoreInputFocus(), 50);
  }

  function guardar() {
    const nombre = document.getElementById('nombre').value.trim();
    const unidad = document.getElementById('unidad').value.trim();
    const categoria_id = selectCategoria ? (selectCategoria.value || null) : null;

    // REEMPLAZO DE alert() - Validaciones
    if (!nombre) {
      showNotification('Por favor ingresa el nombre del insumo', 'warning');
      setTimeout(() => document.getElementById('nombre')?.focus(), 100);
      return;
    }

    if (!unidad) {
      showNotification('Por favor ingresa la unidad del insumo', 'warning');
      setTimeout(() => document.getElementById('unidad')?.focus(), 100);
      return;
    }

    const data = {
      id: idSel,
      nombre: nombre,
      unidad: unidad,
      categoria_id: categoria_id ? parseInt(categoria_id) : null
    };

    console.log('Guardando insumo:', data);

    insumoController.guardar(data, (err) => {
      if (err) {
        console.error('Error al guardar:', err);
        showNotification('Error al guardar el insumo: ' + (err.message || err), 'error');
      } else {
        console.log('Insumo guardado correctamente');
        showNotification(
          idSel ? 'Insumo actualizado exitosamente' : 'Insumo creado exitosamente',
          'success'
        );
        limpiarFormulario();
        cargarLista();
      }
      
      // Restaurar focus después de guardar
      setTimeout(() => restoreInputFocus(), 100);
    });
  }

  // ============================================
  // CONFIGURAR EVENTOS
  // ============================================

  if (btnBuscar && inputBuscar) {
    btnBuscar.onclick = () => {
      const filtro = inputBuscar.value.toLowerCase().trim();
      
      if (!filtro) {
        renderLista(insumos);
        return;
      }

      const filtrados = insumos.filter(i => 
        i.nombre.toLowerCase().includes(filtro) ||
        i.unidad.toLowerCase().includes(filtro)
      );
      renderLista(filtrados);
    };

    // Buscar al presionar Enter
    inputBuscar.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        btnBuscar.click();
      }
    });
  }

  if (btnGuardar) {
    btnGuardar.onclick = guardar;
  } else {
    console.warn('[insumosView.js] No se encontró el botón "guardar"');
  }

  if (btnNuevo) {
    btnNuevo.onclick = limpiarFormulario;
  } else {
    console.warn('[insumosView.js] No se encontró el botón "nuevo"');
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
  cargarCategorias();
  cargarLista();
  
  // Restaurar focus inicial
  setTimeout(() => {
    restoreInputFocus();
  }, 500);
 };
})();