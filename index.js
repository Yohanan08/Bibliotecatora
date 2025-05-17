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
  // Verificar dependencias
  if (typeof html2pdf === 'undefined') {
    mostrarMensaje('Error: La biblioteca html2pdf no está disponible', 'error');
    return;
  }

  // Obtener el elemento a convertir
  const element = document.getElementById('contenido');
  if (!element) {
    mostrarMensaje('Error: No se encontró el elemento con ID "contenido"', 'error');
    return;
  }

  // Mostrar indicador de progreso
  mostrarProgreso('Preparando documento...');

  // Detectar si es dispositivo móvil para optimizaciones
  const esMovil = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Opciones mejoradas para distribución óptima del contenido
  const opciones = {
    margin: esMovil ? [1.0, 0.5, 1.0, 0.5] : [1.2, 0.8, 1.2, 0.8], // Márgenes reducidos para mejor aprovechamiento
    filename: 'documento.pdf',
    image: { type: 'jpeg', quality: 0.98 }, // Mayor calidad
    html2canvas: {
      scale: esMovil ? 1 : 1.5, // Aumentado escala para mejor resolución
      useCORS: true,
      logging: false,
      allowTaint: true,
      // Mejor cálculo de altura con menos espacio añadido
      windowHeight: element.scrollHeight + 50,
      // Mejorar renderizado de texto
      letterRendering: true
    },
    jsPDF: {
      unit: 'cm',
      format: 'a4',
      orientation: 'portrait',
      compress: true,
      precision: 16, // Mayor precisión en posicionamiento
      hotfixes: ['px_scaling']  // Corrige problemas de escala
    },
    pagebreak: {
      mode: ['css', 'legacy', 'avoid-all'],
      // Lista ajustada para mejor control de los saltos de página
      before: ['.page-break-before'],
      after: ['.page-break-after'],
      avoid: ['tr', 'td', 'th', 'img', 'table', '.no-break', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'figure']
    }
  };

  // Aplicar estilos optimizados antes de la conversión
  prepararEstilosParaPDF();
  
  // Optimizar el layout del contenido antes de generar el PDF
  optimizarContenidoParaPDF(element);
  
  // Si el dispositivo tiene memoria limitada y el contenido es grande,
  // usar el método optimizado para dispositivos móviles
  if (esMovil && element.offsetHeight > 1500) {
    generarPDFOptimizado(element, opciones);
    return;
  }
  
  // Generar PDF con manejo de errores mejorado
  generarPDFEstandar(element, opciones);
}

/**
 * Optimiza el contenido para mejor distribución en páginas
 */
