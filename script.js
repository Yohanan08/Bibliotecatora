/* ==================================================================
   BIBLIOTECA TORÁ — script.js
   Arquitectura: módulos independientes con responsabilidad única.
   Cada módulo se inicializa desde App.init() al final del archivo.
   Pensado para escalar a las 54 Parashot y todas sus Aliyot.
   ================================================================== */

/* ==================================================================
   MÓDULO 0 — DATOS
   Fuente única de datos de Parashot y Aliyot. Aquí solo se incluye
   la estructura y un registro de ejemplo (Bereshit). No se rellena
   contenido bíblico/teológico: cada campo de texto queda como
   cadena vacía o marcador, listo para ser completado.
   ================================================================== */
const DataModule = (() => {

  /** Lista completa de las 54 Parashot (nombre + metadatos básicos).
   *  Solo título/orden; el contenido detallado vive en `parashaDetails`. */
  const parashotIndex = [
    { id: 1, nombre: "Bereshit" }, { id: 2, nombre: "Noaj" }, { id: 3, nombre: "Lej Lejá" },
    { id: 4, nombre: "Vayerá" }, { id: 5, nombre: "Jayé Sará" }, { id: 6, nombre: "Toldot" },
    { id: 7, nombre: "Vayetzé" }, { id: 8, nombre: "Vayishlaj" }, { id: 9, nombre: "Vayeshev" },
    { id: 10, nombre: "Miketz" }, { id: 11, nombre: "Vayigash" }, { id: 12, nombre: "Vayejí" },
    { id: 13, nombre: "Shemot" }, { id: 14, nombre: "Vaerá" }, { id: 15, nombre: "Bo" },
    { id: 16, nombre: "Beshalaj" }, { id: 17, nombre: "Yitró" }, { id: 18, nombre: "Mishpatim" },
    { id: 19, nombre: "Terumá" }, { id: 20, nombre: "Tetzavé" }, { id: 21, nombre: "Ki Tisá" },
    { id: 22, nombre: "Vayakhel" }, { id: 23, nombre: "Pekudei" }, { id: 24, nombre: "Vayikrá" },
    { id: 25, nombre: "Tzav" }, { id: 26, nombre: "Shemini" }, { id: 27, nombre: "Tazría" },
    { id: 28, nombre: "Metzorá" }, { id: 29, nombre: "Ajarei Mot" }, { id: 30, nombre: "Kedoshim" },
    { id: 31, nombre: "Emor" }, { id: 32, nombre: "Behar" }, { id: 33, nombre: "Bejukotai" },
    { id: 34, nombre: "Bamidbar" }, { id: 35, nombre: "Nasó" }, { id: 36, nombre: "Behaalotjá" },
    { id: 37, nombre: "Shelaj" }, { id: 38, nombre: "Koraj" }, { id: 39, nombre: "Jukat" },
    { id: 40, nombre: "Balak" }, { id: 41, nombre: "Pinjás" }, { id: 42, nombre: "Matot" },
    { id: 43, nombre: "Masei" }, { id: 44, nombre: "Devarim" }, { id: 45, nombre: "Vaetjanán" },
    { id: 46, nombre: "Ekev" }, { id: 47, nombre: "Reé" }, { id: 48, nombre: "Shoftim" },
    { id: 49, nombre: "Ki Tetzé" }, { id: 50, nombre: "Ki Tavó" }, { id: 51, nombre: "Nitzavim" },
    { id: 52, nombre: "Vayelej" }, { id: 53, nombre: "Haazinu" }, { id: 54, nombre: "Vezot Haberajá" },
  ];

  /** Plantilla vacía reutilizable para cada Aliyá (las 7 por Parashá). */
  const buildEmptyAliyah = (numero) => ({
    numero,
    titulo: "",
    referencia: "",
    bloques: {
      "texto-hebreo": "",
      "fonetica": "",
      "traduccion-literal": "",
      "analisis-palabra": "",
      "comentario-peshat": "",
      "comentario-midrashico": "",
      "tipologia-mesianica": "",
      "cumplimiento-yeshua": "",
      "profundizacion": "",
      "aplicacion-practica": "",
      "resumen": "",
      "preguntas-grupo": [],
      "recursos-adicionales": [],
    }
  });

  /** Detalle completo por Parashá. Se define perezosamente: solo
   *  Bereshit trae datos de demostración (los del diseño original);
   *  el resto se genera vacío bajo demanda con `getParashaDetail`. */
  const parashaDetails = {
    1: {
      id: 1,
      nombre: "Bereshit",
      hebreo: "בְּרֵאשִׁית",
      significado: "«En el principio»",
      versiculos: "Bereshit 1:1 – 6:8",
      resumenGeneral: "",
      temaCentral: "",
      versiculoClave: "",
      yeshuaRevelado: "",
      introduccion: "",
      objetivos: [
        "Espacio reservado para el primer objetivo de estudio de esta Parashá.",
        "Espacio reservado para el segundo objetivo de estudio.",
        "Espacio reservado para el tercer objetivo de estudio.",
      ],
      haftarah: { referencia: "", resumen: "" },
      britHadasha: { referencia: "", resumen: "" },
      impactoProfetico: "",
      aliyot: Array.from({ length: 7 }, (_, i) => buildEmptyAliyah(i + 1)),
    }
  };

  /** Devuelve el detalle de una Parashá; si no existe aún en caché,
   *  genera una estructura vacía completa (escalable a las 54). */
  function getParashaDetail(id) {
    if (parashaDetails[id]) return parashaDetails[id];
    const base = parashotIndex.find((p) => p.id === id);
    if (!base) return null;
    const generated = {
      id: base.id,
      nombre: base.nombre,
      hebreo: "",
      significado: "",
      versiculos: "",
      resumenGeneral: "",
      temaCentral: "",
      versiculoClave: "",
      yeshuaRevelado: "",
      introduccion: "",
      objetivos: [
        "Espacio reservado para el primer objetivo de estudio de esta Parashá.",
        "Espacio reservado para el segundo objetivo de estudio.",
        "Espacio reservado para el tercer objetivo de estudio.",
      ],
      haftarah: { referencia: "", resumen: "" },
      britHadasha: { referencia: "", resumen: "" },
      impactoProfetico: "",
      aliyot: Array.from({ length: 7 }, (_, i) => buildEmptyAliyah(i + 1)),
    };
    parashaDetails[id] = generated;
    return generated;
  }

  return { parashotIndex, getParashaDetail };
})();


