// src/controllers/loginController.js
const User = require('../models/userModel');

/**
 * Autentica un usuario y devuelve el objeto { id, username, superuser } o null.
 */
function autenticar(username, password, cb) {
  User.validar(username, password, (err, row) => {
    if (err) return cb(err);
    // Si no hay fila, credenciales inválidas
    if (!row) return cb(null, null);
    // row ya contiene { id, username, superuser }
    cb(null, row);
  });
}

module.exports = { autenticar };
