"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dish_rout_js_1 = require("./routes/dish.rout.js");
const user_rout_js_1 = require("./routes/user.rout.js");
const category_rout_js_1 = require("./routes/category.rout.js");
const recipe_rout_js_1 = require("./routes/recipe.rout.js");
const ingredient_rout_js_1 = require("./routes/ingredient.rout.js");
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Tus dos endpoints funcionando en paralelo
app.use('/api/dishes', dish_rout_js_1.dishRouter);
app.use('/api/users', user_rout_js_1.userRouter);
app.use('/api/categories', category_rout_js_1.categoryRouter);
app.use('/api/recipes', recipe_rout_js_1.recipeRouter);
app.use('/api/ingredients', ingredient_rout_js_1.ingredientRouter);
app.listen(8080, () => {
    console.log('Servidor escuchando en el puerto 8080');
});
//# sourceMappingURL=app.js.map