/* ==================================================================
   MÓDULO 1 — UTILIDADES
   ================================================================== */
const Utils = (() => {
  const qs = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const debounce = (fn, wait = 200) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  };

  const escapeHtml = (str = "") =>
    str.replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));

  return { qs, qsa, debounce, escapeHtml };
})();


/* ==================================================================
   MÓDULO 2 — MENÚ MÓVIL (hamburguesa + menú lateral)
   ================================================================== */
const NavModule = (() => {
  function init() {
    const toggle = Utils.qs("#navToggle");
    const list = Utils.qs("#mainNavList");
    if (toggle && list) {
      toggle.addEventListener("click", () => {
        const isOpen = list.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", String(isOpen));
      });
    }

    const sidebar = Utils.qs("#sidebarLeft");
    const overlay = Utils.qs("#sidebarOverlay");
    const closeBtn = Utils.qs("#sidebarLeftClose");

    const openSidebar = () => {
      sidebar?.classList.add("is-open");
      overlay?.classList.add("is-visible");
      overlay?.setAttribute("aria-hidden", "false");
    };
    const closeSidebar = () => {
      sidebar?.classList.remove("is-open");
      overlay?.classList.remove("is-visible");
      overlay?.setAttribute("aria-hidden", "true");
    };

    closeBtn?.addEventListener("click", closeSidebar);
    overlay?.addEventListener("click", closeSidebar);

    // Atajo expuesto para que otros módulos (p.ej. al elegir una Parashá en móvil) puedan cerrar el panel
    return { openSidebar, closeSidebar };
  }
  return { init };
})();


/* ==================================================================
   MÓDULO 3 — MODO OSCURO / CLARO
   ================================================================== */
