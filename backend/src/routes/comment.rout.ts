import { Router } from 'express';
import { commentController } from '../controllers/comment.controller.js';
import { requireAuth, requireUser } from '../middlewares/auth.js';

export const commentRouter = Router();

commentRouter.get('/recipes/:recipeId/comments', commentController.getByRecipe);
commentRouter.post('/recipes/:recipeId/comments', requireUser, commentController.create);
commentRouter.put('/comments/:commentId', requireUser, commentController.update);
commentRouter.delete('/comments/:commentId', requireAuth, commentController.remove);
commentRouter.post('/comments/:commentId/like', requireUser, commentController.toggleLike);
