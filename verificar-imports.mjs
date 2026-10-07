// verificar-imports.mjs — Revisa que todos los archivos que importa tu código EXISTAN.
// Uso (desde la carpeta raíz del proyecto):   node verificar-imports.mjs
// Si algún archivo falta o tiene el nombre mal (ej: "ingredient.service (2).ts"), lo muestra.
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, normalize } from 'node:path';

const CARPETAS = ['frontend/src', 'backend/src'];
const IGNORAR = ['node_modules', 'legacy-mi-app-react'];
const EXTENSIONES = ['', '.ts', '.tsx', '.css', '.js', '/index.ts', '/index.tsx'];

function archivos(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((nombre) => {
    if (IGNORAR.includes(nombre)) return [];
    const ruta = join(dir, nombre);
    return statSync(ruta).isDirectory() ? archivos(ruta) : /\.(ts|tsx)$/.test(nombre) ? [ruta] : [];
  });
}

const regex = /(?:from\s+|import\s+)['"](\.{1,2}\/[^'"]+)['"]/g;
let errores = 0;

for (const carpeta of CARPETAS) {
  for (const archivo of archivos(carpeta)) {
    const texto = readFileSync(archivo, 'utf8');
    for (const [, importado] of texto.matchAll(regex)) {
      const base = normalize(join(dirname(archivo), importado));
      // En el backend se escribe "./x.js" pero el archivo real es "x.ts"
      const sinJs = base.endsWith('.js') ? base.slice(0, -3) : base;
      const existe = EXTENSIONES.some((ext) => existsSync(base + ext) && statSync(base + ext).isFile())
        || EXTENSIONES.some((ext) => existsSync(sinJs + ext) && statSync(sinJs + ext).isFile());
      if (!existe) {
        errores++;
        console.log(`❌ ${archivo}\n   importa "${importado}" pero ese archivo no existe`);
      }
    }
  }
}

// Archivos con nombres sospechosos, típicos de copiar/pegar en Windows: "algo (2).ts", "algo - copia.ts"
for (const carpeta of CARPETAS) {
  for (const archivo of archivos(carpeta)) {
    if (/ \(\d+\)\.|copia|copy/i.test(archivo)) {
      errores++;
      console.log(`⚠️  Nombre sospechoso: ${archivo}\n   (¿hay que renombrarlo o borrarlo?)`);
    }
  }
}

console.log(errores === 0 ? '✅ Todo en orden: todos los imports encuentran su archivo.' : `\nSe encontraron ${errores} problema(s).`);
process.exit(errores === 0 ? 0 : 1);
