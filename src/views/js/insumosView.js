console.log('[insumosView.js] cargado correctamente');

const insumoController = require(path.join(__dirname, '..', 'controllers', 'insumoController.js'));
window.initInsumosView = function () {
  console.log('[initInsumosView] Ejecutando vista de insumos...');
  let idSel = null;
  let insumos = [];

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

      insumos = rows;

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

  const btnGuardar = document.getElementById('guardar');
  const btnNuevo = document.getElementById('nuevo');
  const btnBuscar = document.getElementById("btnBuscar");
  const inputBuscar = document.getElementById("buscarInsumo");

  if (btnBuscar && inputBuscar) {
    btnBuscar.onclick = () => {
      const filtro = inputBuscar.value.toLowerCase();
      const filtrados = insumos.filter(i => i.nombre.toLowerCase().includes(filtro));
      renderLista(filtrados);
    };
  }

  function renderLista(lista) {
    const ul = document.getElementById('listaInsumos');
    ul.innerHTML = '';
    if (lista.length === 0) {
      ul.innerHTML = `<li class="italic text-gray-500">No se encontraron resultados</li>`;
      return;
    }
    lista.forEach(i => {
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
  }

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
