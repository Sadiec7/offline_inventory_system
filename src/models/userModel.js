const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('inventario.sqlite');

function validar(username, password, cb) {
  db.get(
    `SELECT * FROM usuarios WHERE username = ? AND password = ?`,
    [username, password],
    (err, row) => cb(!err && !!row)
  );
}

module.exports = { validar };
