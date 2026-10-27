import { prisma } from '../src/shared/prisma.js';

async function main() {
  // 1. Restaurar Categoria Entrada con idCategoria = 1 si no existe
  let catEntrada = await prisma.categoria.findUnique({ where: { idCategoria: 1 } });
  if (!catEntrada) {
    catEntrada = await prisma.categoria.create({
      data: {
        idCategoria: 1,
        nombreCategoria: 'Entrada',
        descripcion: 'Platos para comenzar la comida',
      },
    });
    console.log('Restaurada Categoria 1 (Entrada)');
  }

  // 2. Restaurar Dificultad Facil con idDificultad = 1
  let diffFacil = await prisma.dificultad.findUnique({ where: { idDificultad: 1 } });
  if (!diffFacil) {
    diffFacil = await prisma.dificultad.create({
      data: {
        idDificultad: 1,
        nivel: 'Facil',
      },
    });
    console.log('Restaurada Dificultad 1 (Facil)');
  }

  // 3. Restaurar Origen Cocina Argentina con idOrigen = 1
  let originArg = await prisma.origen.findUnique({ where: { idOrigen: 1 } });
  if (!originArg) {
    originArg = await prisma.origen.create({
      data: {
        idOrigen: 1,
        nombreOrigen: 'Cocina Argentina',
        paisReferencia: 'Argentina',
        region: 'Pampas y Noroeste',
        descripcionCultura: 'Carnes, empanadas, asados y tradicion criolla.',
      },
    });
    console.log('Restaurado Origen 1 (Cocina Argentina)');
  }

  // 4. Restaurar Ingrediente Huevo con idIngrediente = 2
  let ingHuevo = await prisma.ingrediente.findUnique({ where: { idIngrediente: 2 } });
  if (!ingHuevo) {
    ingHuevo = await prisma.ingrediente.create({
      data: {
        idIngrediente: 2,
        nombreIngrediente: 'Huevo',
        descripcion: 'Huevos de gallina',
        unidadMedidaDefecto: 'unidad',
      },
    });
    console.log('Restaurado Ingrediente 2 (Huevo)');
  }

  // 5. Reconectar recetas que perdieron categoria (Empanadas = 1, Tarta = 1, Ceviche = 1)
  await prisma.receta.updateMany({
    where: { idReceta: { in: [1, 9, 12] } },
    data: { idCategoria: 1 },
  });

  // Reconectar dificultad facil (Ensalada Caesar = 4, Sopa = 5, Pollo al Limon = 7, Limonada = 10, Papas = 11, Guacamole = 13)
  await prisma.receta.updateMany({
    where: { idReceta: { in: [4, 5, 7, 10, 11, 13] } },
    data: { idDificultad: 1 },
  });

  // Reconectar origen Argentina (Empanadas = plato 1, Milanesas = plato 2, Flan = plato 16)
  const argDishes = [1, 2, 16];
  for (const idPlato of argDishes) {
    const exists = await prisma.platoOrigen.findUnique({
      where: { idPlato_idOrigen: { idPlato, idOrigen: 1 } },
    });
    if (!exists) {
      await prisma.platoOrigen.create({
        data: { idPlato, idOrigen: 1 },
      });
    }
  }

  // Reconectar ingrediente huevo en recetas típicas (Empanadas, Flan, Milanesas, etc)
  const huevoRecipes = [
    { idReceta: 1, cantidad: 2, unidad: 'unidad' },
    { idReceta: 2, cantidad: 2, unidad: 'unidad' },
    { idReceta: 6, cantidad: 3, unidad: 'unidad' },
    { idReceta: 9, cantidad: 2, unidad: 'unidad' },
    { idReceta: 14, cantidad: 2, unidad: 'unidad' },
    { idReceta: 15, cantidad: 4, unidad: 'unidad' },
    { idReceta: 16, cantidad: 4, unidad: 'unidad' },
  ];
  for (const hr of huevoRecipes) {
    const exists = await prisma.itemReceta.findUnique({
      where: { idReceta_idIngrediente: { idReceta: hr.idReceta, idIngrediente: 2 } },
    });
    if (!exists) {
      await prisma.itemReceta.create({
        data: {
          idReceta: hr.idReceta,
          idIngrediente: 2,
          cantidadIngrediente: hr.cantidad,
          unidadMedida: hr.unidad,
        },
      });
    }
  }

  console.log('Restauración completada con éxito.');
  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
