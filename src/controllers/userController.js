const User = require('../models/userModel');

// Obtiene todos los usuarios
function listar(callback) {
  User.getAll(callback);
}

// Inserta o actualiza (si data.id existe)
function guardar(data, callback) {
  if (data.id) {
    // superuser y password pueden actualizarse también
    User.update(data.id, {
      username:  data.username,
      password:  data.password,
      superuser: data.superuser
    }, callback);
  } else {
    User.insert({
      username:  data.username,
      password:  data.password,
      superuser: data.superuser
    }, callback);
  }
}

// Elimina un usuario por id
function eliminar(id, callback) {
  User.delete(id, callback);
}

module.exports = { listar, guardar, eliminar };
