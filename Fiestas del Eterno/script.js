// 1. Mostrar menú al cargar
document.addEventListener("DOMContentLoaded", () => {
  mostrarMenuPrincipal();
});

// --- FUNCIÓN 1: MENÚ DE TARJETAS (4 en línea) ---
function mostrarMenuPrincipal() {
  const container = document.getElementById("app-container");
  container.innerHTML = "";

  // Aquí SÍ usamos Grid para las 8 fiestas
  container.style.display = "grid";
  container.style.gridTemplateColumns = "repeat(auto-fit, minmax(250px, 1fr))";
  container.style.gap = "20px";

  Object.keys(studiesData).forEach((fiesta) => {
    const data = studiesData[fiesta].es[0];
    container.innerHTML += `
            <div class="card-estudio-original" style="background: white; border: 1px solid #ddd; border-radius: 10px; padding: 25px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.05); border-top: 5px solid #D4AF37;">
                <div style="margin-bottom: 15px;">
                    <i class="fa-solid fa-scroll" style="color: #D4AF37; font-size: 40px;"></i>
                </div>
                <h2 style="color: #002855; font-family: 'Cinzel', serif; margin-bottom: 15px;">${fiesta}</h2>
                <p style="color: #666; font-size: 0.9rem; margin-bottom: 20px;">${data.summary}</p>
                <button onclick="verEstudiosDeFiesta('${fiesta}')" style="background: #002855; color: white; border: none; padding: 12px; width: 100%; border-radius: 5px; cursor: pointer; font-weight: bold;">
                    Entrar al Estudio
                </button>
            </div>
        `;
  });
}

// --- FUNCIÓN 2: PANTALLA DE LECTURA (UNA SOLA COLUMNA ANCHA) ---
function verEstudiosDeFiesta(nombreFiesta) {
  const container = document.getElementById("app-container");

  // IMPORTANTE: Quitamos el Grid para que los estudios no se amontonen
  container.style.display = "block";
  container.innerHTML = "";

  const lista = studiesData[nombreFiesta].es;

  // Botón para regresar
  let html = `
        <button onclick="mostrarMenuPrincipal()" style="margin-bottom: 30px; padding: 12px 25px; cursor: pointer; border-radius: 5px; border: 1px solid #002855; background: white; color: #002855; font-weight: bold;">
            <i class="fa-solid fa-arrow-left"></i> Volver al Inicio
        </button>
    `;

  // Recorremos los estudios (los 24 de Sukot, etc.)
  lista.forEach((estudio, index) => {
    const id = `estudio-${index}`;
    
    // 1. PROCESAMOS EL TEXTO: Convertimos saltos de línea en párrafos reales
    // También detectamos los puntos 1, 2, 3... para que se vean como títulos internos
    let contenidoFormateado = estudio.content
        .replace(/\n\n/g, '</p><p>') // Doble Enter = Nuevo Párrafo
        .replace(/\n/g, '<br>')      // Enter simple = Salto de línea
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Negritas **texto**
        .replace(/(🔹\s*\d+\.\s+.*?)(?=<br>|<\/p>)/g, '<b style="color:#002855; display:block; margin-top:20px; font-size:1.3rem;">$1</b>'); // Resaltar puntos 1, 2, 3...

    html += `
        <div id="${id}" style="background: white; padding: 50px; border-radius: 15px; margin-bottom: 50px; border-left: 8px solid #D4AF37; box-shadow: 0 4px 25px rgba(0,0,0,0.1); max-width: 1000px; margin-left: auto; margin-right: auto;">
            <h1 style="color: #002855; font-family: 'Lora', serif; border-bottom: 2px solid #f0f0f0; padding-bottom: 15px; margin-bottom: 20px;">
                📖 ${estudio.title}
            </h1>
            
            <!-- Contenido ya separado y formateado -->
            <div style="font-size: 1.2rem; line-height: 2; color: #333; text-align: justify; font-family: 'Lora', serif;">
                <p>${contenidoFormateado}</p>
            </div>
            
            <!-- Botones de Copiar y PDF -->
            <div style="margin-top: 30px; display: flex; gap: 15px; border-top: 1px dashed #ddd; padding-top: 25px;">
                <button onclick="copiarEstudio('${id}')" style="padding: 10px 20px; cursor: pointer; background: #f0f0f0; border: none; border-radius: 5px; display: flex; align-items: center; gap: 8px; font-weight: bold;">
                    <i class="fa-solid fa-copy"></i> Copiar Texto
                </button>
                <button onclick="descargarPDFEstudio('${id}', '${estudio.title}')" style="padding: 10px 20px; cursor: pointer; background: #002855; color: white; border: none; border-radius: 5px; display: flex; align-items: center; gap: 8px; font-weight: bold;">
                    <i class="fa-solid fa-file-pdf"></i> Descargar PDF
                </button>
            </div>
        </div>
    `;
});

  container.innerHTML = html;
  window.scrollTo(0, 0);
}

