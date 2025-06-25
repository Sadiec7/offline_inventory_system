const XLSX = require('xlsx');
function actualizarExcel(items) {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(items);
  XLSX.utils.book_append_sheet(wb, ws, 'Insumos');
  XLSX.writeFile(wb, 'inventario.xlsx');
}
module.exports = { actualizarExcel };
