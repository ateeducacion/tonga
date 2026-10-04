// Copies a curated set of Lucide icons (ISC) into repositorios/iconos*/ as library collections
// «Iconos y símbolos». Each SVG keeps Lucide's licence comment; the only changes are a 256 px
// size (so it is crisp on the canvas) and Tonga's ink colour instead of currentColor (an <img>
// has no text colour). Re-run after choosing other icons:
//
//   npm pack lucide-static@1.50.0 && tar -xzf lucide-static-1.50.0.tgz
//   node scripts/import-lucide-icons.mjs package/icons
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const VERSION = '1.50.0';
const INK = '#1f2937';

export const COLLECTIONS = {
  iconosescuela: {
    title: 'Material escolar',
    icons: {
      school: 'Colegio', book: 'Libro', 'book-open': 'Libro abierto', 'notebook-pen': 'Cuaderno', pencil: 'Lápiz', 'pen-tool': 'Pluma',
      ruler: 'Regla', calculator: 'Calculadora', backpack: 'Mochila', 'graduation-cap': 'Birrete', library: 'Biblioteca',
      presentation: 'Pizarra', 'clipboard-list': 'Lista de tareas', calendar: 'Calendario', clock: 'Reloj', 'alarm-clock': 'Despertador',
      lightbulb: 'Idea', puzzle: 'Puzle', palette: 'Paleta', brush: 'Pincel', scissors: 'Tijeras', paperclip: 'Clip', globe: 'Globo terráqueo',
      map: 'Mapa', 'map-pin': 'Ubicación', compass: 'Brújula',
    },
  },
  iconosciencia: {
    title: 'Ciencia y naturaleza',
    icons: {
      'flask-conical': 'Matraz', microscope: 'Microscopio', atom: 'Átomo', dna: 'ADN', magnet: 'Imán', telescope: 'Telescopio',
      rocket: 'Cohete', orbit: 'Órbita', earth: 'Tierra', leaf: 'Hoja', 'tree-pine': 'Pino', flower: 'Flor', sprout: 'Brote', sun: 'Sol',
      moon: 'Luna', cloud: 'Nube', 'cloud-rain': 'Lluvia', snowflake: 'Copo de nieve', thermometer: 'Termómetro', droplet: 'Gota',
      flame: 'Fuego', mountain: 'Montaña', waves: 'Olas', bug: 'Insecto', bird: 'Pájaro', fish: 'Pez', rabbit: 'Conejo', cat: 'Gato',
      dog: 'Perro', turtle: 'Tortuga', squirrel: 'Ardilla', 'paw-print': 'Huella',
    },
  },
  iconossenales: {
    title: 'Flechas y señales',
    icons: {
      'arrow-right': 'Flecha derecha', 'arrow-left': 'Flecha izquierda', 'arrow-up': 'Flecha arriba', 'arrow-down': 'Flecha abajo',
      'arrow-up-right': 'Flecha diagonal', 'refresh-cw': 'Ciclo', repeat: 'Repetir', check: 'Correcto', x: 'Incorrecto', plus: 'Más',
      minus: 'Menos', equal: 'Igual', percent: 'Porcentaje', 'circle-help': 'Pregunta', 'circle-alert': 'Atención', info: 'Información',
      'triangle-alert': 'Aviso', star: 'Estrella', heart: 'Corazón', 'thumbs-up': 'Me gusta', 'thumbs-down': 'No me gusta', smile: 'Contento',
      frown: 'Triste', laugh: 'Risa', hand: 'Mano', flag: 'Bandera', target: 'Diana', trophy: 'Trofeo', medal: 'Medalla', crown: 'Corona',
    },
  },
  iconosvida: {
    title: 'Vida cotidiana',
    icons: {
      house: 'Casa', building: 'Edificio', hospital: 'Hospital', store: 'Tienda', bus: 'Autobús', car: 'Coche', bike: 'Bicicleta',
      'train-front': 'Tren', plane: 'Avión', ship: 'Barco', footprints: 'Pisadas', user: 'Persona', users: 'Personas', baby: 'Bebé',
      'person-standing': 'Persona de pie', accessibility: 'Accesibilidad', utensils: 'Cubiertos', apple: 'Manzana', carrot: 'Zanahoria',
      cookie: 'Galleta', pizza: 'Pizza', coffee: 'Taza', shirt: 'Camiseta', bed: 'Cama', bath: 'Bañera', toilet: 'Váter',
      'trash-2': 'Papelera', recycle: 'Reciclar', gift: 'Regalo', key: 'Llave', lock: 'Candado', bell: 'Campana',
    },
  },
  iconostecnologia: {
    title: 'Tecnología, música y ocio',
    icons: {
      computer: 'Ordenador', laptop: 'Portátil', smartphone: 'Móvil', tablet: 'Tableta', printer: 'Impresora', wifi: 'Wifi',
      camera: 'Cámara', video: 'Vídeo', mail: 'Correo', 'message-circle': 'Mensaje', phone: 'Teléfono', music: 'Música',
      headphones: 'Auriculares', mic: 'Micrófono', speaker: 'Altavoz', piano: 'Piano', guitar: 'Guitarra', drum: 'Tambor',
      'gamepad-2': 'Mando', volleyball: 'Pelota', dumbbell: 'Pesas', tent: 'Tienda de campaña', ticket: 'Entrada',
    },
  },
};

export const RIGHTS = {
  license: 'ISC',
  creator: 'Lucide Icons and Contributors',
  source: `https://lucide.dev (lucide-static ${VERSION})`,
};

/** The Lucide SVG as Tonga stores it: same drawing, 256 px, ink colour. */
export function adapt(svg) {
  return svg.replace('width="24"', 'width="256"').replace('height="24"', 'height="256"').replace('stroke="currentColor"', `stroke="${INK}"`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const from = process.argv[2];
  if (!from) {
    console.error('Usage: node scripts/import-lucide-icons.mjs <lucide-static/icons>');
    process.exit(1);
  }
  for (const [id, { title, icons }] of Object.entries(COLLECTIONS)) {
    const dir = join('repositorios', id);
    mkdirSync(join(dir, 'thumbnails'), { recursive: true });
    const lines = [];
    for (const [name, label] of Object.entries(icons)) {
      const svg = adapt(readFileSync(join(from, `${name}.svg`), 'utf8'));
      writeFileSync(join(dir, `${name}.svg`), svg);
      writeFileSync(join(dir, 'thumbnails', `${name}.svg`), svg);
      lines.push(`${name}.svg|${label}`);
    }
    writeFileSync(join(dir, 'lista.txt'), `${lines.join('\n')}\n`);
    writeFileSync(join(dir, 'rights.json'), `${JSON.stringify(RIGHTS, null, 2)}\n`);
    console.log(`${dir}: ${lines.length} icons (${title})`);
  }
}