function copiarEstudio(id) {
    const elemento = document.getElementById(id);
    if (!elemento) return;

    const clon = elemento.cloneNode(true);
    const botones = clon.querySelector('div:last-child');
    if (botones) botones.remove();

    let textoParaCopiar = clon.innerText;
    
    // Formateo para que no se pegue todo junto
    textoParaCopiar = textoParaCopiar.split('🔹').join('\n\n🔹 ');
    textoParaCopiar = textoParaCopiar.replace(/\n/g, '\n\n'); 

    navigator.clipboard.writeText(textoParaCopiar).then(() => {
        // EN LUGAR DE ALERT, USAMOS ESTA FUNCIÓN:
        mostrarNotificacionCopiado();
    }).catch(err => {
        const textarea = document.createElement("textarea");
        textarea.value = textoParaCopiar;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        mostrarNotificacionCopiado();
    });
}

// Nueva función para el aviso visual elegante
function mostrarNotificacionCopiado() {
    // Creamos el elemento
    const aviso = document.createElement('div');
    aviso.innerHTML = '<i class="fa-solid fa-check"></i> Estudio copiado con éxito';
    
    // Le damos estilo directamente para que combine con Yeshúa la Toraviviente
    Object.assign(aviso.style, {
        position: 'fixed',
        bottom: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#002855', // Tu azul marino
        color: 'white',
        padding: '12px 25px',
        borderRadius: '50px',
        fontSize: '14px',
        fontWeight: 'bold',
        zIndex: '10000',
        boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
        border: '1px solid #D4AF37', // Tu borde dorado
        transition: 'opacity 0.5s ease'
    });

    document.body.appendChild(aviso);

    // Se desvanece y se elimina después de 2 segundos
    setTimeout(() => {
        aviso.style.opacity = '0';
        setTimeout(() => aviso.remove(), 500);
    }, 2000);
}

// --- FUNCIÓN DE DESCARGA (ACTUALIZADA PARA TUS ESTUDIOS) ---
async function descargarPDFEstudio(idElemento, tituloEstudio) {
  const element = document.getElementById(idElemento);
  if (!element) return alert("No se encontró el contenido");

  // 1. Validación de navegador integrado (Instagram, WhatsApp, etc.)
  if (esNavegadorIntegrado()) {
    alert(
      "Para descargar el PDF, por favor abre esta página en el navegador de tu sistema (Chrome o Safari) usando los tres puntos de la esquina.",
    );
    return;
  }

  // 2. Mostrar indicador de carga
  mostrarIndicador(true, "Preparando documento...");

  // 3. Crear el iframe invisible
  const iframe = document.createElement("iframe");
  Object.assign(iframe.style, {
    position: "fixed",
    right: "0",
    bottom: "0",
    width: "0",
    height: "0",
    border: "0",
    zIndex: "-1",
  });
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;

  // 4. Escribir el contenido con tus estilos de ministerio
  // Clonamos el contenido para no modificar el original en pantalla
  const contenidoClonado = element.cloneNode(true);
  const botonesAccion = contenidoClonado.querySelector("div:last-child"); // Eliminamos los botones de copiar/pdf
  if (botonesAccion) botonesAccion.remove();

  doc.write(`
    <html>
      <head>
        <title>${tituloEstudio}</title>
        <style>
          body { 
            font-family: 'Times New Roman', serif; 
            padding: 40px; 
            color: #000; 
            background: #fff;
            line-height: 1.6;
          }
          h1 { color: #002855; border-bottom: 2px solid #D4AF37; padding-bottom: 10px; }
          h2, h3 { color: #002855; }
          p { text-align: justify; margin-bottom: 15px; font-size: 12pt; }
          /* Evita cortes feos */
          p, blockquote, li, h1, h2 { page-break-inside: avoid; }
          @page { margin: 2cm; }
        </style>
      </head>
      <body>
        <div style="text-align:center; margin-bottom: 20px;">
            <small>Yeshúa la Toraviviente - Biblioteca de las Fiestas</small>
        </div>
        ${contenidoClonado.innerHTML}
      </body>
    </html>
  `);

  doc.close();

  // 5. Pausa para procesar e imprimir
  setTimeout(() => {
    mostrarIndicador(false);

    iframe.contentWindow.focus();
    iframe.contentWindow.print();

    // 6. Limpiar el iframe
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 2000);
  }, 1000);
}

// --- TUS FUNCIONES DE APOYO (SE MANTIENEN IGUAL) ---

function mostrarIndicador(mostrar, texto = "Generando PDF…") {
  let el = document.getElementById("cargando-pdf");
  if (mostrar) {
    if (!el) {
      el = document.createElement("div");
      el.id = "cargando-pdf";
      el.innerHTML = `
        <div style="position:fixed;top:0;left:0;width:100%;height:100%;
        background:rgba(0,0,0,0.6);display:flex;align-items:center;
        justify-content:center;z-index:9999;font-family:sans-serif;">
          <div style="background:white;padding:20px 40px;border-radius:10px;text-align:center;box-shadow: 0 5px 15px rgba(0,0,0,0.2);">
            <p id="cargando-pdf-texto" style="font-size:1.1em;font-weight:bold;margin:0;color:#000;">${texto}</p>
          </div>
        </div>`;
      document.body.appendChild(el);
    } else {
      const p = document.getElementById("cargando-pdf-texto");
      if (p) p.innerText = texto;
    }
    el.style.display = "flex";
  } else if (el) {
    el.style.display = "none";
  }
}

function esNavegadorIntegrado() {
  const ua = navigator.userAgent.toLowerCase();
  return (
    ua.includes("instagram") ||
    ua.includes("fbav") ||
    ua.includes("fban") ||
    ua.includes("whatsapp") ||
    ua.includes("telegram") ||
    ua.includes("line")
  );
}
