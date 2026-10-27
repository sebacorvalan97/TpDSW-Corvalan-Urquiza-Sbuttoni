/**
 * CategoryCrud: componente "contenedor" del CRUD de Categorías.
 *
 * Es el cerebro: guarda el ESTADO (lista, categoría en edición, errores...) y coordina
 * al formulario (CategoryForm), a la lista (CategoryList) y al servicio (category.service).
 *
 *   C (Create)  → handleSubmit sin categoría en edición  → POST
 *   R (Read)    → useEffect al montar + filtro de búsqueda → GET
 *   U (Update)  → handleSubmit con categoría en edición  → PUT
 *   D (Delete)  → handleDelete                           → DELETE
 */
import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import type { CategoriaApi, CategoriaFormData } from '../types';
import { categoryService } from '../services/category.service';
import { getErrorMessage } from '../services/http';
import CategoryForm from './CategoryForm';
import CategoryList from './CategoryList';
import './CategoryCrud.css';

export default function CategoryCrud({ onChanged }: { onChanged?: (categories: CategoriaApi[]) => void }) {
    // ---- ESTADO: cuando cambia, React vuelve a dibujar el componente (reactividad) ----
    const [categories, setCategories] = useState<CategoriaApi[]>([]);
    const [editing, setEditing] = useState<CategoriaApi | null>(null); // null = modo "crear"
    const [filter, setFilter] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // Truco: al cambiar la `key` de CategoryForm, React lo vuelve a crear vacío (ver más abajo).
    const [formVersion, setFormVersion] = useState(0);

    // READ: se ejecuta UNA vez, cuando el componente aparece en pantalla (por eso el [] final).
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const loaded = await categoryService.getAll();
                setCategories(loaded);
                onChanged?.(loaded);
            } catch (err) {
                setError(getErrorMessage(err));
            } finally {
                setIsLoading(false);   // pase lo que pase, dejamos de mostrar "Cargando…"
            }
        };
        void loadCategories();
    }, []);

    // Lista filtrada por el texto de búsqueda. useMemo evita recalcular si nada cambió.
    const visibleCategories = useMemo(() => {
        const text = filter.trim().toLowerCase();
        return categories.filter((c) => c.nombre.toLowerCase().includes(text));
    }, [categories, filter]);

    // CREATE y UPDATE: el formulario llama a esta función al guardar.
    const handleSubmit = async (data: CategoriaFormData) => {
        setIsSaving(true);
        setError(null);
        try {
            if (editing === null) {
                const created = await categoryService.create(data);
                const next = [...categories, created];
                setCategories(next);
                onChanged?.(next);
            } else {
                const updated = await categoryService.update(editing.idCategory, data);
                const next = categories.map((c) => (c.idCategory === updated.idCategory ? updated : c));
                setCategories(next);
                onChanged?.(next);
            }
            setEditing(null);
            setFormVersion((v) => v + 1);   // limpia el formulario
        } catch (err) {
            setError(getErrorMessage(err)); // ej: "Ya existe una categoría con ese nombre"
        } finally {
            setIsSaving(false);
        }
    };

    // DELETE: pide confirmación antes de borrar.
    const handleDelete = async (category: CategoriaApi) => {
        if (!window.confirm(`¿Eliminar la categoría "${category.nombre}"?`)) return;
        setError(null);
        try {
            await categoryService.remove(category.idCategory);
            const next = categories.filter((c) => c.idCategory !== category.idCategory);
            setCategories(next);
            onChanged?.(next);
            if (editing?.idCategory === category.idCategory) {   // si justo la estábamos editando
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
        <section className="cat-crud">
            <h2 className="cat-crud__title">Gestión de Categorías</h2>

            {/* `key` hace que React cree un formulario nuevo al cambiar de categoría en edición */}
            <CategoryForm
                key={editing ? `edit-${editing.idCategory}` : `new-${formVersion}`}
                categoryToEdit={editing}
                isSaving={isSaving}
                onSubmit={handleSubmit}
                onCancel={handleCancelEdit}
            />

            {/* Mensaje de error amigable. role="alert" lo anuncia a lectores de pantalla. */}
            {error && <p className="cat-error" role="alert">{error}</p>}

            <input className="cat-search" type="search" placeholder="Buscar categoría…"
                value={filter} onChange={(e: ChangeEvent<HTMLInputElement>) => setFilter(e.target.value)} aria-label="Buscar categoría" />

            {isLoading ? (
                <p className="cat-empty">Cargando categorías…</p>
            ) : categories.length === 0 ? (
                <p className="cat-empty">Todavía no hay categorías. ¡Creá la primera!</p>
            ) : visibleCategories.length === 0 ? (
                <p className="cat-empty">No hay categorías que coincidan con la búsqueda.</p>
            ) : (
                <CategoryList categories={visibleCategories} onEdit={setEditing} onDelete={handleDelete} />
            )}
        </section>
    );
}
