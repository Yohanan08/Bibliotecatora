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

  // Verificación mejorada de visibilidad
  const rect = element.getBoundingClientRect();
  const computedStyle = window.getComputedStyle(element);
  
  if (computedStyle.display === 'none' || 
      computedStyle.visibility === 'hidden' || 
      computedStyle.opacity === '0' ||
      (rect.width === 0 && rect.height === 0)) {
    alert('Error: El elemento "contenido" no es visible o no tiene contenido.');
    diagnosticarProblemas();
    return;
  }

  mostrarIndicadorCarga(true);

  try {
    console.log('Generando PDF con método universal (html2canvas + jsPDF)');
    await generarPDFUniversal(element);
  } catch (error) {
    console.error('Error al generar PDF:', error);
    alert('Hubo un problema al generar el PDF. Detalles: ' + error.message);
  } finally {
    mostrarIndicadorCarga(false);
  }
}

// Método universal mejorado que funciona en móviles y desktop
async function generarPDFUniversal(element) {
  console.log('Iniciando generación de PDF universal...');

  // Preparar elemento para captura
  const estadoOriginal = await prepararElementoParaCaptura(element);
  
  // Esperar a que se apliquen los estilos
  await esperarRenderizado();

  try {
    const dimensiones = obtenerDimensionesCompletas(element);
    console.log('Dimensiones calculadas:', dimensiones);

    if (dimensiones.ancho <= 0 || dimensiones.alto <= 0) {
      throw new Error('El elemento no tiene dimensiones válidas después de la preparación.');
    }

    // Configuración optimizada de html2canvas para capturar TODO el contenido
    const opcionesCanvas = {
      scale: esMobile() ? 1.5 : 2, // Mejor calidad
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      scrollX: 0,
      scrollY: 0,
      width: dimensiones.ancho,
      height: dimensiones.alto,
      windowWidth: dimensiones.ancho, // CLAVE: usar el ancho completo del contenido
      windowHeight: dimensiones.alto, // CLAVE: usar el alto completo del contenido
      imageTimeout: 15000,
      removeContainer: false,
      foreignObjectRendering: false,
      // Capturar todo el contenido, incluso el que está fuera del viewport
      x: 0,
      y: 0,
      ignoreElements: (element) => {
        const tagName = element.tagName ? element.tagName.toLowerCase() : '';
        const className = element.className ? element.className.toString() : '';
        const classList = element.classList ? Array.from(element.classList).join(' ') : '';
        const allClasses = className + ' ' + classList;
        
        return tagName === 'script' || 
               tagName === 'style' || 
               tagName === 'noscript' ||
               allClasses.includes('no-pdf') || // Permitir ocultar elementos específicos
               (allClasses.includes('hidden') && !allClasses.includes('pdf-visible'));
      }
    };

    console.log('Capturando contenido con html2canvas...');
    const canvas = await html2canvas(element, opcionesCanvas);
    console.log('Canvas creado:', canvas.width, 'x', canvas.height);

    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error('El canvas generado está vacío. Verifique el contenido visible.');
    }

    // Verificar que el canvas no esté completamente transparente o negro
    if (await esCanvasVacio(canvas)) {
      throw new Error('El contenido capturado está vacío o es transparente.');
    }

    await crearPDFDesdeCanvasCompleto(canvas);
    console.log('PDF generado exitosamente');

  } catch (error) {
    console.error('Error en generarPDFUniversal:', error);
    throw error;
  } finally {
    restaurarEstadoElemento(element, estadoOriginal);
  }
}

