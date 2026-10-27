import { prisma } from '../src/shared/prisma.js';

async function main() {
  const cats = await prisma.categoria.findMany();
  console.log('CATEGORÍAS (total ' + cats.length + '):');
  console.table(cats);

  const diffs = await prisma.dificultad.findMany();
  console.log('\nDIFICULTADES (total ' + diffs.length + '):');
  console.table(diffs);

  const origins = await prisma.origen.findMany();
  console.log('\nORÍGENES (total ' + origins.length + '):');
  console.table(origins);

  const recipes = await prisma.receta.findMany({
    include: {
      plato: true,
      categoria: true,
      dificultad: true,
    },
  });
  console.log('\nRECETAS (total ' + recipes.length + '):');
  console.table(recipes.map(r => ({
    id: r.idReceta,
    nombre: r.plato.nombre,
    duracion: r.duracion,
    categoria: r.categoria?.nombreCategoria,
    dificultad: r.dificultad?.nivel,
  })));

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
