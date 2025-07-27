// views/comprasInsumosView.js
window.initComprasInsumosView = function() {

const compraCtrl = require(path.join(__dirname, '..', 'controllers', 'compraController'));
const obraCtrl = require(path.join(__dirname, '..', 'controllers', 'obraController'));
const insumoCtrl = require(path.join(__dirname, '..', 'controllers', 'insumoController'));
const proveedorCtrl = require(path.join(__dirname, '..', 'controllers', 'proveedorController'));

  const obraSel       = document.getElementById('obra_id');
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

  // Eventos básicos
  cerrarDet.onclick   = () => modalDet.classList.add('hidden');
  cerrarEd.onclick    = () => modalEd.classList.add('hidden');
  btnNuevo.onclick    = limpiar;
  btnGuardar.onclick  = guardar;

  // Carga inicial de datos
  cargarObras();
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

  function cargarProveedores() {
    proveedorCtrl.list()
      .then(rows => {
        proveedorSel.innerHTML = rows
          .map(p => `<option value="${p.id}">${p.nombre}</option>`)
          .join('');
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
          <div class="font-semibold">${c.fecha}</div>
          <div class="text-sm">Obra: ${c.obra_id} • Insumo: ${c.insumo_id}</div>
          <div class="text-sm">${c.cantidad}×${c.precio} = ${c.importe}</div>
          <div class="text-sm">Proveedor ID: ${c.proveedor_id}</div>
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

  // Búsqueda interna
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
        modalDet.classList.remove('hidden');
        return;
      }
      Promise.all([
        new Promise((res, rej) => obraCtrl.listar((e, r) => e ? rej(e) : res(r))),
        new Promise((res, rej) => insumoCtrl.listar((e, r) => e ? rej(e) : res(r))),
        proveedorCtrl.list()
      ])
      .then(([obras, insumos, proveedores]) => {
        const o = obras.find(x => x.id === c.obra_id);
        const i = insumos.find(x => x.id === c.insumo_id);
        const p = proveedores.find(x => x.id === c.proveedor_id);
        contenidoDet.innerHTML = `
          <h2 class="text-xl font-bold mb-2">Compra #${c.id}</h2>
          <p><strong>Fecha:</strong> ${c.fecha}</p>
          <p><strong>Obra:</strong> ${o?.nombre || '–'}</p>
          <p><strong>Insumo:</strong> ${i?.nombre || '–'}</p>
          <p><strong>Cantidad:</strong> ${c.cantidad}</p>
          <p><strong>Precio:</strong> ${c.precio}</p>
          <p><strong>Importe:</strong> ${c.importe}</p>
          <p><strong>Proveedor:</strong> ${p?.nombre || '–'}</p>
        `;
        modalDet.classList.remove('hidden');
      })
      .catch(err => {
        console.error(err);
        contenidoDet.innerHTML = '<p class="text-red-500">Error al cargar datos relacionados</p>';
        modalDet.classList.remove('hidden');
      });
    });
  };

  // --- Modal Editar ---
  window.showEditar = function(id) {
    contenidoEd.innerText = 'Cargando formulario…';
    
    Promise.all([
      new Promise((res, rej) => obraCtrl.listar((e, r) => e ? rej(e) : res(r))),
      new Promise((res, rej) => insumoCtrl.listar((e, r) => e ? rej(e) : res(r))),
      proveedorCtrl.list()
    ])
    .then(([obras, insumos, proveedores]) => {
      compraCtrl.listar((errC, filas) => {
        if (errC) {
          contenidoEd.innerHTML = '<p class="text-red-500">Error al cargar compras</p>';
          modalEd.classList.remove('hidden');
          return;
        }
        
        const c = Array.isArray(filas) ? filas.find(x => x.id === id) : null;
        if (!c) {
          contenidoEd.innerHTML = '<p class="text-red-500">Compra no encontrada</p>';
          modalEd.classList.remove('hidden');
          return;
        }
        
        contenidoEd.innerHTML = `
          <h2 class="text-xl font-bold mb-4">Editar Compra #${c.id}</h2>
          <label class="block mb-2">Obra:
            <select id="edit_obra" class="w-full p-2 border rounded mb-4">
              ${obras.map(o => `<option value="${o.id}"${o.id === c.obra_id ? ' selected' : ''}>${o.nombre}</option>`).join('')}
            </select>
          </label>
          <label class="block mb-2">Insumo:
            <select id="edit_insumo" class="w-full p-2 border rounded mb-4">
              ${insumos.map(i => `<option value="${i.id}"${i.id === c.insumo_id ? ' selected' : ''}>${i.nombre}</option>`).join('')}
            </select>
          </label>
          <label class="block mb-2">Nombre:
            <input id="edit_nombre" type="text" value="${c.nombre || ''}" class="w-full p-2 border rounded mb-4"/>
          </label>
          <label class="block mb-2">Fecha:
            <input id="edit_fecha" type="date" value="${c.fecha || ''}" class="w-full p-2 border rounded mb-4"/>
          </label>
          <label class="block mb-2">Pedido:
            <input id="edit_pedido" type="text" value="${c.pedido || ''}" class="w-full p-2 border rounded mb-4"/>
          </label>
          <div class="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label class="block mb-1">Cantidad:</label>
              <input id="edit_cantidad" type="number" step="0.01" value="${c.cantidad || 0}" class="w-full p-2 border rounded"/>
            </div>
            <div>
              <label class="block mb-1">Precio:</label>
              <input id="edit_precio" type="number" step="0.01" value="${c.precio || 0}" class="w-full p-2 border rounded"/>
            </div>
            <div>
              <label class="block mb-1">Importe:</label>
              <input id="edit_importe" type="number" step="0.01" value="${c.importe || 0}" class="w-full p-2 border rounded" readonly />
            </div>
          </div>
          <label class="block mb-4">Proveedor:
            <select id="edit_proveedor" class="w-full p-2 border rounded mb-4">
              ${proveedores.map(p => `<option value="${p.id}"${p.id === c.proveedor_id ? ' selected' : ''}>${p.nombre}</option>`).join('')}
            </select>
          </label>
          <div class="flex justify-end space-x-2">
            <button id="cancelEd" class="bg-gray-400 text-white px-4 py-2 rounded">Cancelar</button>
            <button id="saveEd" class="bg-blue-600 text-white px-4 py-2 rounded">Actualizar</button>
          </div>
        `;
        
        // Función para calcular importe en modal de edición
        function calcularImporteEditar() {
          const cantidad = parseFloat(document.getElementById('edit_cantidad').value) || 0;
          const precio = parseFloat(document.getElementById('edit_precio').value) || 0;
          const importe = cantidad * precio;
          document.getElementById('edit_importe').value = importe.toFixed(2);
        }
        
        // Eventos para cálculo automático en edición
        document.getElementById('edit_cantidad').addEventListener('input', calcularImporteEditar);
        document.getElementById('edit_precio').addEventListener('input', calcularImporteEditar);
        
        // Calcular inicialmente
        calcularImporteEditar();
        
        // Eventos de botones
        document.getElementById('cancelEd').onclick = () => {
          modalEd.classList.add('hidden');
        };
        
        document.getElementById('saveEd').onclick = () => {
          const upd = {
            obra_id:     parseInt(document.getElementById('edit_obra').value, 10),
            insumo_id:   parseInt(document.getElementById('edit_insumo').value, 10),
            nombre:      document.getElementById('edit_nombre').value.trim(),
            fecha:       document.getElementById('edit_fecha').value,
            pedido:      document.getElementById('edit_pedido').value.trim(),
            cantidad:    parseFloat(document.getElementById('edit_cantidad').value) || 0,
            precio:      parseFloat(document.getElementById('edit_precio').value) || 0,
            importe:     parseFloat(document.getElementById('edit_importe').value) || 0,
            proveedor_id: parseInt(document.getElementById('edit_proveedor').value, 10)
          };
          
          compraCtrl.editar(c.id, upd, (err, result) => {
            if (err) {
              console.error('Error al actualizar:', err);
              alert('Error al actualizar la compra: ' + err.message);
            } else {
              modalEd.classList.add('hidden');
              cargarCompras();
            }
          });
        };

        modalEd.classList.remove('hidden');
      });
    })
    .catch(err => {
      contenidoEd.innerHTML = '<p class="text-red-500">Error al cargar datos para editar</p>';
      modalEd.classList.remove('hidden');
    });
  };

  // Funciones guardar y limpiar
  function guardar() {
    // Calcular importe antes de guardar
    calcularImporte();
    
    const data = {
      obra_id:     +obraSel.value,
      insumo_id:   +insumoSel.value,
      nombre:      document.getElementById('nombre').value.trim(),
      fecha:       document.getElementById('fecha').value,
      pedido:      document.getElementById('pedido').value.trim(),
      cantidad:    +document.getElementById('cantidad').value || 0,
      precio:      +document.getElementById('precio').value || 0,
      importe:     +document.getElementById('importe').value || 0,
      proveedor_id:+proveedorSel.value
    };
    compraCtrl.guardar(data, err => {
      if (err) {
        console.error('Error al guardar compra:', err);
      } else {
        limpiar();
        cargarCompras();
      }
    });
  }

  function limpiar() {
    ['nombre','fecha','pedido','cantidad','precio','importe']
      .forEach(id => document.getElementById(id).value = '');
  }
};