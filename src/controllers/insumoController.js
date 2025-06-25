const M = require('../models/insumoModel');
function guardar(i,cb){ i.id ? M.update(i.id,i,cb) : M.insert(i,cb); }
function eliminar(id,cb){ M.remove(id,cb); }
function listar(cb){ M.getAll(cb); }
module.exports = { guardar, eliminar, listar };
