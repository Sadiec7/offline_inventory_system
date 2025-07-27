// Mantenemos path porque otras funciones lo necesitan
const path = require('path');
// Solo removemos fs que no funciona en renderer empaquetado
// const fs   = require('fs');

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

async function navegar(seccion) {
  const cont = document.getElementById('contenido');
  try {
    // Usar directamente la ruta que sabemos funciona (basado en tu estructura)
    // Eliminamos el bucle que causa errores innecesarios
    const response = await fetch(`./${seccion}.html`);
    if (!response.ok) {
      throw new Error(`No se pudo cargar la vista ${seccion}: ${response.status}`);
    }
    const html = await response.text();
    cont.innerHTML = html;

    const scriptId = `view-${seccion}`;
    // Si ya cargamos el script, solo invocamos initXView
    if (document.getElementById(scriptId)) {
      const initFn = `init${capitalize(seccion)}View`;
      if (typeof window[initFn] === 'function') {
        window[initFn]();
      }
    } else {
      // Cargamos el script de la vista
      const scr = document.createElement('script');
      scr.src   = `js/${seccion}View.js`;
      scr.defer = true;
      scr.id    = scriptId;
      scr.onload = () => {
        const initFn = `init${capitalize(seccion)}View`;
        if (typeof window[initFn] === 'function') {
          window[initFn]();
        } else {
          console.warn(`${initFn} no está definido`);
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
  // 🚫 No ejecutar en la pantalla de login
  if (window.location.pathname.includes('login.html')) return;

  // 1) Revisar si hay usuario logueado y es superuser
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('currentUser'));
  } catch {}

  if (user && user.superuser === 1) {
    // Buscar el nav dentro del sidebar
    const nav = document.querySelector('#sidebar nav');
    if (nav) {
      // Crear el botón de usuarios con el mismo estilo que los otros
      const btnUsuarios = document.createElement('button');
      btnUsuarios.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-2.239" />
        </svg>
        Usuarios
      `;
      btnUsuarios.className = 'flex items-center w-full px-4 py-2 rounded-lg hover:bg-gray-100 transition';
      btnUsuarios.onclick = () => navegar('usuarios');

      // Buscar el botón de salir para insertarlo antes
      const btnSalir = nav.querySelector('button[onclick="confirmarCerrarSesion()"]');
      if (btnSalir) {
        nav.insertBefore(btnUsuarios, btnSalir);
      } else {
        // Si no encuentra el botón de salir, agregarlo al final
        nav.appendChild(btnUsuarios);
      }
    } else {
      console.warn('[layoutView] nav dentro del sidebar no encontrado');
    }
  }

  // 2) Iniciar en la sección Obras
  navegar('obras');
});