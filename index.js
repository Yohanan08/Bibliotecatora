// Inicializar Google Translate
function googleTranslateElementInit() {
    new google.translate.TranslateElement({
        pageLanguage: "es",
        includedLanguages: "en,fr,pt,it,iw,ru,zh,de,ja,nl,ko,ar,hi,sv,tr,pl,el,th,vi,id,cs,da,fi,hu,no,ro,sk,uk,ms,fa",
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE
    }, "google_translate_element");
}

// Asegurar que Google Translate cargue correctamente
document.addEventListener("DOMContentLoaded", function () {
    setTimeout(() => {
        if (!document.querySelector("#google_translate_element select")) {
            googleTranslateElementInit();
        }
    }, 1000);
});

/**
 * Función principal para descargar contenido como PDF
 */
async function descargarPDF() {
  const element = document.getElementById('contenido');
  if (!element) return alert('No se encontró el contenido');

  // 1. Validación de navegador integrado (Instagram, WhatsApp, etc.)
  if (esNavegadorIntegrado()) {
    alert('Para descargar el PDF, por favor abre esta página en el navegador de tu sistema (Chrome o Safari) usando los tres puntos de la esquina.');
    return;
  }

  // 2. Mostrar tu indicador de carga
  mostrarIndicador(true, 'Preparando documento...');

  // 3. Crear el iframe invisible para procesar el PDF
  const iframe = document.createElement('iframe');
  Object.assign(iframe.style, {
    position: 'fixed',
    right: '0',
    bottom: '0',
    width: '0',
    height: '0',
    border: '0'
  });
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;

  // 4. Escribir el contenido con los estilos de impresión
  doc.write(`
    <html>
      <head>
        <title>Estudio Purim</title>
        <style>
          body { 
            font-family: 'Times New Roman', serif; 
            padding: 40px; 
            color: #000; 
            background: #fff;
            line-height: 1.6;
          }
          h1, h2 { color: #7b1e1e; margin-top: 0; }
          p { text-align: justify; margin-bottom: 15px; font-size: 12pt; }
          blockquote { 
            border-left: 4px solid #7b1e1e; 
            padding-left: 15px; 
            font-style: italic; 
            margin: 20px 0;
          }
          a { color: #0000ff; text-decoration: underline; }
          footer { margin-top: 50px; border-top: 1px solid #ccc; padding-top: 20px; font-size: 10pt; }
          
          /* Evita que los párrafos se corten feo entre páginas */
          p, blockquote, li { page-break-inside: avoid; }
          @page { margin: 2cm; }
        </style>
      </head>
      <body>
        ${element.innerHTML}
      </body>
    </html>
  `);

  doc.close();

  // 5. Pequeña pausa para que el navegador procese el HTML
  setTimeout(() => {
    mostrarIndicador(false); // Ocultamos tu aviso de carga
    
    iframe.contentWindow.focus();
    iframe.contentWindow.print(); // Abre el menú de Guardar PDF

    // 6. Limpiar el iframe después de cerrar el menú de impresión
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 2000);
  }, 1000);
}

// --- TUS FUNCIONES DE APOYO (SE MANTIENEN IGUAL) ---

function mostrarIndicador(mostrar, texto = "Generando PDF…") {
  let el = document.getElementById('cargando-pdf');
  if (mostrar) {
    if (!el) {
      el = document.createElement('div');
      el.id = 'cargando-pdf';
      el.innerHTML = `
        <div style="position:fixed;top:0;left:0;width:100%;height:100%;
        background:rgba(0,0,0,0.6);display:flex;align-items:center;
        justify-content:center;z-index:9999;font-family:sans-serif;">
          <div style="background:white;padding:20px 40px;border-radius:10px;text-align:center;box-shadow: 0 5px 15px rgba(0,0,0,0.2);">
            <p id="cargando-pdf-texto" style="font-size:1.1em;font-weight:bold;margin:0;color:#000;">${texto}</p>
          </div>
        </div>`;
      document.body.appendChild(el);
    } else {
      const p = document.getElementById('cargando-pdf-texto');
      if (p) p.innerText = texto;
    }
    el.style.display = 'flex';
  } else if (el) {
    el.style.display = 'none';
  }
}

function esNavegadorIntegrado() {
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('instagram') || ua.includes('fbav') || ua.includes('fban') ||
         ua.includes('whatsapp') || ua.includes('telegram') || ua.includes('line');
}

// Listener para el botón
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('descargar-pdf'); // Asegúrate que el ID coincida con tu HTML
  if (btn) {
    btn.addEventListener('click', e => {
      e.preventDefault();
      descargarPDF();
    });
  }
});







