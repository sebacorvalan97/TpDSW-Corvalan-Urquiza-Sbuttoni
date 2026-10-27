const BASE_URL = 'http://localhost:8080';

const results = [];

function assert(description, condition, details = '') {
  if (condition) {
    results.push({ description, status: 'PASS', details });
    console.log(`\x1b[32m[PASS]\x1b[0m ${description}`);
  } else {
    results.push({ description, status: 'FAIL', details });
    console.log(`\x1b[31m[FAIL]\x1b[0m ${description} - ${details}`);
  }
}

async function req(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  let body = null;
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      body = await res.json();
    } catch {
      body = null;
    }
  } else {
    body = await res.text();
  }
  return { status: res.status, headers: res.headers, body };
}

async function runTests() {
  console.log('=== INICIANDO QA TEST SUITE COMPLETO ===\n');

  // --- 1. AUTENTICACIÓN ---
  console.log('--- 1. Pruebas de Autenticación ---');
  let adminToken = '';
  let userToken = '';

  const rAdminWrong = await req('/api/admins/login', {
    method: 'POST',
    body: JSON.stringify({ mail: 'admin@recetario.com', password: 'wrong' }),
  });
  assert('Admin login con password incorrecto da 401', rAdminWrong.status === 401, `Status: ${rAdminWrong.status}`);

  const rAdminEmpty = await req('/api/admins/login', {
    method: 'POST',
    body: JSON.stringify({}),
  });
  assert('Admin login con body vacío da 400', rAdminEmpty.status === 400, `Status: ${rAdminEmpty.status}`);

  const rAdminOk = await req('/api/admins/login', {
    method: 'POST',
    body: JSON.stringify({ mail: 'admin@recetario.com', password: 'admin1234' }),
  });
  assert('Admin login con credenciales correctas da 200 y token', rAdminOk.status === 200 && rAdminOk.body?.token, `Status: ${rAdminOk.status}`);
  adminToken = rAdminOk.body?.token;

  const rUserOk = await req('/api/users/login', {
    method: 'POST',
    body: JSON.stringify({ mail: 'martin.garcia@gmail.com', password: 'usuario1234' }),
  });
  assert('User login con credenciales correctas da 200 y token', rUserOk.status === 200 && rUserOk.body?.token, `Status: ${rUserOk.status}`);
  userToken = rUserOk.body?.token;

  // --- 2. CATEGORÍAS ---
  console.log('\n--- 2. Pruebas de Categorías ---');
  const rCats = await req('/api/categories');
  assert('GET /api/categories devuelve 200 y lista no vacía', rCats.status === 200 && Array.isArray(rCats.body) && rCats.body.length > 0, `Length: ${rCats.body?.length}`);

  const firstCatId = rCats.body?.[0]?.idCategory;
  const rCat1 = await req(`/api/categories/${firstCatId}`);
  assert(`GET /api/categories/${firstCatId} devuelve 200`, rCat1.status === 200 && rCat1.body?.idCategory === firstCatId);

  const rCatNotFound = await req('/api/categories/999999');
  assert('GET /api/categories/999999 devuelve 404', rCatNotFound.status === 404, `Status: ${rCatNotFound.status}`);

  const rCatBadId = await req('/api/categories/invalido');
  assert('GET /api/categories/invalido devuelve 400', rCatBadId.status === 400, `Status: ${rCatBadId.status}`);

  const rCatRecipes = await req(`/api/categories/${firstCatId}/recipes`);
  assert(`GET /api/categories/${firstCatId}/recipes devuelve 200 y array`, rCatRecipes.status === 200 && Array.isArray(rCatRecipes.body));

  const rCatRecipesBad = await req('/api/categories/abc/recipes');
  assert('GET /api/categories/abc/recipes devuelve 400', rCatRecipesBad.status === 400, `Status: ${rCatRecipesBad.status}`);

  // Protegidos de Categoría
  const rCreateCatNoAuth = await req('/api/categories', {
    method: 'POST',
    body: JSON.stringify({ nombre: 'Test Sin Auth', descripcion: '' }),
  });
  assert('POST /api/categories sin auth devuelve 403', rCreateCatNoAuth.status === 403, `Status: ${rCreateCatNoAuth.status}`);

  const rCreateCatUserAuth = await req('/api/categories', {
    method: 'POST',
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({ nombre: 'Test User Auth', descripcion: '' }),
  });
  assert('POST /api/categories con user token devuelve 403', rCreateCatUserAuth.status === 403, `Status: ${rCreateCatUserAuth.status}`);

  const uniqueCatName = `Cat QA ${Date.now()}`;
  const rCreateCatAdmin = await req('/api/categories', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ nombre: uniqueCatName, descripcion: 'Categoría de prueba QA' }),
  });
  assert('POST /api/categories con admin crea categoría (201)', rCreateCatAdmin.status === 201 && rCreateCatAdmin.body?.idCategory, `Status: ${rCreateCatAdmin.status}`);
  const createdCatId = rCreateCatAdmin.body?.idCategory;

  const rCreateCatDup = await req('/api/categories', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ nombre: uniqueCatName, descripcion: 'Duplicado' }),
  });
  assert('POST /api/categories con nombre duplicado devuelve 409', rCreateCatDup.status === 409, `Status: ${rCreateCatDup.status}`);

  const rCreateCatEmpty = await req('/api/categories', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ nombre: '   ', descripcion: '' }),
  });
  assert('POST /api/categories con nombre vacío devuelve 400', rCreateCatEmpty.status === 400, `Status: ${rCreateCatEmpty.status}`);

  const rUpdateCat = await req(`/api/categories/${createdCatId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ nombre: `${uniqueCatName} Mod`, descripcion: 'Modificada' }),
  });
  assert('PUT /api/categories/:id con admin modifica categoría (200)', rUpdateCat.status === 200, `Status: ${rUpdateCat.status}`);

  const rDeleteCat = await req(`/api/categories/${createdCatId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert('DELETE /api/categories/:id con admin elimina categoría (204)', rDeleteCat.status === 204, `Status: ${rDeleteCat.status}`);

  // --- 3. ORÍGENES ---
  console.log('\n--- 3. Pruebas de Orígenes ---');
  const rOrigins = await req('/api/origins');
  assert('GET /api/origins devuelve 200 y array', rOrigins.status === 200 && Array.isArray(rOrigins.body));

  const firstOriginId = rOrigins.body?.[0]?.idOrigin;
  const rOrigin1 = await req(`/api/origins/${firstOriginId}`);
  assert(`GET /api/origins/${firstOriginId} devuelve 200 y origen`, rOrigin1.status === 200 && rOrigin1.body?.idOrigin === firstOriginId);

  const rOriginRecipes = await req(`/api/origins/${firstOriginId}/recipes`);
  assert(`GET /api/origins/${firstOriginId}/recipes devuelve 200 y array`, rOriginRecipes.status === 200 && Array.isArray(rOriginRecipes.body));

  const rOrigin404 = await req('/api/origins/999999');
  assert('GET /api/origins/999999 devuelve 404', rOrigin404.status === 404, `Status: ${rOrigin404.status}`);

  const rOriginBad = await req('/api/origins/abc');
  assert('GET /api/origins/abc devuelve 400', rOriginBad.status === 400, `Status: ${rOriginBad.status}`);

  const rCreateOriginNoAuth = await req('/api/origins', {
    method: 'POST',
    body: JSON.stringify({ nombre: 'QA Origen', pais: 'QA Pais' }),
  });
  assert('POST /api/origins sin auth devuelve 403', rCreateOriginNoAuth.status === 403, `Status: ${rCreateOriginNoAuth.status}`);

  const rCreateOriginAdmin = await req('/api/origins', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ nombre: `Origen QA ${Date.now()}`, pais: 'Pais QA' }),
  });
  assert('POST /api/origins con admin crea origen (201)', rCreateOriginAdmin.status === 201 && rCreateOriginAdmin.body?.idOrigin, `Status: ${rCreateOriginAdmin.status}`);
  const createdOriginId = rCreateOriginAdmin.body?.idOrigin;

  const rUpdateOrigin = await req(`/api/origins/${createdOriginId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ nombre: 'Origen Modificado', pais: 'Pais Modificado' }),
  });
  assert('PUT /api/origins/:id con admin devuelve 204', rUpdateOrigin.status === 204, `Status: ${rUpdateOrigin.status}`);

  const rDeleteOrigin = await req(`/api/origins/${createdOriginId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert('DELETE /api/origins/:id con admin devuelve 204', rDeleteOrigin.status === 204, `Status: ${rDeleteOrigin.status}`);

  // --- 4. DIFICULTADES ---
  console.log('\n--- 4. Pruebas de Dificultades ---');
  const rDiffs = await req('/api/difficulties');
  assert('GET /api/difficulties devuelve 200 y array', rDiffs.status === 200 && Array.isArray(rDiffs.body));

  const firstDiffId = rDiffs.body?.[0]?.idDifficulty;
  const rDiff1 = await req(`/api/difficulties/${firstDiffId}`);
  assert(`GET /api/difficulties/${firstDiffId} devuelve 200`, rDiff1.status === 200 && rDiff1.body?.idDifficulty === firstDiffId);

  const rDiff404 = await req('/api/difficulties/999999');
  assert('GET /api/difficulties/999999 devuelve 404', rDiff404.status === 404, `Status: ${rDiff404.status}`);

  const rCreateDiffAdmin = await req('/api/difficulties', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ nivel: `Extremo QA ${Date.now()}` }),
  });
  assert('POST /api/difficulties con admin crea dificultad (201)', rCreateDiffAdmin.status === 201 && rCreateDiffAdmin.body?.idDifficulty, `Status: ${rCreateDiffAdmin.status}`);
  const createdDiffId = rCreateDiffAdmin.body?.idDifficulty;

  const rUpdateDiff = await req(`/api/difficulties/${createdDiffId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ nivel: 'Extremo QA Modificado' }),
  });
  assert('PUT /api/difficulties/:id con admin devuelve 204', rUpdateDiff.status === 204, `Status: ${rUpdateDiff.status}`);

  const rDeleteDiff = await req(`/api/difficulties/${createdDiffId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert('DELETE /api/difficulties/:id con admin devuelve 204', rDeleteDiff.status === 204, `Status: ${rDeleteDiff.status}`);

  // --- 5. INGREDIENTES ---
  console.log('\n--- 5. Pruebas de Ingredientes ---');
  const rIngs = await req('/api/ingredients');
  assert('GET /api/ingredients devuelve 200 y array', rIngs.status === 200 && Array.isArray(rIngs.body));

  const firstIngId = rIngs.body?.[0]?.idIngredient;
  const rIng1 = await req(`/api/ingredients/${firstIngId}`);
  assert(`GET /api/ingredients/${firstIngId} devuelve 200`, rIng1.status === 200 && rIng1.body?.idIngredient === firstIngId);

  const uniqueIngName = `Ingrediente QA ${Date.now()}`;
  const rCreateIngAdmin = await req('/api/ingredients', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      nombre: uniqueIngName,
      descripcion: 'Ingrediente de prueba',
      unidadMedidaDefecto: 'g',
    }),
  });
  assert('POST /api/ingredients con admin crea ingrediente (201)', rCreateIngAdmin.status === 201 && rCreateIngAdmin.body?.idIngredient, `Status: ${rCreateIngAdmin.status}`);
  const createdIngId = rCreateIngAdmin.body?.idIngredient;

  const rUpdateIng = await req(`/api/ingredients/${createdIngId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      nombre: `${uniqueIngName} Mod`,
      descripcion: 'Modificado',
      unidadMedidaDefecto: 'kg',
    }),
  });
  assert('PUT /api/ingredients/:id con admin devuelve 200', rUpdateIng.status === 200, `Status: ${rUpdateIng.status}`);

  // --- 6. SUSTITUTOS DE INGREDIENTE ---
  console.log('\n--- 6. Pruebas de Sustitutos ---');
  const rSubs = await req(`/api/ingredients/${createdIngId}/substitutes`);
  assert(`GET /api/ingredients/:id/substitutes devuelve 200 y array`, rSubs.status === 200 && Array.isArray(rSubs.body));

  const rCreateSub = await req(`/api/ingredients/${createdIngId}/substitutes`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      nombreSustituto: 'Sustituto QA',
      proporcion: '1:1',
      notas: 'Reemplazo directo',
    }),
  });
  assert('POST /api/ingredients/:id/substitutes crea sustituto (201)', rCreateSub.status === 201 && rCreateSub.body?.idSubstituteIngredient, `Status: ${rCreateSub.status}`);
  const createdSubId = rCreateSub.body?.idSubstituteIngredient;

  const rGetSub = await req(`/api/ingredients/${createdIngId}/substitutes/${createdSubId}`);
  assert('GET /api/ingredients/:id/substitutes/:subId devuelve 200', rGetSub.status === 200, `Status: ${rGetSub.status}`);

  const rUpdateSub = await req(`/api/ingredients/${createdIngId}/substitutes/${createdSubId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      nombreSustituto: 'Sustituto QA Mod',
      proporcion: '2:1',
      notas: 'Doble cantidad',
    }),
  });
  assert('PUT /api/ingredients/:id/substitutes/:subId actualiza sustituto (200)', rUpdateSub.status === 200, `Status: ${rUpdateSub.status}`);

  const rDeleteSub = await req(`/api/ingredients/${createdIngId}/substitutes/${createdSubId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert('DELETE /api/ingredients/:id/substitutes/:subId elimina sustituto (204)', rDeleteSub.status === 204, `Status: ${rDeleteSub.status}`);

  const rDeleteIng = await req(`/api/ingredients/${createdIngId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert('DELETE /api/ingredients/:id con admin elimina ingrediente (204)', rDeleteIng.status === 204, `Status: ${rDeleteIng.status}`);

  // --- 7. RECETAS ---
  console.log('\n--- 7. Pruebas de Recetas ---');
  const rRecipesAll = await req('/api/recipes');
  assert('GET /api/recipes devuelve 200 y array', rRecipesAll.status === 200 && Array.isArray(rRecipesAll.body) && rRecipesAll.body.length > 0);

  const rRecipesFilterCat = await req(`/api/recipes?categoryId=${firstCatId}`);
  assert('GET /api/recipes?categoryId=X devuelve 200 y array filtrado', rRecipesFilterCat.status === 200 && Array.isArray(rRecipesFilterCat.body));

  const rRecipesFilterOrigin = await req(`/api/recipes?originId=${firstOriginId}`);
  assert('GET /api/recipes?originId=X devuelve 200 y array filtrado', rRecipesFilterOrigin.status === 200 && Array.isArray(rRecipesFilterOrigin.body));

  const rRecipesSearch = await req('/api/recipes?search=Casero');
  assert('GET /api/recipes?search=Casero devuelve 200 y resultados coincidentes', rRecipesSearch.status === 200 && Array.isArray(rRecipesSearch.body));

  const rRecipesBadQuery = await req('/api/recipes?categoryId=invalido');
  assert('GET /api/recipes?categoryId=invalido no rompe el servidor (200 o 400)', rRecipesBadQuery.status === 200 || rRecipesBadQuery.status === 400, `Status: ${rRecipesBadQuery.status}`);

  const firstRecipeId = rRecipesAll.body?.[0]?.idRecipe;
  const rRecipe1 = await req(`/api/recipes/${firstRecipeId}`);
  assert(`GET /api/recipes/${firstRecipeId} devuelve 200 y objeto receta`, rRecipe1.status === 200 && rRecipe1.body?.idRecipe === firstRecipeId);

  // Crear receta
  const rCreateRecipeNoAuth = await req('/api/recipes', {
    method: 'POST',
    body: JSON.stringify({ nombre: 'Receta Sin Auth', duracion: '30 min' }),
  });
  assert('POST /api/recipes sin auth devuelve 401', rCreateRecipeNoAuth.status === 401, `Status: ${rCreateRecipeNoAuth.status}`);

  const rCreateRecipeUser = await req('/api/recipes', {
    method: 'POST',
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({
      nombre: `Receta QA ${Date.now()}`,
      descripcion: 'Receta de prueba automatizada',
      duracion: '45 min',
      idCategory: firstCatId,
      idDifficulty: firstDiffId,
      idOrigin: firstOriginId,
      imagenUrl: 'https://images.unsplash.com/photo-test',
      ingredients: [
        { idIngredient: firstIngId, cantidad: 200, unidad: 'g' },
      ],
      steps: ['Paso 1: Mezclar todo', 'Paso 2: Hornear'],
    }),
  });
  assert('POST /api/recipes con user token crea receta completa (201)', rCreateRecipeUser.status === 201 && rCreateRecipeUser.body?.idRecipe, `Status: ${rCreateRecipeUser.status}`);
  const createdRecipeId = rCreateRecipeUser.body?.idRecipe;

  if (createdRecipeId) {
    const rUpdateRecipeUser = await req(`/api/recipes/${createdRecipeId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({
        nombre: 'Receta QA Modificada',
        duracion: '50 min',
      }),
    });
    assert('PUT /api/recipes/:id con el creador actualiza receta (200)', rUpdateRecipeUser.status === 200, `Status: ${rUpdateRecipeUser.status}`);

    const rDeleteRecipeUser = await req(`/api/recipes/${createdRecipeId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert('DELETE /api/recipes/:id con el creador elimina receta (200)', rDeleteRecipeUser.status === 200, `Status: ${rDeleteRecipeUser.status}`);
  }

  // Resumen
  console.log('\n=== RESUMEN DE PRUEBAS QA ===');
  const total = results.length;
  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;
  console.log(`Total: ${total} | Aprobadas: ${passed} | Fallidas: ${failed}`);

  if (failed > 0) {
    console.log('\nPRUEBAS FALLIDAS:');
    results.filter((r) => r.status === 'FAIL').forEach((r) => {
      console.log(`- ${r.description} (${r.details})`);
    });
  }
}

runTests().catch((err) => {
  console.error('Error fatal durante la suite de pruebas:', err);
  process.exit(1);
});