// Función MEJORADA para preparar elemento y forzar visualización completa
async function prepararElementoParaCaptura(element) {
  console.log('Preparando elemento para captura completa...');
  
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
    transform: element.style.transform,
    zIndex: element.style.zIndex,
    minWidth: element.style.minWidth,
    minHeight: element.style.minHeight
  };

  // Aplicar estilos para mostrar TODO el contenido
  element.style.position = 'static';
  element.style.visibility = 'visible';
  element.style.display = 'block';
  element.style.opacity = '1';
  element.style.width = 'auto';
  element.style.height = 'auto';
  element.style.maxWidth = 'none';
  element.style.maxHeight = 'none';
  element.style.minWidth = 'auto';
  element.style.minHeight = 'auto';
  element.style.overflow = 'visible';
  element.style.overflowX = 'visible';
  element.style.overflowY = 'visible';
  element.style.transform = 'none';
  element.style.zIndex = 'auto';

  // Preparar elementos hijos para mostrar contenido completo
  const elementosHijos = element.querySelectorAll('*');
  const estadosHijos = [];

  elementosHijos.forEach((hijo, index) => {
    try {
      const estadoOriginalHijo = {
        overflow: hijo.style ? hijo.style.overflow : '',
        overflowX: hijo.style ? hijo.style.overflowX : '',
        overflowY: hijo.style ? hijo.style.overflowY : '',
        maxWidth: hijo.style ? hijo.style.maxWidth : '',
        maxHeight: hijo.style ? hijo.style.maxHeight : '',
        whiteSpace: hijo.style ? hijo.style.whiteSpace : '',
        textOverflow: hijo.style ? hijo.style.textOverflow : '',
        width: hijo.style ? hijo.style.width : '',
        height: hijo.style ? hijo.style.height : ''
      };
      estadosHijos[index] = estadoOriginalHijo;

      if (hijo.style) {
        // Hacer visible todo el contenido oculto por overflow
        if (hijo.style.overflow === 'hidden' || hijo.style.overflow === 'scroll' || hijo.style.overflow === 'auto') {
          hijo.style.overflow = 'visible';
        }
        if (hijo.style.overflowX === 'hidden' || hijo.style.overflowX === 'scroll' || hijo.style.overflowX === 'auto') {
          hijo.style.overflowX = 'visible';
        }
        if (hijo.style.overflowY === 'hidden' || hijo.style.overflowY === 'scroll' || hijo.style.overflowY === 'auto') {
          hijo.style.overflowY = 'visible';
        }
        
        // Eliminar restricciones de tamaño
        if (hijo.style.maxWidth && hijo.style.maxWidth !== 'none') {
          hijo.style.maxWidth = 'none';
        }
        if (hijo.style.maxHeight && hijo.style.maxHeight !== 'none') {
          hijo.style.maxHeight = 'none';
        }
        
        // Hacer visible texto truncado
        if (hijo.style.whiteSpace === 'nowrap') {
          hijo.style.whiteSpace = 'normal';
        }
        if (hijo.style.textOverflow === 'ellipsis') {
          hijo.style.textOverflow = 'clip';
        }
      }
    } catch (error) {
      console.warn('Error procesando elemento hijo:', error);
      estadosHijos[index] = {};
    }
  });

  // Guardar estados de elementos hijos
  originalStyles.elementosHijos = estadosHijos;

  return originalStyles;
}

// Función MEJORADA para obtener dimensiones completas reales
function obtenerDimensionesCompletas(element) {
  // Forzar recálculo del layout
  element.offsetHeight;
  
  // Esperar un momento para que se recalculen las dimensiones
  const rect = element.getBoundingClientRect();
  const computedStyle = window.getComputedStyle(element);
  
  // Obtener todas las métricas posibles
  const anchoMetrics = [
    element.scrollWidth,
    element.offsetWidth,
    element.clientWidth,
    Math.ceil(rect.width)
  ];
  
  const altoMetrics = [
    element.scrollHeight,
    element.offsetHeight,
    element.clientHeight,
    Math.ceil(rect.height)
  ];

  // Verificar también el contenido de los elementos hijos
  const elementosHijos = element.querySelectorAll('*');
  let maxAnchoHijo = 0;
  let maxAltoHijo = 0;

  elementosHijos.forEach(hijo => {
    try {
      const rectHijo = hijo.getBoundingClientRect();
      const rectElemento = element.getBoundingClientRect();
      
      // Calcular posición relativa del hijo respecto al elemento padre
      const anchoHijo = (rectHijo.left - rectElemento.left) + rectHijo.width;
      const altoHijo = (rectHijo.top - rectElemento.top) + rectHijo.height;
      
      maxAnchoHijo = Math.max(maxAnchoHijo, anchoHijo, hijo.scrollWidth, hijo.offsetWidth);
      maxAltoHijo = Math.max(maxAltoHijo, altoHijo, hijo.scrollHeight, hijo.offsetHeight);
    } catch (error) {
      console.warn('Error calculando dimensiones de hijo:', error);
    }
  });

  // Tomar el máximo de todas las métricas
  let ancho = Math.max(...anchoMetrics, maxAnchoHijo);
  let alto = Math.max(...altoMetrics, maxAltoHijo);

  // Ajustar por padding y borders
  const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
  const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
  const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
  const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;
  const borderLeft = parseFloat(computedStyle.borderLeftWidth) || 0;
  const borderRight = parseFloat(computedStyle.borderRightWidth) || 0;
  const borderTop = parseFloat(computedStyle.borderTopWidth) || 0;
  const borderBottom = parseFloat(computedStyle.borderBottomWidth) || 0;

  ancho = Math.max(ancho, paddingLeft + paddingRight + borderLeft + borderRight + 100);
  alto = Math.max(alto, paddingTop + paddingBottom + borderTop + borderBottom + 50);

  // Límites razonables (aumentados para capturar más contenido)
  const maxWidth = esMobile() ? 2000 : 4000;
  const maxHeight = esMobile() ? 15000 : 25000;

  ancho = Math.min(ancho, maxWidth);
  alto = Math.min(alto, maxHeight);

  console.log('Métricas de ancho:', anchoMetrics, 'Max hijo:', maxAnchoHijo, 'Final:', ancho);
  console.log('Métricas de alto:', altoMetrics, 'Max hijo:', maxAltoHijo, 'Final:', alto);

  return { ancho, alto };
}