function optimizarContenidoParaPDF(element) {
  // Almacenar estructura original para restaurar si es necesario
  const contenidoOriginal = element.innerHTML;
  
  try {
    // Ajustar tablas para que no haya desbordamiento
    const tablas = element.querySelectorAll('table');
    tablas.forEach(tabla => {
      // Asegurar que las tablas no se corten entre páginas
      tabla.classList.add('no-break');
      
      // Ajustar ancho máximo de tablas
      tabla.style.maxWidth = '100%';
      tabla.style.tableLayout = 'fixed';
      
      // Ajustar celdas para mejor distribución
      const celdas = tabla.querySelectorAll('td, th');
      celdas.forEach(celda => {
        celda.style.wordBreak = 'break-word';
        celda.style.maxWidth = '100%';
      });
    });
    
    // Evitar que imágenes queden cortadas entre páginas
    const imagenes = element.querySelectorAll('img');
    imagenes.forEach(img => {
      // Contener imágenes en divs para evitar cortes
      if (!img.parentElement.classList.contains('img-container')) {
        const container = document.createElement('div');
        container.classList.add('img-container', 'no-break');
        img.parentNode.insertBefore(container, img);
        container.appendChild(img);
      }
      
      // Asegurar que las imágenes no sean demasiado grandes
      img.style.maxWidth = '95%';
      img.style.height = 'auto';
      img.style.display = 'block';
      img.style.margin = '10px auto';
    });
    
    // Optimizar encabezados 
    const encabezados = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
    encabezados.forEach((encabezado, index) => {
      // Asegurar que los encabezados no queden al final de la página
      encabezado.classList.add('no-break');
      
      // Si es el primer encabezado, ajustar margen superior para que no quede muy pegado al borde
      if (index === 0) {
        encabezado.style.marginTop = '10px';
      }
      
      // Buscar el siguiente contenido para agrupar
      let siguiente = encabezado.nextElementSibling;
      if (siguiente && (siguiente.tagName === 'P' || siguiente.tagName === 'UL' || siguiente.tagName === 'OL')) {
        // Mantener juntos el encabezado y el primer párrafo/lista
        const contenedor = document.createElement('div');
        contenedor.classList.add('no-break', 'encabezado-grupo');
        encabezado.parentNode.insertBefore(contenedor, encabezado);
        contenedor.appendChild(encabezado);
        contenedor.appendChild(siguiente);
      }
    });
    
    // Optimizar grupos de listas para evitar cortes
    const listas = element.querySelectorAll('ul, ol');
    listas.forEach(lista => {
      // Si la lista es pequeña (menos de 6 items), mantenerla junta
      if (lista.children.length < 6) {
        lista.classList.add('no-break');
      } else {
        // Para listas grandes, permitir quiebres pero con control
        lista.style.orphans = '3';
        lista.style.widows = '3';
      }
    });
    
    // Optimizar párrafos
    const parrafos = element.querySelectorAll('p');
    parrafos.forEach(parrafo => {
      // Mejora la distribución de texto para evitar líneas sueltas
      parrafo.style.orphans = '3';
      parrafo.style.widows = '3';
      
      // Si el párrafo es muy corto (1-2 líneas), evitar que quede solo
      if (parrafo.textContent.length < 100) {
        parrafo.classList.add('no-break');
      }
    });
  } catch (error) {
    console.error('Error al optimizar contenido:', error);
    // Restaurar contenido original en caso de error
    element.innerHTML = contenidoOriginal;
  }
}

/**
 * Aplica estilos optimizados para mejorar la distribución del contenido
 */
function prepararEstilosParaPDF() {
  // Crear o actualizar hoja de estilos temporal
  let estiloTemp = document.getElementById('pdf-estilos-temp');
  if (!estiloTemp) {
    estiloTemp = document.createElement('style');
    estiloTemp.id = 'pdf-estilos-temp';
    document.head.appendChild(estiloTemp);
  }
  
  // Estilos mejorados para distribución del contenido
  estiloTemp.textContent = `
    @page {
      margin-top: 1.2cm;
      margin-bottom: 1.2cm;
    }
    #contenido {
      padding-top: 5px;
      padding-bottom: 10px;
      line-height: 1.4; /* Mejorar espacio entre líneas */
    }
    #contenido img {
      max-width: 95% !important;
      height: auto !important;
      margin: 8px auto !important;
      display: block;
    }
    #contenido table {
      width: 100% !important;
      page-break-inside: avoid;
      break-inside: avoid;
      margin: 10px 0;
      border-collapse: collapse;
    }
    #contenido td, #contenido th {
      padding: 6px;
      word-break: break-word;
    }
    #contenido h1, #contenido h2, #contenido h3,
    #contenido h4, #contenido h5, #contenido h6 {
      page-break-after: avoid;
      break-after: avoid;
      margin-top: 12px;
      margin-bottom: 8px;
      line-height: 1.2;
    }
    #contenido h1:first-child, #contenido h2:first-child {
      margin-top: 10px !important; /* Espacio reducido para la primera cabecera */
    }
    .no-break {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    /* Control de párrafos para evitar líneas sueltas */
    p {
      orphans: 3;
      widows: 3;
      margin-bottom: 8px;
      margin-top: 8px;
    }
    /* Control de listas */
    ul, ol {
      padding-left: 20px;
      margin-top: 8px;
      margin-bottom: 8px;
    }
    li {
      margin-bottom: 3px;
    }
    /* Evitar espacio extra entre elementos */
    * + * {
      margin-top: 0.5em;
    }
    /* Controlar espacio vertical en general */
    #contenido > * {
      margin-top: 8px;
      margin-bottom: 8px;
    }
    /* Espacio adicional al final del documento, pero más reducido */
    #contenido::after {
      content: '';
      display: block;
      height: 15px;
    }
    /* Contenedores para imágenes */
    .img-container {
      text-align: center;
      margin: 10px auto;
    }
    /* Agrupar encabezados con contenido siguiente */
    .encabezado-grupo {
      margin-bottom: 10px;
    }
    /* Control específico para mejorar distribución de página */
    .page-break-before {
      page-break-before: always;
      break-before: page;
    }
    .page-break-after {
      page-break-after: always;
      break-after: page;
    }
  `;
  
  // Programar la eliminación de los estilos después
  setTimeout(() => {
    if (estiloTemp && document.head.contains(estiloTemp)) {
      document.head.removeChild(estiloTemp);
    }
  }, 5000);
}

