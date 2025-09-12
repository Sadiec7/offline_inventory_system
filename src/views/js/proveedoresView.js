const provCtrl = require(path.join(__dirname, '..', 'controllers', 'proveedorController'));
window.initProveedoresView = async function() {
  const tblBody     = document.getElementById('tblProveedores');
  const modal       = document.getElementById('modalForm');
  const form        = document.getElementById('proveedorForm');
  const formTitle   = document.getElementById('formTitle');
  const btnNuevo    = document.getElementById('btnNuevo');
  const btnCancelar = document.getElementById('btnCancelar');
  const inpId       = document.getElementById('proveedorId');
  const inpNombre   = document.getElementById('nombre');
  const inpRfc      = document.getElementById('rfc');
  const inpDir      = document.getElementById('direccion');
  const inpTel      = document.getElementById('telefono');

  // Función para mostrar el modal
  function showModal(isEdit = false, data = {}) {
    form.reset();
    if (isEdit) {
      formTitle.textContent = 'Editar Proveedor';
      inpId.value     = data.id;
      inpNombre.value = data.nombre;
      inpRfc.value    = data.rfc;
      inpDir.value    = data.direccion || '';
      inpTel.value    = data.telefono || '';
    } else {
      formTitle.textContent = 'Nuevo Proveedor';
      inpId.value = '';
    }
    modal.classList.remove('hidden');
  }

  // Ocultar modal
  btnCancelar.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  // Nuevo proveedor
  btnNuevo.addEventListener('click', () => {
    showModal(false);
  });

  // Guardar (alta o edición)
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const payload = {
      nombre:    inpNombre.value.trim(),
      rfc:       inpRfc.value.trim(),
      direccion: inpDir.value.trim(),
      telefono:  inpTel.value.trim()
    };
    try {
      if (inpId.value) {
        // edición
        await provCtrl.update(+inpId.value, payload);
      } else {
        // alta
        await provCtrl.add(payload);
      }
      modal.classList.add('hidden');
      await refreshTable();
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  });

  // Refrescar la tabla
  async function refreshTable() {
    const list = await provCtrl.list();
    tblBody.innerHTML = '';
    list.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap" data-label="Nombre:">
          <div class="truncate-text" title="${p.nombre}">${p.nombre}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap" data-label="RFC:">
          <div class="truncate-text" title="${p.rfc}">${p.rfc}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap" data-label="Dirección:">
          <div class="truncate-text" title="${p.direccion || ''}">${p.direccion || ''}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap" data-label="Teléfono:">
          <div class="truncate-text" title="${p.telefono || ''}">${p.telefono || ''}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-center" data-label="Acciones:">
          <button data-id="${p.id}" class="edit text-blue-600 hover:underline mr-2">Editar</button>
          <button data-id="${p.id}" class="del text-red-600 hover:underline">Eliminar</button>
        </td>`;
      tblBody.appendChild(tr);
    });

    // Eventos Editar / Eliminar
    tblBody.querySelectorAll('.edit').forEach(btn =>
      btn.addEventListener('click', async e => {
        const id = +e.target.dataset.id;
        const data = await provCtrl.get(id);
        showModal(true, data);
      })
    );
    tblBody.querySelectorAll('.del').forEach(btn =>
      btn.addEventListener('click', async e => {
        const id = +e.target.dataset.id;
        if (confirm('¿Eliminar este proveedor?')) {
          await provCtrl.remove(id);
          await refreshTable();
        }
      })
    );
  }

  // Al cargar la vista
  await refreshTable();
};