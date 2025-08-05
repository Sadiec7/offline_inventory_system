// loginView.js
const loginCtrl = require('../controllers/loginController');

window.addEventListener('DOMContentLoaded', () => {
  const btn    = document.getElementById('btn-login');
  const errMsg = document.getElementById('login-error');

  btn.onclick = () => {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    loginCtrl.autenticar(username, password, (err, user) => {
      if (err || !user) {
        errMsg.classList.remove('hidden');
      } else {
        errMsg.classList.add('hidden');
        // Guardamos el objeto completo (incluye superuser)
        localStorage.setItem('currentUser', JSON.stringify(user));
        window.location = 'layout.html';
      }
    });
  };
});
