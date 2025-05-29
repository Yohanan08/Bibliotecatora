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
function esMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(navigator.userAgent);
}

function esNavegadorIntegrado() {
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('instagram') || 
         ua.includes('fban') || 
         ua.includes('fbav') || 
         ua.includes('telegram') ||
         ua.includes('whatsapp') ||
         ua.includes('line') ||
         ua.includes('twitter');
}

// Función principal mejorada para descargar PDF
async function descargarPDF() {
  const element = document.getElementById('contenido');
  if (!element) {
    alert('Error: No se encontró el elemento con ID "contenido"');
    return;
  }

  // Mostrar indicador de carga
  mostrarIndicadorCarga(true);

  try {
    if (esMobile() || esNavegadorIntegrado()) {
      await descargarPDFMobile(element);
    } else {
      await descargarPDFDesktop(element);
    }
  } catch (error) {
    console.error('Error al generar PDF:', error);
    alert('Hubo un problema al generar el PDF. Por favor, intente de nuevo.');
  } finally {
    mostrarIndicadorCarga(false);
  }
}

// Versión optimizada para móviles y navegadores integrados
async function descargarPDFMobile(element) {
  // Preparar el elemento para captura móvil
  const elementoClonado = element.cloneNode(true);
  const contenedor = document.createElement('div');
  
  // Estilos específicos para móviles
  contenedor.style.cssText = `
    position: fixed;
    top: -9999px;
    left: -9999px;
    width: 794px;
    background: white;
    font-family: Arial, sans-serif;
    font-size: 14px;
    line-height: 1.4;
    color: #000;
    padding: 20px;
    box-sizing: border-box;
    z-index: -1;
  `;
  
  // Aplicar estilos al contenido clonado
  aplicarEstilosMobile(elementoClonado);
  contenedor.appendChild(elementoClonado);
  document.body.appendChild(contenedor);

  const opciones = {
    margin: [10, 10, 10, 10],
    filename: `documento_${new Date().getTime()}.pdf`,
    image: { 
      type: 'jpeg', 
      quality: 0.95 // Reducir calidad para mejor compatibilidad
    },
    html2canvas: {
      scale: 1,
      useCORS: true,
      allowTaint: true,
      logging: false,
      scrollY: 0,
      scrollX: 0,
      width: 794,
      height: contenedor.scrollHeight,
      windowWidth: 794,
      windowHeight: contenedor.scrollHeight,
      // Configuraciones específicas para móviles
      backgroundColor: '#ffffff',
      removeContainer: true,
      async: true,
      timeout: 15000, // Timeout más largo para móviles
      onrendered: function(canvas) {
        console.log('Canvas renderizado correctamente');
      }
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
      compress: false // Desactivar compresión para mejor compatibilidad
    },
    pagebreak: { 
      mode: ['css'],
      avoid: ['tr', 'td', 'th', 'div.no-break']
    }
  };

  try {
    await html2pdf().set(opciones).from(contenedor).save();
    console.log('PDF generado exitosamente para móvil');
  } finally {
    document.body.removeChild(contenedor);
  }
}

// Versión para escritorio (tu código original mejorado)
async function descargarPDFDesktop(element) {
  const opciones = {
    margin: [15, 15, 15, 15],
    filename: `documento_${new Date().getTime()}.pdf`,
    image: { type: 'jpeg', quality: 1.0 },
    html2canvas: {
      scale: 1.5,
      useCORS: true,
      logging: false,
      letterRendering: true,
      allowTaint: true,
      scrollY: 0,
      backgroundColor: '#ffffff',
      windowWidth: document.documentElement.offsetWidth,
      windowHeight: document.documentElement.offsetHeight
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
      compress: true,
      precision: 16
    },
    pagebreak: { 
      mode: ['avoid-all', 'css', 'legacy'],
      before: '.page-break-before',
      after: '.page-break-after',
      avoid: ['tr', 'td', 'div', 'p', 'img', 'table']
    }
  };

  await html2pdf().set(opciones).from(element).save();
}

// Aplicar estilos específicos para móviles
function aplicarEstilosMobile(elemento) {
  const estilos = `
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    body, div, p, span, h1, h2, h3, h4, h5, h6 {
      font-family: Arial, sans-serif !important;
      color: #000 !important;
    }
    
    img {
      max-width: 100% !important;
      height: auto !important;
      display: block !important;
    }
    
    table {
      width: 100% !important;
      border-collapse: collapse !important;
    }
    
    .no-break {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
  `;
  
  const styleElement = document.createElement('style');
  styleElement.textContent = estilos;
  elemento.insertBefore(styleElement, elemento.firstChild);
}

