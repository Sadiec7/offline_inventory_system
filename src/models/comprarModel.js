// models/comprarModel.js - Versión corregida
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('inventario.sqlite');

function getAll(cb) {
  db.all(`SELECT * FROM compras ORDER BY fecha DESC`, [], cb);
}

function getByObra(idObra, cb) {
  db.all(`SELECT * FROM compras WHERE obra_id = ? ORDER BY fecha DESC`, [idObra], cb);
}

function insert(data, cb) {
  const sql = `
    INSERT INTO compras 
      (obra_id, insumo_id, nombre, fecha, pedido, cantidad, precio, importe, proveedor_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [
    data.obra_id,
    data.insumo_id,
    data.nombre,
    data.fecha,
    data.pedido,
    data.cantidad,
    data.precio,
    data.importe,
    data.proveedor_id
  ];
  console.log('Insertando con SQL:', sql);
  console.log('Parámetros:', params);
  db.run(sql, params, cb);
}

// Función update corregida
function update(id, data, cb) {
  const sql = `
    UPDATE compras
    SET 
      obra_id = ?,
      insumo_id = ?,
      nombre = ?,
      fecha = ?,
      pedido = ?,
      cantidad = ?,
      precio = ?,
      importe = ?,
      proveedor_id = ?
    WHERE id = ?`;
  
  const params = [
    data.obra_id,
    data.insumo_id,
    data.nombre,
    data.fecha,
    data.pedido,
    data.cantidad,
    data.precio,
    data.importe,
    data.proveedor_id,
    id
  ];
  
  console.log('Actualizando con SQL:', sql);
  console.log('Parámetros:', params);
  console.log('ID a actualizar:', id);
  
  db.run(sql, params, function(err) {
    if (err) {
      console.error('Error en update:', err);
      console.error('SQL que causó el error:', sql);
      console.error('Parámetros:', params);
    } else {
      console.log('Actualización exitosa, filas afectadas:', this.changes);
    }
    cb(err, this);
  });
}

function remove(id, cb) {
  db.run(`DELETE FROM compras WHERE id = ?`, [id], cb);
}

module.exports = { getAll, getByObra, insert, delete: remove, update };