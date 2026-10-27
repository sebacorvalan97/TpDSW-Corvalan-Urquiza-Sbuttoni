import { prisma } from '../src/shared/prisma.js';

async function main() {
  const comments = await prisma.comentario.findMany({
    include: { _count: { select: { likes: true } } },
    take: 5,
  });
  console.log('Comentarios en BD:', comments);

  // Probar login de usuario
  const loginRes = await fetch('http://localhost:8080/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mail: 'martin.garcia@gmail.com', password: 'usuario1234' }),
  });
  const loginData = await loginRes.json();
  console.log('Login usuario:', loginRes.status, loginData);

  if (comments.length > 0 && loginData.token) {
    const commentId = comments[0].idComentario;
    console.log(`Probando dar like a comentario ${commentId}...`);
    const likeRes = await fetch(`http://localhost:8080/api/comments/${commentId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginData.token}`,
      },
    });
    const likeData = await likeRes.json();
    console.log('Respuesta toggleLike:', likeRes.status, likeData);
  }

  await prisma.$disconnect();
}

main().catch(console.error);
