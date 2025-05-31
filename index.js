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
    // Método 1: html2pdf optimizado (PRINCIPAL)
    await intentarMetodo1MobileCorregido(element);
  } catch (error) {
    console.warn('Método 1 falló, intentando método 2:', error.message);
    try {
      // Método 2: html2pdf con contenedor temporal
      await intentarMetodo2MobileCorregido(element);
    } catch (error2) {
      console.warn('Método 2 falló, intentando método 3:', error2.message);
      // Método 3: Solo como último recurso
      await intentarMetodo3MobileCorregido(element);
    }
  }
}

// Método 1: html2pdf optimizado para móvil - CORREGIDO
async function intentarMetodo1MobileCorregido(element) {
  console.log('Probando Método 1 - html2pdf móvil optimizado...');
  
  // Obtener el ancho real del contenido incluyendo elementos desbordados
  const anchoReal = obtenerAnchoRealCompleto(element);
  const altoReal = Math.max(element.scrollHeight, element.offsetHeight);
  
  console.log('Dimensiones reales detectadas:', anchoReal, 'x', altoReal);
  console.log('Ancho de ventana:', window.innerWidth);
  
  // Preparar elemento temporalmente
  const estadoOriginal = prepararElementoParaCaptura(element);
  
  try {
    const opciones = {
      margin: [5, 5, 5, 5], // Márgenes más pequeños
      filename: `documento_mobile_${new Date().getTime()}.pdf`,
      image: { 
        type: 'jpeg', 
        quality: 0.8
      },
      html2canvas: {
        scale: 0.9, // Escala optimizada
        useCORS: true,
        allowTaint: true,
        logging: true,
        scrollY: 0,
        scrollX: 0,
        backgroundColor: '#ffffff',
        timeout: 60000,
        foreignObjectRendering: false,
        removeContainer: false,
        async: true,
        // CLAVE: Configurar dimensiones correctas
        width: anchoReal,
        height: altoReal,
        windowWidth: Math.max(anchoReal, window.innerWidth),
        windowHeight: Math.max(altoReal, window.innerHeight)
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: anchoReal > altoReal ? 'landscape' : 'portrait', // Auto-orientación
        compress: true
      },
      pagebreak: { 
        mode: ['avoid-all', 'css'],
        before: '.page-break-before',
        after: '.page-break-after',
        avoid: ['tr', 'td', 'th', 'img', 'svg']
      }
    };

    await html2pdf().set(opciones).from(element).save();
    console.log('✓ Método 1 exitoso');
    
  } finally {
    // Restaurar estado original
    restaurarEstadoElemento(element, estadoOriginal);
  }
}

// Método 2: html2pdf con contenedor temporal - CORREGIDO
async function intentarMetodo2MobileCorregido(element) {
  console.log('Probando Método 2 - html2pdf con contenedor temporal...');
  
  const contenedor = crearContenedorOptimizado(element);
  
  try {
    // Esperar renderizado completo
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const anchoContenedor = Math.max(contenedor.scrollWidth, contenedor.offsetWidth);
    const altoContenedor = Math.max(contenedor.scrollHeight, contenedor.offsetHeight);
    
    console.log('Dimensiones contenedor:', anchoContenedor, 'x', altoContenedor);
    
    const opciones = {
      margin: [8, 8, 8, 8],
      filename: `documento_mobile_m2_${new Date().getTime()}.pdf`,
      image: { 
        type: 'jpeg', 
        quality: 0.85
      },
      html2canvas: {
        scale: 0.8,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: true,
        scrollY: 0,
        scrollX: 0,
        timeout: 45000,
        width: anchoContenedor,
        height: altoContenedor,
        windowWidth: Math.max(anchoContenedor, window.innerWidth),
        windowHeight: Math.max(altoContenedor, window.innerHeight)
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
        compress: true
      },
      pagebreak: { 
        mode: ['css'],
        avoid: ['tr', 'td', 'img']
      }
    };

    await html2pdf().set(opciones).from(contenedor).save();
    console.log('✓ Método 2 exitoso');
    
  } finally {
    // Limpiar contenedor temporal
    if (contenedor.parentNode) {
      document.body.removeChild(contenedor);
    }
  }
}

