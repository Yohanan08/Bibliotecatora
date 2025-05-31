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

// Función principal corregida para descargar PDF
async function descargarPDF() {
  const element = document.getElementById('contenido');
  if (!element) {
    alert('Error: No se encontró el elemento con ID "contenido"');
    return;
  }

  // Verificar que el elemento tenga contenido visible
  if (element.offsetHeight === 0 || element.offsetWidth === 0) {
    alert('Error: El elemento está oculto o no tiene contenido');
    return;
  }

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

// Versión específicamente optimizada para móviles - CORREGIDA
async function descargarPDFMobile(element) {
  console.log('=== INICIANDO PROCESO MÓVIL CORREGIDO ===');
  
  // Diagnóstico inicial
  console.log('Elemento original:', element.offsetWidth, 'x', element.offsetHeight);
  console.log('Scroll dimensions:', element.scrollWidth, 'x', element.scrollHeight);
  
  // Esperar que todo esté renderizado
  await new Promise(resolve => setTimeout(resolve, 300));
  
  try {
    // Usar método directo mejorado
    await generarPDFMobileDirecto(element);
  } catch (error) {
    console.warn('Método directo falló, intentando alternativo:', error.message);
    try {
      await generarPDFMobileAlternativo(element);
    } catch (error2) {
      console.error('Todos los métodos fallaron:', error2.message);
      throw error2;
    }
  }
}

// Método principal mejorado para móvil
async function generarPDFMobileDirecto(element) {
  console.log('Generando PDF móvil - Método directo mejorado...');
  
  // Preparar el elemento para captura completa
  const estadoOriginal = prepararElementoParaCaptura(element);
  
  try {
    // Obtener dimensiones reales después de preparar
    const dimensiones = obtenerDimensionesReales(element);
    console.log('Dimensiones finales detectadas:', dimensiones);
    
    // Configuración optimizada para captura completa
    const opcionesCanvas = {
      scale: 0.8, // Reducir escala para mejor rendimiento
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: true,
      scrollY: 0,
      scrollX: 0,
      timeout: 60000,
      foreignObjectRendering: false,
      // CLAVE: Usar las dimensiones reales detectadas
      width: dimensiones.ancho,
      height: dimensiones.alto,
      windowWidth: Math.max(dimensiones.ancho, window.innerWidth),
      windowHeight: Math.max(dimensiones.alto, window.innerHeight)
    };

    const canvas = await html2canvas(element, opcionesCanvas);
    console.log('Canvas creado:', canvas.width, 'x', canvas.height);
    
    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error('Canvas vacío');
    }

    // Generar PDF con paginación correcta
    await crearPDFDesdCanvas(canvas, 'documento_mobile_directo');
    console.log('✓ PDF móvil generado exitosamente');
    
  } finally {
    // Restaurar estado original
    restaurarEstadoElemento(element, estadoOriginal);
  }
}

// Método alternativo para móvil
async function generarPDFMobileAlternativo(element) {
  console.log('Generando PDF móvil - Método alternativo...');
  
  // Crear contenedor temporal optimizado
  const contenedor = crearContenedorTemporal(element);
  
  try {
    // Esperar renderizado completo
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const dimensiones = obtenerDimensionesReales(contenedor);
    console.log('Dimensiones contenedor temporal:', dimensiones);
    
    const canvas = await html2canvas(contenedor, {
      scale: 0.75,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: true,
      scrollY: 0,
      scrollX: 0,
      timeout: 30000,
      width: dimensiones.ancho,
      height: dimensiones.alto,
      windowWidth: Math.max(dimensiones.ancho, window.innerWidth),
      windowHeight: Math.max(dimensiones.alto, window.innerHeight)
    });

    console.log('Canvas alternativo creado:', canvas.width, 'x', canvas.height);
    
    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error('Canvas alternativo vacío');
    }

    await crearPDFDesdCanvas(canvas, 'documento_mobile_alternativo');
    console.log('✓ PDF alternativo generado exitosamente');
    
  } finally {
    // Limpiar contenedor temporal
    if (contenedor.parentNode) {
      document.body.removeChild(contenedor);
    }
  }
}

