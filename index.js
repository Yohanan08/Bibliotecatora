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

// Versión específicamente optimizada para móviles
async function descargarPDFMobile(element) {
  console.log('=== INICIANDO PROCESO MÓVIL ===');
  
  // Diagnóstico inicial
  console.log('Elemento original:', element.offsetWidth, 'x', element.offsetHeight);
  console.log('Scroll dimensions:', element.scrollWidth, 'x', element.scrollHeight);
  
  // Esperar que todo esté renderizado
  await new Promise(resolve => setTimeout(resolve, 300));
  
  try {
    // Método 1: Intentar con html2pdf optimizado para móvil
    await intentarMetodo1Mobile(element);
  } catch (error) {
    console.warn('Método 1 falló, intentando método 2:', error.message);
    try {
      // Método 2: Usar html2canvas directo + jsPDF
      await intentarMetodo2Mobile(element);
    } catch (error2) {
      console.warn('Método 2 falló, intentando método 3:', error2.message);
      // Método 3: Clonar elemento y renderizar
      await intentarMetodo3Mobile(element);
    }
  }
}

// Método 1: html2pdf optimizado para móvil
async function intentarMetodo1Mobile(element) {
  console.log('Probando Método 1 - html2pdf móvil...');
  
  const opciones = {
    margin: [3, 3, 3, 3],
    filename: `documento_mobile_${new Date().getTime()}.pdf`,
    image: { 
      type: 'jpeg', 
      quality: 0.7
    },
    html2canvas: {
      scale: 0.8, // Escala menor para móviles
      useCORS: true,
      allowTaint: true,
      logging: true,
      scrollY: 0,
      scrollX: 0,
      backgroundColor: '#ffffff',
      timeout: 60000, // Timeout más largo
      // Configuraciones específicas para móviles
      foreignObjectRendering: false,
      removeContainer: false,
      async: true,
      width: Math.min(element.scrollWidth, window.innerWidth),
      height: element.scrollHeight,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
      compress: false
    }
  };

  await html2pdf().set(opciones).from(element).save();
  console.log('✓ Método 1 exitoso');
}