// Función para verificar si el canvas está vacío
async function esCanvasVacio(canvas) {
  try {
    const ctx = canvas.getContext('2d');
    if (!ctx) return true;
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    let pixelesNoTransparentes = 0;
    let pixelesDiferentes = 0;
    let primerPixelR = data[0];
    let primerPixelG = data[1];
    let primerPixelB = data[2];
    
    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3];
      
      if (alpha > 0) {
        pixelesNoTransparentes++;
        
        if (data[i] !== primerPixelR || data[i + 1] !== primerPixelG || data[i + 2] !== primerPixelB) {
          pixelesDiferentes++;
        }
      }
      
      // Si encontramos suficiente contenido, no está vacío
      if (pixelesNoTransparentes > 100 && pixelesDiferentes > 10) {
        return false;
      }
    }
    
    return pixelesNoTransparentes < 100 || pixelesDiferentes < 10;
  } catch (error) {
    console.warn('Error verificando canvas:', error);
    return false;
  }
}

// Función MEJORADA para crear PDF manteniendo proporciones y contenido completo
async function crearPDFDesdeCanvasCompleto(canvas) {
  console.log('Creando PDF desde canvas completo...');
  
  try {
    const { jsPDF } = window.jspdf;
    if (!jsPDF) {
      throw new Error('jsPDF no está disponible');
    }

    // Calcular orientación óptima basada en las dimensiones del contenido
    const esHorizontal = canvas.width > canvas.height;
    const orientation = esHorizontal ? 'l' : 'p'; // landscape o portrait
    
    const pdf = new jsPDF(orientation, 'mm', 'a4');
    
    const pageWidth = orientation === 'l' ? 297 : 210; // A4 dimensions
    const pageHeight = orientation === 'l' ? 210 : 297;
    const margin = 5; // Margen reducido para aprovechar más espacio
    
    const maxWidth = pageWidth - (margin * 2);
    const maxHeight = pageHeight - (margin * 2);

    // Calcular escala para que quepa todo el contenido manteniendo proporciones
    const scaleX = maxWidth / (canvas.width * 0.264583); // Convertir px a mm
    const scaleY = maxHeight / (canvas.height * 0.264583);
    const scale = Math.min(scaleX, scaleY, 1); // No agrandar si ya es pequeño

    let imgWidth = (canvas.width * 0.264583) * scale;
    let imgHeight = (canvas.height * 0.264583) * scale;

    console.log(`Canvas: ${canvas.width}x${canvas.height}px`);
    console.log(`PDF: ${pageWidth}x${pageHeight}mm, Imagen: ${imgWidth.toFixed(1)}x${imgHeight.toFixed(1)}mm`);

    // Si el contenido sigue siendo muy alto, dividir en páginas
    if (imgHeight > maxHeight) {
      const totalPages = Math.ceil(imgHeight / maxHeight);
      console.log(`Contenido requiere ${totalPages} páginas`);

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) pdf.addPage(orientation === 'l' ? [297, 210] : [210, 297]);

        const sourceY = (canvas.height / totalPages) * page;
        const sourceHeight = canvas.height / totalPages;
        
        // Crear canvas temporal para esta página
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = Math.floor(sourceHeight);
        
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) {
          tempCtx.fillStyle = '#ffffff';
          tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
          
          tempCtx.drawImage(
            canvas, 
            0, Math.floor(sourceY), canvas.width, Math.floor(sourceHeight),
            0, 0, canvas.width, Math.floor(sourceHeight)
          );

          const pageImageData = tempCanvas.toDataURL('image/jpeg', 0.95);
          
          // Centrar la imagen en la página
          const x = margin + (maxWidth - imgWidth) / 2;
          const y = margin;
          
          pdf.addImage(pageImageData, 'JPEG', x, y, imgWidth, maxHeight);
        }
      }
    } else {
      // Una sola página - centrar el contenido
      const imageData = canvas.toDataURL('image/jpeg', 0.95);
      
      const x = margin + (maxWidth - imgWidth) / 2;
      const y = margin + (maxHeight - imgHeight) / 2;
      
      pdf.addImage(imageData, 'JPEG', x, y, imgWidth, imgHeight);
    }

    // Guardar el PDF
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    pdf.save(`documento_completo_${timestamp}.pdf`);
    
  } catch (error) {
    console.error('Error creando PDF:', error);
    throw new Error('Error al crear el PDF: ' + error.message);
  }
}

