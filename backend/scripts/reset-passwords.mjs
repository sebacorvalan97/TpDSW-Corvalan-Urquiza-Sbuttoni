import { randomBytes, scryptSync } from 'crypto';
import { prisma } from '../src/shared/prisma.js';

const hashPassword = (password) => {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
};

async function main() {
  const adminHash = hashPassword('admin1234');
  await prisma.cuenta.updateMany({
    where: { mail: 'admin@recetario.com' },
    data: { contrasenia: adminHash, estado: 'activo' },
  });
  console.log('Admin password updated to admin1234');

  const userHash = hashPassword('usuario1234');
  await prisma.cuenta.updateMany({
    where: { mail: 'martin.garcia@gmail.com' },
    data: { contrasenia: userHash, estado: 'activo' },
  });
  console.log('User password for martin.garcia@gmail.com updated to usuario1234');

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
