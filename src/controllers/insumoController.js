const M = require('../models/insumoModel');

function guardar(i, cb) { 
  // Validaciones básicas
  if (!i.nombre || !i.nombre.trim()) {
    return cb(new Error('El nombre del insumo es requerido'));
  }
  
  if (!i.unidad || !i.unidad.trim()) {
    return cb(new Error('La unidad del insumo es requerida'));
  }

  // Limpiar datos
  const insumoData = {
    nombre: i.nombre.trim(),
    unidad: i.unidad.trim(),
    categoria_id: i.categoria_id || null
  };

  // Decidir si es inserción o actualización
  if (i.id) {
    M.update(i.id, insumoData, cb);
  } else {
    M.insert(insumoData, cb);
  }
}

function eliminar(id, cb) { 
  if (!id) {
    return cb(new Error('ID de insumo requerido'));
  }
  M.remove(id, cb); 
}

function listar(cb) { 
  // Obtener insumos con información de categoría
  M.getAllWithCategory(cb);
}

function obtener(id, cb) {
  if (!id) {
    return cb(new Error('ID de insumo requerido'));
  }
  M.getById(id, cb);
}

module.exports = { guardar, eliminar, listar, obtener };