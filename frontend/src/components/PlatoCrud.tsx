import { useState, useEffect } from 'react';
import { platoService } from '../services/plato.service';
import { PlatoForm } from './PlatoForm';
import { PlatoList } from './PlatoList';

export interface Plato {
  idDish: number;
  name: string;
  description: string;
}

export default function PlatoCrud() {
  const [platos, setPlatos] = useState<Plato[]>([]);
  const [platoEditando, setPlatoEditando] = useState<Plato | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);

  useEffect(() => {
    cargarPlatos();
  }, []);

  const cargarPlatos = async () => {
    try {
      const datos = await platoService.getAllPlatos();
      setPlatos(datos);
    } catch (error) {
      console.error('Error cargando platos:', error);
    }
  };

  const handleCreateOrUpdate = async (name: string, description: string) => {
    try {
      if (platoEditando) {
        await platoService.updatePlato(platoEditando.idDish, {
          name,
          description,
        });
      } else {
        await platoService.createPlato(name, description);
      }
      await cargarPlatos();
      setPlatoEditando(null);
      setMostrarForm(false);
    } catch (error) {
      console.error('Error guardando plato:', error);
    }
  };

  const handleEdit = (plato: Plato) => {
    setPlatoEditando(plato);
    setMostrarForm(true);
  };

  const handleDelete = async (idDish: number) => {
    try {
      await platoService.deletePlato(idDish);
      await cargarPlatos();
    } catch (error) {
      console.error('Error eliminando plato:', error);
    }
  };

  const handleCancel = () => {
    setPlatoEditando(null);
    setMostrarForm(false);
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-2xl border border-[#c2c9bb]/60">
      <h1 className="font-serif-display text-2xl font-bold text-[#154212]">
        Gestión de Platos
      </h1>

      {mostrarForm ? (
        <PlatoForm
          platoEditando={platoEditando}
          onSubmit={handleCreateOrUpdate}
          onCancel={handleCancel}
        />
      ) : (
        <button
          onClick={() => setMostrarForm(true)}
          className="bg-[#154212] text-white px-5 py-2.5 rounded-lg font-bold hover:bg-[#2d5a27] transition-colors"
        >
          + Crear plato
        </button>
      )}

      <PlatoList platos={platos} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}
