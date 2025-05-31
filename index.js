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

// Función principal para descargar PDF
async function descargarPDF() {
  const element = document.getElementById('contenido');
  if (!element) {
    alert('Error: No se encontró el elemento con ID "contenido"');
    return;
  }

  if (element.offsetHeight === 0 || element.offsetWidth === 0) {
    alert('Error: El elemento "contenido" está oculto o no tiene dimensiones visibles.');
    diagnosticarProblemas(); // Ayuda a depurar
    return;
  }

  mostrarIndicadorCarga(true);

  try {
    // Para navegadores integrados o móviles, priorizar el método html2canvas + jsPDF
    // ya que html2pdf.js puede ser más pesado o tener problemas.
    if (esNavegadorIntegrado() || esMobile()) {
       console.log('Detectado móvil o navegador integrado. Usando método html2canvas + jsPDF.');
       await generarPDFConHtml2Canvas(element, 'documento_movil');
    } else {
       console.log('Detectado escritorio. Usando html2pdf.js.');
       await descargarPDFDesktop(element);
    }
  } catch (error) {
    console.error('Error principal al generar PDF:', error);
    alert('Hubo un problema al generar el PDF. Por favor, intente de nuevo o use el método alternativo si está disponible. Detalles: ' + error.message);
    // Como fallback general, se podría intentar el otro método si uno falla.
    // Por ejemplo, si descargarPDFDesktop falla, intentar generarPDFConHtml2Canvas.
    // Esto depende de la complejidad que quieras añadir.
  } finally {
    mostrarIndicadorCarga(false);
  }
}


// Método que usa html2canvas y luego jsPDF (para móviles o como alternativo)
async function generarPDFConHtml2Canvas(element, nombreArchivoBase) {
  console.log(`Iniciando generación de PDF con html2canvas para: ${nombreArchivoBase}`);

  const estadoOriginal = prepararElementoParaCaptura(element);
  await new Promise(resolve => setTimeout(resolve, 250)); // Pequeña pausa para aplicar estilos

  try {
    const dimensiones = obtenerDimensionesReales(element);
    console.log('Dimensiones reales para captura:', dimensiones);

    if (dimensiones.ancho === 0 || dimensiones.alto === 0) {
        throw new Error('El elemento a capturar no tiene dimensiones después de la preparación.');
    }

    const opcionesCanvas = {
      scale: window.devicePixelRatio || 1.5, // Escala basada en DPI para mejor calidad
      useCORS: true,
      allowTaint: true, // Si useCORS no funciona para algunas imágenes
      backgroundColor: '#ffffff',
      logging: true,
      scrollX: 0,
      scrollY: 0,
      width: dimensiones.ancho,
      height: dimensiones.alto,
      windowWidth: dimensiones.ancho, // Forzar a html2canvas a usar el ancho del contenido
      windowHeight: dimensiones.alto, // Forzar a html2canvas a usar el alto del contenido
      imageTimeout: 30000, // Aumentar timeout para imágenes lentas
      foreignObjectRendering: true, // Puede ayudar con SVGs y algunas fuentes
    };

    console.log('Opciones de html2canvas:', opcionesCanvas);
    const canvas = await html2canvas(element, opcionesCanvas);
    console.log('Canvas creado:', canvas.width, 'x', canvas.height);

    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error('Canvas generado está vacío (0x0). Verifique el contenido y estilos CSS.');
    }

    await crearPDFDesdeCanvasPaginado(canvas, nombreArchivoBase);
    console.log(`✓ PDF (${nombreArchivoBase}) generado exitosamente con html2canvas.`);

  } catch (error) {
    console.error(`Error en generarPDFConHtml2Canvas (${nombreArchivoBase}):`, error);
    throw error; // Re-lanzar para que la función llamante lo maneje
  } finally {
    restaurarEstadoElemento(element, estadoOriginal);
  }
}


