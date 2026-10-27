import { prisma } from '../prisma.js';

export const recipeCatalogRepository = {
    getOrigins: async () => prisma.origen.findMany({
        select: {
            idOrigen: true,
            nombreOrigen: true,
            paisReferencia: true,
        },
        orderBy: { idOrigen: 'asc' },
    }),

    getOriginById: async (id: number) => prisma.origen.findUnique({
        where: { idOrigen: id },
        select: {
            idOrigen: true,
            nombreOrigen: true,
            paisReferencia: true,
        },
    }),

    getDifficulties: async () => prisma.dificultad.findMany({
        select: {
            idDificultad: true,
            nivel: true,
        },
        orderBy: { idDificultad: 'asc' },
    }),

    getDifficultyById: async (id: number) => prisma.dificultad.findUnique({
        where: { idDificultad: id },
        select: {
            idDificultad: true,
            nivel: true,
        },
    }),

    createOrigin: async (nombre: string, pais: string) => prisma.origen.create({
        data: { nombreOrigen: nombre, paisReferencia: pais },
        select: { idOrigen: true, nombreOrigen: true, paisReferencia: true },
    }),

    updateOrigin: async (id: number, nombre: string, pais: string) => prisma.origen.updateMany({
        where: { idOrigen: id },
        data: { nombreOrigen: nombre, paisReferencia: pais },
    }),

    deleteOrigin: async (id: number) => prisma.origen.deleteMany({ where: { idOrigen: id } }),

    createDifficulty: async (nivel: string) => prisma.dificultad.create({
        data: { nivel },
        select: { idDificultad: true, nivel: true },
    }),

    updateDifficulty: async (id: number, nivel: string) => prisma.dificultad.updateMany({
        where: { idDificultad: id },
        data: { nivel },
    }),

    deleteDifficulty: async (id: number) => prisma.dificultad.deleteMany({ where: { idDificultad: id } }),
};
