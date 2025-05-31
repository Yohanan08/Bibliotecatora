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
async function descargarPDFMultiplesPaginas() {
  const element = document.getElementById('contenido');
  if (!element) {
    alert('Error: No se encontró el elemento con ID "contenido"');
    return;
  }

  mostrarIndicadorCarga(true);

  try {
    console.log('Iniciando generación de PDF con múltiples páginas...');
    
    // Método 1: Dividir contenido por elementos
    await generarPDFPorElementos(element);
    
  } catch (error) {
    console.error('Error:', error);
    try {
      // Método 2: Dividir por altura fija
      console.log('Intentando método alternativo...');
      await generarPDFPorAlturaFija(element);
    } catch (error2) {
      console.error('Todos los métodos fallaron:', error2);
      alert('Error al generar PDF: ' + error2.message);
    }
  } finally {
    mostrarIndicadorCarga(false);
  }
}

// MÉTODO 1: Dividir contenido por elementos individuales
async function generarPDFPorElementos(contenedor) {
  console.log('=== MÉTODO 1: División por elementos ===');
  
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  // Dimensiones de página A4
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  const contentHeight = pageHeight - (margin * 2);
  
  let currentY = margin;
  let pageNumber = 1;
  
  // Obtener todos los elementos hijos principales
  const elementos = Array.from(contenedor.children);
  console.log(`Procesando ${elementos.length} elementos principales`);
  
  for (let i = 0; i < elementos.length; i++) {
    const elemento = elementos[i];
    
    // Ocultar temporalmente otros elementos
    const estadosOriginales = ocultarOtrosElementos(contenedor, elemento);
    
    try {
      // Preparar elemento para captura
      const estadoElemento = prepararElementoParaCaptura(elemento);
      
      try {
        // Crear canvas del elemento individual
        const canvas = await html2canvas(elemento, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: 750, // Anchura fija para consistencia
          height: elemento.scrollHeight || 200,
          scrollY: 0,
          scrollX: 0
        });
        
        if (canvas.width > 0 && canvas.height > 0) {
          // Convertir canvas a imagen
          const imgData = canvas.toDataURL('image/jpeg', 0.9);
          
          // Calcular dimensiones en el PDF
          const imgWidthMM = contentWidth;
          const imgHeightMM = (canvas.height * contentWidth) / canvas.width;
          
          console.log(`Elemento ${i + 1}: ${imgWidthMM.toFixed(1)}x${imgHeightMM.toFixed(1)}mm`);
          
          // Verificar si cabe en la página actual
          if (currentY + imgHeightMM > pageHeight - margin && pageNumber > 1) {
            // Nueva página
            pdf.addPage();
            currentY = margin;
            pageNumber++;
            console.log(`Nueva página ${pageNumber}`);
          }
          
          // Agregar imagen al PDF
          pdf.addImage(imgData, 'JPEG', margin, currentY, imgWidthMM, imgHeightMM);
          currentY += imgHeightMM + 5; // Espaciado entre elementos
          
          console.log(`Elemento agregado en posición Y: ${currentY}`);
        }
        
      } finally {
        restaurarEstadoElemento(elemento, estadoElemento);
      }
      
    } finally {
      restaurarVisibilidadElementos(estadosOriginales);
    }
    
    // Pequeña pausa entre elementos
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`PDF generado con ${pageNumber} páginas`);
  
  // Guardar PDF
  const timestamp = new Date().getTime();
  pdf.save(`documento_elementos_${timestamp}.pdf`);
}

// MÉTODO 2: Dividir por altura fija (más confiable)
async function generarPDFPorAlturaFija(element) {
  console.log('=== MÉTODO 2: División por altura fija ===');
  
  // Preparar elemento completo
  const estadoOriginal = prepararElementoCompleto(element);
  
  try {
    // Crear canvas del contenido completo
    const canvas = await html2canvas(element, {
      scale: 1.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 794, // A4 width
      height: element.scrollHeight,
      scrollY: 0,
      scrollX: 0
    });
    
    console.log(`Canvas completo: ${canvas.width}x${canvas.height}px`);
    
    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error('Canvas vacío');
    }
    
    // Dividir canvas en páginas
    await dividirCanvasEnPaginas(canvas, 'documento_altura_fija');
    
  } finally {
    restaurarEstadoElemento(element, estadoOriginal);
  }
}