// Función MEJORADA para crear PDF desde UN canvas, paginando la imagen
async function crearPDFDesdeCanvasPaginado(canvas, nombreArchivoBase) {
  console.log('Iniciando creación de PDF paginado desde canvas...');
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('p', 'mm', 'a4'); // Portrait, mm, A4

  const A4_PAPER_WIDTH_MM = 210;
  const A4_PAPER_HEIGHT_MM = 297;
  const PDF_MARGIN_MM = 15; // Margen en mm para todas las direcciones

  const pageWidth = A4_PAPER_WIDTH_MM;
  const pageHeight = A4_PAPER_HEIGHT_MM;

  const contentWidthMM = pageWidth - (PDF_MARGIN_MM * 2);
  const contentHeightMM = pageHeight - (PDF_MARGIN_MM * 2);

  // Convertir dimensiones del canvas (pixels) a mm para cálculos
  // Asumimos una densidad de ~96 DPI para la conversión px -> mm (1 pulgada = 25.4mm)
  // O, mejor, usar una escala consistente. html2canvas usa 96dpi por defecto.
  const PX_TO_MM = 0.264583333; // 1px = 0.264583333 mm (a 96 DPI)

  const sourceImgWidthMM = canvas.width * PX_TO_MM;
  const sourceImgHeightMM = canvas.height * PX_TO_MM;

  console.log(`Dimensiones canvas original (px): ${canvas.width}x${canvas.height}`);
  console.log(`Dimensiones canvas original (mm): ${sourceImgWidthMM.toFixed(2)}x${sourceImgHeightMM.toFixed(2)}`);
  console.log(`Area útil página PDF (mm): ${contentWidthMM.toFixed(2)}x${contentHeightMM.toFixed(2)}`);

  // Calcular la escala para que la imagen del canvas quepa en el ancho del contenido del PDF
  let scale = 1;
  if (sourceImgWidthMM > contentWidthMM) {
    scale = contentWidthMM / sourceImgWidthMM;
  }

  const scaledSourceImgWidthMM = sourceImgWidthMM * scale;
  const scaledSourceImgHeightMM = sourceImgHeightMM * scale;

  console.log(`Escala aplicada: ${scale.toFixed(3)}`);
  console.log(`Dimensiones imagen escalada (mm): ${scaledSourceImgWidthMM.toFixed(2)}x${scaledSourceImgHeightMM.toFixed(2)}`);

  let yPosOnSourceImg = 0; // En pixels, la posición Y actual en el canvas fuente
  const scaledContentHeightPX = contentHeightMM / (PX_TO_MM * scale); // Alto de página PDF en píxeles de la imagen fuente escalada

  let pageCount = 0;

  // Crear un canvas temporal para dibujar cada porción de página
  const tempPageCanvas = document.createElement('canvas');
  const tempPageCtx = tempPageCanvas.getContext('2d');

  while (yPosOnSourceImg < canvas.height) {
    if (pageCount > 0) {
      pdf.addPage();
    }
    pageCount++;
    console.log(`Procesando página PDF ${pageCount}`);

    // Determinar alto de la porción a dibujar en esta página
    let SlicedHeightPX = Math.min(scaledContentHeightPX, canvas.height - yPosOnSourceImg);
    
    // Configurar canvas temporal al tamaño de la porción
    tempPageCanvas.width = canvas.width; // Usar ancho original del canvas fuente
    tempPageCanvas.height = SlicedHeightPX;

    console.log(`  Canvas fuente (x,y,w,h): 0, ${yPosOnSourceImg}, ${canvas.width}, ${SlicedHeightPX}`);
    console.log(`  Canvas temporal (w,h): ${tempPageCanvas.width}, ${tempPageCanvas.height}`);

    // Dibujar la porción del canvas original en el canvas temporal
    // (drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight))
    tempPageCtx.drawImage(
      canvas,
      0,                      // sx: Desde x=0 del canvas fuente
      yPosOnSourceImg,        // sy: Desde la posición Y actual del canvas fuente
      canvas.width,           // sWidth: Ancho completo del canvas fuente
      SlicedHeightPX,         // sHeight: Alto de la porción a copiar
      0,                      // dx: Dibujar en x=0 del canvas temporal
      0,                      // dy: Dibujar en y=0 del canvas temporal
      canvas.width,           // dWidth: Ancho completo en el canvas temporal
      SlicedHeightPX          // dHeight: Alto completo en el canvas temporal
    );
    
    const pageImgData = tempPageCanvas.toDataURL('image/jpeg', 0.90); // Calidad JPEG

    if (pageImgData.length < 1000) {
      console.warn(`  Imagen generada para página ${pageCount} es muy pequeña o vacía.`);
      // Podría ser el final y no quedar mucho contenido.
    }
    
    // Calcular dimensiones de la imagen de esta página en el PDF
    const currentImgHeightMM = (SlicedHeightPX * PX_TO_MM) * scale; // Alto de esta porción escalada

    pdf.addImage(
      pageImgData,
      'JPEG',
      PDF_MARGIN_MM,
      PDF_MARGIN_MM,
      scaledSourceImgWidthMM, // Ancho de la imagen en el PDF (escalado)
      currentImgHeightMM      // Alto de la imagen de ESTA página en el PDF
    );
    console.log(`  Imagen añadida a PDF: x=${PDF_MARGIN_MM}, y=${PDF_MARGIN_MM}, w=${scaledSourceImgWidthMM.toFixed(2)}, h=${currentImgHeightMM.toFixed(2)}`);

    yPosOnSourceImg += SlicedHeightPX;
  }

  // Limpiar canvas temporal
  tempPageCanvas.width = tempPageCanvas.height = 0;


  const timestamp = new Date().getTime();
  pdf.save(`${nombreArchivoBase}_${timestamp}.pdf`);
  console.log('PDF paginado guardado exitosamente.');
}


