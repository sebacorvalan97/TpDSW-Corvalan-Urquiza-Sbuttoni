import express from 'express';
import cors from 'cors';
import { dishRouter } from './routes/dish.rout.js'; 
import { userRouter } from './routes/user.rout.js';
import { categoryRouter} from './routes/category.rout.js';
import { recipeRouter } from './routes/recipe.rout.js';
import { ingredientRouter} from './routes/ingredient.rout.js'

const app = express();

app.use(cors());
app.use(express.json());

// Tus dos endpoints funcionando en paralelo
app.use('/api/dishes', dishRouter); 
app.use('/api/users', userRouter);
app.use('/api/categories', categoryRouter); 
app.use('/api/recipes', recipeRouter);
app.use('/api/ingredients', ingredientRouter);

app.listen(8080, () => {
    console.log('Servidor escuchando en el puerto 8080');
});