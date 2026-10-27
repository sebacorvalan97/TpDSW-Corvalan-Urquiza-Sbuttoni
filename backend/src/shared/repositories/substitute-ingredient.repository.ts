/**
 * CAPA DE DATOS (Repository) de Ingredientes Sustitutos.
 * Conectado a MySQL a través de Prisma ORM.
 */
import { prisma } from '../prisma.js';

export interface SubstituteIngredient {
    idSubstituteIngredient: number;
    ingredientePrincipalId: number;
    nombreSustituto: string;
    proporcion: string;
    notas: string;
}

export type SubstituteIngredientInput = Omit<SubstituteIngredient, 'idSubstituteIngredient'>;

export const substituteIngredientRepository = {
    // READ (todos los sustitutos correspondientes a un ingrediente principal)
    getAllByIngredientId: async (ingredientePrincipalId: number): Promise<SubstituteIngredient[]> => {
        const records = await prisma.ingredienteSustituto.findMany({
            where: { idIngrediente: ingredientePrincipalId },
            include: { sustituto: true },
            orderBy: { idSustituto: 'asc' },
        });

        return records.map((r) => ({
            idSubstituteIngredient: r.idSustituto,
            ingredientePrincipalId: r.idIngrediente,
            nombreSustituto: r.sustituto.nombreIngrediente,
            proporcion: r.proporcionConversion,
            notas: r.notas,
        }));
    },

    // READ (uno por id de sustituto e id de ingrediente principal)
    getSubstituteById: async (idSubstituteIngredient: number, ingredientePrincipalId?: number): Promise<SubstituteIngredient | null> => {
        const whereClause = ingredientePrincipalId !== undefined
            ? { idSustituto_idIngrediente: { idSustituto: idSubstituteIngredient, idIngrediente: ingredientePrincipalId } }
            : undefined;

        if (whereClause) {
            const record = await prisma.ingredienteSustituto.findUnique({
                where: whereClause,
                include: { sustituto: true },
            });
            if (!record) return null;
            return {
                idSubstituteIngredient: record.idSustituto,
                ingredientePrincipalId: record.idIngrediente,
                nombreSustituto: record.sustituto.nombreIngrediente,
                proporcion: record.proporcionConversion,
                notas: record.notas,
            };
        }

        const record = await prisma.ingredienteSustituto.findFirst({
            where: { idSustituto: idSubstituteIngredient },
            include: { sustituto: true },
        });

        if (!record) return null;
        return {
            idSubstituteIngredient: record.idSustituto,
            ingredientePrincipalId: record.idIngrediente,
            nombreSustituto: record.sustituto.nombreIngrediente,
            proporcion: record.proporcionConversion,
            notas: record.notas,
        };
    },

    // Búsqueda por nombre exacto dentro del mismo ingrediente principal
    getSubstituteByNameAndIngredientId: async (ingredientePrincipalId: number, nombreSustituto: string): Promise<SubstituteIngredient | null> => {
        const record = await prisma.ingredienteSustituto.findFirst({
            where: {
                idIngrediente: ingredientePrincipalId,
                sustituto: {
                    nombreIngrediente: nombreSustituto,
                },
            },
            include: { sustituto: true },
        });

        if (!record) return null;
        return {
            idSubstituteIngredient: record.idSustituto,
            ingredientePrincipalId: record.idIngrediente,
            nombreSustituto: record.sustituto.nombreIngrediente,
            proporcion: record.proporcionConversion,
            notas: record.notas,
        };
    },

    // CREATE
    createSubstitute: async (data: SubstituteIngredientInput): Promise<SubstituteIngredient> => {
        // Aseguramos que el ingrediente sustituto exista en la tabla ingrediente
        let substituteIng = await prisma.ingrediente.findUnique({
            where: { nombreIngrediente: data.nombreSustituto },
        });

        if (!substituteIng) {
            substituteIng = await prisma.ingrediente.create({
                data: {
                    nombreIngrediente: data.nombreSustituto,
                    descripcion: '',
                    unidadMedidaDefecto: 'unidad',
                },
            });
        }

        const created = await prisma.ingredienteSustituto.create({
            data: {
                idIngrediente: data.ingredientePrincipalId,
                idSustituto: substituteIng.idIngrediente,
                proporcionConversion: data.proporcion,
                notas: data.notas ?? '',
            },
            include: { sustituto: true },
        });

        return {
            idSubstituteIngredient: created.idSustituto,
            ingredientePrincipalId: created.idIngrediente,
            nombreSustituto: created.sustituto.nombreIngrediente,
            proporcion: created.proporcionConversion,
            notas: created.notas,
        };
    },

    // UPDATE
    updateSubstitute: async (idSubstituteIngredient: number, data: SubstituteIngredientInput): Promise<SubstituteIngredient | null> => {
        const updated = await prisma.ingredienteSustituto.update({
            where: {
                idSustituto_idIngrediente: {
                    idSustituto: idSubstituteIngredient,
                    idIngrediente: data.ingredientePrincipalId,
                },
            },
            data: {
                proporcionConversion: data.proporcion,
                notas: data.notas ?? '',
            },
            include: { sustituto: true },
        });

        return {
            idSubstituteIngredient: updated.idSustituto,
            ingredientePrincipalId: updated.idIngrediente,
            nombreSustituto: updated.sustituto.nombreIngrediente,
            proporcion: updated.proporcionConversion,
            notas: updated.notas,
        };
    },

    // DELETE
    deleteSubstitute: async (idSubstituteIngredient: number, ingredientePrincipalId: number): Promise<boolean> => {
        const deleted = await prisma.ingredienteSustituto.deleteMany({
            where: {
                idSustituto: idSubstituteIngredient,
                idIngrediente: ingredientePrincipalId,
            },
        });
        return deleted.count > 0;
    },
};
