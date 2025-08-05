// src/models/userModel.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('inventario.sqlite');

/**
 * Valida credenciales y devuelve el usuario (sin password)
 * user = { id, username, superuser } o null si no existe.
 */
function validar(username, password, cb) {
  const sql = `
    SELECT id, username, superuser
    FROM usuarios
    WHERE username = ? AND password = ?
  `;
  db.get(sql, [username, password], (err, row) => {
    if (err) return cb(err);
    // si row es undefined => credenciales inválidas
    cb(null, row || null);
  });
}

/** Devuelve todos los usuarios (sin password) */
function getAll(cb) {
  const sql = `SELECT id, username, superuser FROM usuarios ORDER BY id`;
  db.all(sql, [], cb);
}

/** Inserta un nuevo usuario */
function insert(data, cb) {
  const sql = `
    INSERT INTO usuarios (username, password, superuser)
    VALUES (?, ?, ?)
  `;
  const params = [data.username, data.password, data.superuser || 0];
  db.run(sql, params, function(err) {
    if (err) return cb(err);
    // devolvemos el id recién creado
    cb(null, { id: this.lastID });
  });
}

/** Actualiza un usuario existente */
function update(id, data, cb) {
  const sql = `
    UPDATE usuarios
    SET username = ?, password = ?, superuser = ?
    WHERE id = ?
  `;
  const params = [
    data.username,
    data.password,
    data.superuser || 0,
    id
  ];
  db.run(sql, params, function(err) {
    cb(err);
  });
}

/** Elimina un usuario por id */
function remove(id, cb) {
  const sql = `DELETE FROM usuarios WHERE id = ?`;
  db.run(sql, [id], cb);
}

module.exports = {
  validar,
  getAll,
  insert,
  update,
  delete: remove
};
