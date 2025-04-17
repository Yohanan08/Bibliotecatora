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
    const element = document.getElementById('contenido');

    const opt = {
      margin:       [0.2, 0.2, 0.2, 0.2], // márgenes mínimos (top, left, bottom, right)
      filename:     'documento.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  {
        scale: 1.3, // mejor calidad y menor espacio en blanco
        useCORS: true,
        scrollY: 0
      },
      jsPDF:        {
        unit: 'cm',
        format: 'a4',
        orientation: 'portrait'
      },
      pagebreak: {
        mode: ['css', 'legacy'],
        before: '.salto', // puedes usar <div class="salto"></div> si necesitas cortar en puntos específicos
      }
    };

    html2pdf().set(opt).from(element).save();
  }








