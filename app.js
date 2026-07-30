const API_BASE = window.location.pathname.includes('/html/') ? '../api/' : 'api/';

document.addEventListener('DOMContentLoaded', () => {
  const openRegisterBtn = document.getElementById('open-register-btn');
  const closeRegisterBtn = document.getElementById('close-register-btn');
  const registerModal = document.getElementById('register-modal');
  const registerForm = document.getElementById('register-form');
  const userGreeting = document.getElementById('user-greeting');
  const userRoleText = userGreeting ? userGreeting.nextElementSibling : null;

  const nameGroup = document.getElementById('reg-name-group');
  const confirmGroup = document.getElementById('reg-pass-confirm-group');
  const modalTitle = document.getElementById('auth-modal-title');
  const modalSubtitle = document.getElementById('auth-modal-subtitle');
  const submitBtn = document.getElementById('auth-submit-btn');
  const toggleAuthMode = document.getElementById('toggle-auth-mode');

  let authMode = 'register'; // 'register' | 'login'
  let usuarioActual = null;

  // ==================== FUNCIONES GLOBALES DE ALERTAS ====================
  window.showToast = function(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = "p-4 rounded-2xl bg-white border border-stone-200 shadow-xl flex items-center gap-3 animate-scale-up max-w-sm pointer-events-auto cursor-pointer";
    let icon = type === 'success' ? 'check-circle-2' : type === 'error' ? 'alert-triangle' : 'info';
    let color = type === 'success' ? 'text-teal-600' : type === 'error' ? 'text-red-500' : 'text-blue-500';

    toast.innerHTML = `
      <div class="p-2 rounded-xl bg-stone-50 ${color}"><i data-lucide="${icon}" class="w-5 h-5"></i></div>
      <span class="text-xs font-bold text-stone-700">${message}</span>
    `;

    container.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();
    setTimeout(() => { toast.classList.add('opacity-0', 'transition-opacity'); setTimeout(() => toast.remove(), 300); }, 3500);
  };

  window.showFieldError = function(inputId, message) {
    const input = document.getElementById(inputId);
    if (input) {
      input.classList.add('border-red-500', 'bg-red-50');
      const tooltip = input.nextElementSibling;
      if (tooltip && tooltip.classList.contains('error-tooltip')) {
        tooltip.innerHTML = `<div class="flex items-center gap-1"><i data-lucide="alert-circle" class="w-3.5 h-3.5"></i> ${message}</div>`;
        tooltip.classList.remove('hidden');
      }
    }
  };

  window.clearValidationErrors = function() {
    document.querySelectorAll('.error-tooltip').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('input, textarea').forEach(el => el.classList.remove('border-red-500', 'bg-red-50'));
  };

  // ==================== SESIÓN (respaldada por la base de datos) ====================
  window.APP_USER = null;

  const aplicarSesion = (usuario) => {
    usuarioActual = usuario;
    window.APP_USER = usuario;

    if (usuario) {
      if (userGreeting) userGreeting.textContent = `¡Hola, ${usuario.nombre.split(' ')[0]}!`;
      if (userRoleText) userRoleText.textContent = 'Ciudadano';
      if (openRegisterBtn) {
        openRegisterBtn.innerHTML = `<i data-lucide="log-out" class="w-4 h-4"></i> Salir`;
        openRegisterBtn.classList.replace('bg-brand-orange', 'bg-stone-200');
        openRegisterBtn.classList.replace('text-white', 'text-stone-700');
        openRegisterBtn.classList.replace('hover:bg-brand-orange-hover', 'hover:bg-stone-300');
        if (window.lucide) window.lucide.createIcons();
      }
    }

    document.dispatchEvent(new CustomEvent('sesion-lista', { detail: { usuario } }));
  };

  const comprobarSesion = async () => {
    try {
      const res = await fetch(API_BASE + 'session.php');
      const data = await res.json();
      aplicarSesion(data.usuario);
    } catch (err) {
      aplicarSesion(null);
    }
  };

  comprobarSesion();

  // ==================== MODO DEL MODAL: REGISTRO / LOGIN ====================
  const setAuthMode = (mode) => {
    authMode = mode;
    window.clearValidationErrors();

    const esLogin = mode === 'login';
    if (nameGroup) nameGroup.classList.toggle('hidden', esLogin);
    if (confirmGroup) confirmGroup.classList.toggle('hidden', esLogin);
    if (modalTitle) modalTitle.textContent = esLogin ? 'Inicia Sesión' : 'Crear tu Cuenta';
    if (modalSubtitle) modalSubtitle.textContent = esLogin ? 'Ingresa con tu correo y contraseña.' : 'Guarda tus avances y sincroniza tu calendario.';
    if (submitBtn) submitBtn.textContent = esLogin ? 'Iniciar Sesión' : 'Crear Cuenta e Ingresar';
    if (toggleAuthMode) toggleAuthMode.textContent = esLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión';
  };

  if (toggleAuthMode) {
    toggleAuthMode.addEventListener('click', (e) => {
      e.preventDefault();
      setAuthMode(authMode === 'register' ? 'login' : 'register');
    });
  }

  // ABRIR/CERRAR MODAL O SESIÓN
  if (openRegisterBtn) {
    openRegisterBtn.addEventListener('click', async () => {
      if (usuarioActual) {
        await fetch(API_BASE + 'logout.php', { method: 'POST' });
        window.location.reload();
      } else {
        setAuthMode('register');
        if (registerModal) registerModal.classList.remove('hidden');
      }
    });
  }

  if (closeRegisterBtn && registerModal) {
    closeRegisterBtn.addEventListener('click', () => {
      registerModal.classList.add('hidden');
      window.clearValidationErrors();
    });
  }

  // ==================== ENVÍO DEL FORMULARIO (REGISTRO O LOGIN) ====================
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('reg-email').value.trim();
      const pass = document.getElementById('reg-pass').value;
      window.clearValidationErrors();

      if (authMode === 'login') {
        if (!email || !email.includes('@')) { window.showFieldError('reg-email', 'Correo electrónico inválido.'); return; }
        if (!pass) { window.showFieldError('reg-pass', 'Ingresa tu contraseña.'); return; }

        try {
          const res = await fetch(API_BASE + 'login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: pass }),
          });
          const data = await res.json();
          if (!res.ok) {
            window.showToast((data.errors && data.errors.login) || 'No se pudo iniciar sesión.', 'error');
            return;
          }
          if (registerModal) registerModal.classList.add('hidden');
          window.location.href = window.location.pathname.includes('/html/') ? 'panel.html' : 'html/panel.html';
        } catch (err) {
          window.showToast('No se pudo conectar con el servidor.', 'error');
        }
        return;
      }

      const name = document.getElementById('reg-name').value.trim();
      const passConfirm = document.getElementById('reg-pass-confirm').value;

      let valid = true;
      if (!name || name.length < 3) { window.showFieldError('reg-name', 'Ingresa tu nombre completo.'); valid = false; }
      if (!email || !email.includes('@')) { window.showFieldError('reg-email', 'Correo electrónico inválido.'); valid = false; }
      if (pass.length < 6) { window.showFieldError('reg-pass', 'Mínimo 6 caracteres.'); valid = false; }
      if (pass !== passConfirm) { window.showFieldError('reg-pass-confirm', 'Las contraseñas no coinciden.'); valid = false; }

      if (!valid) {
        window.showToast('Revisa los campos marcados en rojo.', 'error');
        return;
      }

      try {
        const res = await fetch(API_BASE + 'register.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre: name, email, password: pass, password_confirm: passConfirm }),
        });
        const data = await res.json();

        if (!res.ok) {
          if (data.errors) {
            Object.entries(data.errors).forEach(([campo, msg]) => {
              const inputId = campo === 'password' ? 'reg-pass' : campo === 'password_confirm' ? 'reg-pass-confirm' : `reg-${campo}`;
              window.showFieldError(inputId, msg);
            });
          }
          window.showToast('Revisa los campos marcados en rojo.', 'error');
          return;
        }

        if (registerModal) registerModal.classList.add('hidden');
        window.location.href = window.location.pathname.includes('/html/') ? 'panel.html' : 'html/panel.html';
      } catch (err) {
        window.showToast('No se pudo conectar con el servidor.', 'error');
      }
    });
  }

  if (window.lucide) window.lucide.createIcons();
});