// Función para dividir canvas en páginas físicas
async function dividirCanvasEnPaginas(canvas, nombreArchivo) {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  // Dimensiones
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;
  const contentWidth = pageWidth - (margin * 2);
  const contentHeight = pageHeight - (margin * 2);
  
  // Convertir dimensiones a mm
  const canvasWidthMM = canvas.width * 0.264583;
  const canvasHeightMM = canvas.height * 0.264583;
  
  // Escala para ajustar al ancho
  const scale = contentWidth / canvasWidthMM;
  const scaledHeight = canvasHeightMM * scale;
  
  // Calcular páginas necesarias
  const pagesNeeded = Math.ceil(scaledHeight / contentHeight);
  console.log(`Dividiendo en ${pagesNeeded} páginas`);
  
  // Crear cada página
  for (let pageNum = 0; pageNum < pagesNeeded; pageNum++) {
    if (pageNum > 0) {
      pdf.addPage();
    }
    
    // Crear canvas temporal para esta página
    const pageCanvas = document.createElement('canvas');
    const pageCtx = pageCanvas.getContext('2d');
    
    // Dimensiones del canvas de página
    const pageCanvasHeight = Math.min(
      canvas.height / pagesNeeded,
      canvas.height - (pageNum * canvas.height / pagesNeeded)
    );
    
    pageCanvas.width = canvas.width;
    pageCanvas.height = pageCanvasHeight;
    
    // Dibujar porción de la imagen original
    pageCtx.drawImage(
      canvas,
      0, pageNum * (canvas.height / pagesNeeded), // source x, y
      canvas.width, pageCanvasHeight, // source width, height
      0, 0, // dest x, y
      canvas.width, pageCanvasHeight // dest width, height
    );
    
    // Convertir a imagen y agregar al PDF
    const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.9);
    pdf.addImage(pageImgData, 'JPEG', margin, margin, contentWidth, contentHeight);
    
    console.log(`Página ${pageNum + 1}/${pagesNeeded} completada`);
  }
  
  // Guardar
  const timestamp = new Date().getTime();
  pdf.save(`${nombreArchivo}_${timestamp}.pdf`);
  console.log('PDF guardado exitosamente');
}

// MÉTODO 3: Usando html2pdf con configuración especial
async function generarPDFConHtml2pdf(element) {
  console.log('=== MÉTODO 3: html2pdf optimizado ===');
  
  const estadoOriginal = prepararElementoCompleto(element);
  
  try {
    const options = {
      margin: [10, 10, 10, 10],
      filename: `documento_html2pdf_${new Date().getTime()}.pdf`,
      image: { 
        type: 'jpeg', 
        quality: 0.98 
      },
      html2canvas: {
        scale: 1.5,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 794,
        height: element.scrollHeight
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      },
      pagebreak: { 
        mode: ['avoid-all', 'css', 'legacy'],
        before: '.page-break-before',
        after: '.page-break-after',
        avoid: ['tr', 'td']
      }
    };

    await html2pdf().set(options).from(element).save();
    console.log('PDF con html2pdf generado');
    
  } finally {
    restaurarEstadoElemento(element, estadoOriginal);
  }
}

