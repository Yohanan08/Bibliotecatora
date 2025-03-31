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

    const opciones = {
        margin:       [5, 5, 5, 5], // Márgenes más pequeños
        filename:     'documento.pdf',
        image:        { type: 'jpeg', quality: 0.8 }, // Calidad optimizada para móviles
        html2canvas:  { scale: 0.8, useCORS: true, letterRendering: true, scrollX: 0, scrollY: 0 },
        jsPDF:        { unit: 'mm', format: 'a3', orientation: 'portrait', compress: true }
    };

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
}