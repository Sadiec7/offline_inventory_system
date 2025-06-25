const fs = require('fs');
const path = require('path');

const VIEWS_DIR = path.join(process.cwd(), 'src', 'views');

function navegar(seccion) {
  const cont = document.getElementById('contenido');
  try {
    const html = fs.readFileSync(path.join(VIEWS_DIR, `${seccion}.html`), 'utf8');
    cont.innerHTML = html;

    const scriptId = `view-${seccion}`;

    // Si ya existe el script, ejecutamos la función global asociada
    if (document.getElementById(scriptId)) {
      console.log(`[layoutView] Script ${scriptId} ya estaba cargado. Ejecutando init${capitalize(seccion)}View...`);
      if (window[`init${capitalize(seccion)}View`]) {
        window[`init${capitalize(seccion)}View`]();
      }
    } else {
      const scr = document.createElement('script');
      scr.src = `js/${seccion}View.js`;
      scr.defer = true;
      scr.id = scriptId;
      scr.onload = () => {
        console.log(`[layoutView] Script ${scriptId} cargado correctamente`);
        if (window[`init${capitalize(seccion)}View`]) {
          window[`init${capitalize(seccion)}View`]();
        } else {
          console.warn(`init${capitalize(seccion)}View no está definido`);
        }
      };
      document.body.appendChild(scr);
    }

  } catch (e) {
    cont.innerHTML = `<p class="text-red-600">Error cargando ${seccion}: ${e.message}</p>`;
    console.error(`[layoutView] Error al cargar ${seccion}:`, e);
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function cerrarSesion() {
  window.location = 'login.html';
}

window.addEventListener('DOMContentLoaded', () => navegar('obras'));
