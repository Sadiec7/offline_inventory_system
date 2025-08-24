// views/comprasInsumosView.js
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

  // Eventos básicos
  cerrarDet.onclick   = () => modalDet.classList.add('hidden');
  cerrarEd.onclick    = () => modalEd.classList.add('hidden');
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
      b.onclick = () => {
        if (confirm('¿Estás seguro de eliminar esta compra?')) {
          compraCtrl.eliminar(Number(b.dataset.id), (err) => {
            if (err) {
              alert('Error al eliminar: ' + err.message);
            } else {
              cargarCompras();
            }
          });
        }
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
    
    // También buscar al presionar Enter
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
        return;
      }
      
      Promise.all([
        new Promise((res, rej) => obraCtrl.listar((e, r) => e ? rej(e) : res(r))),
        new Promise((res, rej) => insumoCtrl.listar((e, r) => e ? rej(e) : res(r))),
        new Promise((res, rej) => categoriaCtrl.listar((e, r) => e ? rej(e) : res(r))),
        proveedorCtrl.list()
      ])
      .then(([obras, insumos, categorias, proveedores]) => {
        const o = obras.find(x => x.id === c.obra_id);
        const i = insumos.find(x => x.id === c.insumo_id);
        const cat = i ? categorias.find(x => x.id === i.categoria_id) : null;
        const p = proveedores.find(x => x.id === c.proveedor_id);
        
        contenidoDet.innerHTML = `
          <h2 class="text-xl font-bold mb-4 text-gray-800">Detalle de Compra #${c.id}</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="mb-2"><strong>Fecha:</strong> ${c.fecha || 'No especificada'}</p>
              <p class="mb-2"><strong>Nombre:</strong> ${c.nombre || 'Sin nombre'}</p>
              <p class="mb-2"><strong>Pedido:</strong> ${c.pedido || 'N/A'}</p>
              <p class="mb-2"><strong>Obra:</strong> ${o?.nombre || 'No encontrada'}</p>
            </div>
            <div>
              <p class="mb-2"><strong>Categoría:</strong> ${cat?.nombre || 'Sin categoría'}</p>
              <p class="mb-2"><strong>Insumo:</strong> ${i?.nombre || 'No encontrado'} ${i?.unidad ? `(${i.unidad})` : ''}</p>
              <p class="mb-2"><strong>Proveedor:</strong> ${p?.nombre || 'No encontrado'}</p>
            </div>
          </div>
          <div class="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 class="font-semibold mb-2">Detalles Financieros</h3>
            <p><strong>Cantidad:</strong> ${c.cantidad}</p>
            <p><strong>Precio Unitario:</strong> $${c.precio}</p>
            <p class="text-lg"><strong>Importe Total:</strong> <span class="text-green-600">$${c.importe}</span></p>
          </div>
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
      new Promise((res, rej) => categoriaCtrl.listar((e, r) => e ? rej(e) : res(r))),
      proveedorCtrl.list()
    ])
    .then(([obras, insumos, categorias, proveedores]) => {
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
        
        // Obtener la categoría del insumo actual
        const insumoActual = insumos.find(i => i.id === c.insumo_id);
        const categoriaActual = insumoActual?.categoria_id;
        
        contenidoEd.innerHTML = `
          <h2 class="text-xl font-bold mb-4">Editar Compra #${c.id}</h2>
          <div class="space-y-4">
            <label class="block">
              <span class="block mb-1 font-medium">Obra:</span>
              <select id="edit_obra" class="w-full p-2 border rounded">
                ${obras.map(o => `<option value="${o.id}"${o.id === c.obra_id ? ' selected' : ''}>${o.nombre}</option>`).join('')}
              </select>
            </label>
            
            <label class="block">
              <span class="block mb-1 font-medium">Categoría:</span>
              <select id="edit_categoria" class="w-full p-2 border rounded">
                ${categorias.map(cat => `<option value="${cat.id}"${cat.id === categoriaActual ? ' selected' : ''}>${cat.nombre}</option>`).join('')}
              </select>
            </label>
            
            <label class="block">
              <span class="block mb-1 font-medium">Insumo:</span>
              <select id="edit_insumo" class="w-full p-2 border rounded">
                ${insumos.filter(i => i.categoria_id === categoriaActual).map(i => `<option value="${i.id}"${i.id === c.insumo_id ? ' selected' : ''}>${i.nombre} (${i.unidad || 'unidad'})</option>`).join('')}
              </select>
            </label>
            
            <label class="block">
              <span class="block mb-1 font-medium">Nombre:</span>
              <input id="edit_nombre" type="text" value="${c.nombre || ''}" class="w-full p-2 border rounded"/>
            </label>
            
            <label class="block">
              <span class="block mb-1 font-medium">Fecha:</span>
              <input id="edit_fecha" type="date" value="${c.fecha || ''}" class="w-full p-2 border rounded"/>
            </label>
            
            <label class="block">
              <span class="block mb-1 font-medium">Pedido:</span>
              <input id="edit_pedido" type="text" value="${c.pedido || ''}" class="w-full p-2 border rounded"/>
            </label>
            
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block mb-1 font-medium">Cantidad:</label>
                <input id="edit_cantidad" type="number" step="0.01" value="${c.cantidad || 0}" class="w-full p-2 border rounded"/>
              </div>
              <div>
                <label class="block mb-1 font-medium">Precio:</label>
                <input id="edit_precio" type="number" step="0.01" value="${c.precio || 0}" class="w-full p-2 border rounded"/>
              </div>
              <div>
                <label class="block mb-1 font-medium">Importe:</label>
                <input id="edit_importe" type="number" step="0.01" value="${c.importe || 0}" class="w-full p-2 border rounded" readonly />
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
        
        // Evento para filtrar insumos en modal de edición
        document.getElementById('edit_categoria').addEventListener('change', function() {
          const categoriaId = parseInt(this.value);
          const insumosFiltrados = insumos.filter(i => i.categoria_id === categoriaId);
          const editInsumoSel = document.getElementById('edit_insumo');
          
          editInsumoSel.innerHTML = '<option disabled selected>Selecciona un insumo…</option>' +
            insumosFiltrados.map(i => `<option value="${i.id}">${i.nombre} (${i.unidad || 'unidad'})</option>`).join('');
        });
        
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
          // Validaciones antes de guardar
          const obraId = parseInt(document.getElementById('edit_obra').value, 10);
          const insumoId = parseInt(document.getElementById('edit_insumo').value, 10);
          const proveedorId = parseInt(document.getElementById('edit_proveedor').value, 10);
          
          if (!obraId || !insumoId || !proveedorId) {
            alert('Por favor completa todos los campos obligatorios (Obra, Insumo, Proveedor)');
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
      console.error('Error al cargar datos para editar:', err);
      contenidoEd.innerHTML = '<p class="text-red-500">Error al cargar datos para editar</p>';
      modalEd.classList.remove('hidden');
    });
  };

  // Funciones guardar y limpiar
  function guardar() {
    // Verificar que se haya seleccionado una obra
    if (!obraSel.value || obraSel.selectedIndex === 0) {
      alert('Por favor selecciona una obra');
      obraSel.focus();
      return;
    }
    
    // Verificar que se haya seleccionado una categoría
    if (!categoriaSel.value || categoriaSel.selectedIndex === 0) {
      alert('Por favor selecciona una categoría primero');
      categoriaSel.focus();
      return;
    }
    
    // Verificar que se haya seleccionado un insumo
    if (!insumoSel.value || insumoSel.disabled || insumoSel.selectedIndex === 0) {
      alert('Por favor selecciona un insumo');
      if (!insumoSel.disabled) insumoSel.focus();
      return;
    }
    
    // Verificar que se haya seleccionado un proveedor
    if (!proveedorSel.value || proveedorSel.selectedIndex === 0) {
      alert('Por favor selecciona un proveedor');
      proveedorSel.focus();
      return;
    }

    // Verificar campos numéricos
    const cantidad = parseFloat(document.getElementById('cantidad').value);
    const precio = parseFloat(document.getElementById('precio').value);
    
    if (!cantidad || cantidad <= 0) {
      alert('Por favor ingresa una cantidad válida mayor a 0');
      document.getElementById('cantidad').focus();
      return;
    }
    
    if (!precio || precio <= 0) {
      alert('Por favor ingresa un precio válido mayor a 0');
      document.getElementById('precio').focus();
      return;
    }
    
    // Calcular importe antes de guardar
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
    
    // Mostrar loading en el botón
    const btnGuardarOriginal = btnGuardar.textContent;
    btnGuardar.textContent = 'Guardando...';
    btnGuardar.disabled = true;
    
    compraCtrl.guardar(data, err => {
      // Restaurar botón
      btnGuardar.textContent = btnGuardarOriginal;
      btnGuardar.disabled = false;
      
      if (err) {
        console.error('Error al guardar compra:', err);
        alert('Error al guardar: ' + err.message);
      } else {
        alert('Compra guardada exitosamente');
        limpiar();
        cargarCompras();
      }
    });
  }

  function limpiar() {
    // Limpiar campos de texto y números
    ['nombre','fecha','pedido','cantidad','precio','importe']
      .forEach(id => {
        const element = document.getElementById(id);
        if (element) element.value = '';
      });
    
    // Resetear selectores
    if (obraSel) obraSel.selectedIndex = 0;
    if (categoriaSel) categoriaSel.selectedIndex = 0;
    if (proveedorSel) proveedorSel.selectedIndex = 0;
    
    // Resetear insumos
    if (insumoSel) {
      insumoSel.innerHTML = '<option disabled selected>Primero selecciona una categoría…</option>';
      insumoSel.disabled = true;
    }
    
    // Poner fecha actual por defecto
    const fechaInput = document.getElementById('fecha');
    if (fechaInput) {
      const hoy = new Date().toISOString().split('T')[0];
      fechaInput.value = hoy;
    }
  }

  // Inicializar con fecha actual
  const fechaInput = document.getElementById('fecha');
  if (fechaInput) {
    const hoy = new Date().toISOString().split('T')[0];
    fechaInput.value = hoy;
  }
};