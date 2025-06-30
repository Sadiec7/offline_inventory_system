console.log('[obrasView.js] cargado correctamente');

const obraController = require(path.join(process.cwd(), 'src', 'controllers', 'obraController.js'));

window.initObrasView = function () {
  console.log('[initObrasView] Ejecutando vista de obras...');
  let idSel = null;

  function cargarLista() {
    console.log('[obrasView.js] ejecutando obraController.listar...');
    obraController.listar((err, obras) => {
    
      const ul = document.getElementById('listaObras');
      if (!ul) {
        console.warn('[obrasView.js] No se encontró #listaObras');
        return;
      }

      ul.innerHTML = '';

      if (err) {
        ul.innerHTML = `<li class="text-red-600">Error cargando obras</li>`;
        return;
      }

      if (!obras || obras.length === 0) {
        ul.innerHTML = `<li class="italic text-gray-500">No se han detectado obras en progreso</li>`;
        return;
      }

      obras.forEach(o => {
        const li = document.createElement('li');
        li.className = 'cursor-pointer hover:bg-gray-200 px-2 py-1 rounded flex justify-between';
        li.innerHTML = `
          <span>${o.nombre} [${o.codigo}]</span>
          <button data-id="${o.id}" class="text-red-500 hover:underline">Eliminar</button>
        `;
        li.onclick = () => {
          idSel = o.id;
          ['codigo', 'nombre', 'localidad', 'municipio', 'presupuesto'].forEach(id => {
            document.getElementById(id).value = o[id] || '';
          });
          const archivoSel = document.getElementById('archivo');
          if (archivoSel) archivoSel.value = o.archivo || 'RECIENTE';
        };
        li.querySelector('button').onclick = e => {
          e.stopPropagation();
          obraController.eliminar(o.id, cargarLista);
        };
        ul.appendChild(li);
      });
    });
  }

  const btnGuardar = document.getElementById('guardar');
  const btnNuevo = document.getElementById('nuevo');

  if (btnGuardar && btnNuevo) {
    btnGuardar.onclick = () => {
      const datos = {
        id: idSel,
        codigo: document.getElementById('codigo').value,
        nombre: document.getElementById('nombre').value,
        archivo: document.getElementById('archivo').value,
        localidad: document.getElementById('localidad').value,
        municipio: document.getElementById('municipio').value,
        presupuesto: parseFloat(document.getElementById('presupuesto').value) || 0
      };
      obraController.guardar(datos, () => {
        idSel = null;
        ['codigo', 'nombre', 'localidad', 'municipio', 'presupuesto'].forEach(id => {
          document.getElementById(id).value = '';
        });
        const archivoSel = document.getElementById('archivo');
        if (archivoSel) archivoSel.value = 'RECIENTE';
        cargarLista();
      });
    };

    btnNuevo.onclick = () => {
      idSel = null;
      ['codigo', 'nombre', 'localidad', 'municipio', 'presupuesto'].forEach(id => {
        document.getElementById(id).value = '';
      });
      const archivoSel = document.getElementById('archivo');
      if (archivoSel) archivoSel.value = 'RECIENTE';
    };
  } else {
    console.warn('[obrasView.js] No se encontraron los botones "guardar" o "nuevo"');
  }

  cargarLista();
};
