import express from 'express';
import cors from 'cors';
import { dishRouter } from './routes/dish.rout.js';
import { userRouter } from './routes/user.rout.js';
import { categoryRouter } from './routes/category.rout.js';
import { recipeRouter } from './routes/recipe.rout.js';
import { ingredientRouter } from './routes/ingredient.rout.js';
import { pasoRecetaRouter } from './routes/paso-receta.routes.js';
import { recetaIngredienteRouter } from './routes/receta-ingrediente.routes.js';
import { errorHandler } from './middlewares/error-handler.js';
import { adminRouter } from './routes/admin.rout.js';
import { prisma } from './shared/prisma.js';
import { adminRepository } from './shared/repositories/admin.repository.js';
import { recipeCatalogRouter } from './routes/recipe-catalog.rout.js';
import { userFeaturesRouter } from './routes/user-features.rout.js';
import { commentRouter } from './routes/comment.rout.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/dishes', dishRouter);
app.use('/api/users', userRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/admins', adminRouter);
app.use('/api/recipes', recipeRouter);
app.use('/api', recipeCatalogRouter);
app.use('/api/user-data', userFeaturesRouter);
app.use('/api', commentRouter);
app.use('/api/ingredients', ingredientRouter);
app.use('/api/pasos-receta', pasoRecetaRouter);
app.use('/api/recipes-ingredientes', recetaIngredienteRouter);

app.use(errorHandler);

async function startServer(): Promise<void> {
  await prisma.$connect();
  await adminRepository.ensureInitialAdmin();

  app.listen(8080, () => {
    console.log('Servidor conectado a MySQL y escuchando en el puerto 8080');
  });
}

startServer().catch((error: unknown) => {
  console.error('No se pudo iniciar el backend conectado a MySQL:', error);
  process.exitCode = 1;
  void prisma.$disconnect().catch((disconnectError: unknown) => {
    console.error('No se pudo cerrar la conexión Prisma:', disconnectError);
  });
});
