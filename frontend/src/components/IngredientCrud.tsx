/**
 * IngredientCrud: componente "contenedor" del CRUD de Ingredientes.
 *
 * Es el cerebro: guarda el ESTADO (lista, ingrediente en edición, errores...) y coordina
 * al formulario (IngredientForm), a la lista (IngredientList) y al servicio (ingredient.service).
 *
 *   C (Create)  → handleSubmit sin ingrediente en edición  → POST
 *   R (Read)    → useEffect al montar + filtro de búsqueda  → GET
 *   U (Update)  → handleSubmit con ingrediente en edición  → PUT
 *   D (Delete)  → handleDelete                             → DELETE
 */
import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import type { IngredienteApi, IngredienteFormData } from '../types';
import { ingredientService } from '../services/ingredient.service';
import { getErrorMessage } from '../services/http';
import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import './IngredientCrud.css';

export default function IngredientCrud() {
    // ---- ESTADO: cuando cambia, React vuelve a dibujar el componente (reactividad) ----
    const [ingredients, setIngredients] = useState<IngredienteApi[]>([]);
    const [editing, setEditing] = useState<IngredienteApi | null>(null); // null = modo "crear"
    const [filter, setFilter] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // Truco: al cambiar la `key` de IngredientForm, React lo vuelve a crear vacío (ver más abajo).
    const [formVersion, setFormVersion] = useState(0);

    // READ: se ejecuta UNA vez, cuando el componente aparece en pantalla (por eso el [] final).
    useEffect(() => {
        const loadIngredients = async () => {
            try {
                setIngredients(await ingredientService.getAll());
            } catch (err) {
                setError(getErrorMessage(err));
            } finally {
                setIsLoading(false);   // pase lo que pase, dejamos de mostrar "Cargando…"
            }
        };
        void loadIngredients();
    }, []);

    // Lista filtrada por el texto de búsqueda. useMemo evita recalcular si nada cambió.
    const visibleIngredients = useMemo(() => {
        const text = filter.trim().toLowerCase();
        return ingredients.filter((i) => i.nombre.toLowerCase().includes(text));
    }, [ingredients, filter]);

    // CREATE y UPDATE: el formulario llama a esta función al guardar.
    const handleSubmit = async (data: IngredienteFormData) => {
        setIsSaving(true);
        setError(null);
        try {
            if (editing === null) {
                const created = await ingredientService.create(data);
                setIngredients((current) => [...current, created]);           // agregamos al final
            } else {
                const updated = await ingredientService.update(editing.idIngredient, data);
                setIngredients((current) =>                                   // reemplazamos el editado
                    current.map((i) => (i.idIngredient === updated.idIngredient ? updated : i)));
            }
            setEditing(null);
            setFormVersion((v) => v + 1);   // limpia el formulario
        } catch (err) {
            setError(getErrorMessage(err)); // ej: "Ya existe un ingrediente con ese nombre"
        } finally {
            setIsSaving(false);
        }
    };

    // DELETE: pide confirmación antes de borrar.
    const handleDelete = async (ingredient: IngredienteApi) => {
        if (!window.confirm(`¿Eliminar el ingrediente "${ingredient.nombre}"?`)) return;
        setError(null);
        try {
            await ingredientService.remove(ingredient.idIngredient);
            setIngredients((current) => current.filter((i) => i.idIngredient !== ingredient.idIngredient));
            if (editing?.idIngredient === ingredient.idIngredient) {   // si justo lo estábamos editando
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
        <section className="ing-crud">
            <h2 className="ing-crud__title">Gestión de Ingredientes</h2>

            {/* `key` hace que React cree un formulario nuevo al cambiar de ingrediente en edición */}
            <IngredientForm
                key={editing ? `edit-${editing.idIngredient}` : `new-${formVersion}`}
                ingredientToEdit={editing}
                isSaving={isSaving}
                onSubmit={handleSubmit}
                onCancel={handleCancelEdit}
            />

            {/* Mensaje de error amigable. role="alert" lo anuncia a lectores de pantalla. */}
            {error && <p className="ing-error" role="alert">{error}</p>}

            <input className="ing-search" type="search" placeholder="Buscar ingrediente…"
                value={filter} onChange={(e: ChangeEvent<HTMLInputElement>) => setFilter(e.target.value)}
                aria-label="Buscar ingrediente" />

            {isLoading ? (
                <p className="ing-empty">Cargando ingredientes…</p>
            ) : ingredients.length === 0 ? (
                <p className="ing-empty">Todavía no hay ingredientes. ¡Creá el primero!</p>
            ) : visibleIngredients.length === 0 ? (
                <p className="ing-empty">No hay ingredientes que coincidan con la búsqueda.</p>
            ) : (
                <IngredientList ingredients={visibleIngredients} onEdit={setEditing} onDelete={handleDelete} />
            )}
        </section>
    );
}
