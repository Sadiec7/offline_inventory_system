// resetDb.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('inventario.sqlite');

db.serialize(() => {
  // 1) Eliminar tablas en orden de dependencias
  db.run(`DROP TABLE IF EXISTS compras`);
  db.run(`DROP TABLE IF EXISTS proveedores`);
  db.run(`DROP TABLE IF EXISTS insumos`);
  db.run(`DROP TABLE IF EXISTS obras`);
  db.run(`DROP TABLE IF EXISTS usuarios`);
  db.run(`DROP TABLE IF EXISTS categoria_insumos`);

  // 2) Crear tabla categorias
  db.run(`
    CREATE TABLE categoria_insumos (
      id     INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT UNIQUE NOT NULL
    )
  `);

  const categorias = [
    ['Materiales de construcción'],
    ['Herramientas'],
    ['Equipo de seguridad'],
    ['Suministros eléctricos'],
    ['Suministros hidráulicos']
  ];
  categorias.forEach(c => {
    db.run(`INSERT INTO categoria_insumos (nombre) VALUES (?)`, c);
  });

  // 3) Crear tabla usuarios
  db.run(`
    CREATE TABLE usuarios (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      username  TEXT UNIQUE NOT NULL,
      password  TEXT NOT NULL,
      superuser INTEGER DEFAULT 0
    )
  `);

  const usuarios = [
    ['admin',    'admin123', 1],
    ['usuario1', 'pass1',    0],
    ['usuario2', 'pass2',    0],
    ['usuario3', 'pass3',    0],
    ['usuario4', 'pass4',    0]
  ];
  usuarios.forEach(u => {
    db.run(
      `INSERT INTO usuarios (username, password, superuser) VALUES (?, ?, ?)`,
      u
    );
  });

  // 4) Crear tabla obras
  db.run(`
    CREATE TABLE obras (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo      TEXT UNIQUE NOT NULL,
      nombre      TEXT NOT NULL,
      localidad   TEXT,
      municipio   TEXT,
      presupuesto REAL DEFAULT 0,
      archivo     TEXT DEFAULT 'RECIENTE'
    )
  `);

  const obras = [
    ['OB001', 'Pavimentación Calle 5',   'Centro',     'Querétaro', 1500000],
    ['OB002', 'Rehabilitación Parque',   'Santa Rosa', 'Querétaro',  850000],
    ['OB003', 'Construcción de Aulas',   'San Juan',   'Querétaro', 2300000],
    ['OB004', 'Remodelación Clínica',    'Carrillo',   'Querétaro', 1800000],
    ['OB005', 'Ampliación Red Eléctrica','Juriquilla', 'Querétaro', 1250000]
  ];
  obras.forEach(o => {
    db.run(
      `INSERT INTO obras (codigo, nombre, localidad, municipio, presupuesto) VALUES (?, ?, ?, ?, ?)`,
      o
    );
  });

  // 5) Crear tabla insumos
  db.run(`
    CREATE TABLE insumos (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre       TEXT UNIQUE NOT NULL,
      unidad       TEXT,
      categoria_id INTEGER,
      FOREIGN KEY (categoria_id) REFERENCES categoria_insumos(id)
    )
  `);

  const insumos = [
    ['Cemento gris','kg',1],
    ['Arena fina','m³',1],
    ['Varilla 3/8"','pieza',1],
    ['Pintura blanca','lt',4],
    ['Tubos PVC 4"','m',5]
  ];
  insumos.forEach(i => {
    db.run(
      `INSERT INTO insumos (nombre, unidad, categoria_id) VALUES (?, ?, ?)`,
      i
    );
  });

  // 6) Crear tabla proveedores
  db.run(`
    CREATE TABLE proveedores (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre    TEXT NOT NULL,
      rfc       TEXT NOT NULL,
      direccion TEXT,
      telefono  TEXT
    )
  `);

  const proveedores = [
    ['Proveedor A','RFC-A','Dirección A','1111111111'],
    ['Proveedor B','RFC-B','Dirección B','2222222222'],
    ['Proveedor C','RFC-C','Dirección C','3333333333'],
    ['Proveedor D','RFC-D','Dirección D','4444444444'],
    ['Proveedor E','RFC-E','Dirección E','5555555555']
  ];
  proveedores.forEach(p => {
    db.run(
      `INSERT INTO proveedores (nombre, rfc, direccion, telefono) VALUES (?, ?, ?, ?)`,
      p
    );
  });

  // 7) Crear tabla compras
  db.run(`
    CREATE TABLE compras (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      obra_id      INTEGER,
      insumo_id    INTEGER NOT NULL,
      proveedor_id INTEGER,
      nombre       TEXT,
      fecha        TEXT,
      pedido       TEXT,
      cantidad     REAL,
      precio       REAL,
      importe      REAL,
      FOREIGN KEY (obra_id)       REFERENCES obras(id),
      FOREIGN KEY (insumo_id)     REFERENCES insumos(id),
      FOREIGN KEY (proveedor_id)  REFERENCES proveedores(id)
    )
  `);

  const compras = [
    [1, 1, 1, 'Compra Cemento',   '2025-07-01','PED001',100, 50,5000],
    [2, 2, 2, 'Compra Arena',     '2025-07-02','PED002', 50, 30,1500],
    [3, 3, 3, 'Compra Varilla',   '2025-07-03','PED003',200, 10,2000],
    [4, 4, 4, 'Compra Pintura',   '2025-07-04','PED004', 80, 20,1600],
    [5, 5, 5, 'Compra Tubos PVC', '2025-07-05','PED005', 60, 40,2400]
  ];
  compras.forEach(c => {
    db.run(
      `INSERT INTO compras (obra_id, insumo_id, proveedor_id, nombre, fecha, pedido, cantidad, precio, importe)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      c
    );
  });
});

db.close(err => {
  if (err) console.error('Error cerrando la DB:', err);
  else console.log('✅ Base de datos reinicializada correctamente con 5 ejemplos en cada tabla');
});
