import { useState, useEffect } from 'react';
import {
  pasoRecetaService,
  type PasoReceta,
} from '../services/paso-receta.service';
import { PasoRecetaForm } from './PasoRecetaForm';
import { PasoRecetaList } from './PasoRecetaList';

export default function PasoRecetaCrud() {
  const [pasos, setPasos] = useState<PasoReceta[]>([]);
  const [pasoEditando, setPasoEditando] = useState<PasoReceta | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);

  useEffect(() => {
    cargarPasos();
  }, []);

  const cargarPasos = async () => {
    try {
      const datos = await pasoRecetaService.getAllPasos();
      setPasos(datos);
    } catch (error) {
      console.error('Error cargando pasos de receta:', error);
    }
  };

  const handleCreateOrUpdate = async (
    recetaId: number,
    numeroOrden: number,
    descripcion: string,
  ) => {
    try {
      if (pasoEditando) {
        await pasoRecetaService.updatePaso(pasoEditando.idPaso, {
          recetaId,
          numeroOrden,
          descripcion,
        });
      } else {
        await pasoRecetaService.createPaso(recetaId, numeroOrden, descripcion);
      }
      await cargarPasos();
      setPasoEditando(null);
      setMostrarForm(false);
    } catch (error) {
      console.error('Error guardando paso:', error);
    }
  };

  const handleEdit = (paso: PasoReceta) => {
    setPasoEditando(paso);
    setMostrarForm(true);
  };

  const handleDelete = async (idPaso: number) => {
    try {
      await pasoRecetaService.deletePaso(idPaso);
      await cargarPasos();
    } catch (error) {
      console.error('Error eliminando paso:', error);
    }
  };

  const handleCancel = () => {
    setPasoEditando(null);
    setMostrarForm(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Gestión de Pasos de Receta</h1>
      {mostrarForm ? (
        <PasoRecetaForm
          pasoEditando={pasoEditando}
          onSubmit={handleCreateOrUpdate}
          onCancel={handleCancel}
        />
      ) : (
        <button onClick={() => setMostrarForm(true)}>+ Crear Paso</button>
      )}

      <PasoRecetaList
        pasos={pasos}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
