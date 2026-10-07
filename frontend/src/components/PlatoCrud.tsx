import { useState, useEffect } from 'react';
import { platoService } from '../services/plato.service';
import { PlatoForm } from './PlatoForm';
import { PlatoList } from './PlatoList';

export interface Plato {
  idDish: number;
  name: string;
  description: string;
}

export function PlatoCrud() {
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
    <div style={{ padding: '20px' }}>
      <h1>Gestión de Platos</h1>
      {mostrarForm ? (
        <PlatoForm
          platoEditando={platoEditando}
          onSubmit={handleCreateOrUpdate}
          onCancel={handleCancel}
        />
      ) : (
        <button onClick={() => setMostrarForm(true)}>+ Crear Plato</button>
      )}

      <PlatoList platos={platos} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}
