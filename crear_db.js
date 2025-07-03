// resetDb.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('inventario.sqlite');

db.serialize(() => {
  // 1) Eliminar tablas si existen
  db.run(`DROP TABLE IF EXISTS compras`);
  db.run(`DROP TABLE IF EXISTS usuarios`);
  db.run(`DROP TABLE IF EXISTS obras`);
  db.run(`DROP TABLE IF EXISTS insumos`);

  // 2) Crear tabla usuarios con superuser
  db.run(`
    CREATE TABLE usuarios (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      username   TEXT UNIQUE NOT NULL,
      password   TEXT NOT NULL,
      superuser  INTEGER DEFAULT 0
    )
  `);
  const usuarios = [
    ['admin',       'admin123', 1],
    ['usuario1',    'pass1',    0],
    ['usuario2',    'pass2',    0],
    ['usuario3',    'pass3',    0],
    ['usuario4',    'pass4',    0],
  ];
  usuarios.forEach(u => {
    db.run(
      `INSERT INTO usuarios (username, password, superuser) VALUES (?, ?, ?)`,
      u
    );
  });

  // 3) Crear tabla obras
  db.run(`
    CREATE TABLE obras (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo       TEXT UNIQUE NOT NULL,
      nombre       TEXT NOT NULL,
      localidad    TEXT,
      municipio    TEXT,
      presupuesto  REAL    DEFAULT 0,
      archivo      TEXT    DEFAULT 'RECIENTE'
    )
  `);
  const obras = [
    ['OB001', 'Pavimentación Calle 5',   'Centro',     'Querétaro', 1500000],
    ['OB002', 'Rehabilitación Parque',    'Santa Rosa', 'Querétaro',  850000],
    ['OB003', 'Construcción de Aulas',    'San Juan',   'Querétaro', 2300000],
    ['OB004', 'Remodelación Clínica',     'Carrillo',   'Querétaro', 1800000],
    ['OB005', 'Ampliación Red Eléctrica', 'Juriquilla', 'Querétaro', 1250000],
  ];
  obras.forEach(o => {
    db.run(
      `INSERT INTO obras (codigo, nombre, localidad, municipio, presupuesto) VALUES (?, ?, ?, ?, ?)`,
      o
    );
  });

  // 4) Crear tabla insumos
  db.run(`
    CREATE TABLE insumos (
      id      INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre  TEXT UNIQUE NOT NULL,
      unidad  TEXT
    )
  `);
  const insumos = [
    ['Cemento gris', 'kg'],
    ['Arena fina',   'm³'],
    ['Varilla 3/8"', 'pieza'],
    ['Pintura blanca','lt'],
    ['Tubos PVC 4"','m'],
  ];
  insumos.forEach(i => {
    db.run(
      `INSERT INTO insumos (nombre, unidad) VALUES (?, ?)`,
      i
    );
  });

  // 5) Crear tabla compras
  db.run(`
    CREATE TABLE compras (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      obra_id    INTEGER NOT NULL,
      insumo_id  INTEGER NOT NULL,
      nombre     TEXT,
      fecha      TEXT,
      pedido     TEXT,
      cantidad   REAL,
      precio     REAL,
      importe    REAL,
      proveedor  TEXT,
      FOREIGN KEY (obra_id)   REFERENCES obras(id),
      FOREIGN KEY (insumo_id) REFERENCES insumos(id)
    )
  `);
  const compras = [
    [1, 1, 'Compra Cemento',   '2025-07-01', 'PED001', 100, 50, 5000,  'Proveedor A'],
    [2, 2, 'Compra Arena',     '2025-07-02', 'PED002',  50, 30, 1500,  'Proveedor B'],
    [3, 3, 'Compra Varilla',   '2025-07-03', 'PED003', 200, 10, 2000,  'Proveedor C'],
    [4, 4, 'Compra Pintura',   '2025-07-04', 'PED004',  80, 20, 1600,  'Proveedor D'],
    [5, 5, 'Compra Tubos PVC', '2025-07-05', 'PED005',  60, 40, 2400,  'Proveedor E'],
  ];
  compras.forEach(c => {
    db.run(
      `INSERT INTO compras (obra_id, insumo_id, nombre, fecha, pedido, cantidad, precio, importe, proveedor)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      c
    );
  });
});

db.close();
console.log('✅ Base de datos reinicializada con 5 registros por tabla (1 superuser)'); 