// Funciones auxiliares mejoradas
function prepararElementoCompleto(element) {
  const estadoOriginal = {
    position: element.style.position,
    width: element.style.width,
    maxWidth: element.style.maxWidth,
    overflow: element.style.overflow,
    visibility: element.style.visibility,
    display: element.style.display,
    backgroundColor: element.style.backgroundColor,
    color: element.style.color,
    fontSize: element.style.fontSize,
    lineHeight: element.style.lineHeight,
    fontFamily: element.style.fontFamily
  };
  
  // Aplicar estilos optimizados
  element.style.position = 'static';
  element.style.width = '794px';
  element.style.maxWidth = '794px';
  element.style.overflow = 'visible';
  element.style.visibility = 'visible';
  element.style.display = 'block';
  element.style.backgroundColor = '#ffffff';
  element.style.color = '#000000';
  element.style.fontSize = '14px';
  element.style.lineHeight = '1.4';
  element.style.fontFamily = 'Arial, sans-serif';
  element.style.padding = '20px';
  element.style.boxSizing = 'border-box';
  
  // Corregir elementos hijos
  const todos = element.querySelectorAll('*');
  todos.forEach(el => {
    // Tablas
    if (el.tagName === 'TABLE') {
      el.style.width = '100%';
      el.style.tableLayout = 'fixed';
      el.style.borderCollapse = 'collapse';
      el.style.pageBreakInside = 'auto';
    }
    
    // Imágenes
    if (el.tagName === 'IMG') {
      el.style.maxWidth = '100%';
      el.style.height = 'auto';
      el.style.display = 'block';
    }
    
    // Divs y otros contenedores
    if (el.style.position === 'absolute' || el.style.position === 'fixed') {
      el.style.position = 'static';
    }
    
    if (el.style.overflow === 'hidden') {
      el.style.overflow = 'visible';
    }
    
    if (el.style.maxWidth) {
      el.style.maxWidth = '100%';
    }
  });
  
  return estadoOriginal;
}

function prepararElementoParaCaptura(element) {
  const estado = {
    display: element.style.display,
    visibility: element.style.visibility,
    position: element.style.position,
    width: element.style.width,
    maxWidth: element.style.maxWidth
  };
  
  element.style.display = 'block';
  element.style.visibility = 'visible';
  element.style.position = 'static';
  element.style.width = '750px';
  element.style.maxWidth = '750px';
  element.style.backgroundColor = '#ffffff';
  element.style.color = '#000000';
  element.style.padding = '10px';
  element.style.margin = '5px 0';
  element.style.boxSizing = 'border-box';
  
  return estado;
}

function ocultarOtrosElementos(contenedor, elementoActivo) {
  const estados = [];
  Array.from(contenedor.children).forEach(child => {
    if (child !== elementoActivo) {
      estados.push({
        elemento: child,
        display: child.style.display
      });
      child.style.display = 'none';
    }
  });
  return estados;
}

function restaurarVisibilidadElementos(estados) {
  estados.forEach(({elemento, display}) => {
    elemento.style.display = display;
  });
}

function restaurarEstadoElemento(element, estado) {
  Object.keys(estado).forEach(prop => {
    element.style[prop] = estado[prop];
  });
}

