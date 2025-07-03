const fs   = require('fs');
const path = require('path');
const VIEWS_DIR = path.join(process.cwd(), 'src', 'views');

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function navegar(seccion) {
  const cont = document.getElementById('contenido');
  try {
    // Carga el HTML de la vista
    const html = fs.readFileSync(path.join(VIEWS_DIR, `${seccion}.html`), 'utf8');
    cont.innerHTML = html;

    const scriptId = `view-${seccion}`;
    // Si ya cargamos el script, solo invocamos initXView
    if (document.getElementById(scriptId)) {
      if (window[`init${capitalize(seccion)}View`]) {
        window[`init${capitalize(seccion)}View`]();
      }
    } else {
      // Cargamos el script de la vista
      const scr = document.createElement('script');
      scr.src   = `js/${seccion}View.js`;
      scr.defer = true;
      scr.id    = scriptId;
      scr.onload = () => {
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

function cerrarSesion() {
  localStorage.removeItem('currentUser');
  window.location = 'login.html';
}

window.addEventListener('DOMContentLoaded', () => {
  // 1) Revisar si hay usuario logueado y es superuser
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('currentUser'));
  } catch {}
  if (user && user.superuser === 1) {
    const nav = document.getElementById('main-nav');
    const btn = document.createElement('button');
    btn.textContent = 'Usuarios';
    btn.className   = 'hover:underline';
    btn.onclick     = () => navegar('usuarios');
    // Insertarlo antes del botón Salir
    const salir = Array.from(nav.children)
                       .find(el => el.textContent === 'Salir');
    nav.insertBefore(btn, salir);
  }

  // 2) Iniciar en la sección Obras
  navegar('obras');
});
