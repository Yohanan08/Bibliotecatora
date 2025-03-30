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

    // Asegurar que el contenido es visible antes de capturarlo
    contenido.style.display = "block";

    // 🔹 Esperar un poco más para que las imágenes y estilos se carguen completamente
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verificar si el contenido tiene altura antes de generar el PDF
    if (contenido.getBoundingClientRect().height === 0) {
        console.error("❌ El contenido aún no es visible.");
        alert("El contenido aún no ha cargado completamente.");
        return;
    }

    // Detectar el dispositivo para ajustar opciones
    const esMovil = window.innerWidth <= 600;
    const esTablet = window.innerWidth > 600 && window.innerWidth <= 900;

    const opciones = {
        margin: [5, 5, 5, 5], 
        filename: "lectura.pdf",
        pagebreak: { mode: ["avoid-all", "css", "legacy"] }, 
        image: { type: "jpeg", quality: 1 }, // 🔹 Mejora la calidad de las imágenes
        html2canvas: { 
            scale: esMovil ? 3 : esTablet ? 2 : 1.5, // 🔹 Aumenta la escala en móviles
            useCORS: true,
            logging: true, // 🔹 Muestra información en la consola
            allowTaint: true, // 🔹 Permite capturar contenido externo
            backgroundColor: "#fff" // 🔹 Evita que el fondo salga transparente
        }, 
        jsPDF: { 
            unit: "mm", 
            format: "a4", 
            orientation: "portrait" 
        }
    };

    try {
        console.log("🔍 Capturando contenido con html2pdf...");
        await html2pdf().set(opciones).from(contenido).save();
        console.log("✅ PDF generado correctamente.");
    } catch (err) {
        console.error("❌ Error al generar el PDF:", err);
    }
}