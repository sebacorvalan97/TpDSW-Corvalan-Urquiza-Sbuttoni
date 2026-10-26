import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { requireAdmin, requireUser } from '../middleware/auth.js';

export const userRouter = Router();

userRouter.post('/login', userController.login);
userRouter.post('/', userController.createUser);
userRouter.get('/me', requireUser, userController.getCurrentUser);
userRouter.post('/logout', requireUser, userController.logout);
userRouter.get('/', requireAdmin, userController.getAllUsers);
userRouter.put('/:id', requireAdmin, userController.updateUser);
userRouter.delete('/:id', requireAdmin, userController.deleteUser);
userRouter.get('/:id', requireAdmin, userController.getUserById);