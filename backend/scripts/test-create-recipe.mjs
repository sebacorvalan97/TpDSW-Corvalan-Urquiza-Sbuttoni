async function main() {
  // 1. Login como admin
  const adminLogin = await fetch('http://localhost:8080/api/admins/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mail: 'admin@recetario.com', password: 'admin1234' }),
  });
  const adminData = await adminLogin.json();
  console.log('Login admin:', adminLogin.status, adminData.token ? 'OK' : adminData);

  // 2. Login como usuario
  const userLogin = await fetch('http://localhost:8080/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mail: 'martin.garcia@gmail.com', password: 'usuario1234' }),
  });
  const userData = await userLogin.json();
  console.log('Login user:', userLogin.status, userData.token ? 'OK' : userData);

  // 3. Probar crear receta como admin
  const recipePayload = {
    nombre: 'Receta Test Creada',
    descripcion: 'Una deliciosa receta de prueba',
    duracion: '35',
    idCategory: 1,
    idDifficulty: 1,
    idOrigin: 1,
    imagenUrl: '',
    ingredients: [
      { idIngredient: 2, cantidad: 3, unidad: 'unidad' },
    ],
    steps: ['Paso 1: Batir los huevos', 'Paso 2: Cocinar'],
  };

  console.log('\nIntentando crear receta con token de ADMIN...');
  const resAdmin = await fetch('http://localhost:8080/api/recipes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminData.token}`,
    },
    body: JSON.stringify(recipePayload),
  });
  const bodyAdmin = await resAdmin.json();
  console.log('Resultado como admin:', resAdmin.status, bodyAdmin);

  console.log('\nIntentando crear receta con token de USUARIO...');
  const resUser = await fetch('http://localhost:8080/api/recipes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userData.token}`,
    },
    body: JSON.stringify({ ...recipePayload, nombre: 'Receta Test Usuario' }),
  });
  const bodyUser = await resUser.json();
  console.log('Resultado como usuario:', resUser.status, bodyUser);
}

main().catch(console.error);
