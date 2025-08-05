// preload.js
const { contextBridge } = require('electron');
const fs = require('fs');
const path = require('path');

const loginController = require('./src/controllers/loginController');
const obraController  = require('./src/controllers/obraController');
const insumoController= require('./src/controllers/insumoController');

contextBridge.exposeInMainWorld('api', {
  // login / datos
  validarLogin: loginController.validarUsuario,

  // Insumos
  guardarInsumo: insumoController.guardar,
  eliminarInsumo: insumoController.eliminar,
  listarInsumos: insumoController.listar,

  // Obras
  guardarObra: obraController.guardar,
  eliminarObra: obraController.eliminar,
  listarObras: obraController.listar,

  // Nueva función: lee un HTML de src/views
  loadView: (viewName) => {
    const file = path.join(__dirname, 'src', 'views', `${viewName}.html`);
    return fs.readFileSync(file, 'utf8');
  }
});
