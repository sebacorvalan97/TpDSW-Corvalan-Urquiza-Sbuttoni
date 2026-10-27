# Análisis general: Bodegón Digital (backend + frontend)

**Stack:** Express 5 + Prisma 7 (MySQL/MariaDB) · React 19 + Vite 8 + Tailwind 4

## Chequeos automáticos

| Chequeo | Resultado |
|---|---|
| `tsc` backend | ✅ 0 errores |
| `tsc -b` frontend | ✅ 0 errores |
| `prisma validate` | ✅ schema válido |
| `oxlint` frontend | ⚠️ 0 errores, 14 warnings |
| Pruebas contra la API en ejecución | ❌ hay endpoints que devuelven 500 (ver B4) |

> [!NOTE]
> Compila sin errores, así que los problemas de abajo son de **lógica, seguridad y configuración**, no de tipos.
> 🔬 = lo confirmé en vivo contra los servidores que tenés corriendo.

---

## 🔴 Críticos

### C1. Cualquier usuario logueado puede modificar recetas ajenas (pasos e ingredientes)
[recipe.controller.ts](file:///c:/Users/sebic/OneDrive/Desktop/myrepo/backend/src/controllers/recipe.controller.ts#L113) sí verifica que la receta sea tuya, pero estos controllers **no lo hacen**:
- [paso-receta.controller.ts](file:///c:/Users/sebic/OneDrive/Desktop/myrepo/backend/src/controllers/paso-receta.controller.ts#L10-L41): crear/editar/borrar pasos de **cualquier** receta. Además `updatePaso` acepta `recetaId`, o sea que se pueden mover pasos a otra receta.
- [receta-ingrediente.controller.ts](file:///c:/Users/sebic/OneDrive/Desktop/myrepo/backend/src/controllers/receta-ingrediente.controller.ts#L11-L27): `DELETE /api/recipes-ingredientes/:id` borra **todos** los ingredientes de cualquier receta.

Las rutas sólo usan `requireAuth`, que verifica que haya sesión pero no quién es el dueño.

### C2. Diferencia de mayúsculas en `NavBar.tsx`, rompe en Linux/macOS
- Git lo tiene como `frontend/src/components/Navbar.tsx`
- En disco y en el import se llama `NavBar` ([App.tsx:16](file:///c:/Users/sebic/OneDrive/Desktop/myrepo/frontend/src/App.tsx#L16))
- En Windows funciona porque `core.ignorecase=true`. En un clon en Linux/Mac o en un deploy, **el build falla**.
- Arreglo: `git mv frontend/src/components/Navbar.tsx frontend/src/components/NavBar.tsx`

### C3. Un clon nuevo del repo no arranca
- `backend/.env.example` está **borrado** (git status `D`)
- `src/generated/` (cliente Prisma) está en `.gitignore`, y no hay script `postinstall`/`prisma generate`. Por eso falla con `Cannot find module '../generated/prisma/client.js'`
- El [README](file:///c:/Users/sebic/OneDrive/Desktop/myrepo/README.MD) sólo menciona `DATABASE_URL`, pero [prisma.ts](file:///c:/Users/sebic/OneDrive/Desktop/myrepo/backend/src/shared/prisma.ts#L16-L24) **además** necesita `DATABASE_HOST/USER/PASSWORD/NAME` (+`PORT`). Las migraciones usan `DATABASE_URL` y el runtime usa las otras.
- Gran parte del backend nuevo está **sin trackear** (`prisma/`, `middleware/`, `admin.*`, `comment.*`…). Si se pierde el disco, se pierde todo eso.

---

## 🟠 Bugs funcionales

### B1. 🔬 Todas las recetas figuran con "0 Mins"
La BD guarda `duracion = "90 min"`, y [receta.service.ts:64](file:///c:/Users/sebic/OneDrive/Desktop/myrepo/frontend/src/services/receta.service.ts#L64) hace `Number("90 min") || 0` → `0`.
- La tarjeta destacada muestra 0 minutos ([App.tsx:649](file:///c:/Users/sebic/OneDrive/Desktop/myrepo/frontend/src/App.tsx#L649))
- El filtro de tiempo máximo deja pasar todas las recetas ([App.tsx:480](file:///c:/Users/sebic/OneDrive/Desktop/myrepo/frontend/src/App.tsx#L480))
- Al guardar se manda `"90"` (sin "min"), así que en la BD quedan los dos formatos mezclados
- Arreglo: `parseInt(recipe.duracion, 10) || 0`, o mejor guardar `duracion` como `Int` en minutos

### B2. 🔬 Las categorías rápidas no filtran nada
[App.tsx:322-329](file:///c:/Users/sebic/OneDrive/Desktop/myrepo/frontend/src/App.tsx#L322-L329) usa IDs del mock (`'cat-pastas'`, `'cat-mexicana'`…). Las categorías reales tienen IDs `"1"`…`"8"` (Entrada, Plato Principal, Postre…), así que **ningún acceso rápido coincide**.

### B3. Guardar una receta sin categoría, dificultad u origen da 400
[App.tsx:405-407](file:///c:/Users/sebic/OneDrive/Desktop/myrepo/frontend/src/App.tsx#L405-L407): `Number('')` → `0`, y el backend rechaza `0` ("El campo idCategory no es válido"). Pasa al editar una receta que no tiene origen, por ejemplo. Debería mandarse `null`.

### B4. 🔬 Un ID inválido devuelve 500 en vez de 400
`GET /api/dishes/abc`, `/api/pasos-receta/abc` y `/api/recipes-ingredientes/abc` → **500**. El `parseInt` sin validar da `NaN` y Prisma explota. Pasa en:
- [dish.controller.ts](file:///c:/Users/sebic/OneDrive/Desktop/myrepo/backend/src/controllers/dish.controller.ts), [paso-receta.controller.ts](file:///c:/Users/sebic/OneDrive/Desktop/myrepo/backend/src/controllers/paso-receta.controller.ts), [receta-ingrediente.controller.ts](file:///c:/Users/sebic/OneDrive/Desktop/myrepo/backend/src/controllers/receta-ingrediente.controller.ts), [user.controller.ts](file:///c:/Users/sebic/OneDrive/Desktop/myrepo/backend/src/controllers/user.controller.ts#L71), [admin.controller.ts](file:///c:/Users/sebic/OneDrive/Desktop/myrepo/backend/src/controllers/admin.controller.ts#L42)
- Además `createDish`, `createPaso` y `addIngredienteToReceta` **no validan el body**: un campo faltante también da 500.
- Ya existe [parse-id.ts](file:///c:/Users/sebic/OneDrive/Desktop/myrepo/backend/src/shared/utils/parse-id.ts) y `positiveId()` en otros controllers; usarlos.

### B5. Los admins pueden quedar todos bloqueados
[admin.controller.ts](file:///c:/Users/sebic/OneDrive/Desktop/myrepo/backend/src/controllers/admin.controller.ts#L47-L78):
- `updateAdmin` acepta cualquier `state`. Si se pone `"inactivo"` en el único admin, **nadie puede volver a entrar** (`delete` sí protege este caso, `update` no).
- `createAdmin` no valida tipos ni largo de contraseña (los usuarios piden mínimo 8 caracteres).
- Un admin puede borrarse a sí mismo.

### B6. Cada vez que guardás un archivo del backend se cierran todas las sesiones
Las sesiones viven en un `Map` en memoria ([auth.ts:12](file:///c:/Users/sebic/OneDrive/Desktop/myrepo/backend/src/middleware/auth.ts#L12)), y `tsx watch` reinicia el proceso en cada guardado. En desarrollo te desloguea todo el tiempo. Opciones: JWT o guardar las sesiones en la BD.

### B7. Fallas menores de UX
- [App.tsx:433](file:///c:/Users/sebic/OneDrive/Desktop/myrepo/frontend/src/App.tsx#L433): si querés borrar una receta ajena, la función sale sin avisar nada.
- La pestaña *Favoritos* es accesible para admins ([App.tsx:305](file:///c:/Users/sebic/OneDrive/Desktop/myrepo/frontend/src/App.tsx#L305)), pero favoritos es sólo para usuarios, así que siempre aparece vacía.

---

## 🟡 Calidad y mantenimiento

**Auth duplicada / código muerto**
- [controllers/requireAdmin.ts](file:///c:/Users/sebic/OneDrive/Desktop/myrepo/backend/src/controllers/requireAdmin.ts) es una **segunda implementación de sesiones** que nadie importa. Además exige `state === "activo"`, y el admin inicial se crea con `"active"`. Hay que borrarla.
- [middleware/requireAdmin.ts](file:///c:/Users/sebic/OneDrive/Desktop/myrepo/backend/src/middleware/requireAdmin.ts) sólo reexporta `auth.ts`. Hay dos carpetas, `middleware/` y `middlewares/`.
- `hashPassword`/`checkPassword` están copiados en [user.repository.ts](file:///c:/Users/sebic/OneDrive/Desktop/myrepo/backend/src/shared/repositories/user.repository.ts#L26-L38) y en [admin.repository.ts](file:///c:/Users/sebic/OneDrive/Desktop/myrepo/backend/src/shared/repositories/admin.repository.ts#L19-L31).
- Se mezclan estados `'active'` y `'activo'`. Funciona gracias a `isActiveAccountState`, pero conviene unificar.

**URLs hardcodeadas** (`http://localhost:8080/api`) que ignoran `API_BASE`:
[App.tsx:204](file:///c:/Users/sebic/OneDrive/Desktop/myrepo/frontend/src/App.tsx#L204), [App.tsx:250](file:///c:/Users/sebic/OneDrive/Desktop/myrepo/frontend/src/App.tsx#L250), [AuthPanel.tsx:32](file:///c:/Users/sebic/OneDrive/Desktop/myrepo/frontend/src/components/AuthPanel.tsx#L32), `plato.service.ts`, `paso-receta.service.ts`, `receta-ingrediente.service.ts`. Sugerencia: `import.meta.env.VITE_API_URL`.

**Archivos vacíos, stubs o sin uso**
- Vacíos: `AdminCrud.tsx`, `RecipeCrud.tsx`
- Stubs de 3 líneas con props sin usar: `AdminCrudPanel.tsx`, `CommunityRanking.tsx`, `RecipeCard.tsx`
- `index.css` no se importa y usa sintaxis de Tailwind 3 (`@tailwind base`). `tailwind.config.js` Tailwind 4 lo ignora.
- `backend/app.legacy.js` está en CommonJS dentro de un paquete `"type": "module"`, así que ni siquiera corre.
- El `package.json` + `node_modules` de la raíz tienen Tailwind suelto.
- Hay `package-lock.json` **y** `pnpm-lock.yaml` en backend y en frontend. Elegir un solo gestor.

**Otros**
- [App.tsx](file:///c:/Users/sebic/OneDrive/Desktop/myrepo/frontend/src/App.tsx) tiene 1065 líneas y concentra estado, fetch y vistas. Convendría dividirlo en hooks y páginas.
- Lint: `set-state-in-effect` (L190, L277) y `exhaustive-deps` (L289).
- Al backend le faltan los scripts `build`/`start`, y no hay tests en ninguno de los dos proyectos.
- `cors()` está abierto a cualquier origen.
- `createUser` guarda el nombre completo en `nombre`, pero `updateUser` lo parte en `nombre` y `apellido`. Es inconsistente.
- [comment.repository.ts:27](file:///c:/Users/sebic/OneDrive/Desktop/myrepo/backend/src/shared/repositories/comment.repository.ts#L27) hace el recorrido `usuario → cuenta → usuario` para leer `fotoPerfil`, que ya está en `usuario`.
- Los nombres son inconsistentes: `*.rout.ts` y `*.routes.ts`, `/recipes-ingredientes` (mitad inglés, mitad español).

---

## ✅ Lo que está bien
- Contraseñas con `scrypt` + salt + `timingSafeEqual`
- Las recetas validan bien el dueño y los datos ([recipe.controller.ts](file:///c:/Users/sebic/OneDrive/Desktop/myrepo/backend/src/controllers/recipe.controller.ts))
- El `errorHandler` traduce `P2002`/`P2003` a 409
- Express 5 captura solo los errores async
- Las actualizaciones de receta corren en transacción
- Comentarios, likes, favoritos y alacena están bien validados y usan el usuario de la sesión

## Orden sugerido de arreglo
1. **C2** (`git mv`, 1 minuto) y **C3** (recuperar `.env.example`, agregar `postinstall: prisma generate`, commitear lo no trackeado)
2. **C1** (chequear dueño en pasos e ingredientes)
3. **B1, B2, B3** (bugs visibles en la UI)
4. **B4, B5** (validación de IDs y protección de admins)
5. Limpieza 🟡
