console.log('[insumosView.js] cargado correctamente');

const insumoController = require(path.join(process.cwd(), 'src', 'controllers', 'insumoController.js'));

window.initInsumosView = function () {
  console.log('[initInsumosView] Ejecutando vista de insumos...');
  let idSel = null;

  function cargarLista() {
    console.log('[insumosView.js] ejecutando insumoController.listar...');
    insumoController.listar((err, rows) => {
      console.log('[insumosView.js] resultado de listar:', { err, rows });

      const ul = document.getElementById('listaInsumos');
      if (!ul) {
        console.warn('[insumosView.js] No se encontró #listaInsumos');
        return;
      }

      ul.innerHTML = '';

      if (err) {
        ul.innerHTML = `<li class="text-red-600">Error cargando insumos</li>`;
        return;
      }

      if (!rows || rows.length === 0) {
        ul.innerHTML = `<li class="italic text-gray-500">No se han detectado insumos registrados</li>`;
        return;
      }

      rows.forEach(i => {
        const li = document.createElement('li');
        li.className = 'cursor-pointer hover:bg-gray-200 px-2 py-1 rounded flex justify-between';
        li.innerHTML = `
          <span>${i.nombre} (${i.unidad})</span>
          <button data-id="${i.id}" class="text-red-500 hover:underline">Eliminar</button>
        `;
        li.onclick = () => {
          idSel = i.id;
          document.getElementById('nombre').value = i.nombre;
          document.getElementById('unidad').value = i.unidad;
        };
        li.querySelector('button').onclick = e => {
          e.stopPropagation();
          insumoController.eliminar(i.id, cargarLista);
        };
        ul.appendChild(li);
      });
    });
  }

  const btnGuardar = document.getElementById('guardar');
  const btnNuevo = document.getElementById('nuevo');

  if (btnGuardar && btnNuevo) {
    btnGuardar.onclick = () => {
      const d = {
        id: idSel,
        nombre: document.getElementById('nombre').value,
        unidad: document.getElementById('unidad').value
      };
      insumoController.guardar(d, () => {
        idSel = null;
        ['nombre', 'unidad'].forEach(k => {
          document.getElementById(k).value = '';
        });
        cargarLista();
      });
    };

    btnNuevo.onclick = () => {
      idSel = null;
      ['nombre', 'unidad'].forEach(k => {
        document.getElementById(k).value = '';
      });
    };
  } else {
    console.warn('[insumosView.js] No se encontraron los botones "guardar" o "nuevo"');
  }

  cargarLista();
};
