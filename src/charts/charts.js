// charts.js
// ------------
// Debido a que en main.js tenemos `nodeIntegration: true` y `contextIsolation: false`,
// Podemos usar require() directamente en este renderer para acceder a la BD:

const path = require('path');
// Tu db.js está en src/database/db.js, así que desde src/charts/ haces require('../database/db')
const db = require('../database/db');

document.addEventListener('DOMContentLoaded', () => {
  // 1) Capturamos el botón “Regresar”
  const btnRegresar = document.getElementById('btn-regresar');

  if (!btnRegresar) {
    console.error('⚠️ No se encontró el botón #btn-regresar en charts.html');
  } else {
    // 2) Al hacer clic, navegamos a index.html (que está 2 niveles arriba)
    btnRegresar.addEventListener('click', () => {
      // Desde src/charts/charts.html → para llegar a index.html: subir 2 niveles, luego index.html
      window.location.href = '../index.html';
    });
  }

  // 3) Obtener todos los productos desde SQLite
  let productos = [];
  try {
    productos = db.obtenerProductos();
    console.log('Productos para gráficas:', productos);
  } catch (err) {
    console.error('Error al obtener productos para gráficas:', err);
    // Mostramos un mensaje mínimo si falla
    document.body.innerHTML = `
      <div class="p-6 text-center text-red-600">
        Error al cargar datos para las gráficas. Revisa la consola para más detalles.
      </div>
    `;
    return;
  }

  // 4) Procesar los datos por categoría
  const dataPorCategoria = {};
  productos.forEach(p => {
    const cat = p.categoria || 'Sin Categoría';
    if (!dataPorCategoria[cat]) {
      dataPorCategoria[cat] = { cantidadTotal: 0, sumaPrecios: 0, countProductos: 0 };
    }
    dataPorCategoria[cat].cantidadTotal += p.cantidad;
    dataPorCategoria[cat].sumaPrecios += p.precio;
    dataPorCategoria[cat].countProductos += 1;
  });

  // Convertir el mapa en arreglos para Chart.js
  const categorias = Object.keys(dataPorCategoria);
  const cantidadPorCategoria = categorias.map(cat => dataPorCategoria[cat].cantidadTotal);
  const distribucionPorCategoria = categorias.map(cat => dataPorCategoria[cat].countProductos);
  const precioPromedioPorCategoria = categorias.map(cat => {
    return dataPorCategoria[cat].sumaPrecios / dataPorCategoria[cat].countProductos;
  });

  // 5) Graficar con Chart.js

  // 5.1 Bar Chart: Cantidad total por categoría
  const ctxCantidad = document.getElementById('chart-cantidad-categoria').getContext('2d');
  new Chart(ctxCantidad, {
    type: 'bar',
    data: {
      labels: categorias,
      datasets: [{
        label: 'Cantidad Total',
        data: cantidadPorCategoria,
        backgroundColor: categorias.map(() => 'rgba(59, 130, 246, 0.6)'),
        borderColor: categorias.map(() => 'rgba(59, 130, 246, 1)'),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 },
          title: { display: true, text: 'Cantidad' }
        },
        x: {
          title: { display: true, text: 'Categoría' }
        }
      }
    }
  });

  // 5.2 Pie Chart: Distribución de productos (por categoría)
  const ctxDistribucion = document.getElementById('chart-distribucion-categoria').getContext('2d');
  new Chart(ctxDistribucion, {
    type: 'pie',
    data: {
      labels: categorias,
      datasets: [{
        label: 'Cantidad de Productos',
        data: distribucionPorCategoria,
        backgroundColor: [
          'rgba(59, 130, 246, 0.6)',
          'rgba(16, 185, 129, 0.6)',
          'rgba(234, 179, 8, 0.6)',
          'rgba(220, 38, 38, 0.6)',
          'rgba(168, 85, 247, 0.6)',
          'rgba(239, 68, 68, 0.6)',
          'rgba(34, 197, 94, 0.6)',
          'rgba(236, 72, 153, 0.6)',
          'rgba(14, 165, 233, 0.6)',
          'rgba(249, 115, 22, 0.6)'
        ].slice(0, categorias.length),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'right' }
      }
    }
  });

  // 5.3 Bar Chart: Precio promedio vs Stock por categoría (dos ejes Y)
  const ctxPrecioStock = document.getElementById('chart-precio-stock').getContext('2d');
  new Chart(ctxPrecioStock, {
    type: 'bar',
    data: {
      labels: categorias,
      datasets: [
        {
          label: 'Precio Promedio',
          data: precioPromedioPorCategoria,
          backgroundColor: categorias.map(() => 'rgba(16, 185, 129, 0.6)'),
          borderColor: categorias.map(() => 'rgba(16, 185, 129, 1)'),
          borderWidth: 1,
          yAxisID: 'y1'
        },
        {
          label: 'Stock Total',
          data: cantidadPorCategoria,
          backgroundColor: categorias.map(() => 'rgba(59, 130, 246, 0.6)'),
          borderColor: categorias.map(() => 'rgba(59, 130, 246, 1)'),
          borderWidth: 1,
          yAxisID: 'y'
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          type: 'linear',
          position: 'left',
          beginAtZero: true,
          title: { display: true, text: 'Stock' }
        },
        y1: {
          type: 'linear',
          position: 'right',
          beginAtZero: true,
          grid: { drawOnChartArea: false },
          title: { display: true, text: 'Precio Promedio' }
        },
        x: {
          title: { display: true, text: 'Categoría' }
        }
      }
    }
  });
});
