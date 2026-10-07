/**
 * CategoryForm: formulario para CREAR o EDITAR una categoría.
 *
 * Es un componente "hijo": no habla con el backend. Recibe datos por PROPS (entradas)
 * y avisa al padre mediante funciones (salidas). Esto cumple con "Input property" y
 * "Output property" de la cátedra:
 *   - Input  (el padre → el hijo):  categoryToEdit, isSaving
 *   - Output (el hijo → el padre):  onSubmit, onCancel
 */
import { useState, type ChangeEvent, type FormEvent } from 'react';
import type { CategoriaApi, CategoriaFormData } from '../types';

interface Props {
    categoryToEdit: CategoriaApi | null;                       // null = estamos creando
    isSaving: boolean;                                         // true mientras se espera al backend
    onSubmit: (data: CategoriaFormData) => void | Promise<void>; // se ejecuta al guardar
    onCancel: () => void;                                      // se ejecuta al cancelar la edición
}

export default function CategoryForm({ categoryToEdit, isSaving, onSubmit, onCancel }: Props) {
    // Estado local: lo que la persona va escribiendo. Si editamos, arranca con los datos actuales.
    const [formData, setFormData] = useState<CategoriaFormData>({
        nombre: categoryToEdit?.nombre ?? '',
        descripcion: categoryToEdit?.descripcion ?? '',
    });

    // Evento "input": se dispara en cada tecla. Usamos el atributo `name` del campo
    // ('nombre' o 'descripcion') para actualizar solo ese dato y conservar el otro.
    const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setFormData((current) => ({ ...current, [name]: value }));
    };

    // Evento "submit": se dispara al apretar el botón de guardar.
    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();            // evita que el navegador recargue la página
        if (!formData.nombre.trim()) return; // validación rápida (el backend vuelve a validar)
        void onSubmit(formData);           // le avisamos al padre; él habla con el backend
    };

    const isEditing = categoryToEdit !== null;

    return (
        <form className="cat-form" onSubmit={handleSubmit}>
            <h3 className="cat-form__title">{isEditing ? 'Editar categoría' : 'Nueva categoría'}</h3>

            <label className="cat-field">
                <span>Nombre *</span>
                <input name="nombre" value={formData.nombre} onChange={handleChange}
                    placeholder="Ej: Postres" maxLength={50} required />
            </label>

            <label className="cat-field">
                <span>Descripción</span>
                <textarea name="descripcion" value={formData.descripcion} onChange={handleChange}
                    placeholder="Opcional" maxLength={200} rows={2} />
            </label>

            <div className="cat-form__actions">
                <button className="cat-btn cat-btn--primary" type="submit" disabled={isSaving}>
                    {isSaving ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Agregar categoría'}
                </button>
                {isEditing && (
                    <button className="cat-btn cat-btn--secondary" type="button" onClick={onCancel}>
                        Cancelar
                    </button>
                )}
            </div>
        </form>
    );
}