/**
 * Genera el PDF con configuración estándar optimizada
 */
function generarPDFEstandar(element, opciones) {
  mostrarProgreso('Generando PDF...');
  
  // Crear un contenedor temporal mejorado
  const contenedorOriginal = element.parentNode;
  const contenedorTemp = document.createElement('div');
  contenedorTemp.id = 'pdf-contenedor-temp';
  contenedorTemp.style.cssText = `
    padding-top: 8px;
    padding-bottom: 12px;
    position: relative;
    overflow: visible;
  `;
  
  // Insertar antes del elemento original
  contenedorOriginal.insertBefore(contenedorTemp, element);
  // Mover el elemento dentro del contenedor temporal
  contenedorTemp.appendChild(element);
  
  // Guardar scroll para restaurar después
  const scrollPos = window.scrollY;
  
  html2pdf()
    .from(contenedorTemp)
    .set(opciones)
    .toPdf() // Acceder al PDF antes de guardarlo
    .get('pdf')
    .then(pdf => {
      // Optimizar espaciado de páginas
      const numPáginas = pdf.internal.getNumberOfPages();
      
      // Si hay más de una página, ajustar distribución
      if (numPáginas > 1) {
        // Añadir números de página y optimizar márgenes
        for (let i = 1; i <= numPáginas; i++) {
          pdf.setPage(i);
          
          // Números de página discretos
          pdf.setFontSize(8);
          pdf.setTextColor(120);
          pdf.text(
            `${i}/${numPáginas}`, 
            pdf.internal.pageSize.getWidth() - 1, 
            pdf.internal.pageSize.getHeight() - 0.5
          );
        }
      }
      
      return pdf;
    })
    .save()
    .then(() => {
      mostrarMensaje('PDF generado correctamente', 'success');
      ocultarProgreso();
      // Restaurar la estructura del DOM
      contenedorOriginal.insertBefore(element, contenedorTemp);
      contenedorOriginal.removeChild(contenedorTemp);
      // Restaurar posición de scroll
      window.scrollTo(0, scrollPos);
    })
    .catch(error => {
      console.error('Error generando PDF:', error);
      // Restaurar la estructura del DOM antes de intentar método de respaldo
      contenedorOriginal.insertBefore(element, contenedorTemp);
      contenedorOriginal.removeChild(contenedorTemp);
      // Restaurar scroll
      window.scrollTo(0, scrollPos);
      // Intentar método de respaldo con opciones más básicas
      generarPDFRespaldo(element);
    });
}

/**
 * Método de respaldo mejorado para casos de error
 */
function generarPDFRespaldo(element) {
  mostrarProgreso('Usando método alternativo...');
  
  // Opciones simplificadas pero optimizadas para distribución de contenido
  const opcionesSimples = {
    margin: [1.0, 0.8, 1.0, 0.8], // Márgenes reducidos para mejor aprovechamiento
    filename: 'documento.pdf',
    image: { type: 'jpeg', quality: 0.9 },
    html2canvas: {
      scale: 1.2,
      useCORS: true,
      letterRendering: true,
      windowHeight: element.scrollHeight + 50
    },
    jsPDF: {
      unit: 'cm',
      format: 'a4',
      compress: true,
      hotfixes: ['px_scaling']
    },
    pagebreak: {
      mode: ['css', 'legacy'],
      avoid: ['img', 'table', '.no-break']
    }
  };
  
  // Añadir espacio mínimo al inicio y final
  const paddingTop = document.createElement('div');
  paddingTop.style.height = '8px';
  const paddingBottom = document.createElement('div');
  paddingBottom.style.height = '10px';
  
  element.insertBefore(paddingTop, element.firstChild);
  element.appendChild(paddingBottom);
  
  html2pdf()
    .from(element)
    .set(opcionesSimples)
    .save()
    .then(() => {
      mostrarMensaje('PDF generado correctamente', 'success');
      ocultarProgreso();
      // Eliminar padding
      if (element.contains(paddingTop)) element.removeChild(paddingTop);
      if (element.contains(paddingBottom)) element.removeChild(paddingBottom);
    })
    .catch(error => {
      console.error('Método de respaldo falló:', error);
      // Eliminar padding
      if (element.contains(paddingTop)) element.removeChild(paddingTop);
      if (element.contains(paddingBottom)) element.removeChild(paddingBottom);
      mostrarMensaje('No se pudo generar el PDF. Intente con un contenido más simple', 'error');
      ocultarProgreso();
    });
}

