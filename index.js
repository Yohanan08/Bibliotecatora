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
    const contenido = document.getElementById("contenido");

    // Asegurar que el contenido es visible antes de capturar
    contenido.style.visibility = "visible";

    const opciones = {
        margin: [10, 10, 10, 10], // Márgenes equilibrados
        filename: 'documento.pdf',
        image: { type: 'jpeg', quality: 0.9 }, // Mejora la calidad sin aumentar mucho el peso
        html2canvas: {
            scale: 1, // No aumentar demasiado la escala
            useCORS: true,
            allowTaint: true,
            scrollX: 0,
            scrollY: 0,
            logging: true,
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Asegurar que el contenido se renderiza correctamente
    setTimeout(() => {
        html2pdf()
            .set(opciones)
            .from(contenido)
            .toPdf()
            .get('pdf')
            .then(function (pdf) {
                let totalPages = pdf.internal.getNumberOfPages();
                for (let i = 1; i <= totalPages; i++) {
                    pdf.setPage(i);
                    pdf.setFontSize(10);
                    pdf.text(`Página ${i} de ${totalPages}`, 190, 285, { align: 'right' });
                }
            })
            .save();
    }, 1000); // Espera 1 segundo para asegurar que todo se cargue bien
}