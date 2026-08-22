import type { Categoria, Comentario, Dificultad, Ingrediente, Origen, Receta, Usuario } from '../types';

export const INITIAL_CATEGORIAS: Categoria[] = [{ id: 'cat-pastas', nombre: 'Pastas' }, { id: 'cat-saludable', nombre: 'Saludable' }, { id: 'cat-postres', nombre: 'Postres' }];
export const INITIAL_ORIGENES: Origen[] = [{ id: 'orig-italia', pais: 'Italia', bandera: 'IT' }, { id: 'orig-mexico', pais: 'México', bandera: 'MX' }];
export const INITIAL_DIFICULTADES: Dificultad[] = [{ id: 'easy', nivel: 'Fácil' }, { id: 'medium', nivel: 'Intermedia' }];
export const INITIAL_INGREDIENTES: Ingrediente[] = [{ id: 'ing-tomate', nombre: 'Tomate', unidadMedidaDefecto: 'unidad', sustitutos: [] }];
export const INITIAL_USUARIOS: [Usuario, ...Usuario[]] = [{ id: 'usr-1', nombre: 'Visitante', avatar: 'https://i.pravatar.cc/100?img=12' }];
export const INITIAL_COMENTARIOS: Comentario[] = [];
export const INITIAL_RECETAS: Receta[] = [{ id: 'rec-1', platoId: 'plt-1', plato: { id: 'plt-1', nombre: 'Pasta casera', descripcion: 'Una receta simple y sabrosa.', imagenUrl: '', categoriaId: 'cat-pastas', origenId: 'orig-italia', dificultadId: 'easy' }, tiempoPreparacionMin: 15, tiempoCoccionMin: 20, porcionesBase: 4, ingredientes: INITIAL_INGREDIENTES, pasos: ['Cocinar y servir.'], calificacionPromedio: 5, totalCalificaciones: 1, creadorUsuarioId: 'usr-1', creadorNombre: 'Visitante', esFavorito: false }];
