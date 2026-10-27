/**
 * SubstituteIngredientCrud: componente "contenedor" del CRUD de Ingredientes Sustitutos.
 *
 * Coordina el flujo completo:
 * 1. Carga el catálogo de ingredientes principales mediante `ingredientService.getAll()`.
 * 2. Permite a la persona usuaria seleccionar un ingrediente principal de un selector.
 * 3. Al seleccionar un ingrediente, gestiona el estado y ciclo de vida de sus sustitutos:
 *    - C (Create) → handleSubmit en modo nuevo → POST /api/ingredients/:id/substitutes
 *    - R (Read)   → carga al seleccionar ingrediente + filtro en memoria → GET /api/ingredients/:id/substitutes
 *    - U (Update) → handleSubmit en modo edición → PUT /api/ingredients/:id/substitutes/:subId
 *    - D (Delete) → handleDelete con confirmación → DELETE /api/ingredients/:id/substitutes/:subId
 */
import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import type { IngredienteApi, SustitutoApi } from '../types';
import { ingredientService } from '../services/ingredient.service';
import { substituteIngredientService } from '../services/substitute-ingredient.service';
import { getErrorMessage } from '../services/http';
import { getUnidadLabel } from '../constants/unidades';
import SubstituteIngredientForm, { type SustitutoInputData } from './SubstituteIngredientForm';
import SubstituteIngredientList from './SubstituteIngredientList';
import './SubstituteIngredientCrud.css';

