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

// Función para descargar el PDF con contenido paginado

function descargarPDF() {
  // Elemento a convertir
  const element = document.getElementById('contenido');
  
  // Evitar cortes de elementos en páginas
  prepararContenidoParaPDF();
  
  // Detectar y proteger cabeceras antes de generar el PDF
  protegerCabeceras();
  
  // Configuración optimizada
  const opt = {
    margin: [1.5, 1, 1.5, 1], // Márgenes optimizados (top, right, bottom, left) en cm
    filename: 'documento.pdf',
    image: { 
      type: 'jpeg', 
      quality: 1.0 // Máxima calidad
    },
    html2canvas: {
      scale: 1.3, // Mayor escala para mejor calidad
      useCORS: true,
      logging: false,
      letterRendering: true,
      allowTaint: true,
      scrollY: 0,
      windowWidth: document.documentElement.offsetWidth,
      // Eliminar espacios en blanco extras
      removeContainer: true,
      ignoreElements: (element) => element.classList.contains('ignorar-en-pdf')
    },
    jsPDF: {
      unit: 'cm',
      format: 'a4',
      orientation: 'portrait',
      compress: true,
      precision: 100,
      putOnlyUsedFonts: true
    },
    pagebreak: {
      mode: ['avoid-all', 'css', 'legacy'],
      before: '.nuevo-pagina',
      after: '.fin-seccion',
      avoid: ['.no-dividir', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', '.cabecera', 'thead', 'th']
    }
  };

  // Optimizar contenido para paginación
  optimizarPaginacion();
  
  // Mostrar indicador de progreso
  mostrarProgreso();
  
  // Generar y descargar el PDF con manejo de eventos
  html2pdf()
    .set(opt)
    .from(element)
    .outputPdf('dataurlstring')
    .then(function(pdfAsString) {
      // Creamos un objeto PDF temporal para post-procesamiento
      const pdfData = pdfAsString.split(',')[1];
      const pdfDoc = new window.jspdf.jsPDF();
      
      return pdfDoc.loadFile(pdfAsString)
        .then(() => {
          // Acceso al objeto PDF para posibles ajustes adicionales
          const totalPaginas = pdfDoc.internal.getNumberOfPages();
          
          // Verificar y corregir problemas de paginación
          for (let i = 1; i <= totalPaginas; i++) {
            pdfDoc.setPage(i);
            
            // Agregar número de página si hay más de una
            if (totalPaginas > 1) {
              pdfDoc.setFontSize(8);
              pdfDoc.setTextColor(100);
              pdfDoc.text(`Página ${i} de ${totalPaginas}`, 
                         pdfDoc.internal.pageSize.getWidth() - 3, 
                         pdfDoc.internal.pageSize.getHeight() - 0.5);
            }
            
            // Si es una página intermedia, verificar si tiene contenido
            // Si está casi vacía, podemos redistribuir el contenido
            if (i > 1 && i < totalPaginas) {
              // Técnica avanzada: análisis de densidad de contenido
              // (aquí sería necesario un análisis más profundo del PDF)
            }
          }
          
          // Guardar el PDF procesado
          pdfDoc.save('documento.pdf');
          
          // Ocultar progreso cuando termine
          ocultarProgreso();
          console.log('PDF generado correctamente');
        });
    })
    .catch(error => {
      ocultarProgreso();
      console.error('Error al generar el PDF:', error);
      alert('Ocurrió un error al generar el PDF. Por favor intenta nuevamente.');
      
      // Intentar método alternativo si falla el optimizado
      console.log('Intentando método alternativo...');
      html2pdf()
        .set(opt)
        .from(element)
        .save()
        .then(() => {
          ocultarProgreso();
          console.log('PDF generado mediante método alternativo');
        })
        .catch(err => {
          console.error('El método alternativo también falló:', err);
        });
    });
}

// Función para mostrar un indicador de progreso
function mostrarProgreso() {
  // Crear elemento de progreso si no existe
  if (!document.getElementById('pdf-progreso')) {
    const progreso = document.createElement('div');
    progreso.id = 'pdf-progreso';
    progreso.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255,255,255,0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    `;
    
    progreso.innerHTML = `
      <div style="text-align: center; background: white; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.2);">
        <p>Generando PDF, por favor espere...</p>
        <div style="width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #3498db; border-radius: 50%; animation: spin 2s linear infinite;"></div>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
    
    document.body.appendChild(progreso);
  } else {
    document.getElementById('pdf-progreso').style.display = 'flex';
  }
}

// Función para ocultar el indicador de progreso
function ocultarProgreso() {
  const progreso = document.getElementById('pdf-progreso');
  if (progreso) {
    progreso.style.display = 'none';
  }
}

// Función para preparar el contenido antes de la conversión
function prepararContenidoParaPDF() {
  // Guardar el estilo original
  const estilosOriginales = {};
  
  // Obtener todos los elementos que podrían causar problemas
  const elementosAProcesar = document.querySelectorAll(
    '#contenido img, #contenido table, #contenido div, #contenido p, ' +
    '#contenido h1, #contenido h2, #contenido h3, #contenido h4, #contenido h5, #contenido h6, ' +
    '#contenido header, #contenido .cabecera, #contenido thead'
  );
  
  elementosAProcesar.forEach((elemento, index) => {
    const id = elemento.id || `elem-pdf-${index}`;
    if (!elemento.id) elemento.id = id;
    
    // Guardar estilos originales
    estilosOriginales[id] = elemento.style.cssText;
    
    // Evitar que elementos grandes se corten entre páginas
    if (elemento.tagName === 'TABLE' || elemento.offsetHeight > 300) {
      elemento.classList.add('no-dividir');
    }
    
    // Asegurar que las imágenes mantengan su aspecto y se ajusten correctamente
    if (elemento.tagName === 'IMG') {
      elemento.style.maxWidth = '100%';
      elemento.style.height = 'auto';
      elemento.style.pageBreakInside = 'avoid';
      elemento.style.breakInside = 'avoid';
    }
    
    // Proteger encabezados y títulos
    if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HEADER'].includes(elemento.tagName) || 
        elemento.classList.contains('cabecera') || 
        elemento.tagName === 'THEAD') {
      elemento.classList.add('no-dividir');
      // Asegurar que los encabezados no queden solos al final de una página
      elemento.style.pageBreakAfter = 'avoid';
      elemento.style.breakAfter = 'avoid';
    }
    
    // Eliminar espacios grandes innecesarios
    if (elemento.clientHeight > 50 && elemento.innerHTML.trim() === '' && !elemento.querySelector('img, table, iframe')) {
      elemento.classList.add('compactar-espacio');
    }
  });
  
  // Optimizar espaciado entre párrafos
  const parrafos = document.querySelectorAll('#contenido p, #contenido div:not(.no-ajustar)');
  parrafos.forEach(p => {
    p.style.marginBottom = '0.5em';
    p.style.marginTop = '0.5em';
  });
  
  // Añadir estilos temporales para el PDF
  const estiloTemporal = document.createElement('style');
  estiloTemporal.id = 'pdf-estilos-temporales';
  estiloTemporal.textContent = `
    /* Evitar cortes en elementos importantes */
    .no-dividir {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    
    /* Forzar salto de página */
    .nuevo-pagina {
      page-break-before: always !important;
      break-before: page !important;
      margin-top: 0 !important;
      padding-top: 0 !important;
    }
    
    /* Marca fin de sección */
    .fin-seccion {
      page-break-after: always !important;
      break-after: page !important;
      margin-bottom: 0 !important;
      padding-bottom: 0 !important;
    }
    
    /* Eliminar espacios grandes innecesarios */
    .compactar-espacio {
      height: auto !important;
      max-height: 10px !important;
      min-height: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow: hidden !important;
    }
    
    /* Ajustes generales para mejor distribución */
    #contenido {
      width: 100% !important;
      max-width: 100% !important;
      font-size: 12pt !important;
      line-height: 1.4 !important;
    }
    
    /* Asegurar que el texto no se desborde */
    #contenido p, #contenido div, #contenido span, #contenido li {
      max-width: 100% !important;
      word-wrap: break-word !important;
      overflow-wrap: break-word !important;
    }
    
    /* Mejoras para tablas */
    #contenido table {
      width: 100% !important;
      table-layout: fixed !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      margin-top: 0.5cm !important;
      margin-bottom: 0.5cm !important;
    }
    
    #contenido td, #contenido th {
      word-wrap: break-word !important;
      overflow-wrap: break-word !important;
    }
    
    /* Protección específica para cabeceras */
    #contenido h1, #contenido h2, #contenido h3, #contenido h4, #contenido h5, #contenido h6,
    #contenido header, #contenido .cabecera, #contenido thead, #contenido th {
      page-break-after: avoid !important;
      break-after: avoid !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    
    /* Garantizar que al menos 2-3 líneas acompañen a un encabezado */
    #contenido h1 + p, #contenido h2 + p, #contenido h3 + p, #contenido h4 + p, 
    #contenido h5 + p, #contenido h6 + p, #contenido header + p, #contenido .cabecera + p {
      page-break-before: avoid !important;
      break-before: avoid !important;
    }
    
    /* Ajuste de espacios vertical */
    #contenido * {
      margin-top: 0.1cm !important;
      margin-bottom: 0.1cm !important;
    }
  `;
  
  document.head.appendChild(estiloTemporal);
  
  // Función para restaurar los estilos originales después de generar el PDF
  setTimeout(() => {
    elementosAProcesar.forEach((elemento) => {
      if (estilosOriginales[elemento.id]) {
        elemento.style.cssText = estilosOriginales[elemento.id];
      }
    });
    
    const estiloTemp = document.getElementById('pdf-estilos-temporales');
    if (estiloTemp) estiloTemp.remove();
  }, 100);
}