const ThemeModule = (() => {
  const STORAGE_KEY = "biblioteca-tora-theme";

  function apply(theme) {
    document.body.dataset.theme = theme;
    Utils.qsa("[aria-pressed]", document).forEach((btn) => {
      if (btn.id === "darkModeToggle" || btn.id === "toolDarkMode") {
        btn.setAttribute("aria-pressed", String(theme === "dark"));
      }
    });
  }

  function toggle() {
    const current = document.body.dataset.theme === "dark" ? "light" : "dark";
    apply(current);
    try { localStorage.setItem(STORAGE_KEY, current); } catch (_) { /* almacenamiento no disponible */ }
  }

  function init() {
    let saved = "dark";
    try { saved = localStorage.getItem(STORAGE_KEY) || "dark"; } catch (_) { /* ignorar */ }
    apply(saved);

    Utils.qs("#darkModeToggle")?.addEventListener("click", toggle);
    Utils.qs("#toolDarkMode")?.addEventListener("click", toggle);
  }

  return { init };
})();


/* ==================================================================
   MÓDULO 4 — TAMAÑO DE FUENTE (accesibilidad)
   ================================================================== */
const FontSizeModule = (() => {
  let scale = 1;
  const MIN = 0.85, MAX = 1.3, STEP = 0.05;

  function apply() {
    document.documentElement.style.setProperty("--font-scale", scale.toFixed(2));
  }

  function init() {
    Utils.qs("#fontIncrease")?.addEventListener("click", () => {
      scale = Math.min(MAX, scale + STEP);
      apply();
    });
    Utils.qs("#fontDecrease")?.addEventListener("click", () => {
      scale = Math.max(MIN, scale - STEP);
      apply();
    });
  }

  return { init };
})();


/* ==================================================================
   MÓDULO 5 — BARRA DE PROGRESO DE LECTURA
   ================================================================== */
const ReadingProgressModule = (() => {
  function update() {
    const bar = Utils.qs("#readingProgressBar");
    const track = Utils.qs(".reading-progress");
    if (!bar || !track) return;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
    bar.style.width = `${pct}%`;
    track.setAttribute("aria-valuenow", String(Math.round(pct)));
  }

  function init() {
    window.addEventListener("scroll", Utils.debounce(update, 30));
    update();
  }

  return { init };
})();


/* ==================================================================
   MÓDULO 6 — RENDERIZADO DE PARASHOT (lista lateral + selección)
   ================================================================== */