// Mostrar/ocultar indicador de carga
function mostrarIndicadorCarga(mostrar) {
  let indicador = document.getElementById('pdf-loading-indicator');
  
  if (mostrar) {
    if (!indicador) {
      indicador = document.createElement('div');
      indicador.id = 'pdf-loading-indicator';
      indicador.innerHTML = `
        <div style="
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          color: white;
          font-family: Arial, sans-serif;
        ">
          <div style="text-align: center;">
            <div style="
              border: 4px solid #f3f3f3;
              border-top: 4px solid #3498db;
              border-radius: 50%;
              width: 50px;
              height: 50px;
              animation: spin 1s linear infinite;
              margin: 0 auto 20px;
            "></div>
            <p>Generando PDF...</p>
            <style>
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            </style>
          </div>
        </div>
      `;
      document.body.appendChild(indicador);
    }
    indicador.style.display = 'flex';
  } else if (indicador) {
    indicador.style.display = 'none';
  }
}

// Función alternativa usando Canvas2PDF para casos extremos
async function descargarPDFAlternativo() {
  const element = document.getElementById('contenido');
  if (!element) {
    alert('Error: No se encontró el elemento con ID "contenido"');
    return;
  }

  try {
    // Usar html2canvas directamente y luego jsPDF
    const canvas = await html2canvas(element, {
      scale: 1,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: element.offsetWidth,
      height: element.offsetHeight
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 190; // A4 width minus margins
    const pageHeight = 280; // A4 height minus margins
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 10;

    pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight + 10;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`documento_${new Date().getTime()}.pdf`);
  } catch (error) {
    console.error('Error con método alternativo:', error);
    throw error;
  }
}

// Inicialización mejorada
function inicializarBotonesPDF() {
  const botonPDF = document.getElementById('btn-descargar-pdf');
  if (botonPDF) {
    botonPDF.addEventListener('click', function(e) {
      e.preventDefault();
      descargarPDF();
    });
  }
  
  const botones = document.querySelectorAll('.btn-descargar-pdf');
  botones.forEach(boton => {
    boton.addEventListener('click', function(e) {
      e.preventDefault();
      descargarPDF();
    });
  });

  // Agregar botón de método alternativo si es necesario
  const botonAlternativo = document.getElementById('btn-pdf-alternativo');
  if (botonAlternativo) {
    botonAlternativo.addEventListener('click', function(e) {
      e.preventDefault();
      descargarPDFAlternativo();
    });
  }
}

// Cargar librerías necesarias
function cargarLibrerias() {
  const libreriasPorCargar = [];
  
  if (typeof html2pdf === 'undefined') {
    libreriasPorCargar.push({
      url: 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js',
      nombre: 'html2pdf'
    });
  }
  
  if (typeof html2canvas === 'undefined') {
    libreriasPorCargar.push({
      url: 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
      nombre: 'html2canvas'
    });
  }
  
  if (typeof jsPDF === 'undefined') {
    libreriasPorCargar.push({
      url: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
      nombre: 'jsPDF'
    });
  }

  if (libreriasPorCargar.length === 0) {
    inicializarBotonesPDF();
    return;
  }

  let libreriasCargadas = 0;
  
  libreriasPorCargar.forEach(libreria => {
    const script = document.createElement('script');
    script.src = libreria.url;
    script.crossOrigin = 'anonymous';
    script.onload = function() {
      console.log(`${libreria.nombre} cargada correctamente`);
      libreriasCargadas++;
      if (libreriasCargadas === libreriasPorCargar.length) {
        inicializarBotonesPDF();
      }
    };
    script.onerror = function() {
      console.error(`Error al cargar ${libreria.nombre}`);
      alert(`No se pudo cargar la biblioteca ${libreria.nombre}. Verifique su conexión a Internet.`);
    };
    document.head.appendChild(script);
  });
}

// Ejecutar cuando la página cargue
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', cargarLibrerias);
} else {
  cargarLibrerias();
}

// Función de diagnóstico para depuración
function diagnosticarProblemas() {
  console.log('=== DIAGNÓSTICO PDF ===');
  console.log('Es móvil:', esMobile());
  console.log('Es navegador integrado:', esNavegadorIntegrado());
  console.log('User Agent:', navigator.userAgent);
  console.log('html2pdf disponible:', typeof html2pdf !== 'undefined');
  console.log('html2canvas disponible:', typeof html2canvas !== 'undefined');
  console.log('jsPDF disponible:', typeof jsPDF !== 'undefined');
  console.log('Elemento contenido existe:', !!document.getElementById('contenido'));
  console.log('======================');
}