/**
 * Optimización para dispositivos móviles y contenido grande
 * Rediseñado para mejor distribución del contenido
 */
function generarPDFOptimizado(element, opciones) {
  mostrarProgreso('Optimizando para mejor distribución...');
  
  // Guardar scroll actual
  const scrollPos = window.scrollY;
  
  // Agregar espacio mínimo pero suficiente al inicio y final
  const paddingTop = document.createElement('div');
  paddingTop.style.height = '8px';
  const paddingBottom = document.createElement('div');
  paddingBottom.style.height = '10px';
  
  element.insertBefore(paddingTop, element.firstChild);
  element.appendChild(paddingBottom);
  
  // Primera fase: generar una imagen del contenido
  html2pdf()
    .from(element)
    .set({
      ...opciones,
      output: 'img'
    })
    .outputImg()
    .then(img => {
      // Segunda fase: convertir imagen a PDF con mejor distribución
      mostrarProgreso('Creando PDF optimizado...');
      const pdf = new window.jspdf.jsPDF(
        opciones.jsPDF.orientation,
        opciones.jsPDF.unit,
        opciones.jsPDF.format
      );
      
      // Calcular dimensiones
      const imgProps = pdf.getImageProperties(img);
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - (opciones.margin[1] + opciones.margin[3]);
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
      
      // Cálculo mejorado para distribuir el contenido uniformemente
      let posY = opciones.margin[0];
      let restante = imgHeight;
      let currentPage = 1;
      
      // Calcular número total de páginas necesarias
      const paginasTotales = Math.ceil(imgHeight / (pageHeight - opciones.margin[0] - opciones.margin[2]));
      
      // Distribuir contenido de manera uniforme si hay múltiples páginas
      let alturaContenidoPorPagina = imgHeight;
      if (paginasTotales > 1) {
        // Ajustar para distribución uniforme entre páginas
        alturaContenidoPorPagina = imgHeight / paginasTotales;
        // Asegurar que no exceda el tamaño máximo de página
        alturaContenidoPorPagina = Math.min(
          alturaContenidoPorPagina,
          pageHeight - opciones.margin[0] - opciones.margin[2] - 0.2 // Reducir 0.2cm para seguridad
        );
      }
      
      let alturaProcesada = 0;
      
      while (restante > 0) {
        // Altura para esta página, optimizada para distribución uniforme
        const alturaDisponible = pageHeight - posY - opciones.margin[2] - 0.2;
        let alturaActual = Math.min(restante, alturaDisponible);
        
        // Optimizar cortes para distribución uniforme (solo si hay muchas páginas)
        if (paginasTotales > 2 && currentPage < paginasTotales) {
          alturaActual = Math.min(alturaActual, alturaContenidoPorPagina);
        }
        
        // Para la primera página
        if (currentPage === 1) {
          pdf.addImage(
            img, 'JPEG',
            opciones.margin[3], posY,
            imgWidth, imgHeight,
            null, 'SLOW',
            -((imgHeight - alturaActual - alturaProcesada) / imgHeight) * imgProps.height
          );
        } else {
          // Para páginas subsecuentes
          pdf.addPage();
          pdf.addImage(
            img, 'JPEG',
            opciones.margin[3], opciones.margin[0],
            imgWidth, imgHeight,
            null, 'SLOW',
            -((imgHeight - restante) / imgHeight) * imgProps.height
          );
        }
        
        // Numerar páginas para mejor navegación
        if (paginasTotales > 1) {
          pdf.setFontSize(8);
          pdf.setTextColor(100);
          pdf.text(
            `${currentPage}/${paginasTotales}`,
            pdf.internal.pageSize.getWidth() - 1,
            pdf.internal.pageSize.getHeight() - 0.5
          );
        }
        
        alturaProcesada += alturaActual;
        restante -= alturaActual;
        posY = opciones.margin[0];
        currentPage++;
      }
      
      // Guardar PDF
      pdf.save(opciones.filename);
      mostrarMensaje('PDF generado correctamente', 'success');
      ocultarProgreso();
      
      // Restaurar posición de scroll
      window.scrollTo(0, scrollPos);
      
      // Eliminar los elementos de padding
      if (element.contains(paddingTop)) element.removeChild(paddingTop);
      if (element.contains(paddingBottom)) element.removeChild(paddingBottom);
    })
    .catch(error => {
      console.error('Error en generación optimizada:', error);
      // Eliminar los elementos de padding
      if (element.contains(paddingTop)) element.removeChild(paddingTop);
      if (element.contains(paddingBottom)) element.removeChild(paddingBottom);
      // Restaurar scroll
      window.scrollTo(0, scrollPos);
      // Intentar método de respaldo
      generarPDFRespaldo(element);
    });
}