const ParashaListModule = (() => {
  let onSelectCallback = null;

  function renderFullList() {
    const container = Utils.qs("#parashaList");
    if (!container) return;
    const activeId = Number(container.dataset.active) || 1;

    container.innerHTML = DataModule.parashotIndex.map((p) => `
      <li>
        <a href="#" data-parasha-id="${p.id}" class="${p.id === activeId ? "is-active" : ""}"
           ${p.id === activeId ? 'aria-current="true"' : ""}>
          <span class="parasha-list__num">${String(p.id).padStart(2, "0")}</span> ${Utils.escapeHtml(p.nombre)}
        </a>
      </li>
    `).join("");
  }

  function setActive(id) {
    const container = Utils.qs("#parashaList");
    if (!container) return;
    container.dataset.active = String(id);
    Utils.qsa("a", container).forEach((a) => {
      const isActive = Number(a.dataset.parashaId) === id;
      a.classList.toggle("is-active", isActive);
      if (isActive) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  }

  function init(onSelect) {
    onSelectCallback = onSelect;
    renderFullList(); // expande a las 54 Parashot reales (la versión estática del HTML era solo una referencia visual)

    Utils.qs("#parashaList")?.addEventListener("click", (e) => {
      const link = e.target.closest("a[data-parasha-id]");
      if (!link) return;
      e.preventDefault();
      const id = Number(link.dataset.parashaId);
      onSelectCallback?.(id);
    });
  }

  return { init, setActive, renderFullList };
})();


/* ==================================================================
   MÓDULO 7 — VISTA DE PARASHÁ (hero, resumen, paginador, checklist, TOC)
   ================================================================== */
const ParashaViewModule = (() => {
  let currentId = 1;

  function renderHero(p) {
    Utils.qs("#parashaNumber").textContent = String(p.id).padStart(2, "0");
    Utils.qs("#parashaTitle").textContent = p.nombre;
    Utils.qs("#parashaHebrewName").textContent = p.hebreo || "—";
    Utils.qs("#parashaMeaning").textContent = p.significado || "Significado pendiente de completar.";
    Utils.qs("#parashaVerses").textContent = p.versiculos || "Por definir";
    Utils.qs("#parashaDate").textContent = new Date().toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" });
    Utils.qs("#pagerCurrent").textContent = String(p.id).padStart(2, "0");
    document.title = `Biblioteca Torá — ${p.nombre} | Parashá ${String(p.id).padStart(2, "0")}`;
  }

  function renderSummaryCards(p) {
    const map = {
      "resumen-general": p.resumenGeneral,
      "tema-central": p.temaCentral,
      "versiculo-clave": p.versiculoClave,
      "yeshua-revelado": p.yeshuaRevelado,
      "haftarah-ref": p.haftarah.referencia,
      "haftarah-resumen": p.haftarah.resumen,
      "brit-hadasha-ref": p.britHadasha.referencia,
      "brit-hadasha-resumen": p.britHadasha.resumen,
      "impacto-profetico": p.impactoProfetico,
      "introduccion": p.introduccion,
    };
    Object.entries(map).forEach(([key, value]) => {
      const el = Utils.qs(`[data-content-placeholder="${key}"]`);
      if (el && value) el.textContent = value;
      // si value está vacío, se conserva el texto de marcador definido en el HTML
    });
  }

  function renderObjetivos(p) {
    const list = Utils.qs("#objetivosList");
    if (!list) return;
    list.innerHTML = p.objetivos.map((texto, i) => `
      <li>
        <label>
          <input type="checkbox" data-objetivo="${i + 1}" />
          <span>${Utils.escapeHtml(texto)}</span>
        </label>
      </li>
    `).join("");
    ChecklistModule.refresh();
  }

  function renderPagerState(p) {
    Utils.qs("#prevParashaBtn").disabled = p.id <= 1;
    Utils.qs("#nextParashaBtn").disabled = p.id >= DataModule.parashotIndex.length;
  }

  function load(id) {
    const p = DataModule.getParashaDetail(id);
    if (!p) return;
    currentId = id;

    renderHero(p);
    renderSummaryCards(p);
    renderObjetivos(p);
    renderPagerState(p);
    ParashaListModule.setActive(id);
    AliyahModule.render(p.aliyot, p.nombre);
    TocModule.rebuild();
    AiAssistantModule.setContext(p.nombre, 1);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function init() {
    Utils.qs("#prevParashaBtn").addEventListener("click", () => {
      if (currentId > 1) load(currentId - 1);
    });
    Utils.qs("#nextParashaBtn").addEventListener("click", () => {
      if (currentId < DataModule.parashotIndex.length) load(currentId + 1);
    });

    load(1);
  }

  function getCurrentId() { return currentId; }

  return { init, load, getCurrentId };
})();


/* ==================================================================
   MÓDULO 8 — CHECKLIST DE OBJETIVOS DE ESTUDIO
   ================================================================== */
const ChecklistModule = (() => {
  function refresh() {
    const boxes = Utils.qsa('#objetivosList input[type="checkbox"]');
    const checked = boxes.filter((b) => b.checked).length;
    const progress = Utils.qs("#objetivosProgress");
    if (progress) {
      progress.textContent = `${checked} de ${boxes.length} objetivos completados`;
    }
  }

  function init() {
    Utils.qs("#objetivosList")?.addEventListener("change", (e) => {
      if (e.target.matches('input[type="checkbox"]')) refresh();
    });
  }

  return { init, refresh };
})();


/* ==================================================================
   MÓDULO 9 — ÍNDICE DE CONTENIDOS AUTOMÁTICO (TOC)
   ================================================================== */
const TocModule = (() => {
  function rebuild() {
    const list = Utils.qs("#tocList");
    if (!list) return;
    // Recolecta los títulos de cada <section class="content-section"> con id
    const sections = Utils.qsa("main .content-section[id]");
    list.innerHTML = sections.map((sec) => {
      const titleEl = sec.querySelector(".content-section__title");
      const label = titleEl ? titleEl.textContent : sec.id;
      return `<li><a href="#${sec.id}">${Utils.escapeHtml(label)}</a></li>`;
    }).join("");
  }

  function init() {
    rebuild();
  }

  return { init, rebuild };
})();


/* ==================================================================
   MÓDULO 10 — ALIYOT (pestañas + tarjetas acordeón)
   ================================================================== */
const AliyahModule = (() => {
  let aliyotData = [];
  let activeIndex = 0;

  function renderTabs() {
    const tabs = Utils.qs("#aliyahTabs");
    if (!tabs) return;
    tabs.innerHTML = aliyotData.map((a, i) => `
      <button type="button" role="tab" id="aliyahTab-${a.numero}"
        aria-selected="${i === activeIndex}" aria-controls="aliyahCard-${a.numero}"
        data-aliyah-index="${i}">${a.numero}</button>
    `).join("");
  }

  function buildCard(aliyah, index, parashaNombre) {
    const tpl = Utils.qs("#aliyahCardTemplate");
    const node = tpl.content.cloneNode(true);
    const article = node.querySelector(".aliyah-card");
    article.id = `aliyahCard-${aliyah.numero}`;
    article.dataset.aliyah = String(aliyah.numero);

    node.querySelector(".aliyah-card__number").textContent = aliyah.numero;
    node.querySelector(".aliyah-card__title").textContent =
      aliyah.titulo || `Aliyá ${aliyah.numero} — ${parashaNombre}`;
    node.querySelector(".aliyah-card__ref").textContent =
      aliyah.referencia || "Referencia bíblica por definir";

    // Bloques de texto simples
    const textBlocks = [
      "texto-hebreo", "fonetica", "traduccion-literal", "comentario-peshat",
      "comentario-midrashico", "tipologia-mesianica", "cumplimiento-yeshua",
      "profundizacion", "aplicacion-practica", "resumen"
    ];
    textBlocks.forEach((key) => {
      const el = node.querySelector(`[data-content-placeholder="${key}"]`);
      if (el && aliyah.bloques[key]) el.textContent = aliyah.bloques[key];
    });

    // Bloques tipo lista (preguntas, recursos)
    if (aliyah.bloques["preguntas-grupo"]?.length) {
      const el = node.querySelector('[data-content-placeholder="preguntas-grupo"]');
      el.innerHTML = aliyah.bloques["preguntas-grupo"].map((q) => `<li>${Utils.escapeHtml(q)}</li>`).join("");
    }
    if (aliyah.bloques["recursos-adicionales"]?.length) {
      const el = node.querySelector('[data-content-placeholder="recursos-adicionales"]');
      el.innerHTML = aliyah.bloques["recursos-adicionales"].map((r) => `<li>${Utils.escapeHtml(r)}</li>`).join("");
    }

    return article;
  }

  function render(aliyot, parashaNombre) {
    aliyotData = aliyot;
    activeIndex = 0;
    renderTabs();

    const container = Utils.qs("#aliyahCards");
    container.innerHTML = "";
    aliyot.forEach((a, i) => {
      const card = buildCard(a, i, parashaNombre);
      const body = card.querySelector(".aliyah-card__body");
      const toggleBtn = card.querySelector(".aliyah-card__toggle");
      if (i === 0) {
        body.hidden = false;
        toggleBtn.setAttribute("aria-expanded", "true");
        toggleBtn.firstChild.textContent = "Cerrar contenido ";
      }
      container.appendChild(card);
    });
  }

  function scrollToCard(index) {
    const aliyah = aliyotData[index];
    if (!aliyah) return;
    const card = Utils.qs(`#aliyahCard-${aliyah.numero}`);
    const body = card?.querySelector(".aliyah-card__body");
    const toggleBtn = card?.querySelector(".aliyah-card__toggle");
    if (body && body.hidden) {
      body.hidden = false;
      toggleBtn.setAttribute("aria-expanded", "true");
    }
    card?.scrollIntoView?.({ behavior: "smooth", block: "start" });
    activeIndex = index;
    Utils.qsa("#aliyahTabs button").forEach((b, i) => b.setAttribute("aria-selected", String(i === index)));
    AiAssistantModule.setContext(null, aliyah.numero);
  }

  function init() {
    Utils.qs("#aliyahTabs")?.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-aliyah-index]");
      if (!btn) return;
      scrollToCard(Number(btn.dataset.aliyahIndex));
    });

    Utils.qs("#aliyahCards")?.addEventListener("click", (e) => {
      const toggle = e.target.closest(".aliyah-card__toggle");
      if (!toggle) return;
      const body = toggle.closest(".aliyah-card").querySelector(".aliyah-card__body");
      const isOpen = !body.hidden;
      body.hidden = isOpen;
      toggle.setAttribute("aria-expanded", String(!isOpen));
      toggle.firstChild.textContent = isOpen ? "Abrir contenido " : "Cerrar contenido ";
    });
  }

  return { init, render };
})();


