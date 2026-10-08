/**
 * IngredientForm: formulario para CREAR o EDITAR un ingrediente.
 *
 * Es un componente "hijo": no habla con el backend. Recibe datos por PROPS (entradas)
 * y avisa al padre mediante funciones (salidas). Esto cumple con "Input property" y
 * "Output property" de la cátedra:
 *   - Input  (el padre → el hijo):  ingredientToEdit, isSaving
 *   - Output (el hijo → el padre):  onSubmit, onCancel
 */
import { useState, type ChangeEvent, type FormEvent } from 'react';
import type { IngredienteApi, IngredienteFormData } from '../types';
import { UNIDADES_MEDIDA } from '../constants/unidades';

interface Props {
    ingredientToEdit: IngredienteApi | null;                      // null = estamos creando
    isSaving: boolean;                                            // true mientras se espera al backend
    onSubmit: (data: IngredienteFormData) => void | Promise<void>; // se ejecuta al guardar
    onCancel: () => void;                                         // se ejecuta al cancelar la edición
}

export default function IngredientForm({ ingredientToEdit, isSaving, onSubmit, onCancel }: Props) {
    // Estado local: lo que la persona va escribiendo. Si editamos, arranca con los datos actuales;
    // si creamos, arranca vacío y con la unidad 'unidad' preseleccionada.
    const [formData, setFormData] = useState<IngredienteFormData>({
        nombre: ingredientToEdit?.nombre ?? '',
        descripcion: ingredientToEdit?.descripcion ?? '',
        unidadMedidaDefecto: ingredientToEdit?.unidadMedidaDefecto ?? 'unidad',
    });

    // Evento "change": se dispara en cada tecla (o al elegir otra opción del select).
    // Usamos el atributo `name` del campo ('nombre', 'descripcion' o 'unidadMedidaDefecto')
    // para actualizar solo ese dato y conservar los demás.
    const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        setFormData((current) => ({ ...current, [name]: value }));
    };

    // Evento "submit": se dispara al apretar el botón de guardar.
    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();              // evita que el navegador recargue la página
        if (!formData.nombre.trim()) return;  // validación rápida (el backend vuelve a validar)
        void onSubmit(formData);             // le avisamos al padre; él habla con el backend
    };

    const isEditing = ingredientToEdit !== null;

    return (
        <form className="ing-form" onSubmit={handleSubmit}>
            <h3 className="ing-form__title">{isEditing ? 'Editar ingrediente' : 'Nuevo ingrediente'}</h3>

            <label className="ing-field">
                <span>Nombre *</span>
                <input name="nombre" value={formData.nombre} onChange={handleChange}
                    placeholder="Ej: Harina 000" maxLength={60} required />
            </label>

            <label className="ing-field">
                <span>Unidad de medida habitual *</span>
                {/* Un <select> evita errores de tipeo: solo se puede elegir una unidad válida */}
                <select name="unidadMedidaDefecto" value={formData.unidadMedidaDefecto} onChange={handleChange}>
                    {UNIDADES_MEDIDA.map((unidad) => (
                        <option key={unidad.value} value={unidad.value}>{unidad.label}</option>
                    ))}
                </select>
            </label>

            <label className="ing-field">
                <span>Descripción</span>
                <textarea name="descripcion" value={formData.descripcion} onChange={handleChange}
                    placeholder="Opcional" maxLength={200} rows={2} />
            </label>

            <div className="ing-form__actions">
                <button className="ing-btn ing-btn--primary" type="submit" disabled={isSaving}>
                    {isSaving ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Agregar ingrediente'}
                </button>
                {isEditing && (
                    <button className="ing-btn ing-btn--secondary" type="button" onClick={onCancel}>
                        Cancelar
                    </button>
                )}
            </div>
        </form>
    );
}
