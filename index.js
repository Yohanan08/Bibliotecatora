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
function descargarPDF() {
  // Obtener el elemento a convertir
  const element = document.getElementById('contenido');
  if (!element) {
    alert('Error: No se encontró el elemento con ID "contenido"');
    return;
  }
  
  // Opciones mejoradas para evitar cortes en las páginas
  const opciones = {
    margin: [15, 15, 15, 15], // Márgenes más amplios (arriba, derecha, abajo, izquierda)
    filename: 'documento.pdf',
    image: { type: 'jpeg', quality: 1.0 }, // Máxima calidad
    html2canvas: {
      scale: 1.3, // Mayor escala para mejor resolución
      useCORS: true,
      logging: false, // Desactivar logs
      letterRendering: true, // Mejor renderizado de texto
      allowTaint: true, // Permite contenido de otras fuentes
      scrollY: 0, // Evita problemas con el scroll
      // Evitar problemas de recorte con estas opciones
      windowWidth: document.documentElement.offsetWidth,
      windowHeight: document.documentElement.offsetHeight
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
      compress: true, // Mejora la gestión de imágenes
      precision: 16 // Mayor precisión para el posicionamiento
    },
    pagebreak: { 
      mode: ['avoid-all', 'css', 'legacy'], // Evitar cortes en elementos
      before: '.page-break-before',
      after: '.page-break-after',
      avoid: ['tr', 'td', 'div', 'p', 'img', 'table'] // Evitar cortar estos elementos
    }
  };
  
  // Usar un método más directo y simple
  try {
    html2pdf().set(opciones).from(element).save()
      .catch(function(error) {
        console.error('Error al generar PDF:', error);
        alert('Hubo un problema al generar el PDF. Por favor, intente de nuevo.');
      });
  } catch (error) {
    console.error('Error inesperado:', error);
    alert('Error inesperado al generar el PDF.');
  }
}

// Para uso directo con botón
function inicializarBotonesPDF() {
  // Para un botón específico con ID
  const botonPDF = document.getElementById('btn-descargar-pdf');
  if (botonPDF) {
    botonPDF.addEventListener('click', function(e) {
      e.preventDefault();
      descargarPDF();
    });
  }
  
  // Para cualquier botón con la clase 'btn-descargar-pdf'
  const botones = document.querySelectorAll('.btn-descargar-pdf');
  botones.forEach(boton => {
    boton.addEventListener('click', function(e) {
      e.preventDefault();
      descargarPDF();
    });
  });
}

// Verificar si la biblioteca está disponible y cargarla si no lo está
function verificarLibreriaHTML2PDF() {
  if (typeof html2pdf === 'undefined') {
    console.log('Cargando biblioteca html2pdf.js...');
    
    // Cargar html2pdf desde CDN
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    script.integrity = 'sha512-GsLlZN/3F2ErC5ifS5QtgpiJtWd43JWSuIgh7mbzZ8zBps+dvLusV+eNQATqgA/HdeKFVgA5v3S/cIrLF7QnIg==';
    script.crossOrigin = 'anonymous';
    script.onload = function() {
      console.log('La biblioteca html2pdf.js se cargó correctamente');
      // Inicializar botones después de cargar la biblioteca
      inicializarBotonesPDF();
    };
    script.onerror = function() {
      console.error('Error al cargar la biblioteca html2pdf.js');
      alert('No se pudo cargar la biblioteca necesaria para generar el PDF. Verifique su conexión a Internet.');
    };
    document.head.appendChild(script);
  } else {
    // La biblioteca ya está cargada, inicializar botones
    inicializarBotonesPDF();
  }
}

// Ejecutar verificación cuando la página cargue
window.addEventListener('load', verificarLibreriaHTML2PDF);








