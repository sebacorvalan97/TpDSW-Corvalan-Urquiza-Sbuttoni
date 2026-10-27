/**
 * SubstituteIngredientForm: formulario para CREAR o EDITAR un ingrediente sustituto.
 *
 * Es un componente "hijo": no habla directamente con el backend. Recibe datos por PROPS (entradas)
 * y avisa al componente contenedor mediante callbacks (salidas). Cumple con el patrón
 * "Input property" y "Output property":
 *   - Input  (el padre → el hijo):  substituteToEdit, isSaving
 *   - Output (el hijo → el padre):  onSubmit, onCancel
 */
import { useState, type ChangeEvent, type FormEvent } from 'react';
import type { SustitutoApi, SustitutoFormData } from '../types';

export type SustitutoInputData = Omit<SustitutoFormData, 'ingredientePrincipalId'>;

interface Props {
    substituteToEdit: SustitutoApi | null;                         // null = modo "crear"
    isSaving: boolean;                                             // true mientras se espera la respuesta del servidor
    onSubmit: (data: SustitutoInputData) => void | Promise<void>;  // se ejecuta al guardar el formulario
    onCancel: () => void;                                          // se ejecuta al cancelar la edición
}

export default function SubstituteIngredientForm({
    substituteToEdit,
    isSaving,
    onSubmit,
    onCancel,
}: Props) {
    // Estado local: campos controlados del formulario. Si editamos, arranca con los valores existentes.
    const [formData, setFormData] = useState<SustitutoInputData>({
        nombreSustituto: substituteToEdit?.nombreSustituto ?? '',
        proporcion: substituteToEdit?.proporcion ?? '',
        notas: substituteToEdit?.notas ?? '',
    });

    // Evento "change": actualiza el campo correspondiente según su atributo `name`.
    const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setFormData((current) => ({ ...current, [name]: value }));
    };

    // Evento "submit": previene la recarga de página y valida campos obligatorios antes de notificar al padre.
    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        if (!formData.nombreSustituto.trim() || !formData.proporcion.trim()) return;
        void onSubmit(formData);
    };

    const isEditing = substituteToEdit !== null;

    return (
        <form className="sub-form" onSubmit={handleSubmit}>
            <h3 className="sub-form__title">
                {isEditing ? 'Editar ingrediente sustituto' : 'Nuevo ingrediente sustituto'}
            </h3>

            <label className="sub-field">
                <span>Nombre del sustituto *</span>
                <input
                    name="nombreSustituto"
                    value={formData.nombreSustituto}
                    onChange={handleChange}
                    placeholder="Ej: Harina de almendras"
                    maxLength={60}
                    required
                />
            </label>

            <label className="sub-field">
                <span>Proporción *</span>
                <input
                    name="proporcion"
                    value={formData.proporcion}
                    onChange={handleChange}
                    placeholder="ej: 1 taza = 1 taza"
                    maxLength={60}
                    required
                />
            </label>

            <label className="sub-field">
                <span>Notas</span>
                <textarea
                    name="notas"
                    value={formData.notas}
                    onChange={handleChange}
                    placeholder="Opcional: detalles de textura, sabor, precauciones..."
                    maxLength={200}
                    rows={2}
                />
            </label>

            <div className="sub-form__actions">
                <button className="sub-btn sub-btn--primary" type="submit" disabled={isSaving}>
                    {isSaving ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Agregar sustituto'}
                </button>
                {isEditing && (
                    <button className="sub-btn sub-btn--secondary" type="button" onClick={onCancel}>
                        Cancelar
                    </button>
                )}
            </div>
        </form>
    );
}