// Función para preparar elemento para captura completa
function prepararElementoParaCaptura(element) {
  console.log('Preparando elemento para captura...');
  const originalStyles = {
    position: element.style.position,
    visibility: element.style.visibility,
    display: element.style.display,
    opacity: element.style.opacity,
    width: element.style.width,
    height: element.style.height,
    maxWidth: element.style.maxWidth,
    maxHeight: element.style.maxHeight,
    overflow: element.style.overflow,
    overflowX: element.style.overflowX,
    overflowY: element.style.overflowY,
    whiteSpace: element.style.whiteSpace, // Añadido
    boxSizing: element.style.boxSizing,   // Añadido
  };

  // Aplicar estilos para asegurar captura completa
  element.style.position = 'static';    // Evitar problemas con fixed/absolute
  element.style.visibility = 'visible';
  element.style.display = 'block';      // Asegurar que ocupa espacio
  element.style.opacity = '1';
  element.style.width = 'auto';         // Permitir que se expanda a su contenido
  element.style.height = 'auto';
  element.style.maxWidth = 'none';      // Sin límite de ancho
  element.style.maxHeight = 'none';
  element.style.overflow = 'visible';   // Mostrar todo el contenido
  element.style.overflowX = 'visible';
  element.style.overflowY = 'visible';
  element.style.whiteSpace = 'normal';  // Evitar problemas con nowrap
  element.style.boxSizing = 'content-box'; // Para consistencia en cálculos de tamaño

  // Intentar que los hijos también se expandan si están restringidos
  const children = element.querySelectorAll('*');
  children.forEach(child => {
    if (child.style) { // Verificar que el elemento tenga 'style'
        if (child.style.overflow === 'hidden') child.style.overflow = 'visible';
        if (child.style.overflowX === 'hidden') child.style.overflowX = 'visible';
        if (child.style.overflowY === 'hidden') child.style.overflowY = 'visible';
        if (child.style.maxWidth && child.style.maxWidth !== 'none') child.style.maxWidth = 'none';
        // No es seguro cambiar maxHeight de todos los hijos a 'none' sin más contexto.
    }
  });
  
  // Forzar reflow para que se apliquen los estilos antes de medir
  element.offsetHeight; 

  return originalStyles;
}

// Función para restaurar estado original
function restaurarEstadoElemento(element, originalStyles) {
  console.log('Restaurando estado original del elemento...');
  Object.keys(originalStyles).forEach(prop => {
    element.style[prop] = originalStyles[prop];
  });
}

