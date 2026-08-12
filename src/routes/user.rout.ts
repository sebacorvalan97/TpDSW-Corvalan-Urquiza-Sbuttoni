import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';

export const userRouter = Router();

userRouter.get('/', userController.getAllUsers);
userRouter.post('/', userController.createUser);
userRouter.put('/:id', userController.updateUser);
userRouter.delete('/:id', userController.deleteUser);
userRouter.get('/:id', userController.getUserById);