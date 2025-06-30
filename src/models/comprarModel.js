// models/comprarModel.js
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
      (obra_id, insumo_id, nombre, fecha, pedido, cantidad, precio, importe, proveedor)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [
    data.obra_id,   // antes data.id_obra
    data.insumo_id, // antes data.insumo
    data.nombre,
    data.fecha,
    data.pedido,
    data.cantidad,
    data.precio,
    data.importe,
    data.proveedor
  ];
  db.run(sql, params, cb);
}


function update(id, data, cb) {
  const sql = `
    UPDATE compras 
    SET obra_id = ?, insumo_id = ?, nombre = ?, fecha = ?, pedido = ?, cantidad = ?, precio = ?, importe = ?, proveedor = ?
    WHERE id = ?`;
  const params = [
    data.obra_id,   // antes data.id_obra
    data.insumo_id, // antes data.insumo
    data.nombre,
    data.fecha,
    data.pedido,
    data.cantidad,
    data.precio,
    data.importe,
    data.proveedor,
    id
  ];
  db.run(sql, params, cb);
}

function remove(id, cb) {
  db.run(`DELETE FROM compras WHERE id = ?`, [id], cb);
}

module.exports = { getAll, getByObra, insert, delete: remove };
