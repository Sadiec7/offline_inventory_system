// controllers/categoriaInsumoController.js
const model = require('../models/categoriaInsumoModel');

module.exports = {
  listar(cb) { model.listar(cb); },
  obtener(id, cb) { model.obtener(id, cb); },
  crear(data, cb) { model.crear(data, cb); },
  actualizar(id, data, cb) { model.actualizar(id, data, cb); },
  eliminar(id, cb) { model.eliminar(id, cb); },
  buscar(term, cb) { model.buscar(term, cb); }
};