export default function SubstituteIngredientCrud() {
    // ---- ESTADO DE INGREDIENTES PRINCIPALES ----
    const [ingredients, setIngredients] = useState<IngredienteApi[]>([]);
    const [selectedIngredientId, setSelectedIngredientId] = useState<number | null>(null);
    const [isLoadingIngredients, setIsLoadingIngredients] = useState(true);

    // ---- ESTADO DEL CRUD DE SUSTITUTOS ----
    const [substitutes, setSubstitutes] = useState<SustitutoApi[]>([]);
    const [editing, setEditing] = useState<SustitutoApi | null>(null); // null = modo "crear"
    const [filter, setFilter] = useState('');
    const [isLoadingSubstitutes, setIsLoadingSubstitutes] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formVersion, setFormVersion] = useState(0); // Reinicia el formulario al cambiar de versión

    // Carga inicial: obtiene todos los ingredientes disponibles para el selector.
    useEffect(() => {
        let isMounted = true;
        const loadIngredients = async () => {
            try {
                const data = await ingredientService.getAll();
                if (isMounted) {
                    setIngredients(data);
                }
            } catch (err) {
                if (isMounted) {
                    setError(getErrorMessage(err));
                }
            } finally {
                if (isMounted) {
                    setIsLoadingIngredients(false);
                }
            }
        };
        void loadIngredients();

        return () => {
            isMounted = false;
        };
    }, []);

    // Carga los sustitutos correspondientes al ingrediente seleccionado.
    useEffect(() => {
        if (selectedIngredientId === null) return;

        let isCancelled = false;
        const loadSubstitutes = async () => {
            setIsLoadingSubstitutes(true);
            setError(null);
            try {
                const data = await substituteIngredientService.getAll(selectedIngredientId);
                if (!isCancelled) {
                    setSubstitutes(data);
                }
            } catch (err) {
                if (!isCancelled) {
                    setError(getErrorMessage(err));
                }
            } finally {
                if (!isCancelled) {
                    setIsLoadingSubstitutes(false);
                }
            }
        };
        void loadSubstitutes();

        return () => {
            isCancelled = true;
        };
    }, [selectedIngredientId]);

    // Ingrediente principal actualmente seleccionado.
    const selectedIngredient = useMemo(
        () => ingredients.find((i) => i.idIngredient === selectedIngredientId) ?? null,
        [ingredients, selectedIngredientId]
    );

    // Filtro en memoria por nombre del sustituto o proporción.
    const visibleSubstitutes = useMemo(() => {
        const text = filter.trim().toLowerCase();
        if (!text) return substitutes;
        return substitutes.filter(
            (s) =>
                s.nombreSustituto.toLowerCase().includes(text) ||
                s.proporcion.toLowerCase().includes(text) ||
                s.notas.toLowerCase().includes(text)
        );
    }, [substitutes, filter]);

    // Cambio en el selector de ingrediente principal.
    const handleIngredientChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        const nextId = value ? Number(value) : null;
        setSelectedIngredientId(nextId);
        setEditing(null);
        setError(null);
        setFilter('');
        if (nextId === null) {
            setSubstitutes([]);
            setIsLoadingSubstitutes(false);
        }
    };

    // CREATE y UPDATE: guardado de un sustituto.
    const handleSubmit = async (data: SustitutoInputData) => {
        if (selectedIngredientId === null) return;
        setIsSaving(true);
        setError(null);
        try {
            if (editing === null) {
                const created = await substituteIngredientService.create(selectedIngredientId, data);
                setSubstitutes((current) => [...current, created]);
            } else {
                const updated = await substituteIngredientService.update(
                    selectedIngredientId,
                    editing.idSubstituteIngredient,
                    data
                );
                setSubstitutes((current) =>
                    current.map((s) => (s.idSubstituteIngredient === updated.idSubstituteIngredient ? updated : s))
                );
            }
            setEditing(null);
            setFormVersion((v) => v + 1);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsSaving(false);
        }
    };

    // DELETE: elimina un sustituto con previa confirmación del usuario.
    const handleDelete = async (sub: SustitutoApi) => {
        if (selectedIngredientId === null) return;
        if (!window.confirm(`¿Eliminar el sustituto "${sub.nombreSustituto}"?`)) return;
        setError(null);
        try {
            await substituteIngredientService.remove(selectedIngredientId, sub.idSubstituteIngredient);
            setSubstitutes((current) =>
                current.filter((s) => s.idSubstituteIngredient !== sub.idSubstituteIngredient)
            );
            if (editing?.idSubstituteIngredient === sub.idSubstituteIngredient) {
                setEditing(null);
                setFormVersion((v) => v + 1);
            }
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    const handleCancelEdit = () => {
        setEditing(null);
        setFormVersion((v) => v + 1);
    };

    return (
        <section className="sub-crud">
            <h2 className="sub-crud__title">Gestión de Ingredientes Sustitutos</h2>

            {/* Selector de ingrediente principal */}
            <div className="sub-selector">
                <label className="sub-field">
                    <span className="font-semibold text-[#154212]">Seleccionar Ingrediente Principal *</span>
                    <select
                        value={selectedIngredientId ?? ''}
                        onChange={handleIngredientChange}
                        disabled={isLoadingIngredients}
                    >
                        <option value="">
                            {isLoadingIngredients
                                ? 'Cargando catálogo de ingredientes…'
                                : '-- Elegí un ingrediente para gestionar sus sustitutos --'}
                        </option>
                        {ingredients.map((ing) => (
                            <option key={ing.idIngredient} value={ing.idIngredient}>
                                {ing.nombre} ({getUnidadLabel(ing.unidadMedidaDefecto)})
                            </option>
                        ))}
                    </select>
                </label>

                {selectedIngredient && (
                    <div className="sub-selector__info">
                        <span>Ingrediente seleccionado:</span>
                        <span className="sub-selector__badge">{selectedIngredient.nombre}</span>
                        <span className="text-xs text-[#5b6257]">
                            • Unidad habitual: {getUnidadLabel(selectedIngredient.unidadMedidaDefecto)}
                        </span>
                    </div>
                )}
            </div>

            {/* Mensaje de error general si ocurre alguna falla en la API */}
            {error && <p className="sub-error" role="alert">{error}</p>}

            {/* Si no hay ingrediente seleccionado, se muestra un aviso indicándolo */}
            {selectedIngredientId === null ? (
                <p className="sub-empty">
                    Seleccioná un ingrediente principal en el menú superior para ver y administrar sus sustitutos.
                </p>
            ) : (
                <>
                    {/* Formulario de creación / edición */}
                    <SubstituteIngredientForm
                        key={editing ? `edit-${editing.idSubstituteIngredient}` : `new-${formVersion}`}
                        substituteToEdit={editing}
                        isSaving={isSaving}
                        onSubmit={handleSubmit}
                        onCancel={handleCancelEdit}
                    />

                    {/* Buscador de sustitutos */}
                    <input
                        className="sub-search"
                        type="search"
                        placeholder="Buscar sustituto por nombre, proporción o nota…"
                        value={filter}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setFilter(e.target.value)}
                        aria-label="Buscar sustituto"
                    />

                    {/* Estados de carga y listado de sustitutos */}
                    {isLoadingSubstitutes ? (
                        <p className="sub-empty">Cargando sustitutos…</p>
                    ) : substitutes.length === 0 ? (
                        <p className="sub-empty">
                            No hay sustitutos registrados para {selectedIngredient?.nombre}. ¡Agregá el primero arriba!
                        </p>
                    ) : visibleSubstitutes.length === 0 ? (
                        <p className="sub-empty">No hay sustitutos que coincidan con la búsqueda.</p>
                    ) : (
                        <SubstituteIngredientList
                            substitutes={visibleSubstitutes}
                            onEdit={setEditing}
                            onDelete={handleDelete}
                        />
                    )}
                </>
            )}
        </section>
    );
}
