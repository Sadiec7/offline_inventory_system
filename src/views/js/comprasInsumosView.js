// comprasInsumosView.js
// nodeIntegration=true en BrowserWindow para usar require en renderer
// Se expone una función global initComprasInsumosView para que layoutView.js la invoque
window.initComprasInsumosView = function() {
  // Elementos del DOM
  const obraSel      = document.getElementById('obra_id');
  const insumoSel    = document.getElementById('insumo_id');
  const listaEl      = document.getElementById('listaCompras');
  const btnNuevo     = document.getElementById('nuevo');
  const btnGuardar   = document.getElementById('guardar');
  const inputNombre   = document.getElementById('nombre');
  const inputFecha    = document.getElementById('fecha');
  const inputPedido   = document.getElementById('pedido');
  const inputCantidad = document.getElementById('cantidad');
  const inputPrecio   = document.getElementById('precio');
  const inputImporte  = document.getElementById('importe');
  const inputProveedor= document.getElementById('proveedor');

  // Controladores
  const compraCtrl = require('../controllers/compraController');
  const obraCtrl   = require('../controllers/obraController');
  const insumoCtrl = require('../controllers/insumoController');

  // Asocia eventos
  btnNuevo.addEventListener('click', limpiar);
  btnGuardar.addEventListener('click', guardar);

  // Inicializa datos
  cargarObras();
  cargarInsumos();
  cargarCompras();

  function cargarObras() {
    obraCtrl.listar((err, filas) => {
      let error, data;
      if (Array.isArray(filas)) {
        error = err;
        data  = filas;
      } else if (err && Array.isArray(err.obras)) {
        error = err.err;
        data  = err.obras;
      } else {
        error = err;
        data  = filas || [];
      }
      if (error) {
        obraSel.innerHTML = `<option disabled>Error al cargar obras</option>`;
        return;
      }
      if (data.length === 0) {
        obraSel.innerHTML = `<option disabled selected>No hay obras disponibles</option>`;
      } else {
        obraSel.innerHTML = data
          .map(o => `<option value="${o.id}">${o.nombre}</option>`) 
          .join('');
      }
    });
  }

  function cargarInsumos() {
    insumoCtrl.listar((err, filas) => {
      let error, data;
      if (Array.isArray(filas)) {
        error = err;
        data  = filas;
      } else if (err && Array.isArray(err.insumos)) {
        error = err.err;
        data  = err.insumos;
      } else {
        error = err;
        data  = filas || [];
      }
      if (error) {
        insumoSel.innerHTML = `<option disabled>Error al cargar insumos</option>`;
        return;
      }
      if (data.length === 0) {
        insumoSel.innerHTML = `<option disabled selected>No hay insumos disponibles</option>`;
      } else {
        insumoSel.innerHTML = data
          .map(i => `<option value="${i.id}">${i.nombre}</option>`) 
          .join('');
      }
    });
  }

function cargarCompras() {
  compraCtrl.listar((err, filas) => {
    let error, data;
    if (Array.isArray(filas)) {
      error = err;
      data  = filas;
    } else if (err && Array.isArray(err.compras)) {
      error = err.err;
      data  = err.compras;
    } else {
      error = err;
      data  = filas || [];
    }

    if (error) {
      listaEl.innerHTML = `<li class="text-red-500 p-4">Error al cargar compras</li>`;
      return;
    }
    if (data.length === 0) {
      listaEl.innerHTML = `<li class="p-4">No hay compras registradas</li>`;
      return;
    }

    // Generar tarjetas con “Ver” y “Editar”
    listaEl.innerHTML = data.map(c => `
      <li class="bg-white rounded-lg shadow p-4 mb-4 flex justify-between items-start hover:shadow-md transition">
        <div class="flex-1 cursor-pointer"
             onclick="location.href='detalleCompra.html?id=${c.id}'">
          <div class="font-semibold text-gray-800 mb-1">${c.fecha}</div>
          <div class="text-sm text-gray-600 mb-1">
            Obra: <span class="font-medium">${c.obra_id}</span> •
            Insumo: <span class="font-medium">${c.insumo_id}</span>
          </div>
          <div class="text-sm text-gray-600 mb-1">
            ${c.cantidad}×${c.precio} = <span class="font-medium">${c.importe}</span>
          </div>
          <div class="text-sm text-gray-600">Proveedor: ${c.proveedor}</div>
        </div>
        <div class="flex flex-col ml-4 space-y-2">
          <a href="editarCompra.html?id=${c.id}"
             class="text-green-600 hover:text-green-800">
            Editar
          </a>
          <button class="text-red-500 hover:text-red-700" data-id="${c.id}" title="Eliminar">
            Eliminar
          </button>
        </div>
      </li>
    `).join('');

    // Asignar evento eliminar
    listaEl.querySelectorAll('button[data-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id, 10);
        compraCtrl.eliminar(id, err => {
          if (err) console.error('Error al eliminar compra:', err);
          cargarCompras();
        });
      });
    });
  });
}

  function guardar() {
    const data = {
      obra_id:   parseInt(obraSel.value,   10),
      insumo_id: parseInt(insumoSel.value, 10),
      nombre:    inputNombre.value.trim(),
      fecha:     inputFecha.value,
      pedido:    inputPedido.value.trim(),
      cantidad:  parseFloat(inputCantidad.value) || 0,
      precio:    parseFloat(inputPrecio.value)   || 0,
      importe:   parseFloat(inputImporte.value)  || 0,
      proveedor: inputProveedor.value.trim()
    };
    compraCtrl.guardar(data, err => {
      if (err) {
        console.error('Error al guardar compra:', err);
        return;
      }
      limpiar();
      cargarCompras();
    });
  }

  function limpiar() {
    inputNombre.value = '';
    inputFecha.value = '';
    inputPedido.value = '';
    inputCantidad.value = '';
    inputPrecio.value = '';
    inputImporte.value = '';
    inputProveedor.value = '';
  }
};