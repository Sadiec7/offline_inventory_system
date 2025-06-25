const User = require('../models/userModel');
function validarUsuario(u,p,cb) { User.validar(u,p,cb); }
module.exports = { validarUsuario };
