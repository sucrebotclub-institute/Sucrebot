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
    tooltip: '@byd_ecuador · @bydauto.ec'
  },
  {
    nombre: 'JEP Cooperativa',
    logo: 'jep.png',
    url: null
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
