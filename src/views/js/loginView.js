// src/views/js/loginView.js
const path = require('path');
const ctrl = require(path.join(process.cwd(), 'src', 'controllers', 'loginController.js'));

window.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('btn-login');
  const err = document.getElementById('login-error');

  btn.onclick = () => {
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value.trim();
    if (!u || !p) {
      err.textContent = 'Llena ambos campos';
      err.classList.remove('hidden');
      return;
    }
    ctrl.validarUsuario(u, p, ok => {
      if (ok) window.location = 'layout.html';
      else err.classList.remove('hidden');
    });
  };
});
