// === categoriaInsumoView.js - VERSIÓN CON FIX DE ELECTRON ===
(() => {
  'use strict';
  console.log('[categoriaInsumoView.js] cargado correctamente');

  const path = require('path');
  const categoriaController = require(path.join(__dirname, '..', 'controllers', 'categoriaInsumoController.js'));

window.initCategoriaInsumoView = function() {
  console.log('[initCategoriaInsumoView] Ejecutando vista de categorías...');
  
  let idSel = null;
  let categorias = [];

  // Elementos del DOM
  const listaEl = document.getElementById('listaCategorias');
  const buscarInput = document.getElementById('buscarCategoria');
  const dataList = document.getElementById('categoriasData');
  const btnBuscar = document.getElementById('btnBuscar');
  const btnNuevo = document.getElementById('nuevo');
  const btnGuardar = document.getElementById('guardar');
  const inputNombre = document.getElementById('nombre');

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

  // Función para cargar la lista completa
  function cargarLista() {
    console.log('[categoriaInsumoView.js] ejecutando categoriaController.listar...');
    categoriaController.listar((err, rows) => {
      console.log('[categoriaInsumoView.js] resultado de listar:', { err, rows });

      if (!listaEl) {
        console.warn('[categoriaInsumoView.js] No se encontró #listaCategorias');
        return;
      }

      listaEl.innerHTML = '';

      if (err) {
        listaEl.innerHTML = `<li class="text-red-600 p-4">Error cargando categorías: ${err.message}</li>`;
        console.error('Error al cargar categorías:', err);
        showNotification('Error al cargar categorías: ' + err.message, 'error');
        return;
      }

      if (!rows || rows.length === 0) {
        listaEl.innerHTML = `<li class="italic text-gray-500 p-4">No se han detectado categorías registradas</li>`;
        return;
      }

      categorias = rows;
      renderLista(categorias);

      // Llenar datalist para autocompletado
      if (dataList) {
        dataList.innerHTML = '';
        rows.forEach(cat => {
          const opt = document.createElement('option');
          opt.value = cat.nombre;
          dataList.appendChild(opt);
        });
      }
    });
  }

  // Función para renderizar la lista
  function renderLista(lista) {
    if (!listaEl) return;
    
    listaEl.innerHTML = '';
    
    if (!lista || lista.length === 0) {
      listaEl.innerHTML = `<li class="italic text-gray-500 p-4">No se encontraron resultados</li>`;
      return;
    }

    lista.forEach(cat => {
      const li = document.createElement('li');
      li.className = 'bg-white rounded-lg shadow p-4 mb-4 flex justify-between hover:shadow-md transition cursor-pointer';
      li.innerHTML = `
        <div class="flex-1">
          <div class="font-semibold">${cat.nombre}</div>
          <div class="text-sm text-gray-600">ID: ${cat.id}</div>
        </div>
        <div class="ml-4 flex flex-col space-y-2">
          <button class="text-red-500 hover:text-red-700" data-id="${cat.id}">Eliminar</button>
        </div>
      `;

      // Evento para seleccionar categoría
      li.onclick = (e) => {
        if (e.target.tagName === 'BUTTON') return;
        
        idSel = cat.id;
        if (inputNombre) inputNombre.value = cat.nombre;
        
        // Marcar visualmente el elemento seleccionado
        document.querySelectorAll('#listaCategorias li').forEach(item => {
          item.classList.remove('ring-2', 'ring-blue-500');
        });
        li.classList.add('ring-2', 'ring-blue-500');
        
        // Restaurar focus después de seleccionar
        setTimeout(() => restoreInputFocus(), 50);
      };

      // Evento para eliminar - REEMPLAZO DE confirm()
      const btnEliminar = li.querySelector('button[data-id]');
      btnEliminar.onclick = (e) => {
        e.stopPropagation();
        const catId = parseInt(btnEliminar.dataset.id);
        
        showConfirm(
          '¿Eliminar esta categoría? Si hay insumos que la usan, la operación fallará.',
          () => {
            // Confirmar eliminación
            categoriaController.eliminar(catId, (err) => {
              if (err) {
                console.error('Error al eliminar:', err);
                showNotification('No se pudo eliminar. Verifica que no esté usada por insumos.', 'error');
              } else {
                showNotification('Categoría eliminada exitosamente', 'success');
                cargarLista();
                limpiarFormulario();
              }
            });
          }
        );
      };

      listaEl.appendChild(li);
    });
  }

  // Función para limpiar el formulario
  function limpiarFormulario() {
    idSel = null;
    if (inputNombre) inputNombre.value = '';
    
    // Quitar selección visual
    document.querySelectorAll('#listaCategorias li').forEach(item => {
      item.classList.remove('ring-2', 'ring-blue-500');
    });
    
    // Restaurar focus
    setTimeout(() => restoreInputFocus(), 50);
  }

  // Función para guardar/actualizar categoría
  function guardar() {
    const nombre = (inputNombre?.value || '').trim();
    
    // REEMPLAZO DE alert()
    if (!nombre) {
      showNotification('Por favor ingresa el nombre de la categoría', 'warning');
      setTimeout(() => inputNombre?.focus(), 100);
      return;
    }

    const data = { nombre };

    if (idSel) {
      // Actualizar categoría existente
      categoriaController.actualizar(idSel, data, (err) => {
        if (err) {
          console.error('Error al actualizar:', err);
          showNotification('No se pudo actualizar la categoría: ' + (err.message || err), 'error');
        } else {
          showNotification('Categoría actualizada exitosamente', 'success');
          cargarLista();
          limpiarFormulario();
        }
        
        setTimeout(() => restoreInputFocus(), 100);
      });
    } else {
      // Crear nueva categoría
      categoriaController.crear(data, (err) => {
        if (err) {
          console.error('Error al crear:', err);
          showNotification('No se pudo crear la categoría (¿nombre duplicado?): ' + (err.message || err), 'error');
        } else {
          showNotification('Categoría creada exitosamente', 'success');
          cargarLista();
          limpiarFormulario();
        }
        
        setTimeout(() => restoreInputFocus(), 100);
      });
    }
  }

  // ============================================
  // CONFIGURAR EVENTOS
  // ============================================

  if (btnNuevo) {
    btnNuevo.onclick = limpiarFormulario;
  } else {
    console.warn('[categoriaInsumoView.js] No se encontró el botón "nuevo"');
  }

  if (btnGuardar) {
    btnGuardar.onclick = guardar;
  } else {
    console.warn('[categoriaInsumoView.js] No se encontró el botón "guardar"');
  }

  // Configurar búsqueda
  if (btnBuscar && buscarInput) {
    btnBuscar.onclick = () => {
      const filtro = buscarInput.value.toLowerCase().trim();
      
      if (!filtro) {
        renderLista(categorias);
        return;
      }

      const filtrados = categorias.filter(cat => 
        cat.nombre.toLowerCase().includes(filtro)
      );
      renderLista(filtrados);
    };

    // También buscar al presionar Enter
    buscarInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        btnBuscar.click();
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
  cargarLista();
  
  // Restaurar focus inicial
  setTimeout(() => {
    restoreInputFocus();
  }, 500);
};
})();