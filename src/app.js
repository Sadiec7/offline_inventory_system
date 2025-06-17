// app.js
// ------------
// Ajusta la ruta según donde tengas tu db.js. En este ejemplo, está en /database/db.js
const db = require('./database/db');

document.addEventListener('DOMContentLoaded', () => {
  console.log('→ app.js se ha cargado correctamente');

  const appContainer = document.getElementById('app');
  const notificacionesContainer = document.getElementById('notificaciones');
  const btnAgregar = document.getElementById('btn-agregar');
  const btnExportar = document.getElementById('btn-exportar');
    const btnGraficos = document.getElementById('btn-graficos');  // ← Referencia al botón “Ver Gráficos”

  // 3) Listener para “Ver Gráficos”
  btnGraficos.addEventListener('click', () => {
    // Cambia la página actual por charts.html
    window.location.href = 'charts/charts.html';
  });

  // Función para mostrar notificaciones
  function mostrarNotificacion(mensaje, tipo = 'info') {
    const alerta = document.createElement('div');
    alerta.className = `
      px-4 py-2 rounded shadow
      ${tipo === 'success' ? 'bg-green-100 text-green-800' : ''}
      ${tipo === 'error' ? 'bg-red-100 text-red-800' : ''}
    `;
    alerta.textContent = mensaje;
    notificacionesContainer.appendChild(alerta);
    setTimeout(() => alerta.remove(), 3000);
  }

  // Función para renderizar la tabla de productos
  function renderizarTabla(productos) {
    const cabeceras = ['ID', 'Nombre', 'Categoría', 'Cantidad', 'Precio', 'Acciones'];
    const tabla = document.createElement('table');
    tabla.className = 'min-w-full bg-white';

    // Encabezado
    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        ${cabeceras.map(h => `
          <th class="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 
                     text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
            ${h}
          </th>`).join('')}
      </tr>
    `;
    tabla.appendChild(thead);

    // Cuerpo
    const tbody = document.createElement('tbody');
    productos.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap">${p.id}</td>
        <td class="px-6 py-4 whitespace-nowrap">${p.nombre}</td>
        <td class="px-6 py-4 whitespace-nowrap">${p.categoria}</td>
        <td class="px-6 py-4 whitespace-nowrap">${p.cantidad}</td>
        <td class="px-6 py-4 whitespace-nowrap">${p.precio}</td>
        <td class="px-6 py-4 whitespace-nowrap">
          <button class="btn-editar bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mr-2" data-id="${p.id}">
            Editar
          </button>
          <button class="btn-eliminar bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded" data-id="${p.id}">
            Eliminar
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
    tabla.appendChild(tbody);

    // Reemplazar el contenido del contenedor
    appContainer.innerHTML = '';
    appContainer.appendChild(tabla);

    // Asignar eventos a botones de eliminar
    document.querySelectorAll('.btn-eliminar').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.getAttribute('data-id'));
        try {
          db.eliminarProducto(id);
          mostrarNotificacion('Producto eliminado.', 'success');
          cargarProductos(); // refrescar tabla
        } catch (err) {
          console.error('Error al eliminar producto:', err);
          mostrarNotificacion('Error al eliminar producto.', 'error');
        }
      });
    });

    // Asignar eventos a botones de editar
    document.querySelectorAll('.btn-editar').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.getAttribute('data-id'));
        const producto = productos.find(p => p.id === id);
        mostrarFormulario(producto);
      });
    });
  }

  // Función para mostrar formulario de agregar/editar
  function mostrarFormulario(producto = {}) {
    const esEdicion = Boolean(producto.id);
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center modal-z-index';

    modal.innerHTML = `
      <div class="bg-white rounded-lg shadow-lg w-96 p-6 relative">
        <h3 class="text-xl font-bold mb-4">${esEdicion ? 'Editar' : 'Agregar'} Producto</h3>
        <form id="form-producto" class="space-y-4">
          <input type="hidden" id="producto-id" value="${producto.id || ''}" />
          <div>
            <label class="block text-gray-700 mb-1" for="nombre">Nombre:</label>
            <input id="nombre" type="text" class="w-full border rounded px-3 py-2" value="${producto.nombre || ''}" required />
          </div>
          <div>
            <label class="block text-gray-700 mb-1" for="categoria">Categoría:</label>
            <input id="categoria" type="text" class="w-full border rounded px-3 py-2" value="${producto.categoria || ''}" required />
          </div>
          <div>
            <label class="block text-gray-700 mb-1" for="cantidad">Cantidad:</label>
            <input id="cantidad" type="number" class="w-full border rounded px-3 py-2" value="${producto.cantidad || 0}" required />
          </div>
          <div>
            <label class="block text-gray-700 mb-1" for="precio">Precio:</label>
            <input id="precio" type="number" step="0.01" class="w-full border rounded px-3 py-2" value="${producto.precio || 0}" required />
          </div>
          <div class="flex justify-end space-x-2 mt-4">
            <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              ${esEdicion ? 'Guardar' : 'Agregar'}
            </button>
            <button type="button" id="btn-cancelar" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);

    // Evento: cancelar
    document.getElementById('btn-cancelar').addEventListener('click', () => {
      modal.remove();
    });

    // Evento: submit del formulario
    document.getElementById('form-producto').addEventListener('submit', (e) => {
      e.preventDefault();
      const id = parseInt(document.getElementById('producto-id').value);
      const nombre = document.getElementById('nombre').value.trim();
      const categoria = document.getElementById('categoria').value.trim();
      const cantidad = parseInt(document.getElementById('cantidad').value);
      const precio = parseFloat(document.getElementById('precio').value);

      if (!nombre || !categoria || isNaN(cantidad) || isNaN(precio)) {
        mostrarNotificacion('Por favor, completa todos los campos.', 'error');
        return;
      }

      try {
        if (id) {
          // Edición
          db.actualizarProducto({ id, nombre, categoria, cantidad, precio });
          mostrarNotificacion('Producto actualizado.', 'success');
        } else {
          // Nuevo
          db.agregarProducto({ nombre, categoria, cantidad, precio });
          mostrarNotificacion('Producto agregado.', 'success');
        }
      } catch (err) {
        console.error('Error al guardar producto:', err);
        mostrarNotificacion('Error al guardar producto.', 'error');
      }

      modal.remove();
      cargarProductos();
    });
  }

  // Función para cargar todos los productos y renderizar la tabla
  function cargarProductos() {
    let productos = [];
    try {
      productos = db.obtenerProductos();
      console.log('Productos cargados:', productos);
    } catch (err) {
      console.error('Error al obtener productos de la BD:', err);
      appContainer.innerHTML = `
        <div class="p-4 text-center text-red-600">
          ⚠️ Error al cargar productos.<br>
          Revisa la consola para más detalles.
        </div>`;
      return;
    }

    // Si no hay productos, podemos mostrar un mensaje en lugar de una tabla vacía
    if (productos.length === 0) {
      appContainer.innerHTML = `
        <div class="p-6 text-center text-gray-600">
          No hay productos registrados aún.<br>
          Pulsa “Agregar Producto” para crear uno.
        </div>`;
    } else {
      renderizarTabla(productos);
    }
  }

  // Evento para el botón “Agregar Producto”
  btnAgregar.addEventListener('click', () => {
    mostrarFormulario(); // abre el form en modo “nuevo”
  });

  // Evento para el botón “Exportar”
   // 3. Listener para “Exportar”:
  btnExportar.addEventListener('click', async () => {
    try {
      // a) Requerimos exceljs
      const ExcelJS = require('exceljs');

      // b) Obtenemos todos los productos desde la base de datos
      const productos = db.obtenerProductos(); // Debe devolver un arreglo de objetos: [{id, nombre, categoria, cantidad, precio}, ...]

      // c) Creamos un nuevo Workbook y una hoja (“Inventario”)
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Inventario');

      // d) Definimos las columnas (headers) del Excel
      sheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Nombre', key: 'nombre', width: 30 },
        { header: 'Categoría', key: 'categoria', width: 30 },
        { header: 'Cantidad', key: 'cantidad', width: 10 },
        { header: 'Precio', key: 'precio', width: 15 }
      ];

      // e) Agregamos cada producto como fila en la hoja
      productos.forEach(p => {
        sheet.addRow({
          id: p.id,
          nombre: p.nombre,
          categoria: p.categoria,
          cantidad: p.cantidad,
          precio: p.precio
        });
      });

      // f) Determinar la ruta donde guardaremos el archivo Excel
      //    - __dirname en app.js apunta a la carpeta donde está app.js (la raíz del proyecto).
      //    - Lo guardaremos como “inventario.xlsx” en la raíz.
      const path = require('path');
      const filePath = path.join(__dirname, 'inventario.xlsx');

      // g) Escribimos el archivo en disco
      await workbook.xlsx.writeFile(filePath);

      // h) Notificar al usuario que el archivo se generó correctamente
      mostrarNotificacion(`Archivo Excel generado en:\n${filePath}`, 'success');
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      mostrarNotificacion('Error al exportar a Excel. Revisa la consola.', 'error');
    }
  });


  // Cargar productos al iniciar
  cargarProductos();
});
