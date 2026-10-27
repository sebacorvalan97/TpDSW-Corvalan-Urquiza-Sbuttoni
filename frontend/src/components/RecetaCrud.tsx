import { useState, useEffect } from 'react';
import { recetaService, type Receta } from '../services/receta.service';
import { RecetaForm } from './RecetaForm';
import { RecetaList } from './RecetaList';

export default function RecetaCrud() {
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [recetaEditando, setRecetaEditando] = useState<Receta | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);

  useEffect(() => {
    cargarRecetas();
  }, []);

  const cargarRecetas = async () => {
    try {
      const datos = await recetaService.getAllRecetas();
      setRecetas(datos);
    } catch (error) {
      console.error('Error cargando recetas:', error);
    }
  };

  const handleCreateOrUpdate = async (
    nombre: string,
    descripcion: string,
    tiempoMinutos: number,
  ) => {
    try {
      if (recetaEditando) {
        await recetaService.updateReceta(recetaEditando.idReceta, {
          nombre,
          descripcion,
          tiempoMinutos,
        });
      } else {
        await recetaService.createReceta(nombre, descripcion, tiempoMinutos);
      }
      await cargarRecetas();
      setRecetaEditando(null);
      setMostrarForm(false);
    } catch (error) {
      console.error('Error guardando receta:', error);
    }
  };

  const handleEdit = (receta: Receta) => {
    setRecetaEditando(receta);
    setMostrarForm(true);
  };

  const handleDelete = async (idReceta: number) => {
    try {
      await recetaService.deleteReceta(idReceta);
      await cargarRecetas();
    } catch (error) {
      console.error('Error eliminando receta:', error);
    }
  };

  const handleCancel = () => {
    setRecetaEditando(null);
    setMostrarForm(false);
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-2xl border border-[#c2c9bb]/60 shadow-sm mt-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#154212]">
          Gestión de Recetas
        </h1>
        {!mostrarForm && (
          <button
            onClick={() => setMostrarForm(true)}
            className="bg-[#154212] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#2d5a27] transition-colors"
          >
            + Crear Receta
          </button>
        )}
      </div>

      {mostrarForm && (
        <RecetaForm
          recetaEditando={recetaEditando}
          onSubmit={handleCreateOrUpdate}
          onCancel={handleCancel}
        />
      )}

      <RecetaList
        recetas={recetas}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
