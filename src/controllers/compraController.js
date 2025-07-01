// controllers/compraController.js
const compraModel = require('../models/comprarModel');

function listar(cb) {
  compraModel.getAll(cb);
}

function listarPorObra(idObra, cb) {
  compraModel.getByObra(idObra, cb);
}

function guardar(data, cb) {
  // data debe tener obra_id e insumo_id
  compraModel.insert({
    obra_id:   data.obra_id,
    insumo_id: data.insumo_id,
    nombre:    data.nombre,
    fecha:     data.fecha,
    pedido:    data.pedido,
    cantidad:  data.cantidad,
    precio:    data.precio,
    importe:   data.importe,
    proveedor: data.proveedor
  }, cb);
}

function editar(id, data, cb) {
  compraModel.update(id, data, cb);
}

function eliminar(id, cb) {
  compraModel.delete(id, cb);
}

module.exports = { listar, listarPorObra, guardar, eliminar, editar};
