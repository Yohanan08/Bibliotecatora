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
  
  // Opciones mejoradas para evitar corte en cabecera y pie
  const opciones = {
    margin: esMovil ? [1.5, 0.5, 1.5, 0.5] : [2, 1, 2, 1], // Aumentado margen superior e inferior
    filename: 'documento.pdf',
    image: { type: 'jpeg', quality: 0.95 },
    html2canvas: {
      scale: esMovil ? 1 : 1.5,
      useCORS: true,
      logging: false,
      allowTaint: true,
      // Añadir altura adicional para evitar cortes
      windowHeight: element.scrollHeight + 100
    },
    jsPDF: {
      unit: 'cm',
      format: 'a4',
      orientation: 'portrait',
      compress: true,
      hotfixes: ['px_scaling']  // Corrige problemas de escala
    },
    pagebreak: {
      mode: ['css', 'legacy', 'avoid-all'],  // Añadido avoid-all para mejor manejo
      avoid: ['tr', 'td', 'th', 'img', 'table', '.no-break', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']
    }
  };

  // Aplicar estilos mejorados antes de la conversión
  prepararEstilosParaPDF();
  
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
 * Aplica estilos mejorados para evitar cortes en cabecera y pie del PDF
 */
function prepararEstilosParaPDF() {
  // Crear o actualizar hoja de estilos temporal
  let estiloTemp = document.getElementById('pdf-estilos-temp');
  if (!estiloTemp) {
    estiloTemp = document.createElement('style');
    estiloTemp.id = 'pdf-estilos-temp';
    document.head.appendChild(estiloTemp);
  }
  
  // Estilos mejorados para evitar cortes
  estiloTemp.textContent = `
    @page {
      margin-top: 2cm;
      margin-bottom: 2cm;
    }
    #contenido {
      padding-top: 10px;
      padding-bottom: 20px;
    }
    #contenido img {
      max-width: 100% !important;
      height: auto !important;
    }
    #contenido table {
      width: 100% !important;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    #contenido h1, #contenido h2, #contenido h3,
    #contenido h4, #contenido h5, #contenido h6 {
      page-break-after: avoid;
      break-after: avoid;
      margin-top: 15px;
      padding-top: 5px;
    }
    #contenido h1:first-child, #contenido h2:first-child {
      margin-top: 20px !important; /* Espacio adicional para la primera cabecera */
    }
    .no-break {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    /* Prevenir cortes al final de la página */
    p {
      orphans: 3;
      widows: 3;
    }
    /* Asegurar espacio extra al final del documento */
    #contenido::after {
      content: '';
      display: block;
      height: 30px;
    }
  `;
  
  // Programar la eliminación de los estilos después
  setTimeout(() => {
    if (estiloTemp && document.head.contains(estiloTemp)) {
      document.head.removeChild(estiloTemp);
    }
  }, 5000); // Aumentado a 5 segundos para asegurar que termine la generación
}

/**
 * Genera el PDF con configuración estándar
 */
function generarPDFEstandar(element, opciones) {
  mostrarProgreso('Generando PDF...');
  
  // Agregar contenedor temporal para evitar cortes
  const contenedorOriginal = element.parentNode;
  const contenedorTemp = document.createElement('div');
  contenedorTemp.id = 'pdf-contenedor-temp';
  contenedorTemp.style.cssText = `
    padding-top: 15px;
    padding-bottom: 25px;
    position: relative;
    overflow: visible;
  `;
  
  // Insertar antes del elemento original
  contenedorOriginal.insertBefore(contenedorTemp, element);
  // Mover el elemento dentro del contenedor temporal
  contenedorTemp.appendChild(element);
  
  html2pdf()
    .from(contenedorTemp)
    .set(opciones)
    .save()
    .then(() => {
      mostrarMensaje('PDF generado correctamente', 'success');
      ocultarProgreso();
      // Restaurar la estructura del DOM
      contenedorOriginal.insertBefore(element, contenedorTemp);
      contenedorOriginal.removeChild(contenedorTemp);
    })
    .catch(error => {
      console.error('Error generando PDF:', error);
      // Restaurar la estructura del DOM antes de intentar método de respaldo
      contenedorOriginal.insertBefore(element, contenedorTemp);
      contenedorOriginal.removeChild(contenedorTemp);
      // Intentar método de respaldo con opciones más básicas
      generarPDFRespaldo(element);
    });
}

/**
 * Método de respaldo para dispositivos con limitaciones
 */
function generarPDFRespaldo(element) {
  mostrarProgreso('Usando método alternativo...');
  
  // Opciones simplificadas al máximo pero con márgenes mejorados
  const opcionesSimples = {
    margin: [2, 1, 2, 1], // Aumentado márgenes superior e inferior
    filename: 'documento.pdf',
    image: { type: 'jpeg', quality: 0.8 },
    html2canvas: {
      scale: 1,
      useCORS: true,
      windowHeight: element.scrollHeight + 100
    },
    jsPDF: {
      unit: 'cm',
      format: 'a4',
      hotfixes: ['px_scaling']
    }
  };
  
  html2pdf()
    .from(element)
    .set(opcionesSimples)
    .save()
    .then(() => {
      mostrarMensaje('PDF generado correctamente', 'success');
      ocultarProgreso();
    })
    .catch(error => {
      console.error('Método de respaldo falló:', error);
      mostrarMensaje('No se pudo generar el PDF. Intente con un contenido más simple', 'error');
      ocultarProgreso();
    });
}

/**
 * Optimización para dispositivos móviles y contenido grande
 * Divide el proceso en dos fases para evitar problemas de memoria
 */
function generarPDFOptimizado(element, opciones) {
  mostrarProgreso('Optimizando para dispositivo móvil...');
  
  // Guardar scroll actual
  const scrollPos = window.scrollY;
  
  // Agregar espacio adicional antes y después del contenido
  const paddingTop = document.createElement('div');
  paddingTop.style.height = '20px';
  const paddingBottom = document.createElement('div');
  paddingBottom.style.height = '30px';
  
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
      // Segunda fase: convertir imagen a PDF
      mostrarProgreso('Creando PDF...');
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
      
      // Si la imagen es más alta que la página, dividirla
      let posY = opciones.margin[0];
      let restante = imgHeight;
      let currentPage = 1;
      
      while (restante > 0) {
        // Reducir el espacio disponible para evitar cortes en los bordes
        const alturaDisponible = pageHeight - posY - opciones.margin[2] - 0.5; // Reducir 0.5cm para seguridad
        const alturaActual = Math.min(restante, alturaDisponible);
        
        // Para la primera página
        if (currentPage === 1) {
          pdf.addImage(
            img, 'JPEG',
            opciones.margin[3], posY,
            imgWidth, imgHeight,
            null, 'SLOW',
            -((imgHeight - alturaActual) / imgHeight) * imgProps.height
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
        
        // Numerar páginas si hay más de una
        if (imgHeight > pageHeight) {
          pdf.setFontSize(8);
          pdf.setTextColor(100);
          pdf.text(
            `Página ${currentPage}`,
            pdf.internal.pageSize.getWidth() - 2,
            pdf.internal.pageSize.getHeight() - 0.5
          );
        }
        
        restante -= alturaDisponible;
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
      // Intentar método de respaldo
      generarPDFRespaldo(element);
    });
}

/**
 * Muestra un indicador de progreso simple
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
      background: rgba(255,255,255,0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    `;
    
    document.body.appendChild(progreso);
  }
  
  progreso.innerHTML = `
    <div style="background: white; padding: 20px; border-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.2); text-align: center;">
      <p style="margin-bottom: 15px;">${mensaje}</p>
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








