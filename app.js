"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_rout_js_1 = require("./routes/user.rout.js");
const app = (0, express_1.default)();
// Esto permite que nuestro servidor entienda datos en formato JSON (necesario para el POST)
app.use(express_1.default.json());
// Conectamos nuestras rutas
app.use('/api/usuarios', user_rout_js_1.userRouter);
app.listen(3000, () => {
    console.log('Servidor escuchando en el puerto 3000');
});
//# sourceMappingURL=app.js.map