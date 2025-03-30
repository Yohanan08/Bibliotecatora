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

    // 🔹 Asegurar que el contenido está completamente visible
    contenido.style.display = "block";

    // 🔹 Esperar un poco más para garantizar la carga en móviles
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Verificar que el contenido tiene altura
    if (contenido.getBoundingClientRect().height === 0) {
        console.error("❌ El contenido aún no es visible.");
        alert("El contenido aún no ha cargado completamente.");
        return;
    }

    // 🔹 Configuración de html2pdf
    const opciones = {
        margin: 10,
        filename: "lectura.pdf",
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { 
            scale: 1.3,  // 🔹 Asegura buena calidad en móviles y escritorio
            useCORS: true, 
            logging: false,
            allowTaint: true,
            backgroundColor: "#fff"  // 🔹 Fondo blanco para evitar transparencias
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