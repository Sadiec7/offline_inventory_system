// src/models/proveedorModel.js
const sqlite3 = require('sqlite3').verbose();
const path    = require('path');
// Ajusta la ruta si tu DB está en otra ubicación
const dbPath  = path.join(__dirname, '../../inventario.sqlite');
const db      = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, err => {
  if (err) console.error('Error al conectar con la DB de proveedores:', err);
});

/**
 * Devuelve todos los proveedores ordenados por nombre.
 * @returns {Promise<Array>}
 */
function getAllProveedores() {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT id, nombre, rfc, direccion, telefono
         FROM proveedores
       ORDER BY nombre`,
      [],
      (err, rows) => err ? reject(err) : resolve(rows)
    );
  });
}

/**
 * Devuelve un proveedor por su ID.
 * @param {number} id
 * @returns {Promise<Object>}
 */
function getProveedorById(id) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT id, nombre, rfc, direccion, telefono
         FROM proveedores
       WHERE id = ?`,
      [id],
      (err, row) => err ? reject(err) : resolve(row)
    );
  });
}

/**
 * Crea un nuevo proveedor.
 * @param {Object} data - { nombre, rfc, direccion, telefono }
 * @returns {Promise<{ id: number }>}
 */
function createProveedor({ nombre, rfc, direccion, telefono }) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO proveedores (nombre, rfc, direccion, telefono)
             VALUES (?, ?, ?, ?)`,
      [nombre, rfc, direccion, telefono],
      function(err) {
        if (err) reject(err);
        else      resolve({ id: this.lastID });
      }
    );
  });
}

/**
 * Actualiza un proveedor existente.
 * @param {number} id
 * @param {Object} data - { nombre, rfc, direccion, telefono }
 * @returns {Promise<{ changes: number }>}
 */
function updateProveedor(id, { nombre, rfc, direccion, telefono }) {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE proveedores
         SET nombre = ?, rfc = ?, direccion = ?, telefono = ?
       WHERE id = ?`,
      [nombre, rfc, direccion, telefono, id],
      function(err) {
        if (err) reject(err);
        else      resolve({ changes: this.changes });
      }
    );
  });
}

/**
 * Elimina un proveedor por su ID.
 * @param {number} id
 * @returns {Promise<{ changes: number }>}
 */
function deleteProveedor(id) {
  return new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM proveedores WHERE id = ?`,
      [id],
      function(err) {
        if (err) reject(err);
        else      resolve({ changes: this.changes });
      }
    );
  });
}

module.exports = {
  getAllProveedores,
  getProveedorById,
  createProveedor,
  updateProveedor,
  deleteProveedor
};
