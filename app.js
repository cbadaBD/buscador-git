const API = 'https://api.github.com';

const form = document.querySelector('#form-buscar');
const input = document.querySelector('#input-usuario');
const boton = document.querySelector('#btn-buscar');
const estado = document.querySelector('#estado');
const perfil = document.querySelector('#perfil');
const titulo = document.querySelector('#titulo-repos');
const repos = document.querySelector('#repos');

// Selectores para las nuevas funcionalidades
const btnCargarMas = document.querySelector('#btn-cargar-mas');
const selectOrden = document.querySelector('#select-orden');
const resumenSeccion = document.querySelector('#resumen');
const resumenLenguajes = document.querySelector('#resumen-lenguajes');
const rateLimit = document.querySelector('#rate-limit');

// Variables de estado para la paginación
let pagina = 1;
let orden = 'updated';
let usuarioActual = '';
let todosLosRepos = [];

// 1. Petición genérica con traducción de errores HTTP
// Actividad 3: Modificado para mostrar x-ratelimit-remaining en el footer
async function obtenerJSON(url) {
  const res = await fetch(url);

  // Mostrar el límite de peticiones restantes
  const remaining = res.headers.get('x-ratelimit-remaining');
  if (remaining !== null) {
    rateLimit.textContent = `Peticiones restantes en esta hora: ${remaining}`;
  }

  if (res.status === 404) throw new Error('Usuario no encontrado');
  if (res.status === 403) {
    throw new Error('Límite de peticiones alcanzado');
  }
  if (!res.ok) throw new Error(`Error HTTP ${res.status}`);

  return res.json();
}

// 2. Pintar el perfil
function mostrarPerfil(u) {
  const img = document.createElement('img');
  img.src = u.avatar_url;
  img.alt = `Avatar de ${u.login}`;

  const nombre = document.createElement('h2');
  nombre.textContent = u.name ?? u.login;

  const datos = document.createElement('p');
  datos.textContent = `${u.public_repos} repositorios · ${u.followers} seguidores`;

  const enlace = document.createElement('a');
  enlace.href = u.html_url;
  enlace.target = '_blank';
  enlace.textContent = 'Ver en GitHub';

  const info = document.createElement('div');
  info.append(nombre, datos, enlace);

  perfil.replaceChildren(img, info);
  perfil.classList.remove('oculto');
}

// 3. Pintar la lista de repositorios
// Actividad 3: Modificado para permitir agregar (append) y controlar el botón de cargar más
function mostrarRepos(lista, append = false) {
  if (!append) {
    repos.innerHTML = '';
  }

  lista.forEach(r => {
    const a = document.createElement('a');
    a.href = r.html_url;
    a.target = '_blank';
    a.textContent = r.name;

    const li = document.createElement('li');
    const lenguaje = r.language ?? 'sin lenguaje';

    li.append(a, ` - ${lenguaje} - ★ ${r.stargazers_count}`);
    repos.append(li);
  });

  titulo.classList.remove('oculto');

  // Actividad 3: Ocultar el botón si la API devolvió menos de 5 resultados
  if (lista.length < 5) {
    btnCargarMas.classList.add('oculto');
  } else {
    btnCargarMas.classList.remove('oculto');
  }
}

// Actividad 2: Función para calcular y mostrar el resumen de lenguajes
function actualizarResumenLenguajes() {
  const conteo = {};
  todosLosRepos.forEach(r => {
    const lang = r.language ?? 'Sin lenguaje';
    conteo[lang] = (conteo[lang] || 0) + 1;
  });

  resumenLenguajes.innerHTML = '';
  
  // Ordenar de mayor a menor cantidad
  Object.entries(conteo)
    .sort((a, b) => b[1] - a[1])
    .forEach(([lang, count]) => {
      const p = document.createElement('p');
      p.textContent = `${lang}: ${count} repositorio(s)`;
      resumenLenguajes.append(p);
    });

  resumenSeccion.classList.remove('oculto');
}

// 4. Función principal de búsqueda (unifica el evento submit y el cambio de orden)
async function buscarPerfil() {
  const inputUsuario = input.value.trim();
  if (!inputUsuario) return;

  usuarioActual = encodeURIComponent(inputUsuario);
  pagina = 1;
  todosLosRepos = [];
  orden = selectOrden.value;

  boton.disabled = true;
  estado.className = '';
  estado.textContent = 'Buscando...';
  
  // Ocultar elementos mientras se busca
  btnCargarMas.classList.add('oculto');
  perfil.classList.add('oculto');
  titulo.classList.add('oculto');
  resumenSeccion.classList.add('oculto');
  repos.innerHTML = '';

  // Actividad 2: Uso de URLSearchParams para construir la URL
  const params = new URLSearchParams({ 
    sort: orden, 
    per_page: 5, 
    page: pagina 
  });

  try {
    const [datosUsuario, datosRepos] = await Promise.all([
      obtenerJSON(`${API}/users/${usuarioActual}`),
      obtenerJSON(`${API}/users/${usuarioActual}/repos?${params}`)
    ]);

    mostrarPerfil(datosUsuario);
    todosLosRepos = datosRepos;
    mostrarRepos(datosRepos);
    actualizarResumenLenguajes();
    estado.textContent = '';
  } catch (error) {
    perfil.classList.add('oculto');
    titulo.classList.add('oculto');
    resumenSeccion.classList.add('oculto');
    repos.innerHTML = '';
    estado.className = 'error';
    estado.textContent = error.message;
  } finally {
    boton.disabled = false;
  }
}

// Actividad 3: Función para cargar los siguientes 5 repositorios
async function cargarMas() {
  pagina++;
  const params = new URLSearchParams({ 
    sort: orden, 
    per_page: 5, 
    page: pagina 
  });

  btnCargarMas.disabled = true;

  try {
    const datosRepos = await obtenerJSON(`${API}/users/${usuarioActual}/repos?${params}`);
    
    // Acumular los repositorios y mostrarlos sin borrar los anteriores
    todosLosRepos = todosLosRepos.concat(datosRepos);
    mostrarRepos(datosRepos, true);
    
    // Recalcular el resumen de lenguajes con la nueva lista completa
    actualizarResumenLenguajes();
  } catch (error) {
    estado.className = 'error';
    estado.textContent = error.message;
  } finally {
    btnCargarMas.disabled = false;
  }
}

// Event Listeners
form.addEventListener('submit', (e) => {
  e.preventDefault();
  buscarPerfil();
});

// Actividad 2: Volver a buscar cuando cambia el orden
selectOrden.addEventListener('change', () => {
  if (usuarioActual) {
    buscarPerfil();
  }
});

// Actividad 3: Evento para cargar más
btnCargarMas.addEventListener('click', cargarMas);
