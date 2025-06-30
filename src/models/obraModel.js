const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('inventario.sqlite');

// Asegura que la columna 'archivo' exista
db.run(`ALTER TABLE obras ADD COLUMN archivo TEXT DEFAULT 'RECIENTE'`, (err) => {
  if (err && !err.message.includes("duplicate column")) {
    console.error("Error agregando columna 'archivo':", err.message);
  }
});

// Obtener todas las obras
function getAll(callback) {
  db.all("SELECT * FROM obras ORDER BY nombre", [], callback);
}

// Insertar nueva obra
function insert(data, callback) {
  const stmt = db.prepare(`INSERT INTO obras (codigo, nombre, localidad, municipio, presupuesto, archivo)
                           VALUES (?, ?, ?, ?, ?, ?)`);
  stmt.run(data.codigo, data.nombre, data.localidad, data.municipio, data.presupuesto, data.archivo, callback);
  stmt.finalize();
}

// Actualizar obra existente
function update(data, callback) {
  const stmt = db.prepare(`UPDATE obras SET
                           codigo = ?, nombre = ?, localidad = ?, municipio = ?, presupuesto = ?, archivo = ?
                           WHERE id = ?`);
  stmt.run(data.codigo, data.nombre, data.localidad, data.municipio, data.presupuesto, data.archivo, data.id, callback);
  stmt.finalize();
}

// Eliminar obra por ID
function remove(id, callback) {
  const stmt = db.prepare(`DELETE FROM obras WHERE id = ?`);
  stmt.run(id, callback);
  stmt.finalize();
}

module.exports = { getAll, insert, update, delete: remove };