// Función para obtener dimensiones reales del contenido
function obtenerDimensionesReales(element) {
  // Asegurarse de que los estilos de 'prepararElementoParaCaptura' se hayan aplicado y renderizado.
  // Un pequeño timeout puede ayudar si el reflow forzado no es suficiente.
  // await new Promise(resolve => setTimeout(resolve, 50)); // Descomentar si hay problemas de timing

  const rect = element.getBoundingClientRect();
  // scrollWidth/Height son generalmente los más fiables para el contenido total
  // clientWidth/Height son el espacio visible incluyendo padding, pero no bordes ni scrollbars.
  // offsetWidth/Height incluyen padding, bordes y scrollbars.
  
  let ancho = Math.max(
    element.scrollWidth,
    element.offsetWidth,
    rect.width // A veces útil si el elemento es transformado
  );
  let alto = Math.max(
    element.scrollHeight,
    element.offsetHeight,
    rect.height
  );

  // Si el elemento es muy pequeño (ej. vacío o colapsado), darle un mínimo para que html2canvas no falle.
  // Pero es mejor que el contenido tenga dimensiones reales.
  ancho = Math.max(ancho, 100); // Mínimo 100px de ancho
  alto = Math.max(alto, 50);   // Mínimo 50px de alto

  return { ancho, alto };
}


// Versión para escritorio usando html2pdf.js
async function descargarPDFDesktop(element) {
  console.log('Generando PDF para escritorio con html2pdf.js...');

  const estadoOriginal = prepararElementoParaCaptura(element);
  await new Promise(resolve => setTimeout(resolve, 250)); // Pausa para aplicar estilos

  try {
    const dimensiones = obtenerDimensionesReales(element);
    console.log('Dimensiones para html2pdf (desktop):', dimensiones);

    if (dimensiones.ancho === 0 || dimensiones.alto === 0) {
        throw new Error('El elemento a capturar no tiene dimensiones después de la preparación para desktop.');
    }
    
    // Es importante que el CSS del usuario defina los page-break-inside: avoid, etc.
    // para un mejor control de la paginación.
    const opciones = {
      margin: [15, 12, 15, 12], // Margen: [arriba, izquierda, abajo, derecha] en mm
      filename: `documento_desktop_${new Date().toISOString().slice(0,10)}.pdf`,
      image: {
        type: 'jpeg',
        quality: 0.92 // Buena calidad, tamaño de archivo razonable
      },
      html2canvas: {
        scale: window.devicePixelRatio || 1.5, // Mejorar calidad de la captura
        useCORS: true,
        allowTaint: true,
        logging: true, // Activar para depuración
        backgroundColor: '#ffffff',
        scrollX: 0, // Iniciar captura desde el principio
        scrollY: 0,
        // Es crucial que html2canvas capture el contenido completo.
        // html2pdf.js maneja internamente el width/height del canvas basado en el contenido
        // y la paginación. No siempre es necesario especificarlos aquí si el elemento ya está preparado.
        width: dimensiones.ancho, 
        windowWidth: dimensiones.ancho,
        // height y windowHeight pueden ser problemáticos si html2pdf.js hace su propia paginación.
        // Dejar que html2pdf.js lo maneje puede ser mejor.
        // height: dimensiones.alto, 
        // windowHeight: dimensiones.alto 
        imageTimeout: 30000,
        foreignObjectRendering: true,
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      },
      // Modos de pagebreak: 'avoid-all', 'css', 'legacy', ['css', 'legacy']
      // 'css' respeta page-break-before/after/inside.
      // 'avoid-all' intenta evitar romper cualquier elemento.
      // 'legacy' es un modo más antiguo.
      pagebreak: {
        mode: ['css', 'avoid-all'], // Priorizar CSS, luego intentar evitar cortes en general
        avoid: ['tr', 'thead', 'figure', 'figcaption', 'img', '.verse-container', '.section-container', 'h1', 'h2', 'h3', 'h4'], // Elementos a evitar romper
        before: ['.break-before-always'], // Clases para forzar salto antes
        after: [], // Clases para forzar salto después
      },
      enableLinks: true // Intentar preservar enlaces
    };

    console.log('Opciones de html2pdf:', opciones);
    await html2pdf().from(element).set(opciones).save();
    console.log('PDF desktop generado exitosamente con html2pdf.js');

  } catch (error) {
      console.error('Error en descargarPDFDesktop:', error);
      throw error;
  } finally {
    restaurarEstadoElemento(element, estadoOriginal);
  }
}

