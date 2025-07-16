const {
  getAllProveedores,
  getProveedorById,
  createProveedor,
  updateProveedor,
  deleteProveedor
} = require('../models/proveedorModel');

exports.list   = () => getAllProveedores();
exports.get    = id => getProveedorById(id);
exports.add    = data => createProveedor(data);
exports.update = (id, data) => updateProveedor(id, data);
exports.remove = id => deleteProveedor(id);
