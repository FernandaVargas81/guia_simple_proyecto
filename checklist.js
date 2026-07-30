document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('checklist');
  const badge = document.getElementById('progress-badge');
  if (!container) return;

  const tramiteId = container.dataset.tramite;

  const renderItem = (item) => {
    const label = document.createElement('label');
    label.className = "flex items-start gap-3 p-3 bg-stone-50 rounded-xl cursor-pointer hover:bg-stone-100/50 transition-all";
    label.innerHTML = `
      <input type="checkbox" data-id="${item.id}" class="mt-1 w-4 h-4 rounded text-brand-orange focus:ring-brand-orange border-stone-300" ${item.completado ? 'checked' : ''}>
      <div>
        <p class="text-xs font-bold text-stone-950">${item.titulo}</p>
        <p class="text-[10px] text-stone-400">${item.descripcion || ''}</p>
      </div>
    `;
    if (item.completado) label.classList.add('opacity-60', 'line-through');

    label.querySelector('input').addEventListener('change', async (e) => {
      const checkbox = e.target;
      if (!window.APP_USER) {
        checkbox.checked = !checkbox.checked;
        if (window.showToast) window.showToast('Regístrate o inicia sesión para guardar tu progreso.', 'error');
        return;
      }

      const res = await fetch(API_BASE + 'checklist.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: item.id, completado: checkbox.checked }),
      });

      if (!res.ok) {
        checkbox.checked = !checkbox.checked;
        if (window.showToast) window.showToast('No se pudo guardar tu progreso.', 'error');
        return;
      }

      label.classList.toggle('opacity-60', checkbox.checked);
      label.classList.toggle('line-through', checkbox.checked);
      updateProgress();
    });

    container.appendChild(label);
  };

  const updateProgress = () => {
    const inputs = container.querySelectorAll('input[type="checkbox"]');
    const total = inputs.length;
    const completed = Array.from(inputs).filter(i => i.checked).length;
    const percent = total ? Math.round((completed / total) * 100) : 0;
    if (badge) badge.textContent = `${percent}% Completado`;
  };

  const cargarChecklist = async () => {
    try {
      const res = await fetch(`${API_BASE}checklist.php?tramite_id=${encodeURIComponent(tramiteId)}`);
      const data = await res.json();
      container.innerHTML = '';
      (data.items || []).forEach(renderItem);
      updateProgress();
      if (window.lucide) window.lucide.createIcons();
    } catch (err) {
      container.innerHTML = `<p class="text-xs text-red-500 font-bold">No se pudo conectar con la base de datos.</p>`;
    }
  };

  document.addEventListener('sesion-lista', cargarChecklist, { once: true });
});
