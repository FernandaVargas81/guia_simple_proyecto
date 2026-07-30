document.addEventListener('DOMContentLoaded', () => {
  const mapSearchInput = document.getElementById('map-search');
  const mapaVisual = document.getElementById('mapa-visual');
  const btnBuscarMapa = document.getElementById('btn-buscar-mapa');
  const formCita = document.getElementById('cita-form');
  const selectTramite = document.getElementById('cita-tramite');
  const inputFecha = document.getElementById('cita-fecha');
  const selectSede = document.getElementById('cita-sede');
  const containerRecordatorios = document.getElementById('recordatorios-container');

  const activeTramitesCard = document.getElementById('active-tramites-card');
  const tramitesActivosSection = document.getElementById('tramites-activos-section');
  const closeActivosBtn = document.getElementById('close-activos-btn');

  // ==================== MÉTRICAS REALES DESDE LA BASE DE DATOS ====================
  const pintarMetricas = (usuario) => {
    const cards = document.querySelectorAll('.metric-card');
    const metricHeaders = document.querySelectorAll('.metric-content h2');

    if (!usuario) {
      cards.forEach(card => {
        card.style.opacity = '0.4';
        card.style.pointerEvents = 'none';
        const overlay = document.createElement('div');
        overlay.className = "absolute inset-0 bg-white/40 flex items-center justify-center backdrop-blur-[1px]";
        overlay.innerHTML = `<span class="bg-stone-900 text-white text-[9px] font-bold px-2 py-1 rounded shadow-md uppercase tracking-wider">🔒 Regístrate para ver</span>`;
        card.appendChild(overlay);
      });
      return;
    }

    const stats = usuario.estadisticas || { horas: 0, activos: 0, completados: 0 };

    if (metricHeaders.length >= 3) {
      metricHeaders[0].textContent = `${stats.horas} Horas`;
      metricHeaders[1].innerHTML = `<span>${stats.activos} Activo${stats.activos !== 1 ? 's' : ''}</span> <span class="text-xs font-bold text-brand-orange underline">Ver listado ➔</span>`;
      metricHeaders[2].textContent = `${stats.completados} Completado${stats.completados !== 1 ? 's' : ''}`;
    }

    cards.forEach(card => {
      card.style.opacity = '1';
      card.style.pointerEvents = 'auto';
    });
  };

  // ==================== CITAS (persistidas por usuario en BD) ====================
  const renderCita = (cita) => {
    const el = document.createElement('div');
    el.className = "flex items-center justify-between border-b border-stone-100 pb-3 animate-scale-up";
    el.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5"></div>
        <div>
          <h3 class="text-xs font-bold text-stone-950">${cita.tramite}</h3>
          <p class="text-[10px] text-stone-400">${cita.fecha} — Sede: ${cita.sede}</p>
        </div>
      </div>
      <button class="text-stone-300 hover:text-red-500 transition-colors btn-eliminar"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
    `;

    el.querySelector('.btn-eliminar').addEventListener('click', async () => {
      await fetch(`${API_BASE}citas.php?id=${cita.id}`, { method: 'DELETE' });
      el.remove();
      if (window.showToast) window.showToast('Cita eliminada', 'success');
    });

    if (containerRecordatorios) containerRecordatorios.appendChild(el);
  };

  const cargarCitas = async () => {
    if (!containerRecordatorios) return;
    const res = await fetch(API_BASE + 'citas.php');
    if (!res.ok) return;
    const data = await res.json();
    containerRecordatorios.innerHTML = '';
    (data.citas || []).forEach(renderCita);
    if (window.lucide) window.lucide.createIcons();
  };

  if (formCita) {
    formCita.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!window.APP_USER) {
        if (window.showToast) window.showToast('Regístrate para agendar citas.', 'error');
        return;
      }

      const tramite = selectTramite.value;
      const fecha = inputFecha.value;
      const sede = selectSede.value;

      if (!tramite || !fecha || !sede) {
        if (window.showToast) window.showToast('Completa todos los campos de la cita.', 'error');
        return;
      }

      const res = await fetch(API_BASE + 'citas.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tramite, fecha, sede }),
      });

      if (!res.ok) {
        if (window.showToast) window.showToast('No se pudo guardar la cita.', 'error');
        return;
      }

      const data = await res.json();
      renderCita(data.cita);
      formCita.reset();
      if (window.showToast) window.showToast('Cita agregada a tu agenda', 'success');
      if (window.lucide) window.lucide.createIcons();
    });
  }

  // ==================== INTERACCION DE TRÁMITES ACTIVOS ====================
  if (activeTramitesCard && tramitesActivosSection) {
    activeTramitesCard.addEventListener('click', () => tramitesActivosSection.classList.toggle('hidden'));
  }
  if (closeActivosBtn && tramitesActivosSection) {
    closeActivosBtn.addEventListener('click', () => tramitesActivosSection.classList.add('hidden'));
  }

  // ==================== BÚSQUEDA DEL MAPA (consulta la tabla `oficinas`) ====================
  if (btnBuscarMapa && mapSearchInput && mapaVisual) {
    btnBuscarMapa.addEventListener('click', async () => {
      const searchVal = mapSearchInput.value.trim();
      const res = await fetch(`${API_BASE}oficinas.php?q=${encodeURIComponent(searchVal)}`);
      const data = await res.json();

      if (data.oficina) {
        mapaVisual.innerHTML = `
          <div class="absolute inset-0 bg-stone-200 flex flex-col items-center justify-center p-4 text-center animate-scale-up">
            <i data-lucide="map-pin" class="w-10 h-10 text-brand-orange animate-bounce"></i>
            <h4 class="font-bold text-stone-900 text-sm mt-2">${data.oficina.nombre}</h4>
            <p class="text-xs text-stone-500">${data.oficina.direccion}</p>
          </div>
          <div class="absolute bottom-4 right-4 bg-stone-950 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-md">Ubicación Fijada</div>
        `;
        if (window.lucide) window.lucide.createIcons();
      } else {
        if (window.showToast) window.showToast('Sede no encontrada. Intenta con "Tránsito" o "Pasaportes".', 'error');
      }
    });
  }

  document.addEventListener('sesion-lista', (e) => {
    pintarMetricas(e.detail.usuario);
    if (e.detail.usuario) cargarCitas();
  });
});