// Método alternativo (ahora usa la función mejorada generarPDFConHtml2Canvas)
async function descargarPDFAlternativo() {
  const element = document.getElementById('contenido');
  if (!element) {
    alert('Error: No se encontró el elemento con ID "contenido" para el método alternativo.');
    return;
  }
   if (element.offsetHeight === 0 || element.offsetWidth === 0) {
    alert('Error: El elemento "contenido" está oculto o no tiene dimensiones visibles (alternativo).');
    return;
  }

  mostrarIndicadorCarga(true);

  try {
    console.log('Usando método alternativo (generarPDFConHtml2Canvas)...');
    await generarPDFConHtml2Canvas(element, 'documento_alternativo');
  } catch (error) {
    console.error('Error con método alternativo:', error);
    alert('Error con el método alternativo: ' + error.message);
  } finally {
    mostrarIndicadorCarga(false);
  }
}


// Funciones mostrarIndicadorCarga, inicializarBotonesPDF, cargarLibrerias, diagnosticarProblemas
// (Mantener como las tienes, pero asegúrate de que `diagnosticarProblemas` sea llamado
// o esté disponible si algo sale mal, y que `cargarLibrerias` y `inicializarBotonesPDF`
// funcionen correctamente para adjuntar los event listeners a los botones correctos).

// --- Ejemplo de cómo podrías mantener/mejorar las funciones restantes ---

function mostrarIndicadorCarga(mostrar) {
  let indicador = document.getElementById('pdf-loading-indicator');
  if (mostrar) {
    if (!indicador) {
      indicador = document.createElement('div');
      indicador.id = 'pdf-loading-indicator';
      indicador.innerHTML = `
        <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);display:flex;justify-content:center;align-items:center;z-index:10000;color:white;font-family:Arial,sans-serif;">
          <div style="text-align:center;">
            <div style="border:5px solid #f3f3f3;border-top:5px solid #3498db;border-radius:50%;width:50px;height:50px;animation:spin 1s linear infinite;margin:0 auto 20px;"></div>
            <p>Generando PDF, por favor espere...</p>
            <style>@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}</style>
          </div>
        </div>`;
      document.body.appendChild(indicador);
    }
    indicador.style.display = 'flex';
  } else if (indicador) {
    indicador.style.display = 'none';
  }
}

function inicializarBotonesPDF() {
  console.log('Inicializando botones PDF...');
  const botonPDFPrincipal = document.getElementById('btn-descargar-pdf'); // Asume que tienes un botón principal
  if (botonPDFPrincipal) {
    botonPDFPrincipal.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Botón PDF principal clickeado');
      descargarPDF();
    });
    console.log('Botón principal configurado:', botonPDFPrincipal.id);
  } else {
    console.warn('No se encontró el botón con ID "btn-descargar-pdf"');
  }

  // Para múltiples botones con la misma clase
  const botonesClase = document.querySelectorAll('.btn-descargar-pdf-clase'); // Usar una clase específica si es necesario
  botonesClase.forEach((boton, index) => {
    boton.addEventListener('click', function(e) {
      e.preventDefault();
      console.log(`Botón PDF (clase) ${index} clickeado`);
      descargarPDF(); // O una función específica si es necesario
    });
  });
  if (botonesClase.length > 0) console.log(`${botonesClase.length} botones con clase '.btn-descargar-pdf-clase' configurados.`);


  const botonAlternativo = document.getElementById('btn-pdf-alternativo');
  if (botonAlternativo) {
    botonAlternativo.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Botón alternativo clickeado');
      descargarPDFAlternativo();
    });
    console.log('Botón alternativo configurado:', botonAlternativo.id);
  } else {
     console.warn('No se encontró el botón con ID "btn-pdf-alternativo"');
  }
}

