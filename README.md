Aplicación web que consume la **API REST pública de GitHub** para buscar usuarios, mostrar su perfil, listar sus repositorios más recientes, ordenarlos y generar un resumen de los lenguajes más usados.


buscador-github/
├── index.html # Interfaz de usuario
├── app.js # Lógica de consumo de la API
├── .gitignore # Archivos excluidos del repositorio
└── README.md # Este archivo



Características

- Búsqueda de perfiles por nombre de usuario de GitHub.
- Visualización de datos del perfil: avatar, nombre, repositorios públicos y seguidores.
- Listado de los **5 repositorios más recientes**, con enlace, lenguaje y estrellas.
- Selector para **ordenar repositorios** por:
  - Última actualización (`updated`)
  - Fecha de creación (`created`)
  - Nombre (`full_name`)
- **Resumen de lenguajes más usados** con la cantidad de repositorios por lenguaje.
- Botón **"Cargar más"** para traer los siguientes 5 repositorios sin perder los anteriores.
- Manejo de errores HTTP (404, 403, otros).
- Visualización del **límite de peticiones restantes** (x-ratelimit-remaining) en el pie de página.
