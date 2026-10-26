import { prisma } from '../prisma.js';
import { HttpError } from '../errors/http-error.js';

const mapComment = (comment: {
    idComentario: number;
    idCuenta: number;
    idPlato: number;
    descripcionComentario: string;
    calificacion: number;
    fechaComentario: Date;
    usuario: { nombre: string; apellido: string; cuenta: { usuario: { fotoPerfil: string | null } | null } };
    _count: { likes: number };
}, likedByUser = false) => ({
    id: comment.idComentario,
    recipeDishId: comment.idPlato,
    userId: comment.idCuenta,
    userName: [comment.usuario.nombre, comment.usuario.apellido].filter(Boolean).join(' '),
    avatar: comment.usuario.cuenta.usuario?.fotoPerfil ?? '',
    rating: comment.calificacion,
    text: comment.descripcionComentario,
    date: comment.fechaComentario.toISOString(),
    likes: comment._count.likes,
    likedByUser,
});

const commentInclude = {
    usuario: { include: { cuenta: { include: { usuario: true } } } },
    _count: { select: { likes: true } },
} as const;

export const commentRepository = {
    getByRecipe: async (recipeId: number, userId?: number) => {
        const recipe = await prisma.receta.findUnique({
            where: { idReceta: recipeId },
            select: { idPlato: true },
        });
        if (!recipe) throw new HttpError(404, 'Receta no encontrada.');
        const comments = await prisma.comentario.findMany({
            where: { idPlato: recipe.idPlato },
            include: {
                ...commentInclude,
                ...(userId === undefined ? {} : {
                    likes: { where: { idCuenta: userId }, select: { idCuenta: true } },
                }),
            },
            orderBy: { fechaComentario: 'desc' },
        });
        return comments.map((comment) => mapComment(
            comment,
            'likes' in comment ? comment.likes.length > 0 : false,
        ));
    },

    create: async (recipeId: number, userId: number, rating: number, text: string) => {
        const recipe = await prisma.receta.findUnique({
            where: { idReceta: recipeId },
            select: { idPlato: true },
        });
        if (!recipe) throw new HttpError(404, 'Receta no encontrada.');
        const comment = await prisma.comentario.create({
            data: {
                idCuenta: userId,
                idPlato: recipe.idPlato,
                calificacion: rating,
                descripcionComentario: text,
            },
            include: { ...commentInclude, likes: { select: { idCuenta: true } } },
        });
        return mapComment(comment, false);
    },

    toggleLike: async (commentId: number, userId: number) => prisma.$transaction(async (transaction) => {
        const currentComment = await transaction.comentario.findUnique({
            where: { idComentario: commentId },
            select: { idComentario: true },
        });
        if (!currentComment) throw new HttpError(404, 'Comentario no encontrado.');
        const existing = await transaction.comentarioLike.findUnique({
            where: { idCuenta_idComentario: { idCuenta: userId, idComentario: commentId } },
        });
        if (existing) {
            await transaction.comentarioLike.delete({
                where: { idCuenta_idComentario: { idCuenta: userId, idComentario: commentId } },
            });
        } else {
            await transaction.comentarioLike.create({ data: { idCuenta: userId, idComentario: commentId } });
        }
        const comment = await transaction.comentario.findUnique({
            where: { idComentario: commentId },
            include: { ...commentInclude, likes: { where: { idCuenta: userId }, select: { idCuenta: true } } },
        });
        if (!comment) throw new HttpError(404, 'Comentario no encontrado.');
        return mapComment(comment, comment.likes.length > 0);
    }),
};
