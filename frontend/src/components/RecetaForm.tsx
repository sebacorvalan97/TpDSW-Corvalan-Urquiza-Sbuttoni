import { useState, useEffect } from 'react';
import { type Receta } from '../services/receta.service';

interface RecetaFormProps {
  recetaEditando: Receta | null;
  onSubmit: (
    nombre: string,
    descripcion: string,
    tiempoMinutos: number,
  ) => void;
  onCancel: () => void;
}

export function RecetaForm({
  recetaEditando,
  onSubmit,
  onCancel,
}: RecetaFormProps) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tiempoMinutos, setTiempoMinutos] = useState(0);

  useEffect(() => {
    if (recetaEditando) {
      setNombre(recetaEditando.nombre);
      setDescripcion(recetaEditando.descripcion || '');
      setTiempoMinutos(recetaEditando.tiempoMinutos || 0);
    } else {
      setNombre('');
      setDescripcion('');
      setTiempoMinutos(0);
    }
  }, [recetaEditando]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(nombre, descripcion, tiempoMinutos);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 bg-gray-50 rounded-xl border"
    >
      <h2 className="font-bold text-lg text-gray-700">
        {recetaEditando ? 'Editar Receta' : 'Nueva Receta'}
      </h2>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Nombre
        </label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Descripción
        </label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Tiempo (minutos)
        </label>
        <input
          type="number"
          value={tiempoMinutos}
          onChange={(e) => setTiempoMinutos(Number(e.target.value))}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold"
        >
          {recetaEditando ? 'Actualizar' : 'Guardar'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-400 text-white px-4 py-2 rounded-lg"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