function cargarLibrerias() {
  console.log('Iniciando carga de librerías...');
  const librerias = [
    { global: 'html2pdf', url: 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js', nombre: 'html2pdf.js' },
    { global: 'html2canvas', url: 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js', nombre: 'html2canvas' },
    { global: 'jspdf', obj: 'window.jspdf', url: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', nombre: 'jsPDF' }
  ];

  const promesasCarga = [];

  librerias.forEach(lib => {
    let yaCargada = false;
    if (lib.obj) { // Para jsPDF que se adjunta a window.jspdf
        try {
            yaCargada = eval(lib.obj) !== undefined;
        } catch (e) { yaCargada = false; }
    } else {
        yaCargada = typeof window[lib.global] !== 'undefined';
    }

    if (yaCargada) {
      console.log(`Librería ${lib.nombre} ya está cargada.`);
      return; // No la cargues de nuevo
    }

    promesasCarga.push(new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = lib.url;
      script.async = true; // Cargar asíncronamente
      script.crossOrigin = 'anonymous';
      script.onload = () => {
        console.log(`✓ ${lib.nombre} cargada correctamente desde ${lib.url}`);
        resolve();
      };
      script.onerror = () => {
        console.error(`✗ Error al cargar ${lib.nombre} desde ${lib.url}`);
        reject(new Error(`No se pudo cargar la biblioteca ${lib.nombre}.`));
      };
      document.head.appendChild(script);
    }));
  });

  if (promesasCarga.length === 0) {
    console.log('Todas las librerías requeridas ya estaban cargadas.');
    inicializarBotonesPDF();
    return;
  }

  Promise.all(promesasCarga)
    .then(() => {
      console.log('Todas las librerías necesarias han sido cargadas. Inicializando botones...');
      // Pequeña demora para asegurar que las librerías estén completamente disponibles globalmente
      setTimeout(inicializarBotonesPDF, 150); 
    })
    .catch(error => {
      console.error('Error al cargar una o más librerías:', error);
      alert(error.message + ' La funcionalidad de PDF podría no estar disponible.');
    });
}

function diagnosticarProblemas() {
  console.log('=== DIAGNÓSTICO PDF ===');
  console.log('User Agent:', navigator.userAgent);
  console.log('Es móvil:', esMobile());
  console.log('Es navegador integrado:', esNavegadorIntegrado());
  console.log('Viewport (window.innerWidth x window.innerHeight):', window.innerWidth, 'x', window.innerHeight);
  console.log('Device Pixel Ratio:', window.devicePixelRatio);

  console.log('Librerías Disponibles:');
  console.log('  html2pdf:', typeof html2pdf !== 'undefined');
  console.log('  html2canvas:', typeof html2canvas !== 'undefined');
  console.log('  jsPDF (window.jspdf):', typeof window.jspdf !== 'undefined');

  const elemento = document.getElementById('contenido');
  console.log('Elemento #contenido existe:', !!elemento);
  if (elemento) {
    const rect = elemento.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(elemento);
    console.group('Detalles del Elemento #contenido:');
    console.log('  offsetWidth x offsetHeight:', elemento.offsetWidth, 'x', elemento.offsetHeight);
    console.log('  scrollWidth x scrollHeight:', elemento.scrollWidth, 'x', elemento.scrollHeight);
    console.log('  clientWidth x clientHeight:', elemento.clientWidth, 'x', elemento.clientHeight);
    console.log('  getBoundingClientRect (width x height):', rect.width.toFixed(2), 'x', rect.height.toFixed(2));
    console.log('  Computed display:', computedStyle.display);
    console.log('  Computed visibility:', computedStyle.visibility);
    console.log('  Computed opacity:', computedStyle.opacity);
    console.log('  Computed overflow:', computedStyle.overflow);
    console.log('  Contenido (primeros 100 chars):', (elemento.innerText || elemento.textContent || "").substring(0, 100) + '...');
    console.groupEnd();

    // Verificar si está visible en el viewport
    const isVisible = rect.top < window.innerHeight && rect.bottom >= 0 &&
                      rect.left < window.innerWidth && rect.right >= 0;
    console.log('Elemento #contenido visible en viewport actual:', isVisible);
  }
  console.log('========================');
}

// Exponer funciones de diagnóstico globalmente para fácil acceso desde consola
window.diagnosticarPDF = diagnosticarProblemas;

// Ejecutar cuando la página cargue
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', cargarLibrerias);
} else {
  cargarLibrerias(); // Ya cargado
}








