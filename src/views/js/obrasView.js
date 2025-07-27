const obraController = require(path.join(__dirname, '..', 'controllers', 'obraController'));

window.initObrasView = function () {
  console.log('[initObrasView] Ejecutando vista de obras...');
  let idSel = null;
  let obrasCache = [];

  const inputBuscar = document.getElementById('buscarObra');
  const btnBuscar = document.getElementById('btnBuscar');
  const dataList = document.getElementById('obrasData');

  // Cargar listado de obras
  function cargarLista() {
    console.log('[obrasView.js] ejecutando obraController.listar...');
    obraController.listar((err, obras) => {
      const ul = document.getElementById('listaObras');
      if (!ul) {
        console.warn('[obrasView.js] No se encontró #listaObras');
        return;
      }

      ul.innerHTML = '';
      obrasCache = obras || [];

      if (err) {
        ul.innerHTML = `<li class="text-red-600">Error cargando obras</li>`;
        return;
      }

      if (!obrasCache.length) {
        ul.innerHTML = `<li class="italic text-gray-500">No se han detectado obras en progreso</li>`;
      } else {
        obrasCache.forEach(o => {
          const li = document.createElement('li');
          li.className = 'cursor-pointer hover:bg-gray-200 px-2 py-1 rounded flex justify-between';
          li.innerHTML = `
            <span>${o.nombre} [${o.codigo}]</span>
            <button data-id="${o.id}" class="text-red-500 hover:underline">Eliminar</button>
          `;
          // Selección para editar
          li.addEventListener('click', () => selectObra(o));
          // Eliminar
          li.querySelector('button').addEventListener('click', e => {
            e.stopPropagation();
            obraController.eliminar(o.id, cargarLista);
          });
          ul.appendChild(li);
        });
      }

      // Actualizar autocompletado
      updateDatalist();
    });
  }

  // Rellenar elementos del datalist nativo
  function updateDatalist() {
    if (!dataList) return;
    dataList.innerHTML = '';
    obrasCache.forEach(o => {
      const opt = document.createElement('option');
      opt.value = `${o.nombre} [${o.codigo}]`;
      dataList.appendChild(opt);
    });
  }

  // Rellenar formulario para edición
  function selectObra(o) {
    console.log('[obrasView.js] Editando obra:', o);
    idSel = o.id;
    document.getElementById('codigo').value = o.codigo;
    document.getElementById('nombre').value = o.nombre;
    document.getElementById('localidad').value = o.localidad || '';
    document.getElementById('municipio').value = o.municipio || '';
    document.getElementById('presupuesto').value = o.presupuesto || '';
    const archivoSel = document.getElementById('archivo');
    if (archivoSel) archivoSel.value = o.archivo || 'RECIENTE';
    Swal.fire('Obra seleccionada', `${o.nombre} (${o.codigo})`, 'info');
  }

  // Búsqueda activa
  function buscarObra() {
    const val = inputBuscar.value.trim();
    if (!val) return cargarLista();
    const match = obrasCache.find(o => `${o.nombre} [${o.codigo}]` === val);
    if (match) {
      selectObra(match);
    } else {
      Swal.fire('No encontrada', 'No existe esa obra.', 'error');
    }
  }

  // Validación código duplicado al guardar
  function validarDuplicado(codigo) {
    return obrasCache.some(o => o.codigo === codigo && o.id !== idSel);
  }

  // Botones guardar y nuevo
  const btnGuardar = document.getElementById('guardar');
  const btnNuevo = document.getElementById('nuevo');
  if (btnGuardar && btnNuevo) {
    btnGuardar.addEventListener('click', () => {
      const datos = {
        id: idSel,
        codigo: document.getElementById('codigo').value.trim(),
        nombre: document.getElementById('nombre').value.trim(),
        archivo: document.getElementById('archivo').value,
        localidad: document.getElementById('localidad').value.trim(),
        municipio: document.getElementById('municipio').value.trim(),
        presupuesto: parseFloat(document.getElementById('presupuesto').value) || 0
      };
      if (!datos.codigo || !datos.nombre) {
        Swal.fire('Datos incompletos', 'Debes ingresar código y nombre.', 'warning');
        return;
      }
      if (validarDuplicado(datos.codigo)) {
        Swal.fire('Código duplicado', 'Ya existe una obra con ese código.', 'error');
        return;
      }
      obraController.guardar(datos, () => {
        idSel = null;
        ['codigo','nombre','localidad','municipio','presupuesto'].forEach(id => document.getElementById(id).value = '');
        document.getElementById('archivo').value = 'RECIENTE';
        cargarLista();
      });
    });
    btnNuevo.addEventListener('click', () => {
      idSel = null;
      ['codigo','nombre','localidad','municipio','presupuesto'].forEach(id => document.getElementById(id).value = '');
      document.getElementById('archivo').value = 'RECIENTE';
    });
  } else {
    console.warn('[obrasView.js] No se encontraron los botones "guardar" o "nuevo"');
  }

  // Eventos búsqueda
  if (btnBuscar) btnBuscar.addEventListener('click', buscarObra);
  if (inputBuscar) inputBuscar.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); buscarObra(); } });

  cargarLista();
};
