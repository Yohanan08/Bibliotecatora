/* ==================================================================
   PARASHOT · Yeshúa — La Torá Viviente
   sitio.js — lógica compartida por la portada, las páginas de parashá
   y las páginas de aliyá.

   Qué hace:
   1. Calcula la parashá de la semana con la hora de Yerushaláyim
      (tabla PT_DATOS.cal, lectura de Israel).
   2. Trae de Hebcal la entrada y la salida del Shabat en Yerushaláyim.
      Si no hay internet o Hebcal falla, las calcula con la posición
      del sol (mismo criterio: 40 min antes de la puesta / 8,5° bajo
      el horizonte).
   3. La nueva parashá comienza cuando sale el Shabat en Yerushaláyim.
   4. Estudio del día: día 1 (domingo) = aliyá 1 … Shabat = aliyá 7.
   ================================================================== */
(function () {
  "use strict";

  var D = window.PT_DATOS;
  if (!D) return;

  var TZ = "Asia/Jerusalem";
  var LAT = 31.76904, LON = 35.21633;          // Yerushaláyim
  var MIN_VELAS = 40;                           // minutos antes de la puesta del sol
  var GRADOS_SALIDA = 8.5;                      // sol bajo el horizonte al salir el Shabat
  var DIA_MS = 86400000;
  var DIAS = [
    { es: "Domingo", he: "Yom Rishón", corto: "Dom" },
    { es: "Lunes", he: "Yom Shení", corto: "Lun" },
    { es: "Martes", he: "Yom Shlishí", corto: "Mar" },
    { es: "Miércoles", he: "Yom Reví'í", corto: "Mié" },
    { es: "Jueves", he: "Yom Jamishí", corto: "Jue" },
    { es: "Viernes", he: "Yom Shishí", corto: "Vie" },
    { es: "Shabat", he: "Yom HaShabat", corto: "Shab" }
  ];

  /* ---------- Fechas en hora de Yerushaláyim ---------- */
  var fmtPartes = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23"
  });

  function partesJerusalen(fecha) {
    var o = {};
    fmtPartes.formatToParts(fecha).forEach(function (p) { o[p.type] = p.value; });
    var numDia = Date.UTC(+o.year, +o.month - 1, +o.day) / DIA_MS;
    return { numDia: numDia, dow: new Date(numDia * DIA_MS).getUTCDay(), h: +o.hour % 24, m: +o.minute, s: +o.second };
  }

  function isoDeNumDia(n) { return new Date(n * DIA_MS).toISOString().slice(0, 10); }

  /* ---------- Sol: puesta y salida de estrellas (respaldo sin internet) ---------- */
  function rad(g) { return g * Math.PI / 180; }

  /** Instante (ms UTC) en que el sol está `grados` bajo el horizonte al atardecer. */
  function atardecer(numDia, grados) {
    var n = numDia - 10957 + 0.0008;
    var j = n - LON / 360;
    var M = (357.5291 + 0.98560028 * j) % 360;
    var C = 1.9148 * Math.sin(rad(M)) + 0.02 * Math.sin(rad(2 * M)) + 0.0003 * Math.sin(rad(3 * M));
    var L = (M + C + 180 + 102.9372) % 360;
    var transito = 2451545 + j + 0.0053 * Math.sin(rad(M)) - 0.0069 * Math.sin(rad(2 * L));
    var decl = Math.asin(Math.sin(rad(L)) * Math.sin(rad(23.4397)));
    var cosW = (Math.sin(rad(-grados)) - Math.sin(rad(LAT)) * Math.sin(decl)) / (Math.cos(rad(LAT)) * Math.cos(decl));
    var w = Math.acos(Math.max(-1, Math.min(1, cosW))) * 180 / Math.PI;
    return Math.round(((transito + w / 360) - 2440587.5) * DIA_MS / 60000) * 60000;
  }

  function horariosCalculados(numShabat) {
    return {
      entrada: atardecer(numShabat - 1, 0.833) - MIN_VELAS * 60000,
      salida: atardecer(numShabat, GRADOS_SALIDA),
      fuente: "calculo"
    };
  }

  /* ---------- Hebcal: horarios oficiales de Yerushaláyim ---------- */
  var memoria = {}, pedidos = {};

  function leerCache(clave) {
    try { var t = localStorage.getItem(clave); return t ? JSON.parse(t) : null; } catch (e) { return null; }
  }
  function guardarCache(clave, valor) {
    try { localStorage.setItem(clave, JSON.stringify(valor)); } catch (e) { /* sin almacenamiento: no pasa nada */ }
  }

  function horarios(numShabat) {
    if (memoria[numShabat]) return memoria[numShabat];
    var calc = horariosCalculados(numShabat);
    var c = leerCache("pt-shabat-" + isoDeNumDia(numShabat));
    if (c && Math.abs(c.entrada - calc.entrada) < 25 * 60000 && Math.abs(c.salida - calc.salida) < 25 * 60000) {
      c.fuente = "hebcal";
      return (memoria[numShabat] = c);
    }
    return (memoria[numShabat] = calc);
  }

  function pedirHebcal(numShabat) {
    if (horarios(numShabat).fuente === "hebcal" || pedidos[numShabat]) return Promise.resolve(false);
    pedidos[numShabat] = true;
    if (!window.fetch) return Promise.resolve(false);
    var viernes = isoDeNumDia(numShabat - 1), sabado = isoDeNumDia(numShabat);
    var v = viernes.split("-");
    var url = "https://www.hebcal.com/shabbat?cfg=json&geonameid=281184&M=on&leyning=off" +
      "&gy=" + v[0] + "&gm=" + (+v[1]) + "&gd=" + (+v[2]);
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    }).then(function (json) {
      var entrada = null, salida = null;
      (json.items || []).forEach(function (it) {
        var f = String(it.date || "");
        if (f.length < 16) return;
        if (it.category === "candles" && f.slice(0, 10) === viernes) entrada = Date.parse(f);
        if ((it.category === "havdalah" || it.category === "candles") && f.slice(0, 10) === sabado) salida = Date.parse(f);
      });
      var calc = horariosCalculados(numShabat);
      if (!entrada || !salida) return false;
      // Solo se acepta si coincide (±25 min) con el cálculo astronómico.
      if (Math.abs(entrada - calc.entrada) > 25 * 60000 || Math.abs(salida - calc.salida) > 25 * 60000) return false;
      var dato = { entrada: entrada, salida: salida };
      guardarCache("pt-shabat-" + sabado, dato);
      memoria[numShabat] = { entrada: entrada, salida: salida, fuente: "hebcal" };
      return true;
    }).catch(function () { return false; });
  }

  /* ---------- Calendario de parashot ---------- */
  var numInicio = Date.parse(D.calInicio + "T00:00:00Z") / DIA_MS;

  function valorSemana(numShabat) {
    var i = Math.round((numShabat - numInicio) / 7);
    return (i >= 0 && i < D.cal.length) ? D.cal[i] : null;
  }

  /** Parashot que se estudian en la semana que termina en ese Shabat. */
  function semana(numShabat) {
    var v = valorSemana(numShabat);
    if (v === null) return { nums: [], moed: false, fuera: true };
    if (v > 100) return { nums: [v - 100, v - 99], moed: false };
    if (v > 0) return { nums: [v], moed: false };
    // Shabat de moed: no hay lectura propia; se sigue con la que viene.
    for (var k = 1; k < 6; k++) {
      var s = valorSemana(numShabat + 7 * k);
      if (s) {
        var prox = s > 100 ? [s - 100, s - 99] : [s];
        if (prox[0] === 1) return { nums: [54], moed: true };     // antes de Bereshit: Vezot Haberajá
        return { nums: prox, moed: true };
      }
    }
    return { nums: [], moed: true, fuera: true };
  }

  /** Estado completo para un instante dado. */
  function estado(ahora) {
    var p = partesJerusalen(ahora);
    var numShabat = p.numDia + (6 - p.dow);
    var dia = p.dow + 1;
    if (p.dow === 6 && ahora.getTime() >= horarios(numShabat).salida) { numShabat += 7; dia = 1; }
    var h = horarios(numShabat);
    return {
      ahora: ahora, jerusalen: p, numShabat: numShabat, dia: dia,
      semana: semana(numShabat), siguiente: semana(numShabat + 7),
      entrada: h.entrada, salida: h.salida, fuente: h.fuente,
      enShabat: ahora.getTime() >= h.entrada && ahora.getTime() < h.salida
    };
  }

  /* ---------- Utilidades de texto y enlaces ---------- */
  function P(n) { return D.parashot[n - 1]; }
  function nombres(nums) { return nums.map(function (n) { return P(n).nombre; }).join(" – "); }
  function hebreos(nums) { return nums.map(function (n) { return P(n).hebreo; }).join(" – "); }
  function urlParasha(n, raiz) { return (raiz || "") + "parasha" + n + ".html"; }
  function urlAliya(n, a, raiz) { return (raiz || "") + P(n).carpeta + "/aliya" + a + ".html"; }
  function dos(n) { return (n < 10 ? "0" : "") + n; }
  function el(id) { return document.getElementById(id); }
  function texto(id, t) { var e = el(id); if (e) e.textContent = t; }
  function crear(tag, attrs, hijos) {
    var e = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "text") e.textContent = attrs[k]; else e.setAttribute(k, attrs[k]);
    });
    (hijos || []).forEach(function (h) { e.appendChild(h); });
    return e;
  }

  function fmt(opts, enJerusalen) {
    var o = {}; Object.keys(opts).forEach(function (k) { o[k] = opts[k]; });
    if (enJerusalen) o.timeZone = TZ;
    return new Intl.DateTimeFormat("es", o);
  }
  var fmtDiaJ = fmt({ weekday: "long", day: "numeric", month: "long" }, true);
  var fmtHoraJ = fmt({ hour: "2-digit", minute: "2-digit", hourCycle: "h23" }, true);
  var fmtRelojJ = fmt({ hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }, true);
  var fmtLocal = fmt({ weekday: "long", hour: "numeric", minute: "2-digit" }, false);
  function mayus(t) { return t.charAt(0).toUpperCase() + t.slice(1); }

  var MAGEN = '<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path d="M24 4 41.3 34H6.7Z"/><path d="M24 44 6.7 14h34.6Z"/></svg>';

  /* =================================================================
     PORTADA
     ================================================================= */
  function pintarPortada(e) {
    var nums = e.semana.nums;
    if (!nums.length) return;
    var raiz = "";
    var principal = P(nums[0]);

    texto("sem-etiqueta", e.semana.moed ? "Shabat de moed · se estudia esta semana" : "Parashá de la semana");
    texto("sem-numero", nums.length > 1 ? "N.º " + nums.join(" y ") + " de 54" : "N.º " + nums[0] + " de 54");
    texto("sem-nombre", nombres(nums));
    texto("sem-hebreo", hebreos(nums));
    texto("sem-ref", nums.length > 1 ? principal.ref + " · " + P(nums[1]).ref : principal.ref);

    var acciones = el("sem-acciones");
    if (acciones) {
      acciones.textContent = "";
      nums.forEach(function (n) {
        acciones.appendChild(crear("a", { href: urlParasha(n, raiz), "class": "pt-boton pt-boton-blanco", text: "Abrir " + P(n).nombre }));
      });
    }

    // Horarios de Yerushaláyim
    var hE = el("hor-entrada"), hS = el("hor-salida");
    if (hE) { hE.dateTime = new Date(e.entrada).toISOString(); hE.textContent = mayus(fmtDiaJ.format(e.entrada)) + " · " + fmtHoraJ.format(e.entrada); }
    if (hS) { hS.dateTime = new Date(e.salida).toISOString(); hS.textContent = mayus(fmtDiaJ.format(e.salida)) + " · " + fmtHoraJ.format(e.salida); }
    texto("hor-entrada-local", "En tu hora: " + fmtLocal.format(e.entrada));
    texto("hor-salida-local", "En tu hora: " + fmtLocal.format(e.salida));
    var misma = e.siguiente.nums.join() === nums.join();
    var verbo = misma ? "Continúa " : "Comienza ";
    texto("hor-nueva", e.siguiente.nums.length ? verbo + nombres(e.siguiente.nums) : "Comienza la nueva parashá");
    texto("hor-fuente", e.fuente === "hebcal"
      ? "Horarios de Yerushaláyim tomados de Hebcal."
      : "Horarios de Yerushaláyim calculados por la posición del sol.");
    texto("cuenta-titulo", misma ? "Falta para la salida del Shabat"
      : (e.siguiente.nums.length ? "Falta para que comience " + nombres(e.siguiente.nums) : "Falta para la nueva parashá"));

    // Estudio del día
    var d = DIAS[e.dia - 1];
    texto("hoy-dia", "Día " + e.dia + " · " + d.es + " (" + d.he + ")");
    var lista = el("hoy-estudios");
    if (lista) {
      lista.textContent = "";
      nums.forEach(function (n) {
        var p = P(n);
        var a = crear("a", { href: urlAliya(n, e.dia, raiz), "class": "pt-hoy-enlace" }, [
          crear("span", { "class": "pt-hoy-aliya", text: "Aliyá " + e.dia }),
          crear("strong", { text: p.nombre }),
          crear("span", { "class": "pt-hoy-ref", text: p.aliyot[e.dia - 1] }),
          crear("span", { "class": "pt-hoy-ir", text: "Estudiar ahora →" })
        ]);
        lista.appendChild(crear("li", {}, [a]));
      });
    }

    // Semana completa
    var tira = el("hoy-semana");
    if (tira) {
      tira.textContent = "";
      DIAS.forEach(function (dd, i) {
        var n = nums[0];
        var clase = "pt-dia" + (i + 1 === e.dia ? " es-hoy" : (i + 1 < e.dia ? " es-pasado" : ""));
        var a = crear("a", { href: urlAliya(n, i + 1, raiz), "class": clase }, [
          crear("span", { "class": "pt-dia-nombre", text: dd.corto }),
          crear("strong", { text: String(i + 1) }),
          crear("span", { "class": "pt-dia-ref", text: P(n).aliyot[i].replace(/^[^\d]*/, "") })
        ]);
        if (i + 1 === e.dia) a.setAttribute("aria-current", "date");
        a.setAttribute("aria-label", dd.es + ": Aliyá " + (i + 1) + ", " + P(n).aliyot[i]);
        tira.appendChild(crear("li", {}, [a]));
      });
    }

    // Marca en la lista de las 54
    Array.prototype.forEach.call(document.querySelectorAll(".pt-parasha.es-semana"), function (x) {
      x.classList.remove("es-semana"); var b = x.querySelector(".pt-insignia"); if (b) b.remove();
    });
    nums.forEach(function (n) {
      var t = document.querySelector('.pt-parasha[data-n="' + n + '"]');
      if (!t) return;
      t.classList.add("es-semana");
      t.appendChild(crear("span", { "class": "pt-insignia", text: "Esta semana" }));
    });
  }

  function pintarReloj(e) {
    texto("reloj-hora", fmtRelojJ.format(e.ahora));
    texto("reloj-fecha", mayus(fmtDiaJ.format(e.ahora)));
    var falta = Math.max(0, e.salida - e.ahora.getTime());
    var s = Math.floor(falta / 1000);
    texto("cd-d", dos(Math.floor(s / 86400)));
    texto("cd-h", dos(Math.floor(s % 86400 / 3600)));
    texto("cd-m", dos(Math.floor(s % 3600 / 60)));
    texto("cd-s", dos(s % 60));
    var aviso = el("shabat-aviso");
    if (aviso) aviso.hidden = !e.enShabat;
  }

  function iniciarBuscador() {
    var campo = el("buscador"), vacio = el("sin-resultados");
    var filtros = document.querySelectorAll(".pt-filtro");
    var libro = "todos";
    function norm(t) { return t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
    function aplicar() {
      var q = norm(campo ? campo.value.trim() : "");
      var visibles = 0;
      Array.prototype.forEach.call(document.querySelectorAll(".pt-parasha"), function (t) {
        var ok = (libro === "todos" || t.getAttribute("data-libro") === libro) &&
          (!q || norm(t.getAttribute("data-buscar") || "").indexOf(q) !== -1);
        t.parentNode.hidden = !ok;
        if (ok) visibles++;
      });
      Array.prototype.forEach.call(document.querySelectorAll(".pt-libro"), function (sec) {
        sec.hidden = !sec.querySelector("li:not([hidden])");
      });
      if (vacio) vacio.hidden = visibles > 0;
    }
    if (campo) campo.addEventListener("input", aplicar);
    Array.prototype.forEach.call(filtros, function (b) {
      b.addEventListener("click", function () {
        libro = b.getAttribute("data-libro");
        Array.prototype.forEach.call(filtros, function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        aplicar();
      });
    });
  }

  /* =================================================================
     PÁGINA DE PARASHÁ
     ================================================================= */
  function pintarParasha(e, n) {
    var esSemana = e.semana.nums.indexOf(n) !== -1;
    var aviso = el("par-aviso");
    if (aviso) {
      aviso.hidden = false;
      aviso.textContent = "";
      if (esSemana) {
        aviso.className = "pt-aviso es-semana";
        aviso.appendChild(crear("strong", { text: "Esta es la parashá de esta semana. " }));
        aviso.appendChild(document.createTextNode("Hoy corresponde la Aliyá " + e.dia + " (" + DIAS[e.dia - 1].es + ")."));
      } else if (e.semana.nums.length) {
        aviso.className = "pt-aviso";
        aviso.appendChild(document.createTextNode("Esta semana se estudia "));
        aviso.appendChild(crear("a", { href: urlParasha(e.semana.nums[0]), text: nombres(e.semana.nums) }));
        aviso.appendChild(document.createTextNode("."));
      }
    }
    Array.prototype.forEach.call(document.querySelectorAll(".pt-aliya"), function (a) {
      var k = +a.getAttribute("data-a");
      a.classList.toggle("es-hoy", esSemana && k === e.dia);
      a.classList.toggle("es-pasado", esSemana && k < e.dia);
      var marca = a.querySelector(".pt-insignia");
      if (marca) marca.remove();
      if (esSemana && k === e.dia) a.appendChild(crear("span", { "class": "pt-insignia", text: "Hoy" }));
    });
  }

  /* =================================================================
     PÁGINA DE ALIYÁ (barra superior y navegación inferior)
     ================================================================= */
  function iniciarAliya(n, a) {
    var p = P(n), raiz = "../";
    var e = estado(new Date());
    var esSemana = e.semana.nums.indexOf(n) !== -1;
    document.body.classList.add("pt-aliya-pagina");

    var pastillas = crear("ol", { "class": "pt-pastillas" });
    for (var k = 1; k <= 7; k++) {
      var enlace = crear("a", { href: "aliya" + k + ".html", text: String(k), title: "Aliyá " + k + ": " + p.aliyot[k - 1] });
      if (k === a) enlace.setAttribute("aria-current", "page");
      if (esSemana && k === e.dia) enlace.className = "es-hoy";
      pastillas.appendChild(crear("li", {}, [enlace]));
    }
    var inicio = crear("a", { href: raiz + "index.html", "class": "pt-marca", "aria-label": "Inicio: las 54 parashot" });
    inicio.innerHTML = MAGEN + "<span>Parashot</span>";
    var barra = crear("nav", { "class": "pt-barra", "aria-label": "Navegación de la parashá" }, [
      inicio,
      crear("a", { href: urlParasha(n, raiz), "class": "pt-barra-parasha" }, [
        crear("span", { text: n + " · " }), crear("strong", { text: p.nombre })
      ]),
      pastillas
    ]);
    document.body.insertBefore(barra, document.body.firstChild);

    // Navegación inferior
    var ant = a > 1 ? { href: "aliya" + (a - 1) + ".html", t: "Aliyá " + (a - 1), s: p.aliyot[a - 2] }
      : { href: urlParasha(n, raiz), t: "Parashá " + p.nombre, s: "Las 7 aliyot" };
    var sig = a < 7 ? { href: "aliya" + (a + 1) + ".html", t: "Aliyá " + (a + 1), s: p.aliyot[a] }
      : (n < 54 ? { href: urlAliya(n + 1, 1, raiz), t: "Parashá " + P(n + 1).nombre, s: "Aliyá 1 · " + P(n + 1).aliyot[0] }
        : { href: raiz + "index.html", t: "Las 54 parashot", s: "Volver al inicio" });
    function tarjeta(o, clase, flecha) {
      return crear("a", { href: o.href, "class": "pt-paso " + clase }, [
        crear("span", { "class": "pt-paso-flecha", text: flecha }),
        crear("strong", { text: o.t }),
        crear("span", { "class": "pt-paso-ref", text: o.s })
      ]);
    }
    var pie = crear("nav", { "class": "pt-pasos", "aria-label": "Aliyá anterior y siguiente" }, [
      tarjeta(ant, "es-anterior", "← Anterior"),
      crear("a", { href: urlParasha(n, raiz), "class": "pt-paso es-centro" }, [
        crear("span", { "class": "pt-paso-flecha", text: "Parashá " + n }),
        crear("strong", { text: p.nombre }),
        crear("span", { "class": "pt-paso-ref", text: "Ver las 7 aliyot" })
      ]),
      tarjeta(sig, "es-siguiente", "Siguiente →")
    ]);
    var main = document.querySelector("main") || document.body;
    main.parentNode.insertBefore(pie, main.nextSibling);
    document.body.classList.add("pt-nav-lista");
  }

  /* =================================================================
     ARRANQUE
     ================================================================= */
  function arrancar() {
    var m = location.pathname.match(/\/parasha(\d{1,2})\/aliya(\d)(?:\.html?)?$/i);
    if (m && +m[1] >= 1 && +m[1] <= 54 && +m[2] >= 1 && +m[2] <= 7) { iniciarAliya(+m[1], +m[2]); return; }

    var pagina = document.body.getAttribute("data-pagina");
    if (pagina !== "inicio" && pagina !== "parasha") return;
    var nPar = +document.body.getAttribute("data-n");
    var clave = "";

    function repintar(forzar) {
      var e = estado(new Date());
      var nueva = e.numShabat + "|" + e.dia + "|" + e.fuente;
      if (forzar || nueva !== clave) {
        clave = nueva;
        if (pagina === "inicio") pintarPortada(e); else pintarParasha(e, nPar);
        pedirHebcal(e.numShabat).then(function (cambio) { if (cambio) repintar(true); });
      }
      if (pagina === "inicio") pintarReloj(e);
    }

    if (pagina === "inicio") iniciarBuscador();
    repintar(true);
    document.documentElement.classList.add("pt-listo");
    setInterval(repintar, pagina === "inicio" ? 1000 : 60000);
  }

  // Para pruebas y para otras páginas del ministerio que quieran reutilizarlo.
  window.PT = { estado: estado, semana: semana, horariosCalculados: horariosCalculados, partesJerusalen: partesJerusalen };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", arrancar);
  else arrancar();
})();
