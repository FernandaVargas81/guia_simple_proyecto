document.addEventListener('DOMContentLoaded', () => {
  const opinionForm = document.getElementById('comunidad-form');
  const opinionInput = opinionForm ? opinionForm.querySelector('textarea') : null;
  const contenedorConsejos = document.getElementById('consejos-container');

  const tiempoRelativo = (fechaStr) => {
    const diffMs = Date.now() - new Date(fechaStr.replace(' ', 'T')).getTime();
    const minutos = Math.floor(diffMs / 60000);
    if (minutos < 1) return 'Hace un momento';
    if (minutos < 60) return `Hace ${minutos} min`;
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `Hace ${horas} h`;
    return `Hace ${Math.floor(horas / 24)} d`;
  };

  const renderConsejo = (consejo, alPrincipio = false) => {
    if (!contenedorConsejos) return;
    const inicial = consejo.autor_nombre.charAt(0).toUpperCase();

    const el = document.createElement('div');
    el.className = "bg-white border border-stone-200/80 p-5 rounded-2xl shadow-sm space-y-3 animate-scale-up";
    el.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-orange-100 text-brand-orange flex items-center justify-center font-bold text-xs">
            ${inicial}
          </div>
          <div>
            <p class="text-xs font-bold text-stone-900">${consejo.autor_nombre}</p>
            <p class="text-[10px] text-stone-400">${tiempoRelativo(consejo.created_at)}</p>
          </div>
        </div>
      </div>
      <p class="text-xs text-stone-600 leading-relaxed">"${consejo.mensaje}"</p>
    `;

    if (alPrincipio) contenedorConsejos.prepend(el);
    else contenedorConsejos.appendChild(el);
  };

  const cargarConsejos = async () => {
    if (!contenedorConsejos) return;
    const res = await fetch(API_BASE + 'comunidad.php');
    if (!res.ok) return;
    const data = await res.json();
    contenedorConsejos.innerHTML = '';
    (data.consejos || []).forEach(c => renderConsejo(c));
  };

  cargarConsejos();

  if (opinionForm && opinionInput) {
    opinionInput.addEventListener('input', () => {
      opinionInput.classList.remove('border-red-500', 'bg-red-50');
    });

    opinionForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const texto = opinionInput.value.trim();
      if (!texto) {
        if (window.showToast) window.showToast('No puedes publicar un mensaje vacío.', 'error');
        opinionInput.classList.add('border-red-500', 'bg-red-50');
        return;
      }

      const res = await fetch(API_BASE + 'comunidad.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: texto }),
      });

      if (!res.ok) {
        if (window.showToast) window.showToast('No se pudo publicar el consejo.', 'error');
        return;
      }

      const data = await res.json();
      renderConsejo(data.consejo, true);
      opinionInput.value = '';
      if (window.showToast) window.showToast('¡Consejo publicado con éxito!', 'success');
    });
  }
});
