const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Ajusta la ruta si tu DB está en otra ubicación
const dbPath = path.join(__dirname, '../../inventario.sqlite');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, err => {
  if (err) console.error('Error al conectar con la DB de insumos:', err);
});

function insert(i, cb) {
  db.run(
    `INSERT INTO insumos (nombre, unidad, categoria_id) VALUES (?, ?, ?)`,
    [i.nombre, i.unidad, i.categoria_id],
    function(err) {
      if (err) {
        console.error('Error al insertar insumo:', err);
        return cb(err);
      }
      console.log('Insumo insertado con ID:', this.lastID);
      cb(null, { id: this.lastID, ...i });
    }
  );
}

function update(id, i, cb) {
  db.run(
    `UPDATE insumos SET nombre=?, unidad=?, categoria_id=? WHERE id=?`,
    [i.nombre, i.unidad, i.categoria_id, id],
    function(err) {
      if (err) {
        console.error('Error al actualizar insumo:', err);
        return cb(err);
      }
      console.log('Insumo actualizado, cambios:', this.changes);
      cb(null, { id, ...i });
    }
  );
}

function remove(id, cb) {
  db.run(`DELETE FROM insumos WHERE id=?`, [id], function(err) {
    if (err) {
      console.error('Error al eliminar insumo:', err);
      return cb(err);
    }
    console.log('Insumo eliminado, cambios:', this.changes);
    cb(null, { changes: this.changes });
  });
}

function getAll(cb) {
  db.all(`SELECT * FROM insumos ORDER BY nombre ASC`, (err, rows) => {
    if (err) {
      console.error('Error al obtener insumos:', err);
      return cb(err);
    }
    cb(null, rows);
  });
}

// Nueva función para obtener insumos con información de categoría
function getAllWithCategory(cb) {
  const query = `
    SELECT 
      i.id,
      i.nombre,
      i.unidad,
      i.categoria_id,
      c.nombre as categoria_nombre
    FROM insumos i
    LEFT JOIN categoria_insumos c ON i.categoria_id = c.id
    ORDER BY i.nombre ASC
  `;
  
  db.all(query, (err, rows) => {
    if (err) {
      console.error('Error al obtener insumos con categorías:', err);
      return cb(err);
    }
    cb(null, rows);
  });
}

function getById(id, cb) {
  db.get(
    `SELECT 
      i.id,
      i.nombre,
      i.unidad,
      i.categoria_id,
      c.nombre as categoria_nombre
    FROM insumos i
    LEFT JOIN categoria_insumos c ON i.categoria_id = c.id
    WHERE i.id = ?`,
    [id],
    (err, row) => {
      if (err) {
        console.error('Error al obtener insumo por ID:', err);
        return cb(err);
      }
      cb(null, row);
    }
  );
}

module.exports = { 
  insert, 
  update, 
  remove, 
  getAll, 
  getAllWithCategory,
  getById 
};