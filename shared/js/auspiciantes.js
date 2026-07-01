// ════════════════════════════════════════════════════════════════
//  SUCREBOT 2026 — Auspiciantes (fuente única de verdad)
//  Usado por: INICIO (carrusel), INSTITUCION (hero strip + sidebar),
//             RESULTADOS (splash de carga)
//
//  Para agregar un auspiciante nuevo:
//    1. Subir el logo a shared/images/auspiciantes/
//    2. Agregar un objeto al array AUSPICIANTES de abajo
//    3. Commit — se refleja automáticamente en las 4 zonas
// ════════════════════════════════════════════════════════════════

const AUSPICIANTES_BASE_URL = 'https://raw.githubusercontent.com/sucrebotclub-institute/Sucrebot/main/shared/images/auspiciantes/';

const AUSPICIANTES = [
  {
    nombre: 'BYD',
    logo: 'byd.png',
    url: 'https://www.instagram.com/byd_ecuador/',
    tooltip: '@byd_ecuador'
  },
  {
    nombre: 'BYD Auto Ec',
    logo: 'byd.png',
    url: 'https://www.instagram.com/bydauto.ec/',
    tooltip: '@bydauto.ec'
  },
  {
    nombre: 'JEP Cooperativa',
    logo: 'jep.png',
    url: 'https://www.jep.coop/'
  },
  {
    nombre: 'AX-TEC',
    logo: 'axtec.png',
    url: null
  },
  {
    nombre: 'daly bella',
    logo: 'dalybella.png',
    url: null
  },
  {
    nombre: 'NEO-MAKER LAB',
    logo: 'neomaker.jpg',
    url: null
  },
  {
    nombre: 'Eléctrica GRM',
    logo: 'electricagrm.png',
    url: 'https://electricagrm.com/'
  },
  {
    nombre: "Cytronic's Plant",
    logo: 'cytronics.png',
    url: null
  },
  {
    nombre: 'InnovArte STEAM',
    logo: 'innovarte.jpg',
    url: null
  },
  {
    nombre: 'Peluditos Glam',
    logo: 'peluditosglam.jpg',
    url: 'https://instagram.com/peluditosglam'
  },
  {
    nombre: 'Maker CK3D',
    logo: 'makerck3d.jpg',
    url: 'https://share.google/jNQIpqjdwLw8N6ggB'
  },
  {
    nombre: 'CELIT',
    logo: 'celit.jpg',
    url: 'https://www.celitecuador.com'
  }
];

// Devuelve la URL completa del logo
function ausLogoUrl(item) {
  return AUSPICIANTES_BASE_URL + item.logo;
}

// Reordena una lista para que dos entradas con el mismo logo (ej. BYD + BYD Auto Ec)
// nunca queden adyacentes. Útil para el carrusel. Funciona con cualquier cantidad
// de duplicados a futuro, no solo el caso actual de BYD.
function ausSinAdyacentesDuplicados(lista) {
  const grupos = {};
  lista.forEach(function(item) {
    if (!grupos[item.logo]) grupos[item.logo] = [];
    grupos[item.logo].push(item);
  });
  const colas = Object.keys(grupos).map(function(k) { return grupos[k]; })
    .sort(function(a, b) { return b.length - a.length; });
  const resultado = [];
  let quedan = true;
  while (quedan) {
    quedan = false;
    for (let i = 0; i < colas.length; i++) {
      if (colas[i].length) { resultado.push(colas[i].shift()); quedan = true; }
    }
  }
  // El carrusel repite este set en loop: el último y el primero terminan quedando
  // adyacentes en el punto de reinicio. Si coinciden, se intercambia el último
  // con un elemento del medio (no con el primero de la lista, para no crear
  // una adyacencia nueva justo al inicio).
  if (resultado.length > 3 && resultado[0].logo === resultado[resultado.length - 1].logo) {
    const mitad = Math.floor(resultado.length / 2);
    for (let off = 0; off < resultado.length; off++) {
      const i = ((mitad + off) % (resultado.length - 2)) + 1; // evita índice 0 y el último
      const vecinoAnterior = resultado[i - 1] ? resultado[i - 1].logo : null;
      const vecinoSiguiente = resultado[i + 1] ? resultado[i + 1].logo : null;
      const candidato = resultado[resultado.length - 1].logo;
      if (resultado[i].logo !== resultado[0].logo &&
          candidato !== vecinoAnterior && candidato !== vecinoSiguiente) {
        const tmp = resultado[resultado.length - 1];
        resultado[resultado.length - 1] = resultado[i];
        resultado[i] = tmp;
        break;
      }
    }
  }
  return resultado;
}

// Devuelve el HTML de un <a> o <div> clicable/no-clicable según tenga url
function ausRenderPill(item, className, imgClassName) {
  const tag   = item.url ? 'a' : 'div';
  const attrs = item.url
    ? `href="${item.url}" target="_blank" rel="noopener noreferrer"`
    : '';
  const title = item.tooltip ? `title="${item.tooltip}"` : '';
  return `<${tag} class="${className}" ${attrs} ${title}>` +
           `<img class="${imgClassName}" src="${ausLogoUrl(item)}" alt="${item.nombre}" loading="lazy"/>` +
         `</${tag}>`;
}
