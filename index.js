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
    console.log("Generando PDF...");

    const contenido = document.getElementById("contenido");

    if (!contenido) {
        console.error("❌ No se encontró el contenido.");
        alert("No hay contenido disponible para generar el PDF.");
        return;
    }

    // 🔹 Asegurar que el contenido está completamente visible antes de capturarlo
    contenido.style.display = "block";

    // 🔹 Esperar un poco más para garantizar la carga en móviles
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 🔹 Verificar que el contenido tiene altura antes de capturar el PDF
    if (contenido.getBoundingClientRect().height === 0) {
        console.error("❌ El contenido aún no es visible.");
        alert("El contenido aún no ha cargado completamente.");
        return;
    }

    // 🔹 Ajustar saltos de página con CSS
    contenido.querySelectorAll('*').forEach(el => {
        el.style.pageBreakInside = "avoid"; // Evita que los elementos se corten
        el.style.overflow = "visible"; // Asegura que no haya contenido oculto
    });

    // 🔹 Configuración de html2pdf
    const opciones = {
        margin: 10,
        filename: "lectura.pdf",
        pagebreak: { mode: ["avoid-all", "css", "legacy"] }, // 🔹 Mejor manejo de saltos de página
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { 
            scale: 1,  
            useCORS: true, 
            logging: false,
            allowTaint: true,
            backgroundColor: "#fff"
        }, 
        jsPDF: { 
            unit: "mm", 
            format: "a4", 
            orientation: "portrait" 
        }
    };

    try {
        console.log("🔍 Capturando contenido...");
        await html2pdf().set(opciones).from(contenido).save();
        console.log("✅ PDF generado correctamente.");
    } catch (err) {
        console.error("❌ Error al generar el PDF:", err);
        alert("Hubo un error al generar el PDF. Intenta nuevamente.");
    }
}