/* ==================================================================
   MÓDULO 11 — BUSCADOR
   ================================================================== */
const SearchModule = (() => {
  function searchParashot(query) {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return DataModule.parashotIndex.filter((p) => p.nombre.toLowerCase().includes(q));
  }

  function renderResults(results, query) {
    const list = Utils.qs("#searchResults");
    if (!list) return;
    if (!query || query.trim().length < 2) {
      list.hidden = true;
      list.innerHTML = "";
      return;
    }
    if (results.length === 0) {
      list.innerHTML = `<li class="search-form__empty">Sin resultados para «${Utils.escapeHtml(query)}»</li>`;
    } else {
      list.innerHTML = results.map((p) => `
        <li><a href="#" data-parasha-id="${p.id}">${String(p.id).padStart(2, "0")} — ${Utils.escapeHtml(p.nombre)}</a></li>
      `).join("");
    }
    list.hidden = false;
  }

  function init() {
    const form = Utils.qs("#searchForm");
    const input = Utils.qs("#searchInput");
    const resultsList = Utils.qs("#searchResults");

    input?.addEventListener("input", Utils.debounce((e) => {
      renderResults(searchParashot(e.target.value), e.target.value);
    }, 180));

    resultsList?.addEventListener("click", (e) => {
      const link = e.target.closest("a[data-parasha-id]");
      if (!link) return;
      e.preventDefault();
      ParashaViewModule.load(Number(link.dataset.parashaId));
      resultsList.hidden = true;
      input.value = "";
    });

    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      const results = searchParashot(input.value);
      if (results.length) ParashaViewModule.load(results[0].id);
    });

    document.addEventListener("click", (e) => {
      if (!form.contains(e.target)) resultsList.hidden = true;
    });
  }

  return { init };
})();


