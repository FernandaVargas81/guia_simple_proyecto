document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('tramites-grid');
  const searchInput = document.getElementById('main-search');
  const clearBtn = document.getElementById('clear-search-btn');
  const catButtons = document.querySelectorAll('.cat-btn');

  let TRAMITES = [];

  const renderCards = (list) => {
    if (!grid) return;
    grid.innerHTML = '';

    if (list.length === 0) {
      grid.innerHTML = `<div class="col-span-full py-12 text-center text-stone-400 font-bold">No se encontraron trámites.</div>`;
      return;
    }

    list.forEach(t => {
      const card = document.createElement('div');
      card.className = "bg-white border border-stone-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4";
      card.innerHTML = `
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div class="w-10 h-10 rounded-xl bg-orange-50 text-brand-orange flex items-center justify-center">
              <i data-lucide="${t.icono}" class="w-5 h-5"></i>
            </div>
            <span class="text-[10px] font-bold uppercase tracking-wider text-stone-400 bg-stone-100 px-2.5 py-1 rounded-full">${t.categoria}</span>
          </div>
          <div class="space-y-1">
            <h3 class="font-display font-black text-lg text-stone-950 leading-tight">${t.titulo}</h3>
            <p class="text-xs text-stone-500 leading-relaxed line-clamp-3">${t.descripcion}</p>
          </div>
        </div>
        <div class="flex items-center justify-between pt-2 border-t border-stone-100">
          <div class="flex items-center gap-3 text-[11px] text-stone-400 font-medium">
            <span class="flex items-center gap-1"><i data-lucide="clock" class="w-3.5 h-3.5"></i> ${t.duracion}</span>
            <span class="flex items-center gap-1"><i data-lucide="bar-chart-2" class="w-3.5 h-3.5"></i> ${t.dificultad}</span>
          </div>
          <button data-url="${t.url}" class="btn-ver-guia text-xs font-bold text-brand-orange hover:text-brand-orange-hover flex items-center gap-1 transition-all">
            Ver guía <i data-lucide="chevron-right" class="w-4 h-4"></i>
          </button>
        </div>
      `;
      grid.appendChild(card);
    });

    // ================== RESTRICCIÓN DE ACCESO (verificada contra la sesión real en BD) ==================
    document.querySelectorAll('.btn-ver-guia').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const res = await fetch(API_BASE + 'session.php');
        const data = await res.json();

        if (!data.usuario) {
          const modal = document.getElementById('register-modal');
          if (modal) modal.classList.remove('hidden');
          if (window.showToast) window.showToast('Debes registrarte gratis para iniciar este trámite.', 'error');
        } else {
          window.location.href = btn.getAttribute('data-url');
        }
      });
    });

    if (window.lucide) window.lucide.createIcons();
  };

  const cargarTramites = async () => {
    try {
      const res = await fetch(API_BASE + 'tramites.php');
      const data = await res.json();
      TRAMITES = data.tramites || [];
      renderCards(TRAMITES);
    } catch (err) {
      if (grid) grid.innerHTML = `<div class="col-span-full py-12 text-center text-red-500 font-bold">No se pudo conectar con la base de datos.</div>`;
    }
  };

  cargarTramites();

  // Manejo de Categorías
  catButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      catButtons.forEach(b => b.className = "cat-btn px-4 py-1.5 rounded-full text-xs font-bold transition-all bg-stone-100 text-stone-700");
      btn.className = "cat-btn px-4 py-1.5 rounded-full text-xs font-bold transition-all bg-brand-orange text-white";
      const cat = btn.getAttribute('data-cat');
      renderCards(cat === 'todas' ? TRAMITES : TRAMITES.filter(t => t.categoria === cat));
    });
  });

  // Buscador
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const val = e.target.value.toLowerCase().trim();
      if (val.length > 0) {
        if (clearBtn) clearBtn.classList.remove('hidden');
        renderCards(TRAMITES.filter(t => t.titulo.toLowerCase().includes(val)));
      } else {
        if (clearBtn) clearBtn.classList.add('hidden');
        renderCards(TRAMITES);
      }
    });
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearBtn.classList.add('hidden');
        renderCards(TRAMITES);
      });
    }
  }
});
