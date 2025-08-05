const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('inventario.sqlite');

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