// Método 3: html2canvas + jsPDF solo como último recurso
async function intentarMetodo3MobileCorregido(element) {
  console.log('Probando Método 3 - html2canvas como último recurso...');
  
  const estadoOriginal = prepararElementoParaCaptura(element);
  
  try {
    const anchoReal = obtenerAnchoRealCompleto(element);
    const altoReal = Math.max(element.scrollHeight, element.offsetHeight);
    
    console.log('Método 3 - Dimensiones:', anchoReal, 'x', altoReal);
    
    const canvas = await html2canvas(element, {
      scale: 0.8,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: true,
      scrollY: 0,
      scrollX: 0,
      timeout: 30000,
      width: anchoReal,
      height: altoReal,
      windowWidth: Math.max(anchoReal, window.innerWidth),
      windowHeight: Math.max(altoReal, window.innerHeight)
    });

    console.log('Canvas método 3:', canvas.width, 'x', canvas.height);
    
    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error('Canvas vacío en método 3');
    }

    // Usar jsPDF para crear el PDF respetando el formato original
    const imgData = canvas.toDataURL('image/jpeg', 0.85);
    const { jsPDF } = window.jspdf;
    
    // Determinar orientación basada en las dimensiones del contenido
    const orientation = anchoReal > altoReal ? 'landscape' : 'portrait';
    const pdf = new jsPDF(orientation, 'mm', 'a4');
    
    const pageWidth = pdf.internal.pageSize.getWidth() - 10; // 5mm margen cada lado
    const pageHeight = pdf.internal.pageSize.getHeight() - 10;
    
    // Calcular dimensiones manteniendo proporción
    const imgAspectRatio = canvas.width / canvas.height;
    const pageAspectRatio = pageWidth / pageHeight;
    
    let finalWidth, finalHeight;
    
    if (imgAspectRatio > pageAspectRatio) {
      // La imagen es más ancha que la página
      finalWidth = pageWidth;
      finalHeight = pageWidth / imgAspectRatio;
    } else {
      // La imagen es más alta que la página
      finalHeight = pageHeight;
      finalWidth = pageHeight * imgAspectRatio;
    }
    
    console.log('Dimensiones finales PDF:', finalWidth, 'x', finalHeight);
    
    // Si la imagen es muy alta, dividir en páginas
    if (finalHeight > pageHeight) {
      const totalPages = Math.ceil(finalHeight / pageHeight);
      console.log(`Dividiendo en ${totalPages} páginas`);
      
      for (let page = 0; page < totalPages; page++) {
        if (page > 0) pdf.addPage(orientation);
        
        const offsetY = -(page * pageHeight);
        pdf.addImage(imgData, 'JPEG', 5, 5 + offsetY, finalWidth, finalHeight);
      }
    } else {
      // La imagen cabe en una página
      const x = (pageWidth - finalWidth) / 2 + 5; // Centrar horizontalmente
      const y = (pageHeight - finalHeight) / 2 + 5; // Centrar verticalmente
      pdf.addImage(imgData, 'JPEG', x, y, finalWidth, finalHeight);
    }

    pdf.save(`documento_mobile_m3_${new Date().getTime()}.pdf`);
    console.log('✓ Método 3 exitoso');
    
  } finally {
    restaurarEstadoElemento(element, estadoOriginal);
  }
}

