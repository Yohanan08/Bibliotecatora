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

  if (esNavegadorIntegrado()) {
    alert('Este navegador no permite descargas. Usa el navegador del sistema.');
    return;
  }

  mostrarIndicador(true, 'Preparando descarga...');

  // 1. Guardar estilos originales
  const originalStyle = {
    height: element.style.height,
    overflow: element.style.overflow,
    position: element.style.position, // Añadido para más seguridad
  };

  // 2. Aplicar estilos para asegurar la captura completa
  element.style.height = 'auto';
  element.style.overflow = 'visible';
  element.style.position = 'relative'; // 'relative' es más seguro para el cálculo de altura

  // Esperamos a que el contenido se re-renderice
  await new Promise(resolve => setTimeout(resolve, 100));

  try {
    // 3. Configuración de PDF y Dimensiones
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfPageWidth = 210; // Ancho A4
    const pdfPageHeight = 297; // Alto A4
    const margin = 10;

    // Dimensiones útiles de la página PDF (en mm)
    const pdfImgWidthMM = pdfPageWidth - margin * 2; // 190 mm
    const pdfImgHeightMM = pdfPageHeight - margin * 2; // 277 mm

    // Dimensiones del contenido (en px)
    const contentWidthPX = element.scrollWidth;
    const totalHeightPX = element.scrollHeight;

    // 4. Calcular geometría de paginación
    // Ratio (proporción) de la página PDF
    const pdfPageRatio = pdfImgHeightMM / pdfImgWidthMM;
    // Calcular cuántos píxeles de alto del contenido caben en una página PDF
    const pageHeightPX = contentWidthPX * pdfPageRatio;

    // Calcular número total de páginas
    const totalPages = Math.ceil(totalHeightPX / pageHeightPX);

    // 5. Opciones base de html2canvas
    const canvasOptions = {
      useCORS: true,
      backgroundColor: '#fff',
      scale: Math.min(window.devicePixelRatio || 1, 1.5),
      width: contentWidthPX,
      // Compensamos el scroll que TENGA LA VENTANA, si es que tiene
      scrollX: -window.scrollX,
      scrollY: -window.scrollY,
    };

    // 6. Loop para capturar página por página
    for (let i = 0; i < totalPages; i++) {
      // Actualizar el indicador de carga con el progreso
      mostrarIndicador(true, `Generando página ${i + 1} de ${totalPages}...`);
      
      if (i > 0) {
        pdf.addPage();
      }

      // Calcular el offset 'Y' (dónde empieza el recorte)
      const yOffset = i * pageHeightPX;
      
      // Calcular la altura real a capturar (para la última página)
      const currentHeightPX = Math.min(pageHeightPX, totalHeightPX - yOffset);

      // --- ¡ESTA ES LA CORRECCIÓN CLAVE! ---
      // Usamos 'y' para decirle dónde empezar a capturar
      // Usamos 'height' para decirle dónde terminar
      const pageCanvasOptions = {
        ...canvasOptions,
        height: currentHeightPX,
        y: yOffset // Dónde empezar a capturar (en píxeles, desde el top)
      };

      // Capturar solo esta "ventana" del contenido
      const canvas = await html2canvas(element, pageCanvasOptions);

      // Calcular la altura proporcional de la imagen en el PDF
      const imgHeightMM = (canvas.height * pdfImgWidthMM) / canvas.width;

      // Añadir al PDF
      const imgData = canvas.toDataURL('image/jpeg', 0.85);
      pdf.addImage(imgData, 'JPEG', margin, margin, pdfImgWidthMM, imgHeightMM);
      
      // (Opcional) Pequeña pausa para que el navegador respire
      await new Promise(resolve => setTimeout(resolve, 10)); 
    }

    // 7. Descargar el PDF
    mostrarIndicador(true, 'Finalizando descarga...');
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const blob = pdf.output('blob');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `documento_${timestamp}.pdf`;
    a.click();
    URL.revokeObjectURL(url);

  } catch (e) {
    console.error('Error al generar PDF', e);
    alert('Error al generar el PDF: ' + e.message);
  } finally {
    // 8. Restaurar estilos originales
    element.style.height = originalStyle.height;
    element.style.overflow = originalStyle.overflow;
    element.style.position = originalStyle.position;
    
    // Ocultar indicador
    mostrarIndicador(false);
  }
}

/**
 * Función de indicador de carga mejorada.
 * Ahora acepta un parámetro de 'texto' para mostrar el progreso.
 */
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
            <p id="cargando-pdf-texto" style="font-size:1.1em;font-weight:bold;margin:0;">${texto}</p>
          </div>
        </div>`;
      document.body.appendChild(el);
    } else {
      // Si ya existe, solo actualiza el texto
      const p = document.getElementById('cargando-pdf-texto');
      if (p) p.innerText = texto;
    }
    el.style.display = 'flex';
  } else if (el) {
    el.style.display = 'none';
  }
}

/**
 * Función de utilidad para detectar navegadores integrados (sin cambios).
 */
function esNavegadorIntegrado() {
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('instagram') || ua.includes('fbav') || ua.includes('fban') ||
         ua.includes('whatsapp') || ua.includes('telegram') || ua.includes('line');
}

/**
 * Listener del botón (sin cambios).
 */
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('btn-descargar-pdf');
  if (btn) {
    btn.addEventListener('click', e => {
      e.preventDefault();
      descargarPDF();
    });
  }
});







