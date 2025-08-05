// controllers/compraController.js - Versión corregida
const compraModel = require('../models/comprarModel');

function listar(cb) {
  compraModel.getAll(cb);
}

function listarPorObra(idObra, cb) {
  compraModel.getByObra(idObra, cb);
}

function guardar(data, cb) {
  // Validar que los datos requeridos estén presentes
  if (!data.obra_id || !data.insumo_id) {
    return cb(new Error('obra_id e insumo_id son requeridos'));
  }
  
  const compraData = {
    obra_id:      data.obra_id,
    insumo_id:    data.insumo_id,
    nombre:       data.nombre || '',
    fecha:        data.fecha || '',
    pedido:       data.pedido || '',
    cantidad:     data.cantidad || 0,
    precio:       data.precio || 0,
    importe:      data.importe || 0,
    proveedor_id: data.proveedor_id || null
  };
  
  console.log('Guardando compra:', compraData);
  compraModel.insert(compraData, cb);
}

function editar(id, data, cb) {
  // Validar que el ID sea válido
  if (!id || isNaN(id)) {
    return cb(new Error('ID inválido'));
  }
  
  // Validar que los datos requeridos estén presentes
  if (!data.obra_id || !data.insumo_id) {
    return cb(new Error('obra_id e insumo_id son requeridos'));
  }
  
  const compraData = {
    obra_id:      data.obra_id,
    insumo_id:    data.insumo_id,
    nombre:       data.nombre || '',
    fecha:        data.fecha || '',
    pedido:       data.pedido || '',
    cantidad:     data.cantidad || 0,
    precio:       data.precio || 0,
    importe:      data.importe || 0,
    proveedor_id: data.proveedor_id || null
  };
  
  console.log('Editando compra ID:', id);
  console.log('Datos a actualizar:', compraData);
  
  compraModel.update(id, compraData, cb);
}

function eliminar(id, cb) {
  if (!id || isNaN(id)) {
    return cb(new Error('ID inválido'));
  }
  
  console.log('Eliminando compra ID:', id);
  compraModel.delete(id, cb);
}

module.exports = { listar, listarPorObra, guardar, eliminar, editar };