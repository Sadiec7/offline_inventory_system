const Obra = require('../models/obraModel');

function listar(callback) {
  Obra.getAll(callback);
}

function guardar(data, callback) {
  if (data.id) {
    Obra.update(data, callback);
  } else {
    Obra.insert(data, callback);
  }
}

function eliminar(id, callback) {
  Obra.delete(id, callback);
}

module.exports = { listar, guardar, eliminar };
