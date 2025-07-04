// Vista MVC en Electron sin preload
// Exponer initComprasInsumosView para layoutView.js
window.initComprasInsumosView = function() {
  const compraCtrl = require('../controllers/compraController');
  const obraCtrl   = require('../controllers/obraController');
  const insumoCtrl = require('../controllers/insumoController');

  const obraSel       = document.getElementById('obra_id');
  const insumoSel     = document.getElementById('insumo_id');
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

  cerrarDet.onclick   = () => modalDet.classList.add('hidden');
  cerrarEd.onclick    = () => modalEd.classList.add('hidden');
  btnNuevo.onclick    = limpiar;
  btnGuardar.onclick  = guardar;

  cargarObras();
  cargarInsumos();
  cargarCompras();

  function cargarObras() {
    obraCtrl.listar((err, filas) => {
      obraSel.innerHTML = (Array.isArray(filas) && filas.length)
        ? filas.map(o => `<option value="${o.id}">${o.nombre}</option>`).join('')
        : `<option disabled>No hay obras</option>`;
    });
  }

  function cargarInsumos() {
    insumoCtrl.listar((err, filas) => {
      insumoSel.innerHTML = (Array.isArray(filas) && filas.length)
        ? filas.map(i => `<option value="${i.id}">${i.nombre}</option>`).join('')
        : `<option disabled>No hay insumos</option>`;
    });
  }

  function cargarCompras() {
    compraCtrl.listar((err, filas) => {
      if (err) {
        listaEl.innerHTML = `<li class="p-4 text-red-500">Error al cargar</li>`;
        return;
      }
      const data = Array.isArray(filas) ? filas : [];
      comprasGlobal = data;
      renderCompras(data);

      if (datalist) {
        datalist.innerHTML = data.map(c => `<option value="${c.nombre}">`).join('');
      }
    });
  }

  function renderCompras(data) {
    if (!data.length) {
      listaEl.innerHTML = `<li class="p-4">No hay compras</li>`;
      return;
    }

    listaEl.innerHTML = data.map(c => `
      <li class="bg-white rounded-lg shadow p-4 mb-4 flex justify-between hover:shadow-md transition">
        <div class="flex-1 cursor-pointer" onclick="showDetalle(${c.id})">
          <div class="font-semibold">${c.fecha}</div>
          <div class="text-sm">Obra: ${c.obra_id} • Insumo: ${c.insumo_id}</div>
          <div class="text-sm">${c.cantidad}×${c.precio} = ${c.importe}</div>
          <div class="text-sm">Proveedor: ${c.proveedor}</div>
        </div>
        <div class="ml-4 flex flex-col space-y-2">
          <button class="text-green-600 hover:text-green-800" onclick="showEditar(${c.id})">Editar</button>
          <button class="text-red-500 hover:text-red-700" data-id="${c.id}">Eliminar</button>
        </div>
      </li>
    `).join('');

    listaEl.querySelectorAll('button[data-id]').forEach(b => {
      b.onclick = () => compraCtrl.eliminar(Number(b.dataset.id), () => cargarCompras());
    });
  }

  // --- Buscar por nombre interno ---
  if (btnBuscar && inputBuscar) {
    btnBuscar.onclick = () => {
      const filtro = inputBuscar.value.toLowerCase();
      const filtrados = comprasGlobal.filter(c => c.nombre?.toLowerCase().includes(filtro));
      renderCompras(filtrados);
    };
  }

  // --- Modal Detalle ---
  window.showDetalle = function(id) {
    contenidoDet.innerText = 'Cargando detalle…';
    compraCtrl.listar((err, filas) => {
      const c = Array.isArray(filas) ? filas.find(x => x.id === id) : null;
      if (!c) {
        contenidoDet.innerHTML = '<p class="text-red-500">Compra no encontrada</p>';
      } else {
        obraCtrl.listar((_, obras) => {
          insumoCtrl.listar((_, insumos) => {
            const o = obras.find(x => x.id === c.obra_id);
            const i = insumos.find(x => x.id === c.insumo_id);
            contenidoDet.innerHTML = `
              <h2 class="text-xl font-bold mb-2">Compra #${c.id}</h2>
              <p><strong>Fecha:</strong> ${c.fecha}</p>
              <p><strong>Obra:</strong> ${o?.nombre || '–'}</p>
              <p><strong>Insumo:</strong> ${i?.nombre || '–'}</p>
              <p><strong>Cantidad:</strong> ${c.cantidad}</p>
              <p><strong>Precio:</strong> ${c.precio}</p>
              <p><strong>Importe:</strong> ${c.importe}</p>
              <p><strong>Proveedor:</strong> ${c.proveedor}</p>
            `;
          });
        });
      }
      modalDet.classList.remove('hidden');
    });
  };

  // --- Modal Editar ---
  window.showEditar = function(id) {
    contenidoEd.innerText = 'Cargando formulario…';
    obraCtrl.listar((errO, obras) => {
      insumoCtrl.listar((errI, insumos) => {
        compraCtrl.listar((errC, filas) => {
          const c = Array.isArray(filas) ? filas.find(x => x.id === id) : null;
          if (!c) {
            contenidoEd.innerHTML = '<p class="text-red-500">Compra no encontrada</p>';
          } else {
            contenidoEd.innerHTML = `
              <h2 class="text-xl font-bold mb-4">Editar Compra #${c.id}</h2>
              <label class="block mb-2">Obra:
                <select id="edit_obra" class="w-full p-2 border rounded mb-4">
                  ${obras.map(o => `<option value="${o.id}">${o.nombre}</option>`).join('')}
                </select>
              </label>
              <label class="block mb-2">Insumo:
                <select id="edit_insumo" class="w-full p-2 border rounded mb-4">
                  ${insumos.map(i => `<option value="${i.id}">${i.nombre}</option>`).join('')}
                </select>
              </label>
              <label class="block mb-2">Nombre:
                <input id="edit_nombre" type="text" value="${c.nombre}" class="w-full p-2 border rounded mb-4"/>
              </label>
              <label class="block mb-2">Fecha:
                <input id="edit_fecha" type="date" value="${c.fecha}" class="w-full p-2 border rounded mb-4"/>
              </label>
              <label class="block mb-2">Pedido:
                <input id="edit_pedido" type="text" value="${c.pedido}" class="w-full p-2 border rounded mb-4"/>
              </label>
              <div class="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label class="block mb-1">Cantidad:</label>
                  <input id="edit_cantidad" type="number" step="0.01" value="${c.cantidad}" class="w-full p-2 border rounded"/>
                </div>
                <div>
                  <label class="block mb-1">Precio:</label>
                  <input id="edit_precio" type="number" step="0.01" value="${c.precio}" class="w-full p-2 border rounded"/>
                </div>
                <div>
                  <label class="block mb-1">Importe:</label>
                  <input id="edit_importe" type="number" step="0.01" value="${c.importe}" class="w-full p-2 border rounded"/>
                </div>
              </div>
              <label class="block mb-4">Proveedor:
                <input id="edit_proveedor" type="text" value="${c.proveedor}" class="w-full p-2 border rounded"/>
              </label>
              <div class="flex justify-end space-x-2">
                <button id="cancelEd" class="bg-gray-400 text-white px-4 py-2 rounded">Cancelar</button>
                <button id="saveEd"   class="bg-blue-600 text-white px-4 py-2 rounded">Actualizar</button>
              </div>
            `;
            document.getElementById('edit_obra').value   = c.obra_id;
            document.getElementById('edit_insumo').value = c.insumo_id;
            document.getElementById('cancelEd').onclick = () => modalEd.classList.add('hidden');
            document.getElementById('saveEd').onclick   = () => {
              const upd = {
                obra_id:   +document.getElementById('edit_obra').value,
                insumo_id: +document.getElementById('edit_insumo').value,
                nombre:    document.getElementById('edit_nombre').value.trim(),
                fecha:     document.getElementById('edit_fecha').value,
                pedido:    document.getElementById('edit_pedido').value.trim(),
                cantidad:  +document.getElementById('edit_cantidad').value || 0,
                precio:    +document.getElementById('edit_precio').value   || 0,
                importe:   +document.getElementById('edit_importe').value || 0,
                proveedor: document.getElementById('edit_proveedor').value.trim()
              };
              compraCtrl.editar(c.id, upd, err => {
                if (!err) {
                  modalEd.classList.add('hidden');
                  cargarCompras();
                } else {
                  alert('Error al actualizar');
                }
              });
            };
          }
        });
      });
    });
    modalEd.classList.remove('hidden');
  };

  function guardar() {
    const data = {
      obra_id:   +obraSel.value,
      insumo_id: +insumoSel.value,
      nombre:    document.getElementById('nombre').value.trim(),
      fecha:     document.getElementById('fecha').value,
      pedido:    document.getElementById('pedido').value.trim(),
      cantidad:  +document.getElementById('cantidad').value || 0,
      precio:    +document.getElementById('precio').value   || 0,
      importe:   +document.getElementById('importe').value  || 0,
      proveedor: document.getElementById('proveedor').value.trim()
    };
    compraCtrl.guardar(data, err => {
      if (err) {
        console.error('Error al guardar:', err);
      } else {
        limpiar();
        cargarCompras();
      }
    });
  }

  function limpiar() {
    ['nombre','fecha','pedido','cantidad','precio','importe','proveedor']
      .forEach(id => document.getElementById(id).value = '');
  }
};
