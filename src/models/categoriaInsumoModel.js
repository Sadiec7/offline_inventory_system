// models/categoriaInsumoModel.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('inventario.sqlite');

const CategoriaInsumoModel = {
  listar(callback) {
    db.all(
      `SELECT id, nombre
       FROM categoria_insumos
       ORDER BY nombre ASC`,
      [],
      callback
    );
  },

  obtener(id, callback) {
    db.get(
      `SELECT id, nombre
       FROM categoria_insumos
       WHERE id = ?`,
      [id],
      callback
    );
  },

  crear(data, callback) {
    const { nombre } = data;
    db.run(
      `INSERT INTO categoria_insumos (nombre) VALUES (?)`,
      [nombre],
      function (err) {
        if (err) return callback(err);
        callback(null, { id: this.lastID });
      }
    );
  },

  actualizar(id, data, callback) {
    const { nombre } = data;
    db.run(
      `UPDATE categoria_insumos SET nombre = ? WHERE id = ?`,
      [nombre, id],
      function (err) {
        if (err) return callback(err);
        callback(null, { changes: this.changes });
      }
    );
  },

  eliminar(id, callback) {
    db.run(
      `DELETE FROM categoria_insumos WHERE id = ?`,
      [id],
      function (err) {
        if (err) return callback(err);
        callback(null, { changes: this.changes });
      }
    );
  },

  buscar(term, callback) {
    const like = `%${term || ''}%`;
    db.all(
      `SELECT id, nombre
       FROM categoria_insumos
       WHERE nombre LIKE ?
       ORDER BY nombre ASC`,
      [like],
      callback
    );
  }
};

module.exports = CategoriaInsumoModel;
