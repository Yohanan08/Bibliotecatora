# 📖 Biblioteca Torá

Biblioteca Torá es una aplicación web diseñada para estudiar las Escrituras desde una perspectiva del judaísmo mesiánico.  
El proyecto organiza textos bíblicos, salmos y parashot con herramientas que facilitan el estudio, la lectura y la generación de documentos.

🌐 Demo en vivo  
https://bibliotecatora.vercel.app/

---

# ✨ Características

- 📜 Visualización de textos bíblicos
- 🔤 Texto hebreo
- 🔊 Fonética hebrea (transliteración)
- 📖 Traducción literal al español
- 🌍 Traducción automática a múltiples idiomas
- 📄 Exportación de contenido a PDF
- 📚 Navegación por parashot de la Torá
- 📖 Lectura estructurada de los Salmos
- 📱 Diseño adaptable para móviles, tabletas y escritorio

---

# 🧠 Objetivo del proyecto

Este proyecto busca crear una **biblioteca digital de estudio bíblico** donde los textos puedan analizarse de forma estructurada:

- Texto original
- Fonética
- Traducción literal
- Comentario mesiánico

La plataforma está diseñada para ayudar a estudiantes de las Escrituras a profundizar en el texto desde su idioma original.

---

# 🛠️ Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript (Vanilla JS)
- Google Translate API
- html2pdf.js (generación de PDF)
- Vercel (deploy)

---

# 📂 Estructura del proyecto


/biblioteca-tora
│
├── index.html
├── styles.css
├── script.js
│
├── /salmos
├── /parashot
├── /assets
│
└── README.md


---

# 🚀 Instalación

1. Clona el repositorio


git clone https://github.com/usuario/biblioteca-tora.git


2. Entra al proyecto


cd biblioteca-tora


3. Abre el archivo principal


index.html


Puedes usar:

- VS Code Live Server
- cualquier servidor local

---

# 🌍 Despliegue

El proyecto está desplegado usando **Vercel**, lo que permite publicar aplicaciones web rápidamente y con escalabilidad automática.  

https://bibliotecatora.vercel.app/

---

# 📚 Contenido del proyecto

El sitio incluye:

- Parashot de la Torá
- Salmos
- Lecturas bíblicas
- Estudios mesiánicos

Cada texto está organizado en bloques:

- Hebreo
- Fonética
- Traducción literal
- Comentario

---

# 🔮 Futuras mejoras

- 🔎 Buscador de versículos
- 📖 Navegación completa por Tanaj
- 🧠 Comentarios interactivos
- 🎧 Audio de pronunciación hebrea
- 📱 Mejoras de accesibilidad
- ⚡ Optimización de rendimiento

---

# 👨‍💻 Autor

Andersson Herrera

Frontend Developer  
Estudiante de desarrollo web y tecnologías JavaScript.

---

# 📜 Licencia

Este proyecto es de uso educativo y de estudio bíblico.

---

# Estructura actual (noviembre 2026)

Este proyecto ahora contiene **solo las parashot**.

| Archivo | Para qué sirve |
| --- | --- |
| `index.html` | Portada: parashá de la semana, horarios de Yerushaláyim, estudio del día y las 54 parashot |
| `parasha1.html` … `parasha54.html` | Las 7 aliyot de cada parashá (una por día) |
| `parashaNN/aliyaN.html` | Los estudios. Solo cargan `tema.css`, `parashot-data.js` y `sitio.js` |
| `tema.css` | Todo el diseño (azul y blanco). Los colores están en `:root`, al inicio |
| `parashot-data.js` | Nombres, pasajes y calendario de lecturas (Israel) hasta 2050 |
| `sitio.js` | Hora de Yerushaláyim, Hebcal, cuenta regresiva, estudio del día y navegación entre aliyot |
| `style.css`, `index.js`, `load-menu.js`, `menu-hamburguesa.html` | Se conservan: los usan las páginas de Profecías y Estudios |

## Agregar o corregir una aliyá

Edita el archivo `parashaNN/aliyaN.html`. No hace falta poner estilos ni botones de navegación:
la barra de arriba y los botones de anterior/siguiente los agrega `sitio.js`.
Si cambia el pasaje de una aliyá, actualízalo también en `parashot-data.js`.

## Secciones que se separaron

`vercel.json` reenvía estas carpetas a sus propios proyectos, así los enlaces antiguos siguen funcionando:

- `/Estudios-a-la-Luz-del-Mashiaj/…` → https://estudios-luz-del-mashiaj.vercel.app
- `/Profesias-de-las-parashot/…` → https://profecias-de-las-parashot.vercel.app
- `/Fiestas del Eterno/…` → https://fiestas-del-eterno.vercel.app