// Función para preparar elemento para captura completa
function prepararElementoParaCaptura(element) {
  const estadoOriginal = {
    position: element.style.position,
    visibility: element.style.visibility,
    display: element.style.display,
    opacity: element.style.opacity,
    width: element.style.width,
    maxWidth: element.style.maxWidth,
    overflow: element.style.overflow,
    whiteSpace: element.style.whiteSpace
  };
  
  // Aplicar estilos para captura completa
  element.style.position = 'static';
  element.style.visibility = 'visible';
  element.style.display = 'block';
  element.style.opacity = '1';
  element.style.width = 'auto';
  element.style.maxWidth = 'none';
  element.style.overflow = 'visible';
  
  // Corregir elementos internos
  const elementosInternos = element.querySelectorAll('*');
  elementosInternos.forEach(el => {
    if (el.style.maxWidth) el.style.maxWidth = 'none';
    if (el.style.overflow === 'hidden') el.style.overflow = 'visible';
  });
  
  // Corregir tablas específicamente
  const tablas = element.querySelectorAll('table');
  tablas.forEach(tabla => {
    tabla.style.width = 'auto';
    tabla.style.tableLayout = 'auto';
    tabla.style.borderCollapse = 'collapse';
  });
  
  return estadoOriginal;
}

// Función para restaurar estado original
function restaurarEstadoElemento(element, estadoOriginal) {
  Object.keys(estadoOriginal).forEach(prop => {
    element.style[prop] = estadoOriginal[prop];
  });
}

// Función para obtener dimensiones reales
function obtenerDimensionesReales(element) {
  // Esperar un frame para que se apliquen los estilos
  element.offsetHeight; // Forzar reflow
  
  const ancho = Math.max(
    element.scrollWidth,
    element.offsetWidth,
    element.clientWidth,
    ...Array.from(element.querySelectorAll('*')).map(el => {
      return Math.max(el.scrollWidth || 0, el.offsetWidth || 0);
    })
  );
  
  const alto = Math.max(
    element.scrollHeight,
    element.offsetHeight,
    element.clientHeight
  );
  
  return {
    ancho: Math.max(ancho, 800), // Mínimo 800px de ancho
    alto: Math.max(alto, 100)    // Mínimo 100px de alto
  };
}