/* ==================================================================
   MÓDULO 12 — HERRAMIENTAS DE ESTUDIO
   (PDF, imprimir, compartir, copiar enlace, favoritos, audio)
   ================================================================== */
const StudyToolsModule = (() => {
  const FAVORITES_KEY = "biblioteca-tora-favoritos";

  function getFavorites() {
    try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]"); }
    catch (_) { return []; }
  }
  function saveFavorites(list) {
    try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(list)); } catch (_) { /* ignorar */ }
  }

  function toggleFavorite() {
    const id = ParashaViewModule.getCurrentId();
    let favs = getFavorites();
    const btn = Utils.qs("#toolFavorite");
    if (favs.includes(id)) {
      favs = favs.filter((f) => f !== id);
      btn.setAttribute("aria-pressed", "false");
    } else {
      favs.push(id);
      btn.setAttribute("aria-pressed", "true");
    }
    saveFavorites(favs);
  }

  function syncFavoriteButton() {
    const id = ParashaViewModule.getCurrentId();
    const btn = Utils.qs("#toolFavorite");
    btn?.setAttribute("aria-pressed", String(getFavorites().includes(id)));
  }

  /** Descarga de PDF — preparado para integrarse con una librería real
   *  (p.ej. jsPDF) o un endpoint de backend. Por ahora genera una
   *  descarga de texto plano como demostración funcional. */
  function downloadPdfPlaceholder() {
    const p = DataModule.getParashaDetail(ParashaViewModule.getCurrentId());
    const blob = new Blob(
      [`Biblioteca Torá\nParashá ${p.id}: ${p.nombre}\n\n(Generación de PDF real pendiente de integrar con una librería de PDF o backend.)`],
      { type: "text/plain" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${p.nombre.replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function printPage() { window.print(); }

  async function sharePage() {
    const p = DataModule.getParashaDetail(ParashaViewModule.getCurrentId());
    const shareData = {
      title: `Biblioteca Torá — ${p.nombre}`,
      text: `Estudia la Parashá ${p.nombre} en la Biblioteca Torá.`,
      url: window.location.href,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (_) { /* el usuario canceló */ }
    } else {
      copyLink();
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      flashButtonFeedback("#toolCopyLink", "¡Enlace copiado!");
    } catch (_) {
      flashButtonFeedback("#toolCopyLink", "No se pudo copiar");
    }
  }

  function flashButtonFeedback(selector, message) {
    const btn = Utils.qs(selector);
    if (!btn) return;
    const original = btn.innerHTML;
    btn.textContent = message;
    setTimeout(() => { btn.innerHTML = original; }, 1800);
  }

  /** Reproducción de audio — preparado para conectarse a un archivo
   *  de audio real por Parashá cuando exista. */
  function toggleAudio() {
    flashButtonFeedback("#toolAudio", "Audio no disponible aún");
  }

  function init() {
    Utils.qs("#toolDownloadPdf")?.addEventListener("click", downloadPdfPlaceholder);
    Utils.qs("#toolPrint")?.addEventListener("click", printPage);
    Utils.qs("#toolShare")?.addEventListener("click", sharePage);
    Utils.qs("#toolCopyLink")?.addEventListener("click", copyLink);
    Utils.qs("#toolFavorite")?.addEventListener("click", toggleFavorite);
    Utils.qs("#toolAudio")?.addEventListener("click", toggleAudio);
    Utils.qs("#introVideoBtn")?.addEventListener("click", () => {
      flashButtonFeedback("#introVideoBtn", "Video no disponible aún");
    });

    syncFavoriteButton();
  }

  return { init, syncFavoriteButton };
})();


/* ==================================================================
   MÓDULO 13 — ASISTENTE IA (panel flotante)
   Toda la lógica de UI está lista; las funciones marcadas como
   "callAiApi" son los puntos de integración con una API de IA real
   (OpenAI, Anthropic, etc.). Por ahora generan una respuesta de
   demostración local para que la interfaz sea completamente funcional.
   ================================================================== */
const AiAssistantModule = (() => {
  let context = { parasha: "Bereshit", aliyah: 1 };
  let history = [];

  function setContext(parashaNombre, aliyahNumero) {
    if (parashaNombre) context.parasha = parashaNombre;
    if (aliyahNumero) context.aliyah = aliyahNumero;
    const label = Utils.qs("#aiContextLabel");
    if (label) label.textContent = `${context.parasha} — Aliyá ${context.aliyah}`;
  }

  function openPanel() {
    const panel = Utils.qs("#aiAssistantPanel");
    panel.hidden = false;
    Utils.qs("#aiFabToggle").setAttribute("aria-expanded", "true");
    Utils.qs("#aiChatInput")?.focus();
  }
  function closePanel() {
    Utils.qs("#aiAssistantPanel").hidden = true;
    Utils.qs("#aiFabToggle").setAttribute("aria-expanded", "false");
  }
  function togglePanel() {
    const panel = Utils.qs("#aiAssistantPanel");
    panel.hidden ? openPanel() : closePanel();
  }

  function appendMessage(text, sender = "bot") {
    const chat = Utils.qs("#aiChatHistory");
    const el = document.createElement("div");
    el.className = `ai-message ai-message--${sender}`;
    el.innerHTML = `<p>${Utils.escapeHtml(text)}</p>`;
    chat.appendChild(el);
    chat.scrollTop = chat.scrollHeight;
    history.push({ sender, text });
  }

  function showTyping(show) {
    const indicator = Utils.qs("#aiTypingIndicator");
    if (indicator) indicator.hidden = !show;
  }

  /* ----------------------------------------------------------------
     PUNTO DE INTEGRACIÓN CON LA API DE IA.
     Sustituir el cuerpo de esta función por una llamada real, p.ej.:

       async function callAiApi(prompt, context) {
         const response = await fetch("/api/ai-assistant", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ prompt, context }),
         });
         const data = await response.json();
         return data.respuesta;
       }

     La firma (prompt, context) -> Promise<string> debe mantenerse
     para que el resto del módulo no requiera cambios.
  ---------------------------------------------------------------- */
  async function callAiApi(prompt, ctx) {
    await new Promise((resolve) => setTimeout(resolve, 700)); // simula latencia de red
    return `(Demostración local) Cuando esté conectado a una API de IA, aquí recibirás una respuesta generada sobre "${prompt}" para ${ctx.parasha}, Aliyá ${ctx.aliyah}.`;
  }

  const quickActionPrompts = {
    "resumir-parasha": "Resume esta Parashá completa de forma clara y breve.",
    "resumir-aliyah": "Resume el contenido de esta Aliyá.",
    "explicar-pasaje": "Explica este pasaje en términos sencillos.",
    "bosquejo-ensenanza": "Crea un bosquejo de enseñanza para esta porción.",
    "generar-preguntas": "Genera preguntas de estudio sobre este contenido.",
    "resumen-ninos": "Crea un resumen para niños sobre esta Parashá.",
    "preparar-ensenanza": "Ayúdame a preparar una enseñanza sobre este pasaje.",
    "explicar-hebreo": "Explica las palabras hebreas clave de este pasaje.",
    "buscar-conexiones": "Busca conexiones de este pasaje con otros textos bíblicos.",
    "generar-oracion": "Genera una oración basada en el contenido de esta Parashá.",
    "guia-grupo": "Crea una guía para grupo de estudio sobre esta porción.",
  };

  async function handlePrompt(promptText) {
    appendMessage(promptText, "user");
    showTyping(true);
    try {
      const reply = await callAiApi(promptText, context);
      appendMessage(reply, "bot");
    } catch (_) {
      appendMessage("Hubo un problema al contactar al asistente. Inténtalo de nuevo.", "bot");
    } finally {
      showTyping(false);
    }
  }

  function clearChat() {
    history = [];
    const chat = Utils.qs("#aiChatHistory");
    chat.innerHTML = `
      <div class="ai-message ai-message--bot">
        <p>Conversación reiniciada. ¿En qué puedo ayudarte a estudiar ${context.parasha}?</p>
      </div>`;
  }

  function init() {
    Utils.qs("#aiFabToggle")?.addEventListener("click", togglePanel);
    Utils.qs("#aiPanelClose")?.addEventListener("click", closePanel);
    Utils.qs("#aiClearChat")?.addEventListener("click", clearChat);

    Utils.qs("#aiQuickActions")?.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-ai-action]");
      if (!btn) return;
      const action = btn.dataset.aiAction;
      handlePrompt(quickActionPrompts[action] || action);
    });

    const form = Utils.qs("#aiChatForm");
    const textarea = Utils.qs("#aiChatInput");
    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = textarea.value.trim();
      if (!text) return;
      handlePrompt(text);
      textarea.value = "";
      textarea.style.height = "auto";
    });

    // Auto-crecimiento del textarea
    textarea?.addEventListener("input", () => {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    });

    // Enviar con Enter, salto de línea con Shift+Enter
    textarea?.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        form.requestSubmit();
      }
    });
  }

  return { init, setContext };
})();


