// === categoriaInsumoView.js ===
(() => {
  'use strict';
  console.log('[categoriaInsumoView.js] cargado correctamente');

  const path = require('path');
  // Usar un alias específico para evitar colisión con insumosView.js
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

  // Función para renderizar la lista (usado también para filtros)
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
        // Evitar que se ejecute si se hace clic en el botón eliminar
        if (e.target.tagName === 'BUTTON') return;
        
        idSel = cat.id;
        if (inputNombre) inputNombre.value = cat.nombre;
        
        // Marcar visualmente el elemento seleccionado
        document.querySelectorAll('#listaCategorias li').forEach(item => {
          item.classList.remove('ring-2', 'ring-blue-500');
        });
        li.classList.add('ring-2', 'ring-blue-500');
      };

      // Evento para eliminar
      const btnEliminar = li.querySelector('button[data-id]');
      btnEliminar.onclick = (e) => {
        e.stopPropagation();
        const catId = parseInt(btnEliminar.dataset.id);
        
        if (confirm('¿Eliminar esta categoría? Si hay insumos que la usan, la operación fallará.')) {
          categoriaController.eliminar(catId, (err) => {
            if (err) {
              console.error('Error al eliminar:', err);
              alert('No se pudo eliminar. Verifica que no esté usada por insumos.');
            } else {
              cargarLista();
              limpiarFormulario();
            }
          });
        }
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
  }

  // Función para guardar/actualizar categoría
  function guardar() {
    const nombre = (inputNombre?.value || '').trim();
    
    if (!nombre) {
      alert('Por favor ingresa el nombre de la categoría');
      return;
    }

    const data = { nombre };

    if (idSel) {
      // Actualizar categoría existente
      categoriaController.actualizar(idSel, data, (err) => {
        if (err) {
          console.error('Error al actualizar:', err);
          alert('No se pudo actualizar la categoría: ' + (err.message || err));
        } else {
          cargarLista();
          limpiarFormulario();
        }
      });
    } else {
      // Crear nueva categoría
      categoriaController.crear(data, (err) => {
        if (err) {
          console.error('Error al crear:', err);
          alert('No se pudo crear la categoría (¿nombre duplicado?): ' + (err.message || err));
        } else {
          cargarLista();
          limpiarFormulario();
        }
      });
    }
  }

  // Configurar eventos de botones
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

    // También buscar al presionar Enter en el campo de búsqueda
    buscarInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        btnBuscar.click();
      }
    });
  }

  // Cargar datos iniciales
  cargarLista();
};
})();