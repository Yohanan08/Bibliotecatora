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

  mostrarIndicador(true);

  try {
    // Aseguramos visibilidad total antes de capturar
    const originalStyle = {
      height: element.style.height,
      overflow: element.style.overflow
    };
    element.style.height = 'auto';
    element.style.overflow = 'visible';

    // Esperamos a que el contenido se re-renderice
    await new Promise(resolve => setTimeout(resolve, 100));

    // Captura de todo el contenido
    const canvas = await html2canvas(element, {
      useCORS: true,
      backgroundColor: '#fff',
      scale: Math.min(window.devicePixelRatio || 1, 1.5),
      scrollX: 0,
      scrollY: 0,
      width: element.scrollWidth,
      height: element.scrollHeight
    });

    // Restaurar estilos originales
    element.style.height = originalStyle.height;
    element.style.overflow = originalStyle.overflow;

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10;
    const imgWidth = pageWidth - margin * 2;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const totalPages = Math.ceil(imgHeight / (pageHeight - margin * 2));
    const sliceHeight = canvas.height / totalPages;

    for (let i = 0; i < totalPages; i++) {
      if (i > 0) pdf.addPage();
      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = sliceHeight;
      const ctx = sliceCanvas.getContext('2d');
      ctx.drawImage(
        canvas,
        0, i * sliceHeight, canvas.width, sliceHeight,
        0, 0, canvas.width, sliceHeight
      );
      const imgData = sliceCanvas.toDataURL('image/jpeg', 0.85);
      pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, pageHeight - margin * 2);
    }

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
    mostrarIndicador(false);
  }
}

function mostrarIndicador(mostrar) {
  let el = document.getElementById('cargando-pdf');
  if (mostrar) {
    if (!el) {
      el = document.createElement('div');
      el.id = 'cargando-pdf';
      el.innerHTML = `
        <div style="position:fixed;top:0;left:0;width:100%;height:100%;
        background:rgba(0,0,0,0.6);display:flex;align-items:center;
        justify-content:center;z-index:9999;font-family:sans-serif;">
          <div style="background:white;padding:20px;border-radius:10px;text-align:center;">
            <p>Generando PDF…</p>
          </div>
        </div>`;
      document.body.appendChild(el);
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

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('btn-descargar-pdf');
  if (btn) {
    btn.addEventListener('click', e => {
      e.preventDefault();
      descargarPDF();
    });
  }
});







