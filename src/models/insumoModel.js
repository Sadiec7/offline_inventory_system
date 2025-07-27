const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Ajusta la ruta si tu DB está en otra ubicación
const dbPath = path.join(__dirname, '../../inventario.sqlite');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, err => {
  if (err) console.error('Error al conectar con la DB de insumos:', err);
});

function insert(i, cb) {
  db.run(
    `INSERT INTO insumos (nombre,unidad) VALUES (?,?)`,
    [i.nombre, i.unidad],
    cb
  );
}

function update(id,i,cb) {
  db.run(
    `UPDATE insumos SET nombre=?,unidad=? WHERE id=?`,
    [i.nombre,i.unidad,id],
    cb
  );
}

function remove(id,cb) {
  db.run(`DELETE FROM insumos WHERE id=?`, [id], cb);
}

function getAll(cb) {
  db.all(`SELECT * FROM insumos`, cb);
}

module.exports = { insert, update, remove, getAll };