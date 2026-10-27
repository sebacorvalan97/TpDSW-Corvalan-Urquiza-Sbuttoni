import { prisma } from '../src/shared/prisma.js';

async function main() {
  const admins = await prisma.administrador.findMany({ include: { cuenta: true } });
  console.log('Admins in DB:');
  for (const a of admins) {
    console.log(`- ID: ${a.idAdministrador}, Nombre: ${a.nombre}, Mail: ${a.cuenta?.mail}, Estado: ${a.cuenta?.estado}, Hash: ${a.cuenta?.contrasenia?.slice(0, 25)}...`);
  }

  const users = await prisma.usuario.findMany({ include: { cuenta: true }, take: 5 });
  console.log('Users in DB (first 5):');
  for (const u of users) {
    console.log(`- ID: ${u.idUsuario}, Nombre: ${u.nombre} ${u.apellido}, Mail: ${u.cuenta?.mail}, Estado: ${u.cuenta?.estado}`);
  }

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