// Función para obtener el ancho real completo incluyendo elementos desbordados
function obtenerAnchoRealCompleto(element) {
  // Obtener ancho del elemento principal
  const anchoElemento = Math.max(
    element.scrollWidth,
    element.offsetWidth,
    element.clientWidth
  );
  
  // Verificar todos los elementos hijos para encontrar el más ancho
  const todosLosElementos = element.querySelectorAll('*');
  let anchoMaximo = anchoElemento;
  
  todosLosElementos.forEach(el => {
    const anchoEl = Math.max(
      el.scrollWidth || 0,
      el.offsetWidth || 0,
      el.clientWidth || 0
    );
    
    // Para tablas, verificar también el ancho de las celdas
    if (el.tagName === 'TABLE') {
      const celdas = el.querySelectorAll('td, th');
      let anchoTabla = 0;
      const primeraFila = el.querySelector('tr');
      if (primeraFila) {
        const celdasPrimeraFila = primeraFila.querySelectorAll('td, th');
        celdasPrimeraFila.forEach(celda => {
          anchoTabla += Math.max(celda.scrollWidth || 0, celda.offsetWidth || 0);
        });
      }
      if (anchoTabla > anchoEl) {
        console.log('Tabla detectada con ancho real:', anchoTabla, 'vs reportado:', anchoEl);
        anchoMaximo = Math.max(anchoMaximo, anchoTabla);
      }
    }
    
    anchoMaximo = Math.max(anchoMaximo, anchoEl);
  });
  
  // Asegurar un mínimo razonable
  return Math.max(anchoMaximo, 800);
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
  
  // Corregir elementos internos que puedan estar cortando el contenido
  const elementosInternos = element.querySelectorAll('*');
  elementosInternos.forEach(el => {
    // Quitar restricciones de ancho
    if (el.style.maxWidth && el.style.maxWidth !== 'none') {
      el.style.maxWidth = 'none';
    }
    // Asegurar que el contenido sea visible
    if (el.style.overflow === 'hidden') {
      el.style.overflow = 'visible';
    }
    // Para texto cortado
    if (el.style.textOverflow === 'ellipsis') {
      el.style.textOverflow = 'clip';
    }
  });
  
  // Manejar tablas específicamente
  const tablas = element.querySelectorAll('table');
  tablas.forEach(tabla => {
    tabla.style.width = 'auto';
    tabla.style.tableLayout = 'auto';
    tabla.style.borderCollapse = 'separate'; // Mejor para renderizado
    tabla.style.whiteSpace = 'nowrap'; // Evitar quiebre de líneas en celdas
    
    // Ajustar celdas
    const celdas = tabla.querySelectorAll('td, th');
    celdas.forEach(celda => {
      celda.style.whiteSpace = 'nowrap';
      celda.style.overflow = 'visible';
      celda.style.maxWidth = 'none';
    });
  });
  
  return estadoOriginal;
}

// Función para restaurar estado original
function restaurarEstadoElemento(element, estadoOriginal) {
  Object.keys(estadoOriginal).forEach(prop => {
    element.style[prop] = estadoOriginal[prop] || '';
  });
}

// Crear contenedor optimizado para captura
function crearContenedorOptimizado(element) {
  const anchoReal = obtenerAnchoRealCompleto(element);
  
  const contenedor = document.createElement('div');
  contenedor.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: ${anchoReal}px;
    background: white;
    z-index: 10000;
    visibility: visible;
    opacity: 1;
    padding: 20px;
    box-sizing: border-box;
    overflow: visible;
    font-family: Arial, sans-serif;
    font-size: 14px;
    line-height: 1.4;
  `;
  
  // Clonar el contenido
  const elementoClonado = element.cloneNode(true);
  
  // Aplicar estilos al elemento clonado
  elementoClonado.style.cssText = `
    width: 100%;
    max-width: none;
    background: white;
    color: black;
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
    if (el.style.textOverflow === 'ellipsis') {
      el.style.textOverflow = 'clip';
    }
  });
  
  // Corregir tablas del clon
  const tablas = elementoClonado.querySelectorAll('table');
  tablas.forEach(tabla => {
    tabla.style.width = 'auto';
    tabla.style.tableLayout = 'auto';
    tabla.style.whiteSpace = 'nowrap';
  });
  
  contenedor.appendChild(elementoClonado);
  document.body.appendChild(contenedor);
  
  return contenedor;
}

