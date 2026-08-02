"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
app.use('/', (req, res) => {
    res.send('¡Hola, mi servidor está funcionando!');
});
app.listen(3000, () => {
    console.log('Servidor escuchando en el puerto 3000');
});
//# sourceMappingURL=app.js.map