// Función para crear contenedor temporal optimizado
function crearContenedorTemporal(element) {
  const dimensiones = obtenerDimensionesReales(element);
  
  const contenedor = document.createElement('div');
  contenedor.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: ${dimensiones.ancho}px;
    min-width: ${dimensiones.ancho}px;
    background: white;
    z-index: 10000;
    visibility: visible;
    opacity: 1;
    padding: 20px;
    box-sizing: border-box;
    overflow: visible;
  `;
  
  // Clonar el contenido
  const elementoClonado = element.cloneNode(true);
  
  // Aplicar estilos para captura completa
  elementoClonado.style.cssText = `
    width: 100%;
    max-width: none;
    background: white;
    color: black;
    font-family: Arial, sans-serif;
    font-size: 14px;
    line-height: 1.4;
    display: block;
    visibility: visible;
    opacity: 1;
    overflow: visible;
  `;
  
  // Corregir elementos internos del clon
  const todosLosElementos = elementoClonado.querySelectorAll('*');
  todosLosElementos.forEach(el => {
    el.style.maxWidth = 'none';
    el.style.overflow = 'visible';
  });
  
  contenedor.appendChild(elementoClonado);
  document.body.appendChild(contenedor);
  
  return contenedor;
}

// Función mejorada para crear PDF desde canvas - SIN DUPLICACIÓN
async function crearPDFDesdCanvas(canvas, nombreArchivo) {
  const imgData = canvas.toDataURL('image/jpeg', 0.85);
  
  if (imgData.length < 1000) {
    throw new Error('Imagen generada muy pequeña o vacía');
  }

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  // Obtener dimensiones de la página
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Calcular dimensiones de imagen con márgenes
  const margin = 10; // 10mm de margen
  const maxWidth = pageWidth - (margin * 2);
  const maxHeight = pageHeight - (margin * 2);
  
  // Calcular escala manteniendo proporción
  const scaleX = maxWidth / (canvas.width * 0.264583); // Convertir px a mm
  const scaleY = maxHeight / (canvas.height * 0.264583);
  const scale = Math.min(scaleX, scaleY, 1); // No escalar hacia arriba
  
  const imgWidth = (canvas.width * 0.264583) * scale;
  const imgHeight = (canvas.height * 0.264583) * scale;
  
  console.log('Dimensiones PDF calculadas:', {
    pageWidth, pageHeight,
    imgWidth, imgHeight,
    scale,
    canvasSize: `${canvas.width}x${canvas.height}`
  });
  
  // CORRECCIÓN CLAVE: Calcular paginación correctamente
  let currentY = margin;
  const pageContentHeight = pageHeight - (margin * 2);
  
  if (imgHeight <= pageContentHeight) {
    // La imagen cabe en una sola página
    pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight);
  } else {
    // La imagen necesita múltiples páginas
    const totalPages = Math.ceil(imgHeight / pageContentHeight);
    console.log(`Dividiendo en ${totalPages} páginas`);
    
    for (let page = 0; page < totalPages; page++) {
      if (page > 0) {
        pdf.addPage();
      }
      
      // Calcular la posición Y para esta página
      const offsetY = -(page * pageContentHeight);
      
      pdf.addImage(
        imgData, 
        'JPEG', 
        margin,           // x
        margin + offsetY, // y (negativo para mostrar parte inferior)
        imgWidth,         // width
        imgHeight         // height (mantener altura original)
      );
      
      console.log(`Página ${page + 1}: offsetY = ${offsetY}`);
    }
  }

  const timestamp = new Date().getTime();
  pdf.save(`${nombreArchivo}_${timestamp}.pdf`);
  
  console.log('PDF guardado exitosamente');
}

// Versión corregida para escritorio
async function descargarPDFDesktop(element) {
  console.log('Generando PDF para desktop...');
  
  // Esperar renderizado
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Preparar elemento
  const estadoOriginal = prepararElementoParaCaptura(element);
  
  try {
    const dimensiones = obtenerDimensionesReales(element);
    console.log('Dimensiones desktop:', dimensiones);

    const opciones = {
      margin: [10, 10, 10, 10],
      filename: `documento_desktop_${new Date().getTime()}.pdf`,
      image: { 
        type: 'jpeg', 
        quality: 0.95 
      },
      html2canvas: {
        scale: 1.2,
        useCORS: true,
        allowTaint: true,
        logging: true,
        backgroundColor: '#ffffff',
        scrollY: 0,
        scrollX: 0,
        width: dimensiones.ancho,
        height: dimensiones.alto,
        windowWidth: Math.max(dimensiones.ancho, window.innerWidth),
        windowHeight: Math.max(dimensiones.alto, window.innerHeight)
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      },
      pagebreak: { 
        mode: ['css', 'legacy'],
        avoid: ['tr', 'td', 'img']
      }
    };

    await html2pdf().set(opciones).from(element).save();
    console.log('PDF desktop generado exitosamente');
    
  } finally {
    restaurarEstadoElemento(element, estadoOriginal);
  }
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

// Método alternativo usando solo html2canvas + jsPDF - CORREGIDO
async function descargarPDFAlternativo() {
  const element = document.getElementById('contenido');
  if (!element) {
    alert('Error: No se encontró el elemento con ID "contenido"');
    return;
  }

  mostrarIndicadorCarga(true);

  try {
    console.log('Usando método alternativo corregido...');
    
    const estadoOriginal = prepararElementoParaCaptura(element);
    
    try {
      const dimensiones = obtenerDimensionesReales(element);
      
      const canvas = await html2canvas(element, {
        scale: 1.2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: true,
        scrollY: 0,
        scrollX: 0,
        width: dimensiones.ancho,
        height: dimensiones.alto,
        windowWidth: Math.max(dimensiones.ancho, window.innerWidth),
        windowHeight: Math.max(dimensiones.alto, window.innerHeight)
      });

      console.log('Canvas alternativo creado:', canvas.width, 'x', canvas.height);

      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error('El canvas está vacío');
      }

      await crearPDFDesdCanvas(canvas, 'documento_alternativo');
      
    } finally {
      restaurarEstadoElemento(element, estadoOriginal);
    }

  } catch (error) {
    console.error('Error con método alternativo:', error);
    alert('Error con el método alternativo: ' + error.message);
  } finally {
    mostrarIndicadorCarga(false);
  }
}

// Inicialización de botones
function inicializarBotonesPDF() {
  console.log('Inicializando botones PDF...');
  
  const botonPDF = document.getElementById('btn-descargar-pdf');
  if (botonPDF) {
    botonPDF.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Botón PDF principal clickeado');
      descargarPDF();
    });
    console.log('Botón principal configurado');
  }
  
  const botones = document.querySelectorAll('.btn-descargar-pdf');
  botones.forEach((boton, index) => {
    boton.addEventListener('click', function(e) {
      e.preventDefault();
      console.log(`Botón PDF ${index} clickeado`);
      descargarPDF();
    });
  });
  console.log(`${botones.length} botones con clase configurados`);

  const botonAlternativo = document.getElementById('btn-pdf-alternativo');
  if (botonAlternativo) {
    botonAlternativo.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Botón alternativo clickeado');
      descargarPDFAlternativo();
    });
    console.log('Botón alternativo configurado');
  }
}

// Cargar librerías con mejor manejo de errores
function cargarLibrerias() {
  console.log('Iniciando carga de librerías...');
  
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
  
  if (typeof window.jspdf === 'undefined') {
    libreriasPorCargar.push({
      url: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
      nombre: 'jsPDF'
    });
  }

  console.log(`Librerías por cargar: ${libreriasPorCargar.length}`);

  if (libreriasPorCargar.length === 0) {
    console.log('Todas las librerías ya están cargadas');
    inicializarBotonesPDF();
    return;
  }

  let libreriasCargadas = 0;
  
  libreriasPorCargar.forEach(libreria => {
    const script = document.createElement('script');
    script.src = libreria.url;
    script.crossOrigin = 'anonymous';
    script.onload = function() {
      console.log(`✓ ${libreria.nombre} cargada correctamente`);
      libreriasCargadas++;
      if (libreriasCargadas === libreriasPorCargar.length) {
        console.log('Todas las librerías cargadas, inicializando...');
        setTimeout(inicializarBotonesPDF, 100);
      }
    };
    script.onerror = function() {
      console.error(`✗ Error al cargar ${libreria.nombre} desde ${libreria.url}`);
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

// Función de diagnóstico mejorada
function diagnosticarProblemas() {
  console.log('=== DIAGNÓSTICO PDF MEJORADO ===');
  console.log('Es móvil:', esMobile());
  console.log('Es navegador integrado:', esNavegadorIntegrado());
  console.log('User Agent:', navigator.userAgent);
  console.log('Viewport:', window.innerWidth, 'x', window.innerHeight);
  console.log('html2pdf disponible:', typeof html2pdf !== 'undefined');
  console.log('html2canvas disponible:', typeof html2canvas !== 'undefined');
  console.log('jsPDF disponible:', typeof window.jspdf !== 'undefined');
  
  const elemento = document.getElementById('contenido');
  console.log('Elemento contenido existe:', !!elemento);
  if (elemento) {
    const dimensiones = obtenerDimensionesReales(elemento);
    const rect = elemento.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(elemento);
    
    console.log('Dimensiones calculadas:', dimensiones);
    console.log('Dimensiones del elemento:', elemento.offsetWidth, 'x', elemento.offsetHeight);
    console.log('Scroll dimensions:', elemento.scrollWidth, 'x', elemento.scrollHeight);
    console.log('BoundingClientRect:', rect.width, 'x', rect.height);
    console.log('Elemento visible:', elemento.offsetWidth > 0 && elemento.offsetHeight > 0);
    console.log('Display style:', computedStyle.display);
    console.log('Visibility style:', computedStyle.visibility);
    console.log('Opacity style:', computedStyle.opacity);
    
    // Verificar contenido crítico
    const textoVisible = elemento.innerText || elemento.textContent;
    console.log('Texto encontrado:', textoVisible ? textoVisible.length + ' caracteres' : 'Sin texto');
    
    const imagenes = elemento.querySelectorAll('img');
    console.log('Imágenes encontradas:', imagenes.length);
    
    const tablas = elemento.querySelectorAll('table');
    console.log('Tablas encontradas:', tablas.length);
    if (tablas.length > 0) {
      tablas.forEach((tabla, i) => {
        console.log(`Tabla ${i}: ${tabla.offsetWidth}x${tabla.offsetHeight}, scrollWidth: ${tabla.scrollWidth}`);
      });
    }
  }
  
  console.log('=====================================');
}

// Exponer funciones de diagnóstico globalmente
window.diagnosticarProblemas = diagnosticarProblemas;








