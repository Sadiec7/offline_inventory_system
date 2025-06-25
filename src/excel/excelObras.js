const XLSX = require('xlsx');
function actualizarExcel(obras) {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(obras);
  XLSX.utils.book_append_sheet(wb, ws, 'Obras');
  XLSX.writeFile(wb, 'inventario.xlsx');
}
module.exports = { actualizarExcel };
