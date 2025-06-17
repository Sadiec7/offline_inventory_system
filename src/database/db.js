// db.js
const path = require('path');
const Database = require('better-sqlite3');

// Determinar ruta de la base de datos.
// En producción (ASAR), se usa resourcesPath; en modo desarrollo, se crea en la carpeta raíz.
const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === undefined;
const dbFile = isDev
  ? path.join(__dirname, 'inventario.sqlite')
  : path.join(process.resourcesPath, 'inventario.sqlite');

const db = new Database(dbFile);

// Crear tabla si no existe
db.prepare(`
  CREATE TABLE IF NOT EXISTS productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    categoria TEXT NOT NULL,
    cantidad INTEGER NOT NULL,
    precio REAL NOT NULL
  )
`).run();

// Funciones para insertar, actualizar, eliminar y consultar productos:
module.exports = {
  agregarProducto: (producto) => {
    const stmt = db.prepare(`
      INSERT INTO productos (nombre, categoria, cantidad, precio)
      VALUES (@nombre, @categoria, @cantidad, @precio)
    `);
    const info = stmt.run(producto);
    return info.lastInsertRowid;
  },

  obtenerProductos: () => {
    const stmt = db.prepare(`SELECT * FROM productos`);
    return stmt.all();
  },

  actualizarProducto: (producto) => {
    const stmt = db.prepare(`
      UPDATE productos
      SET nombre = @nombre, categoria = @categoria, cantidad = @cantidad, precio = @precio
      WHERE id = @id
    `);
    return stmt.run(producto);
  },

  eliminarProducto: (id) => {
    const stmt = db.prepare(`DELETE FROM productos WHERE id = ?`);
    return stmt.run(id);
  }
};
