const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('inventario.sqlite');

db.serialize(() => {
  // Usuarios
  db.run(`CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )`);
  db.run(`INSERT OR IGNORE INTO usuarios (username, password)
          VALUES ('admin','admin123')`);

  // Obras
  db.run(`CREATE TABLE IF NOT EXISTS obras (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    localidad TEXT,
    municipio TEXT,
    presupuesto REAL DEFAULT 0
  )`);

  const obras = [
    ['OB001', 'Pavimentación Calle 5', 'Centro', 'Querétaro', 1500000],
    ['OB002', 'Rehabilitación Parque', 'Santa Rosa', 'Querétaro', 850000],
    ['OB003', 'Construcción de Aulas', 'San Juan', 'Querétaro', 2300000],
    ['OB004', 'Remodelación Clínica', 'Carrillo', 'Querétaro', 1800000],
    ['OB005', 'Ampliación Red Eléctrica', 'Juriquilla', 'Querétaro', 1250000],
  ];

  obras.forEach(o => {
    db.run(`INSERT OR IGNORE INTO obras (codigo, nombre, localidad, municipio, presupuesto)
            VALUES (?, ?, ?, ?, ?)`, o);
  });

  // Insumos
  db.run(`CREATE TABLE IF NOT EXISTS insumos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT UNIQUE NOT NULL,
    unidad TEXT
  )`);

  const insumos = [
    ['Cemento gris', 'kg'],
    ['Arena fina', 'm³'],
    ['Varilla 3/8"', 'pieza'],
    ['Pintura blanca', 'lt'],
    ['Tubos PVC 4"', 'm'],
  ];

  insumos.forEach(i => {
    db.run(`INSERT OR IGNORE INTO insumos (nombre, unidad) VALUES (?, ?)`, i);
  });
});

db.close();

console.log('Base de datos creada con datos de ejemplo');
