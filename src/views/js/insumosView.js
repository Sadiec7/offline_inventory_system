(() => {
  'use strict';
  console.log('[insumosView.js] cargado correctamente');

  const path = require('path');
  const insumoController = require(path.join(__dirname, '..', 'controllers', 'insumoController.js'));
  // Usar un alias específico para evitar colisión con categoriaInsumoView.js
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

  // Cargar categorías primero
  function cargarCategorias() {
    console.log('[insumosView.js] cargando categorías...');
    categoriaInsumoController.listar((err, rows) => {
      if (err) {
        console.error('Error cargando categorías:', err);
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
      };

      // Evento para eliminar
      const btnEliminar = li.querySelector('button[data-id]');
      btnEliminar.onclick = e => {
        e.stopPropagation();
        const insumoId = parseInt(btnEliminar.dataset.id);
        
        if (confirm('¿Eliminar este insumo? Esta acción no se puede deshacer.')) {
          insumoController.eliminar(insumoId, (err) => {
            if (err) {
              console.error('Error al eliminar:', err);
              alert('Error al eliminar el insumo: ' + (err.message || err));
            } else {
              cargarLista();
              limpiarFormulario();
            }
          });
        }
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
  }

  function guardar() {
    const nombre = document.getElementById('nombre').value.trim();
    const unidad = document.getElementById('unidad').value.trim();
    const categoria_id = selectCategoria ? (selectCategoria.value || null) : null;

    if (!nombre) {
      alert('Por favor ingresa el nombre del insumo');
      return;
    }

    if (!unidad) {
      alert('Por favor ingresa la unidad del insumo');
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
        alert('Error al guardar el insumo: ' + (err.message || err));
      } else {
        console.log('Insumo guardado correctamente');
        limpiarFormulario();
        cargarLista();
      }
    });
  }

  // Configurar eventos
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

  // Cargar datos iniciales
  cargarCategorias();
  cargarLista();
 };
})();