// Método 2: html2canvas directo
async function intentarMetodo2Mobile(element) {
  console.log('Probando Método 2 - html2canvas directo...');
  
  // Forzar visibilidad del elemento
  const estiloOriginal = {
    position: element.style.position,
    visibility: element.style.visibility,
    display: element.style.display,
    opacity: element.style.opacity
  };
  
  element.style.position = 'static';
  element.style.visibility = 'visible';
  element.style.display = 'block';
  element.style.opacity = '1';
  
  // Esperar que los estilos se apliquen
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const canvas = await html2canvas(element, {
    scale: 0.75,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: true,
    scrollY: 0,
    scrollX: 0,
    timeout: 30000,
    foreignObjectRendering: false,
    width: Math.min(element.scrollWidth, window.innerWidth),
    height: element.scrollHeight
  });

  console.log('Canvas creado:', canvas.width, 'x', canvas.height);
  
  if (canvas.width === 0 || canvas.height === 0) {
    throw new Error('Canvas vacío en método 2');
  }

  // Restaurar estilos originales
  Object.keys(estiloOriginal).forEach(prop => {
    element.style[prop] = estiloOriginal[prop];
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.8);
  
  if (imgData.length < 1000) {
    throw new Error('Imagen generada muy pequeña');
  }

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  const pageWidth = pdf.internal.pageSize.getWidth() - 6; // Margen
  const pageHeight = pdf.internal.pageSize.getHeight() - 6;
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
  let heightLeft = imgHeight;
  let position = 3;

  pdf.addImage(imgData, 'JPEG', 3, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight + 3;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 3, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(`documento_mobile_m2_${new Date().getTime()}.pdf`);
  console.log('✓ Método 2 exitoso');
}

// Método 3: Elemento clonado visible
async function intentarMetodo3Mobile(element) {
  console.log('Probando Método 3 - elemento clonado...');
  
  // Crear un contenedor temporal visible
  const contenedor = document.createElement('div');
  contenedor.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: ${Math.min(window.innerWidth - 20, 800)}px;
    background: white;
    z-index: 10000;
    visibility: visible;
    opacity: 1;
    padding: 10px;
    box-sizing: border-box;
  `;
  
  // Clonar el contenido
  const elementoClonado = element.cloneNode(true);
  
  // Aplicar estilos para asegurar visibilidad
  elementoClonado.style.cssText = `
    width: 100%;
    background: white;
    color: black;
    font-family: Arial, sans-serif;
    font-size: 14px;
    line-height: 1.4;
    display: block;
    visibility: visible;
    opacity: 1;
  `;
  
  // Corregir imágenes y otros elementos
  const imagenes = elementoClonado.querySelectorAll('img');
  imagenes.forEach(img => {
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    img.style.display = 'block';
  });
  
  const tablas = elementoClonado.querySelectorAll('table');
  tablas.forEach(tabla => {
    tabla.style.width = '100%';
    tabla.style.borderCollapse = 'collapse';
  });
  
  contenedor.appendChild(elementoClonado);
  document.body.appendChild(contenedor);
  
  // Esperar que se renderice
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    const canvas = await html2canvas(contenedor, {
      scale: 0.8,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: true,
      scrollY: 0,
      scrollX: 0,
      timeout: 45000,
      width: contenedor.offsetWidth,
      height: contenedor.offsetHeight
    });

    console.log('Canvas método 3:', canvas.width, 'x', canvas.height);
    
    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error('Canvas vacío en método 3');
    }

    const imgData = canvas.toDataURL('image/jpeg', 0.8);
    
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pageWidth = pdf.internal.pageSize.getWidth() - 6;
    const pageHeight = pdf.internal.pageSize.getHeight() - 6;
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 3;

    pdf.addImage(imgData, 'JPEG', 3, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight + 3;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 3, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`documento_mobile_m3_${new Date().getTime()}.pdf`);
    console.log('✓ Método 3 exitoso');
    
  } finally {
    // Limpiar
    if (contenedor.parentNode) {
      document.body.removeChild(contenedor);
    }
  }
}

// Versión corregida para escritorio
async function descargarPDFDesktop(element) {
  // Esperar un momento para asegurar que todo esté renderizado
  await new Promise(resolve => setTimeout(resolve, 100));

  const opciones = {
    margin: [10, 10, 10, 10],
    filename: `documento_${new Date().getTime()}.pdf`,
    image: { 
      type: 'jpeg', 
      quality: 0.95 
    },
    html2canvas: {
      scale: 1.5,
      useCORS: true,
      allowTaint: true,
      logging: true,
      backgroundColor: '#ffffff',
      scrollY: 0,
      scrollX: 0,
      width: element.scrollWidth || element.offsetWidth,
      height: element.scrollHeight || element.offsetHeight,
      onrendered: function(canvas) {
        console.log('Canvas desktop renderizado - Ancho:', canvas.width, 'Alto:', canvas.height);
      }
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait'
    },
    pagebreak: { 
      mode: ['css'],
      avoid: ['tr', 'td', 'img']
    }
  };

  console.log('Generando PDF para desktop...');
  console.log('Dimensiones del elemento:', element.offsetWidth, 'x', element.offsetHeight);
  
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

// Método alternativo usando solo html2canvas + jsPDF
async function descargarPDFAlternativo() {
  const element = document.getElementById('contenido');
  if (!element) {
    alert('Error: No se encontró el elemento con ID "contenido"');
    return;
  }

  mostrarIndicadorCarga(true);

  try {
    console.log('Usando método alternativo...');
    
    // Asegurar que el elemento esté visible
    const estiloOriginal = element.style.display;
    if (window.getComputedStyle(element).display === 'none') {
      element.style.display = 'block';
    }

    const canvas = await html2canvas(element, {
      scale: 1.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: true,
      scrollY: 0,
      scrollX: 0,
      width: element.scrollWidth || element.offsetWidth,
      height: element.scrollHeight || element.offsetHeight
    });

    console.log('Canvas creado:', canvas.width, 'x', canvas.height);

    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error('El canvas está vacío');
    }

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    
    // Verificar que imgData no esté vacío
    if (imgData === 'data:,') {
      throw new Error('No se pudo generar la imagen del contenido');
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 20; // Margen de 10mm a cada lado
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 10;

    // Primera página
    pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
    heightLeft -= (pageHeight - 20);

    // Páginas adicionales si es necesario
    while (heightLeft > 0) {
      position = heightLeft - imgHeight + 10;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
      heightLeft -= (pageHeight - 20);
    }

    pdf.save(`documento_alternativo_${new Date().getTime()}.pdf`);
    console.log('PDF alternativo generado exitosamente');

    // Restaurar estilo original
    element.style.display = estiloOriginal;

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
        // Esperar un poco para asegurar que todo esté listo
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
  console.log('=== DIAGNÓSTICO PDF ===');
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
    const rect = elemento.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(elemento);
    
    console.log('Dimensiones del elemento:', elemento.offsetWidth, 'x', elemento.offsetHeight);
    console.log('Scroll dimensions:', elemento.scrollWidth, 'x', elemento.scrollHeight);
    console.log('BoundingClientRect:', rect.width, 'x', rect.height);
    console.log('Elemento visible:', elemento.offsetWidth > 0 && elemento.offsetHeight > 0);
    console.log('Display style:', computedStyle.display);
    console.log('Visibility style:', computedStyle.visibility);
    console.log('Opacity style:', computedStyle.opacity);
    console.log('Position style:', computedStyle.position);
    console.log('Z-index style:', computedStyle.zIndex);
    console.log('Overflow style:', computedStyle.overflow);
    
    // Verificar si hay contenido de texto
    const textoVisible = elemento.innerText || elemento.textContent;
    console.log('Texto encontrado:', textoVisible ? textoVisible.length + ' caracteres' : 'Sin texto');
    
    // Verificar imágenes
    const imagenes = elemento.querySelectorAll('img');
    console.log('Imágenes encontradas:', imagenes.length);
    imagenes.forEach((img, i) => {
      console.log(`Imagen ${i}:`, img.src, img.offsetWidth + 'x' + img.offsetHeight);
    });
  }
  
  console.log('======================');
}

// Función para probar captura rápida (solo diagnóstico)
async function probarCapturaMobile() {
  const elemento = document.getElementById('contenido');
  if (!elemento) {
    console.error('No se encontró el elemento');
    return;
  }
  
  console.log('=== PRUEBA DE CAPTURA MÓVIL ===');
  
  try {
    const canvas = await html2canvas(elemento, {
      scale: 0.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: true,
      width: Math.min(elemento.scrollWidth, window.innerWidth),
      height: elemento.scrollHeight
    });
    
    console.log('Canvas de prueba:', canvas.width, 'x', canvas.height);
    
    if (canvas.width > 0 && canvas.height > 0) {
      console.log('✓ La captura funciona correctamente');
      
      // Crear una imagen temporal para verificar
      const imgData = canvas.toDataURL('image/jpeg', 0.8);
      console.log('Tamaño de imagen:', imgData.length, 'bytes');
      
      if (imgData.length > 1000) {
        console.log('✓ Imagen generada correctamente');
      } else {
        console.warn('⚠ Imagen muy pequeña, posible problema');
      }
    } else {
      console.error('✗ Canvas vacío');
    }
    
  } catch (error) {
    console.error('✗ Error en captura:', error);
  }
  
  console.log('===============================');
}

// Exponer función de diagnóstico globalmente
window.diagnosticarProblemas = diagnosticarProblemas;