// Función para esperar renderizado (aumentado el tiempo)
function esperarRenderizado() {
  return new Promise(resolve => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(resolve, 200); // Más tiempo para asegurar renderizado completo
      });
    });
  });
}

// Función mejorada para restaurar estado
function restaurarEstadoElemento(element, originalStyles) {
  console.log('Restaurando estado original...');
  
  try {
    Object.keys(originalStyles).forEach(prop => {
      if (prop !== 'elementosHijos') {
        element.style[prop] = originalStyles[prop] || '';
      }
    });

    // Restaurar estados de elementos hijos
    if (originalStyles.elementosHijos) {
      const elementosHijos = element.querySelectorAll('*');
      elementosHijos.forEach((hijo, index) => {
        try {
          const estadoOriginal = originalStyles.elementosHijos[index];
          if (estadoOriginal && hijo.style) {
            Object.keys(estadoOriginal).forEach(prop => {
              hijo.style[prop] = estadoOriginal[prop] || '';
            });
          }
        } catch (error) {
          console.warn('Error restaurando elemento hijo:', error);
        }
      });
    }
  } catch (error) {
    console.error('Error restaurando estilos:', error);
  }
}

// Función para mostrar indicador de carga
function mostrarIndicadorCarga(mostrar) {
  let indicador = document.getElementById('pdf-loading-indicator');
  
  if (mostrar) {
    if (!indicador) {
      indicador = document.createElement('div');
      indicador.id = 'pdf-loading-indicator';
      indicador.innerHTML = `
        <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;justify-content:center;align-items:center;z-index:10000;color:white;font-family:Arial,sans-serif;backdrop-filter:blur(2px);">
          <div style="text-align:center;background:rgba(255,255,255,0.1);padding:30px;border-radius:10px;">
            <div style="border:4px solid #f3f3f3;border-top:4px solid #00bcd4;border-radius:50%;width:40px;height:40px;animation:spin 1s linear infinite;margin:0 auto 20px;"></div>
            <p style="margin:0;font-size:16px;">Generando PDF completo...</p>
            <p style="margin:5px 0 0 0;font-size:12px;opacity:0.8;">Capturando todo el contenido</p>
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

// Función para inicializar botones
function inicializarBotonesPDF() {
  console.log('Inicializando botones PDF...');
  
  // Botón principal
  const botonPrincipal = document.getElementById('btn-descargar-pdf');
  if (botonPrincipal) {
    botonPrincipal.addEventListener('click', function(e) {
      e.preventDefault();
      descargarPDF();
    });
    console.log('Botón principal configurado');
  }

  // Botones con clase
  const botonesClase = document.querySelectorAll('.btn-descargar-pdf, .btn-pdf');
  botonesClase.forEach((boton, index) => {
    boton.addEventListener('click', function(e) {
      e.preventDefault();
      descargarPDF();
    });
  });
  
  if (botonesClase.length > 0) {
    console.log(`${botonesClase.length} botones configurados`);
  }
}

// Función para cargar librerías
function cargarLibrerias() {
  console.log('Cargando librerías necesarias...');
  
  const librerias = [
    { 
      global: 'html2canvas', 
      url: 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
      nombre: 'html2canvas'
    },
    { 
      global: 'jspdf',
      check: () => window.jspdf && window.jspdf.jsPDF,
      url: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
      nombre: 'jsPDF'
    }
  ];

  const promesasCarga = librerias
    .filter(lib => {
      const cargada = lib.check ? lib.check() : window[lib.global];
      if (cargada) {
        console.log(`✓ ${lib.nombre} ya está cargada`);
        return false;
      }
      return true;
    })
    .map(lib => new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = lib.url;
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.onload = () => {
        console.log(`✓ ${lib.nombre} cargada correctamente`);
        resolve();
      };
      script.onerror = () => {
        console.error(`✗ Error al cargar ${lib.nombre}`);
        reject(new Error(`No se pudo cargar ${lib.nombre}`));
      };
      document.head.appendChild(script);
    }));

  if (promesasCarga.length === 0) {
    console.log('Todas las librerías ya estaban cargadas');
    inicializarBotonesPDF();
    return;
  }

  Promise.all(promesasCarga)
    .then(() => {
      console.log('Todas las librerías cargadas exitosamente');
      setTimeout(inicializarBotonesPDF, 200);
    })
    .catch(error => {
      console.error('Error cargando librerías:', error);
      alert('Error al cargar las librerías necesarias: ' + error.message);
    });
}

// Función de diagnóstico mejorada
function diagnosticarProblemas() {
  console.log('=== DIAGNÓSTICO PDF COMPLETO ===');
  console.log('Dispositivo:', esMobile() ? 'MÓVIL' : 'DESKTOP');
  console.log('Navegador integrado:', esNavegadorIntegrado());
  console.log('User Agent:', navigator.userAgent);
  console.log('Viewport:', window.innerWidth + 'x' + window.innerHeight);
  console.log('Device Pixel Ratio:', window.devicePixelRatio);
  
  // Verificar librerías
  console.log('\nLibrerías:');
  console.log('- html2canvas:', typeof html2canvas !== 'undefined' ? '✓' : '✗');
  console.log('- jsPDF:', (window.jspdf && window.jspdf.jsPDF) ? '✓' : '✗');
  
  // Verificar elemento
  const elemento = document.getElementById('contenido');
  if (elemento) {
    const rect = elemento.getBoundingClientRect();
    const style = window.getComputedStyle(elemento);
    
    console.log('\nElemento #contenido:');
    console.log('- Existe: ✓');
    console.log('- Visible:', style.display !== 'none' && style.visibility !== 'hidden' ? '✓' : '✗');
    console.log('- Dimensiones viewport:', `${rect.width.toFixed(0)}x${rect.height.toFixed(0)}`);
    console.log('- Dimensiones scroll:', `${elemento.scrollWidth}x${elemento.scrollHeight}`);
    console.log('- Dimensiones offset:', `${elemento.offsetWidth}x${elemento.offsetHeight}`);
    console.log('- Overflow:', style.overflow, style.overflowX, style.overflowY);
    console.log('- Contenido:', elemento.children.length + ' elementos hijos');
    
    // Verificar elementos que podrían estar ocultos
    const elementosOcultos = elemento.querySelectorAll('*').length;
    const elementosConOverflow = Array.from(elemento.querySelectorAll('*')).filter(el => {
      const st = window.getComputedStyle(el);
      return st.overflow === 'hidden' || st.overflowX === 'hidden' || st.overflowY === 'hidden';
    }).length;
    
    console.log('- Elementos con overflow hidden:', elementosConOverflow + '/' + elementosOcultos);
  } else {
    console.log('\n❌ Elemento #contenido NO ENCONTRADO');
  }
  
  console.log('================================');
}

// Exponer funciones globalmente para debugging
window.diagnosticarPDF = diagnosticarProblemas;
window.descargarPDFManual = descargarPDF;

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', cargarLibrerias);
} else {
  cargarLibrerias();
}








