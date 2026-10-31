import path from 'path';
import dotenv from 'dotenv';

// Cargar variables de entorno desde backend/.env antes de cualquier import de prisma
dotenv.config({ path: path.resolve('backend/.env') });

const { prisma } = await import('../src/shared/prisma.js');

async function main() {
  const query = `
UPDATE plato SET imagenUrl = CONCAT('https://raw.githubusercontent.com/sebacorvalan97/ImagenesTPDSW/main/img/platos/', CASE idPlato
  WHEN 1  THEN 'Empanadas-de-carne.png'
  WHEN 2  THEN 'milanesas-napolitanas.jpg'
  WHEN 3  THEN 'fideos-bolognesa.jpg'
  WHEN 4  THEN 'ensalada-caesar.jpg'
  WHEN 5  THEN 'sopa-crema-de-zapallo.jpg'
  WHEN 6  THEN 'brownie-de-chocolate.jpg'
  WHEN 7  THEN 'pollo-al-limon.jpg'
  WHEN 8  THEN 'risotto-de-hongos.jpg'
  WHEN 9  THEN 'tarta-de-espinaca-y-ricota.jpg'
  WHEN 10 THEN 'limonada-clasica.jpg'
  WHEN 11 THEN 'papas-al-horno-con-romero.jpg'
  WHEN 12 THEN 'ceviche-peruano.jpg'
  WHEN 13 THEN 'guacamole-con-nachos.jpg'
  WHEN 14 THEN 'pad-thai-de-pollo.jpg'
  WHEN 15 THEN 'ramen-casero.jpg'
  WHEN 16 THEN 'flan-casero-con-dulce-de-leche.jpg'
END)
WHERE idPlato BETWEEN 1 AND 16;
`;

  console.log('Ejecutando UPDATE en tabla plato...');
  const affected = await prisma.$executeRawUnsafe(query);
  console.log(`Filas modificadas: ${affected}`);

  const platos = await prisma.$queryRawUnsafe<Array<{ idPlato: number; nombre: string; imagenUrl: string | null }>>(
    'SELECT idPlato, nombre, imagenUrl FROM plato ORDER BY idPlato ASC'
  );
  console.log('Resultado SELECT idPlato, nombre, imagenUrl FROM plato:');
  console.table(platos);
}

main()
  .catch((e) => {
    console.error('Error durante la ejecución del script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