// Función para mostrar indicador de carga
function mostrarIndicadorCarga(mostrar) {
  let indicador = document.getElementById('pdf-loading-indicator');
  
  if (mostrar && !indicador) {
    indicador = document.createElement('div');
    indicador.id = 'pdf-loading-indicator';
    indicador.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 99999;
        color: white;
        font-family: Arial, sans-serif;
      ">
        <div style="text-align: center; background: rgba(0,0,0,0.9); padding: 30px; border-radius: 10px;">
          <div style="
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3498db;
            border-radius: 50%;
            width: 60px;
            height: 60px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
          "></div>
          <h3 style="margin: 0 0 10px 0;">Generando PDF</h3>
          <p style="margin: 0;">Esto puede tomar unos momentos...</p>
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
  
  if (indicador) {
    indicador.style.display = mostrar ? 'flex' : 'none';
  }
}

// Inicialización y configuración de botones
function inicializarGeneradorPDF() {
  console.log('Inicializando generador PDF mejorado...');
  
  // Verificar librerías
  if (typeof html2canvas === 'undefined' || typeof window.jspdf === 'undefined') {
    console.log('Cargando librerías necesarias...');
    cargarLibreriasNecesarias();
    return;
  }
  
  // Configurar botones
  configurarBotonesPDF();
}

function configurarBotonesPDF() {
  // Botón principal
  const botonPrincipal = document.getElementById('btn-descargar-pdf');
  if (botonPrincipal) {
    botonPrincipal.addEventListener('click', function(e) {
      e.preventDefault();
      descargarPDFMultiplesPaginas();
    });
  }
  
  // Botones con clase
  const botones = document.querySelectorAll('.btn-descargar-pdf');
  botones.forEach(boton => {
    boton.addEventListener('click', function(e) {
      e.preventDefault();
      descargarPDFMultiplesPaginas();
    });
  });
  
  // Crear botones de prueba si no existen
  if (!botonPrincipal && botones.length === 0) {
    crearBotonesPrueba();
  }
  
  console.log('Botones PDF configurados correctamente');
}

function crearBotonesPrueba() {
  const contenedor = document.createElement('div');
  contenedor.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    background: white;
    padding: 15px;
    border: 2px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  `;
  
  contenedor.innerHTML = `
    <h4 style="margin: 0 0 10px 0;">Opciones PDF:</h4>
    <button id="btn-metodo1" style="display: block; width: 100%; margin: 5px 0; padding: 8px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
      Método 1: Por elementos
    </button>
    <button id="btn-metodo2" style="display: block; width: 100%; margin: 5px 0; padding: 8px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">
      Método 2: Por altura
    </button>
    <button id="btn-metodo3" style="display: block; width: 100%; margin: 5px 0; padding: 8px; background: #ffc107; color: black; border: none; border-radius: 4px; cursor: pointer;">
      Método 3: html2pdf
    </button>
  `;
  
  document.body.appendChild(contenedor);
  
  // Configurar eventos
  document.getElementById('btn-metodo1').addEventListener('click', () => {
    const element = document.getElementById('contenido');
    if (element) {
      mostrarIndicadorCarga(true);
      generarPDFPorElementos(element).finally(() => mostrarIndicadorCarga(false));
    }
  });
  
  document.getElementById('btn-metodo2').addEventListener('click', () => {
    const element = document.getElementById('contenido');
    if (element) {
      mostrarIndicadorCarga(true);
      generarPDFPorAlturaFija(element).finally(() => mostrarIndicadorCarga(false));
    }
  });
  
  document.getElementById('btn-metodo3').addEventListener('click', () => {
    const element = document.getElementById('contenido');
    if (element) {
      mostrarIndicadorCarga(true);
      generarPDFConHtml2pdf(element).finally(() => mostrarIndicadorCarga(false));
    }
  });
}

function cargarLibreriasNecesarias() {
  const librerías = [
    {
      test: () => typeof html2canvas !== 'undefined',
      url: 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
      nombre: 'html2canvas'
    },
    {
      test: () => typeof window.jspdf !== 'undefined',
      url: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
      nombre: 'jsPDF'
    },
    {
      test: () => typeof html2pdf !== 'undefined',
      url: 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js',
      nombre: 'html2pdf'
    }
  ];
  
  const porCargar = librerías.filter(lib => !lib.test());
  let cargadas = 0;
  
  if (porCargar.length === 0) {
    configurarBotonesPDF();
    return;
  }
  
  porCargar.forEach(lib => {
    const script = document.createElement('script');
    script.src = lib.url;
    script.onload = () => {
      console.log(`✓ ${lib.nombre} cargada`);
      cargadas++;
      if (cargadas === porCargar.length) {
        setTimeout(configurarBotonesPDF, 100);
      }
    };
    script.onerror = () => {
      console.error(`✗ Error cargando ${lib.nombre}`);
    };
    document.head.appendChild(script);
  });
}

// Auto-inicialización
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarGeneradorPDF);
} else {
  inicializarGeneradorPDF();
}

// Exponer funciones principales
window.descargarPDFMultiplesPaginas = descargarPDFMultiplesPaginas;
window.generarPDFPorElementos = generarPDFPorElementos;
window.generarPDFPorAlturaFija = generarPDFPorAlturaFija;
window.generarPDFConHtml2pdf = generarPDFConHtml2pdf;