// Función para detectar y proteger cabeceras específicamente
function protegerCabeceras() {
  // Detectar las posibles cabeceras en el documento
  const posiblesCabeceras = [];
  
  // 1. Buscar elementos que parecen cabeceras por su posición y estilo
  const todosElementos = document.querySelectorAll('#contenido > *');
  let cabeceraCandidato = null;
  
  // Verificar el primer elemento y elementos que aparecen repetidamente en posiciones similares
  if (todosElementos.length > 0) {
    cabeceraCandidato = todosElementos[0];
    posiblesCabeceras.push(cabeceraCandidato);
  }
  
  // 2. Buscar elementos con estilos de cabecera (posición fija/absoluta, parte superior)
  const elementosEstilizados = document.querySelectorAll('#contenido *');
  elementosEstilizados.forEach(elem => {
    const estilo = window.getComputedStyle(elem);
    if (
      (estilo.position === 'fixed' || estilo.position === 'absolute') &&
      parseInt(estilo.top) < 100
    ) {
      posiblesCabeceras.push(elem);
    }
    
    // Elementos que tienen atributos que sugieren ser cabeceras
    if (
      elem.hasAttribute('header') ||
      elem.id.toLowerCase().includes('header') ||
      elem.id.toLowerCase().includes('cabecera') ||
      elem.className.toLowerCase().includes('header') ||
      elem.className.toLowerCase().includes('cabecera') ||
      elem.className.toLowerCase().includes('head')
    ) {
      posiblesCabeceras.push(elem);
    }
  });
  
  // 3. Procesar los elementos detectados como cabeceras
  posiblesCabeceras.forEach(cabecera => {
    // Marcar para protección contra división
    cabecera.classList.add('no-dividir');
    
    // Clonar la cabecera para cada página asegurando que aparezca en todas
    // En lugar de usar clones, aplicamos estilos especiales para html2pdf
    cabecera.setAttribute('data-html2pdf-cabecera', 'true');
    
    // Asegurarnos que los elementos siguientes a la cabecera no se separen
    let siguienteElemento = cabecera.nextElementSibling;
    if (siguienteElemento) {
      siguienteElemento.classList.add('no-dividir');
      siguienteElemento.style.pageBreakBefore = 'avoid';
      siguienteElemento.style.breakBefore = 'avoid';
    }
  });
  
  // 4. Agregar reglas CSS específicas para cabeceras
  const estilosCabecera = document.createElement('style');
  estilosCabecera.id = 'pdf-estilos-cabecera';
  estilosCabecera.textContent = `
    /* Tratamiento especial para cabeceras detectadas */
    [data-html2pdf-cabecera="true"] {
      page-break-after: avoid !important;
      break-after: avoid !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      margin-bottom: 0.5cm !important;
    }
    
    /* Agregamos un espaciado después de la cabecera para evitar cortes abruptos */
    [data-html2pdf-cabecera="true"]::after {
      content: "";
      display: block;
      height: 0.2cm;
    }
  `;
  document.head.appendChild(estilosCabecera);
  
  // Eliminar estos estilos después de generar el PDF
  setTimeout(() => {
    const estilosCab = document.getElementById('pdf-estilos-cabecera');
    if (estilosCab) estilosCab.remove();
  }, 100);
}

// Función para optimizar el uso de páginas y reducir espacios en blanco
function optimizarPaginacion() {
  // Ajustar las alturas de elementos para usar mejor el espacio
  const contenedores = document.querySelectorAll('#contenido > div');
  
  contenedores.forEach(contenedor => {
    const altura = contenedor.offsetHeight;
    
    // Si un contenedor ocupa casi toda una página pero no completamente
    if (altura > 700 && altura < 900) {
      contenedor.classList.add('ajustar-altura');
      contenedor.style.height = 'auto';
    }
  });
}