/* ==================================================================
   MÓDULO 14 — VALIDACIÓN DE FORMULARIOS (genérico, reutilizable)
   ================================================================== */
const FormValidationModule = (() => {
  function validateSearchInput(input) {
    return input.value.trim().length > 0;
  }

  function init() {
    // Punto de extensión: cualquier formulario futuro (newsletter, contacto, etc.)
    // puede registrarse aquí siguiendo el mismo patrón de validate + feedback.
    const searchInput = Utils.qs("#searchInput");
    Utils.qs("#searchForm")?.addEventListener("submit", (e) => {
      if (searchInput && !validateSearchInput(searchInput)) {
        e.preventDefault();
      }
    });
  }

  return { init };
})();


/* ==================================================================
   INICIALIZACIÓN GENERAL DE LA APLICACIÓN
   ================================================================== */
const App = (() => {
  function init() {
    NavModule.init();
    ThemeModule.init();
    FontSizeModule.init();
    ReadingProgressModule.init();
    ChecklistModule.init();
    TocModule.init();
    AliyahModule.init();
    SearchModule.init();
    StudyToolsModule.init();
    AiAssistantModule.init();
    FormValidationModule.init();

    // La lista de Parashot y la vista dependen una de la otra:
    // al seleccionar una Parashá en la lista, se recarga la vista completa.
    ParashaListModule.init((id) => {
      ParashaViewModule.load(id);
      StudyToolsModule.syncFavoriteButton();
      NavModule.init().closeSidebar?.(); // cierra el menú lateral en móvil tras seleccionar
    });

    ParashaViewModule.init();
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", App.init);