/**
 * Muestra un indicador de progreso mejorado
 */
function mostrarProgreso(mensaje = 'Procesando...') {
  let progreso = document.getElementById('pdf-progreso');
  
  if (!progreso) {
    progreso = document.createElement('div');
    progreso.id = 'pdf-progreso';
    progreso.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255,255,255,0.85);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    `;
    
    document.body.appendChild(progreso);
  }
  
  progreso.innerHTML = `
    <div style="background: white; padding: 20px; border-radius: 6px; box-shadow: 0 3px 12px rgba(0,0,0,0.15); text-align: center; max-width: 280px;">
      <p style="margin-bottom: 15px; font-weight: 500;">${mensaje}</p>
      <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
    </div>
    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  `;
}

/**
 * Oculta el indicador de progreso
 */
function ocultarProgreso() {
  const progreso = document.getElementById('pdf-progreso');
  if (progreso) {
    document.body.removeChild(progreso);
  }
}

/**
 * Muestra mensajes al usuario (éxito, error, info)
 */
function mostrarMensaje(texto, tipo = 'info') {
  // Ocultar progreso si está activo
  ocultarProgreso();
  
  // Colores según tipo de mensaje
  const colores = {
    success: { bg: '#f6ffed', border: '#b7eb8f', text: '#52c41a' },
    error: { bg: '#fff2f0', border: '#ffccc7', text: '#ff4d4f' },
    info: { bg: '#e6f7ff', border: '#91d5ff', text: '#1890ff' }
  };
  
  const color = colores[tipo] || colores.info;
  
  // Crear elemento de mensaje
  const mensajeDiv = document.createElement('div');
  mensajeDiv.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: ${color.bg};
    border: 1px solid ${color.border};
    color: ${color.text};
    padding: 12px 20px;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    z-index: 10000;
    animation: fadeIn 0.3s ease;
  `;
  
  mensajeDiv.innerHTML = `
    <div style="display: flex; align-items: center;">
      <div>${texto}</div>
      <button style="margin-left: 15px; background: transparent; border: none; cursor: pointer; color: ${color.text};">✕</button>
    </div>
    <style>
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px) translateX(-50%); }
        to { opacity: 1; transform: translateY(0) translateX(-50%); }
      }
    </style>
  `;
  
  // Agregar al DOM
  document.body.appendChild(mensajeDiv);
  
  // Evento para cerrar
  const cerrarBtn = mensajeDiv.querySelector('button');
  cerrarBtn.addEventListener('click', () => {
    document.body.removeChild(mensajeDiv);
  });
  
  // Auto-eliminar después de 4 segundos
  setTimeout(() => {
    if (document.body.contains(mensajeDiv)) {
      mensajeDiv.style.opacity = '0';
      mensajeDiv.style.transform = 'translateY(-10px) translateX(-50%)';
      mensajeDiv.style.transition = 'opacity 0.3s, transform 0.3s';
      
      setTimeout(() => {
        if (document.body.contains(mensajeDiv)) {
          document.body.removeChild(mensajeDiv);
        }
      }, 300);
    }
  }, 4000);
}