// Versión corregida para escritorio
async function descargarPDFDesktop(element) {
  console.log('Generando PDF para desktop...');
  
  // Esperar renderizado
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const anchoReal = obtenerAnchoRealCompleto(element);
  const altoReal = Math.max(element.scrollHeight, element.offsetHeight);
  
  console.log('Desktop - Dimensiones detectadas:', anchoReal, 'x', altoReal);
  
  const opciones = {
    margin: [10, 10, 10, 10],
    filename: `documento_desktop_${new Date().getTime()}.pdf`,
    image: { 
      type: 'jpeg', 
      quality: 0.95 
    },
    html2canvas: {
      scale: 1.3,
      useCORS: true,
      allowTaint: true,
      logging: true,
      backgroundColor: '#ffffff',
      scrollY: 0,
      scrollX: 0,
      width: anchoReal,
      height: altoReal,
      windowWidth: Math.max(anchoReal, window.innerWidth),
      windowHeight: Math.max(altoReal, window.innerHeight)
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: anchoReal > altoReal ? 'landscape' : 'portrait',
      compress: true
    },
    pagebreak: { 
      mode: ['css'],
      before: '.page-break-before',
      after: '.page-break-after',
      avoid: ['tr', 'td', 'img', 'svg']
    }
  };

  await html2pdf().set(opciones).from(element).save();
  console.log('PDF desktop generado exitosamente');
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

// Método alternativo usando solo html2canvas + jsPDF - SOLO COMO RESPALDO
async function descargarPDFAlternativo() {
  const element = document.getElementById('contenido');
  if (!element) {
    alert('Error: No se encontró el elemento con ID "contenido"');
    return;
  }

  mostrarIndicadorCarga(true);

  try {
    console.log('Usando método alternativo (html2canvas + jsPDF)...');
    
    const estadoOriginal = prepararElementoParaCaptura(element);
    
    try {
      const anchoReal = obtenerAnchoRealCompleto(element);
      const altoReal = Math.max(element.scrollHeight, element.offsetHeight);
      
      console.log('Alternativo - Dimensiones:', anchoReal, 'x', altoReal);
      
      const canvas = await html2canvas(element, {
        scale: 1.2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: true,
        scrollY: 0,
        scrollX: 0,
        width: anchoReal,
        height: altoReal,
        windowWidth: Math.max(anchoReal, window.innerWidth),
        windowHeight: Math.max(altoReal, window.innerHeight)
      });

      console.log('Canvas alternativo:', canvas.width, 'x', canvas.height);

      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error('El canvas está vacío');
      }

      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      const { jsPDF } = window.jspdf;
      
      const orientation = anchoReal > altoReal ? 'landscape' : 'portrait';
      const pdf = new jsPDF(orientation, 'mm', 'a4');
      
      const pageWidth = pdf.internal.pageSize.getWidth() - 20;
      const pageHeight = pdf.internal.pageSize.getHeight() - 20;
      
      const imgAspectRatio = canvas.width / canvas.height;
      const pageAspectRatio = pageWidth / pageHeight;
      
      let finalWidth, finalHeight;
      
      if (imgAspectRatio > pageAspectRatio) {
        finalWidth = pageWidth;
        finalHeight = pageWidth / imgAspectRatio;
      } else {
        finalHeight = pageHeight;
        finalWidth = pageHeight * imgAspectRatio;
      }
      
      if (finalHeight > pageHeight) {
        const totalPages = Math.ceil(finalHeight / pageHeight);
        for (let page = 0; page < totalPages; page++) {
          if (page > 0) pdf.addPage(orientation);
          const offsetY = -(page * pageHeight);
          pdf.addImage(imgData, 'JPEG', 10, 10 + offsetY, finalWidth, finalHeight);
        }
      } else {
        const x = (pageWidth - finalWidth) / 2 + 10;
        const y = (pageHeight - finalHeight) / 2 + 10;
        pdf.addImage(imgData, 'JPEG', x, y, finalWidth, finalHeight);
      }

      pdf.save(`documento_alternativo_${new Date().getTime()}.pdf`);
      console.log('PDF alternativo generado exitosamente');
      
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

// Función de diagnóstico mejorada - COMPLETADA
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
    const anchoReal = obtenerAnchoRealCompleto(elemento);
    const rect = elemento.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(elemento);
    
    console.log('Ancho real calculado:', anchoReal);
    console.log('Dimensiones del elemento:', elemento.offsetWidth, 'x', elemento.offsetHeight);
    console.log('Scroll dimensions:', elemento.scrollWidth, 'x', elemento.scrollHeight);
    console.log('BoundingClientRect:', rect.width, 'x', rect.height);
    console.log('Elemento visible:', elemento.offsetWidth > 0 && elemento.offsetHeight > 0);
    console.log('Display style:', computedStyle.display);
    console.log('Visibility style:', computedStyle.visibility);








