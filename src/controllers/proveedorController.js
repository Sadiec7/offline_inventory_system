// controllers/proveedorController.js - Versión mejorada
const proveedorModel = require('../models/proveedorModel');
const path = require('path');

// Función para cargar proveedores con callback
function listar(callback) {
  try {
    proveedorModel.getAllProveedores()
      .then(rows => callback(null, rows))
      .catch(err => {
        console.error('Error en modelo al listar proveedores:', err);
        callback(new Error('Error al cargar proveedores'));
      });
  } catch (error) {
    console.error('Error inesperado en controlador de proveedores:', error);
    callback(new Error('Error interno del sistema'));
  }
}

module.exports = { 
  listar,
  list: proveedorModel.getAllProveedores,
  get: proveedorModel.getProveedorById,
  add: proveedorModel.createProveedor,
  update: proveedorModel.updateProveedor,
  remove: proveedorModel.deleteProveedor
};