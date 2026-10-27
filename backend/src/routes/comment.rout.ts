import { Router } from 'express';
import { commentController } from '../controllers/comment.controller.js';
import { requireUser } from '../middleware/auth.js';

export const commentRouter = Router();

commentRouter.get('/recipes/:recipeId/comments', commentController.getByRecipe);
commentRouter.post('/recipes/:recipeId/comments', requireUser, commentController.create);
commentRouter.post('/comments/:commentId/like', requireUser, commentController.toggleLike);
