const userCtrl = require(path.join(__dirname, '..', 'controllers', 'userController'));

window.initUsuariosView = function() {
  const listaEl        = document.getElementById('listaUsuarios');
  const inpUsername    = document.getElementById('username');
  const inpPassword    = document.getElementById('password');
  const selSuperuser   = document.getElementById('superuser');
  const btnNuevo       = document.getElementById('nuevoUsuario');
  const btnGuardar     = document.getElementById('guardarUsuario');

  let editingUserId = null;

  // Inicialización
  cargarUsuarios();
  btnNuevo.onclick   = clearForm;
  btnGuardar.onclick = saveUser;

  function cargarUsuarios() {
    userCtrl.listar((err, users) => {
      if (err) {
        listaEl.innerHTML = `<li class="text-red-500 p-2">Error cargando usuarios</li>`;
        return;
      }
      if (!users.length) {
        listaEl.innerHTML = `<li class="p-2">No hay usuarios registrados</li>`;
        return;
      }
      listaEl.innerHTML = users.map(u => `
        <li class="flex justify-between items-center bg-white p-2 rounded shadow-sm mb-2">
          <div>
            <span class="font-medium">${u.username}</span>
            ${u.superuser
              ? `<span class="ml-2 px-2 py-0.5 bg-green-200 text-green-800 text-xs rounded">SU</span>`
              : ''}
          </div>
          <div class="space-x-2">
            <button data-id="${u.id}" data-action="edit"
                    class="text-blue-600 hover:text-blue-800">✎</button>
            <button data-id="${u.id}" data-action="delete"
                    class="text-red-600 hover:text-red-800">✖</button>
          </div>
        </li>
      `).join('');

      // Asignar eventos
      listaEl.querySelectorAll('button').forEach(btn => {
        const id     = Number(btn.dataset.id);
        const action = btn.dataset.action;
        if (action === 'edit') {
          btn.onclick = () => startEdit(id);
        } else if (action === 'delete') {
          btn.onclick = () => {
            if (confirm('¿Eliminar este usuario?')) {
              userCtrl.eliminar(id, err => {
                if (err) return alert('Error al eliminar');
                cargarUsuarios();
                if (editingUserId === id) clearForm();
              });
            }
          };
        }
      });
    });
  }

  function startEdit(id) {
    userCtrl.listar((err, users) => {
      const u = users.find(x => x.id === id);
      if (!u) return alert('Usuario no encontrado');
      editingUserId   = id;
      inpUsername.value  = u.username;
      inpPassword.value  = ''; // dejar vacío para no revelar
      selSuperuser.value = String(u.superuser);
      btnGuardar.textContent = 'Actualizar';
    });
  }

  function saveUser() {
    const data = {
      username:  inpUsername.value.trim(),
      password:  inpPassword.value,
      superuser: Number(selSuperuser.value)
    };
    if (!data.username || !data.password) {
      return alert('Usuario y contraseña son obligatorios');
    }
    if (editingUserId) {
      data.id = editingUserId;
    }
    userCtrl.guardar(data, err => {
      if (err) return alert('Error al guardar usuario');
      clearForm();
      cargarUsuarios();
    });
  }

  function clearForm() {
    editingUserId       = null;
    inpUsername.value   = '';
    inpPassword.value   = '';
    selSuperuser.value  = '0';
    btnGuardar.textContent = 'Guardar';
  }
};
