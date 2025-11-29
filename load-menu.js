document.addEventListener('DOMContentLoaded', function() {
    const menuPlaceholder = document.getElementById('menu-placeholder');
    if (!menuPlaceholder) return;

    const scriptEl = document.currentScript || document.querySelector('script[src$="load-menu.js"]');
    const base = scriptEl ? scriptEl.src : window.location.href;
    const menuUrl = new URL('menu-hamburguesa.html', base).href;

    fetch(menuUrl)
        .then(response => {
            if (!response.ok) throw new Error('HTTP ' + response.status + ' al cargar ' + menuUrl);
            return response.text();
        })
        .then(htmlText => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, 'text/html');

            // Mover estilos al head para que apliquen
            doc.querySelectorAll('style, link[rel="stylesheet"]').forEach(node => {
                document.head.appendChild(node.cloneNode(true));
            });

            // Obtener el contenedor del menú (o todo el body si no hay uno específico)
            const menuNode = doc.querySelector('.menu-wrapper') || doc.body;

            // Insertar el HTML del menú en el placeholder
            menuPlaceholder.appendChild(menuNode.cloneNode(true));

            // Ejecutar scripts: recrearlos en el documento principal
            doc.querySelectorAll('script').forEach(oldScript => {
                const newScript = document.createElement('script');
                if (oldScript.src) {
                    // Resolver rutas relativas respecto al archivo menu-hamburguesa.html
                    newScript.src = new URL(oldScript.src, menuUrl).href;
                    newScript.async = false;
                } else {
                    newScript.textContent = oldScript.textContent;
                }
                document.body.appendChild(newScript);
            });
        })
        .catch(error => console.error('Error al cargar el menú:', error));
});