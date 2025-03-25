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
async function descargarPDF() {
    console.log("Generando PDF con html2pdf...");

    const contenido = document.getElementById("contenido");

    if (!contenido) {
        console.error("Error: No se encontró el contenido.");
        alert("No hay contenido disponible para generar el PDF.");
        return;
    }

    contenido.style.display = "block";

    await new Promise(resolve => setTimeout(resolve, 1000));

    if (contenido.getBoundingClientRect().height === 0) {
        console.error("El contenido aún no es visible.");
        alert("El contenido aún no ha cargado completamente.");
        return;
    }

    // Detectar el dispositivo para ajustar tamaño y escala
    const esMovil = window.innerWidth <= 600;
    const esTablet = window.innerWidth > 600 && window.innerWidth <= 900;

    const opciones = {
        margin: [5, 5, 5, 5], 
        filename: "lectura.pdf",
        pagebreak: { mode: ["avoid-all", "css", "legacy"] }, 
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { 
            scale: esMovil ? 2 : esTablet ? 1.5 : 1.3, // Ajusta la calidad según el dispositivo
            useCORS: true 
        }, 
        jsPDF: { 
            unit: "mm", 
            format: esMovil ? "a5" : esTablet ? "a4" : "a4", // Móvil usa A5, tablet y PC usan A4
            orientation: "portrait" 
        }
    };

    try {
        await html2pdf().set(opciones).from(contenido).save();
        console.log("✅ PDF generado correctamente.");
    } catch (err) {
        console.error("❌ Error al generar el PDF:", err);
    }
}
