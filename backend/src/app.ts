import express from 'express';
import cors from 'cors';
import { dishRouter } from './routes/dish.rout.js';
import { userRouter } from './routes/user.rout.js';
import { categoryRouter } from './routes/category.rout.js';
import { recipeRouter } from './routes/recipe.rout.js';
<<<<<<< HEAD
import { ingredientRouter } from './routes/ingredient.rout.js';
import { pasoRecetaRouter } from './routes/paso-receta.routes.js';
import { recetaIngredienteRouter } from './routes/receta-ingrediente.routes.js';
=======
import { ingredientRouter} from './routes/ingredient.rout.js'
import { errorHandler } from './middlewares/error-handler.js';
>>>>>>> rama-de-nano

const app = express();

app.use(cors());
app.use(express.json());

<<<<<<< HEAD
// Tus dos endpoints funcionando en paralelo
app.use('/api/dishes', dishRouter);
=======
// Cada router atiende un recurso: /api/<recurso>
app.use('/api/dishes', dishRouter); 
>>>>>>> rama-de-nano
app.use('/api/users', userRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/recipes', recipeRouter);
app.use('/api/ingredients', ingredientRouter);
<<<<<<< HEAD
app.use('/api/pasos-receta', pasoRecetaRouter);
app.use('/api/recipes-ingredientes', recetaIngredienteRouter);
=======

// El manejador de errores va SIEMPRE después de las rutas: atrapa lo que ellas lancen.
app.use(errorHandler);

>>>>>>> rama-de-nano
app.listen(8080, () => {
  console.log('Servidor escuchando en el puerto 8080');
});
