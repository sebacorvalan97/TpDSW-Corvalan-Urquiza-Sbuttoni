import { useState, useMemo, type FormEvent } from 'react';
import { recipeCatalogService } from '../services/recipe-catalog.service';
import { getErrorMessage } from '../services/http';
import type { Dificultad, Origen } from '../types';
import { getCountryFlag } from '../utils/flags';

interface Props {
  origins: Origen[];
  difficulties: Dificultad[];
  onOriginsChanged: (origins: Origen[]) => void;
  onDifficultiesChanged: (difficulties: Dificultad[]) => void;
}

export default function RecipeCatalogCrud({
  origins,
  difficulties,
  onOriginsChanged,
  onDifficultiesChanged,
}: Props) {
  // Estado para creación/edición de Origen
  const [originName, setOriginName] = useState('');
  const [originCountry, setOriginCountry] = useState('');
  const [editingOriginId, setEditingOriginId] = useState<number | null>(null);
  const [originSearch, setOriginSearch] = useState('');

  // Estado para creación/edición de Dificultad
  const [difficultyName, setDifficultyName] = useState('');
  const [editingDifficultyId, setEditingDifficultyId] = useState<number | null>(null);
  const [difficultySearch, setDifficultySearch] = useState('');

  // Mensajes de error y éxito
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const refreshOrigins = async () => {
    const list = await recipeCatalogService.getOrigins();
    onOriginsChanged(list.map((o) => ({ id: String(o.idOrigin), pais: o.pais, nombre: o.nombre, bandera: getCountryFlag(o.pais) })));
  };

  const refreshDifficulties = async () => {
    const list = await recipeCatalogService.getDifficulties();
    onDifficultiesChanged(list.map((d) => ({ id: String(d.idDifficulty), nivel: d.nivel })));
  };

  // Submit Origen (Crear o Modificar)
  const handleOriginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!originName.trim() || !originCountry.trim()) return;
    setError('');
    setSuccess('');
    try {
      if (editingOriginId === null) {
        await recipeCatalogService.createOrigin({ nombre: originName.trim(), pais: originCountry.trim() });
        setSuccess('Origen creado correctamente.');
      } else {
        await recipeCatalogService.updateOrigin(editingOriginId, { nombre: originName.trim(), pais: originCountry.trim() });
        setSuccess('Origen modificado correctamente.');
      }
      setOriginName('');
      setOriginCountry('');
      setEditingOriginId(null);
      await refreshOrigins();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleEditOrigin = (origin: Origen) => {
    setEditingOriginId(Number(origin.id));
    setOriginName(origin.nombre ?? origin.pais);
    setOriginCountry(origin.pais);
    setError('');
    setSuccess('');
  };

  const handleCancelOriginEdit = () => {
    setEditingOriginId(null);
    setOriginName('');
    setOriginCountry('');
  };

  const handleDeleteOrigin = async (origin: Origen) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar el origen "${origin.nombre || origin.pais}"?`)) return;
    setError('');
    setSuccess('');
    try {
      await recipeCatalogService.deleteOrigin(Number(origin.id));
      setSuccess('Origen eliminado correctamente.');
      if (editingOriginId === Number(origin.id)) {
        handleCancelOriginEdit();
      }
      await refreshOrigins();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  // Submit Dificultad (Crear o Modificar)
  const handleDifficultySubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!difficultyName.trim()) return;
    setError('');
    setSuccess('');
    try {
      if (editingDifficultyId === null) {
        await recipeCatalogService.createDifficulty(difficultyName.trim());
        setSuccess('Dificultad creada correctamente.');
      } else {
        await recipeCatalogService.updateDifficulty(editingDifficultyId, difficultyName.trim());
        setSuccess('Dificultad modificada correctamente.');
      }
      setDifficultyName('');
      setEditingDifficultyId(null);
      await refreshDifficulties();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleEditDifficulty = (difficulty: Dificultad) => {
    setEditingDifficultyId(Number(difficulty.id));
    setDifficultyName(difficulty.nivel);
    setError('');
    setSuccess('');
  };

  const handleCancelDifficultyEdit = () => {
    setEditingDifficultyId(null);
    setDifficultyName('');
  };

  const handleDeleteDifficulty = async (difficulty: Dificultad) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar la dificultad "${difficulty.nivel}"?`)) return;
    setError('');
    setSuccess('');
    try {
      await recipeCatalogService.deleteDifficulty(Number(difficulty.id));
      setSuccess('Dificultad eliminada correctamente.');
      if (editingDifficultyId === Number(difficulty.id)) {
        handleCancelDifficultyEdit();
      }
      await refreshDifficulties();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  // Filtrado de listas
  const filteredOrigins = useMemo(() => {
    const q = originSearch.toLowerCase().trim();
    if (!q) return origins;
    return origins.filter((o) => (o.nombre && o.nombre.toLowerCase().includes(q)) || o.pais.toLowerCase().includes(q));
  }, [origins, originSearch]);

  const filteredDifficulties = useMemo(() => {
    const q = difficultySearch.toLowerCase().trim();
    if (!q) return difficulties;
    return difficulties.filter((d) => d.nivel.toLowerCase().includes(q));
  }, [difficulties, difficultySearch]);

  return (
    <section className="space-y-6 rounded-2xl border border-[#c2c9bb]/60 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#f0eded] pb-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#154212]">Catálogo de Orígenes y Dificultades</h2>
          <p className="text-xs text-[#605e5b]">Administración de orígenes geográficos y niveles de dificultad de recetas</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">
          <span className="material-symbols-outlined text-base">error</span>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl bg-[#bcf0ae]/40 p-3 text-sm text-[#154212]" role="status">
          <span className="material-symbols-outlined text-base">check_circle</span>
          <span>{success}</span>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        {/* PANEL: CRUD DE ORÍGENES */}
        <div className="space-y-4 rounded-xl border border-[#c2c9bb]/40 bg-[#fbf9f8] p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-[#154212]">
              {editingOriginId !== null ? 'Modificar Origen' : 'Nuevo Origen'}
            </h3>
            {editingOriginId !== null && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                Editando ID #{editingOriginId}
              </span>
            )}
          </div>

          <form onSubmit={handleOriginSubmit} className="space-y-3">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <input
                aria-label="Nombre del origen"
                className="w-full rounded-xl border border-[#c2c9bb] bg-white p-2.5 text-xs text-[#1b1c1c] focus:outline-hidden focus:ring-2 focus:ring-[#154212]"
                maxLength={150}
                placeholder="Nombre o cocina (ej. Cocina Italiana)"
                required
                value={originName}
                onChange={(e) => setOriginName(e.target.value)}
              />
              <input
                aria-label="País de referencia"
                className="w-full rounded-xl border border-[#c2c9bb] bg-white p-2.5 text-xs text-[#1b1c1c] focus:outline-hidden focus:ring-2 focus:ring-[#154212]"
                maxLength={100}
                placeholder="País (ej. Italia)"
                required
                value={originCountry}
                onChange={(e) => setOriginCountry(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-[#154212] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#2d5a27]"
              >
                <span className="material-symbols-outlined text-sm">
                  {editingOriginId !== null ? 'save' : 'add'}
                </span>
                <span>{editingOriginId !== null ? 'Guardar Cambios' : 'Agregar Origen'}</span>
              </button>

              {editingOriginId !== null && (
                <button
                  type="button"
                  onClick={handleCancelOriginEdit}
                  className="rounded-xl border border-[#c2c9bb] bg-white px-3 py-2 text-xs font-semibold text-[#605e5b] hover:bg-[#f0eded]"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>

          {/* Listado con buscador */}
          <div className="pt-2">
            <div className="relative mb-2">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-[#72796e]">
                search
              </span>
              <input
                type="text"
                placeholder="Buscar origen o país..."
                value={originSearch}
                onChange={(e) => setOriginSearch(e.target.value)}
                className="w-full rounded-lg border border-[#c2c9bb]/60 bg-white py-1.5 pl-8 pr-3 text-xs"
              />
            </div>

            <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
              {filteredOrigins.length === 0 ? (
                <p className="py-4 text-center text-xs text-[#72796e]">No se encontraron orígenes.</p>
              ) : (
                filteredOrigins.map((origin) => {
                  const isCurrentEditing = editingOriginId === Number(origin.id);
                  return (
                    <div
                      key={origin.id}
                      className={`flex items-center justify-between rounded-lg border p-2.5 text-xs transition-colors ${
                        isCurrentEditing
                          ? 'border-[#154212] bg-[#bcf0ae]/20'
                          : 'border-[#c2c9bb]/40 bg-white hover:bg-[#f6f3f2]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg select-none" role="img" aria-label={origin.pais}>{origin.bandera || getCountryFlag(origin.pais)}</span>
                        <div className="flex flex-col">
                          <span className="font-semibold text-[#154212]">{origin.nombre || origin.pais}</span>
                          <span className="text-[11px] text-[#72796e]">País: {origin.pais}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEditOrigin(origin)}
                          className="rounded-md px-2 py-1 text-xs font-semibold text-[#154212] hover:bg-[#154212]/10"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeleteOrigin(origin)}
                          className="rounded-md px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                        >
                          Borrar
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* PANEL: CRUD DE DIFICULTADES */}
        <div className="space-y-4 rounded-xl border border-[#c2c9bb]/40 bg-[#fbf9f8] p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-[#154212]">
              {editingDifficultyId !== null ? 'Modificar Dificultad' : 'Nueva Dificultad'}
            </h3>
            {editingDifficultyId !== null && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                Editando ID #{editingDifficultyId}
              </span>
            )}
          </div>

          <form onSubmit={handleDifficultySubmit} className="space-y-3">
            <input
              aria-label="Nivel de dificultad"
              className="w-full rounded-xl border border-[#c2c9bb] bg-white p-2.5 text-xs text-[#1b1c1c] focus:outline-hidden focus:ring-2 focus:ring-[#154212]"
              maxLength={50}
              placeholder="Nivel (ej. Fácil, Medio, Difícil, Experto)"
              required
              value={difficultyName}
              onChange={(e) => setDifficultyName(e.target.value)}
            />

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-[#154212] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#2d5a27]"
              >
                <span className="material-symbols-outlined text-sm">
                  {editingDifficultyId !== null ? 'save' : 'add'}
                </span>
                <span>{editingDifficultyId !== null ? 'Guardar Cambios' : 'Agregar Dificultad'}</span>
              </button>

              {editingDifficultyId !== null && (
                <button
                  type="button"
                  onClick={handleCancelDifficultyEdit}
                  className="rounded-xl border border-[#c2c9bb] bg-white px-3 py-2 text-xs font-semibold text-[#605e5b] hover:bg-[#f0eded]"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>

          {/* Listado con buscador */}
          <div className="pt-2">
            <div className="relative mb-2">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-[#72796e]">
                search
              </span>
              <input
                type="text"
                placeholder="Buscar nivel..."
                value={difficultySearch}
                onChange={(e) => setDifficultySearch(e.target.value)}
                className="w-full rounded-lg border border-[#c2c9bb]/60 bg-white py-1.5 pl-8 pr-3 text-xs"
              />
            </div>

            <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
              {filteredDifficulties.length === 0 ? (
                <p className="py-4 text-center text-xs text-[#72796e]">No se encontraron dificultades.</p>
              ) : (
                filteredDifficulties.map((difficulty) => {
                  const isCurrentEditing = editingDifficultyId === Number(difficulty.id);
                  return (
                    <div
                      key={difficulty.id}
                      className={`flex items-center justify-between rounded-lg border p-2.5 text-xs transition-colors ${
                        isCurrentEditing
                          ? 'border-[#154212] bg-[#bcf0ae]/20'
                          : 'border-[#c2c9bb]/40 bg-white hover:bg-[#f6f3f2]'
                      }`}
                    >
                      <span className="font-semibold text-[#154212]">{difficulty.nivel}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEditDifficulty(difficulty)}
                          className="rounded-md px-2 py-1 text-xs font-semibold text-[#154212] hover:bg-[#154212]/10"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeleteDifficulty(difficulty)}
                          className="rounded-md px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                        >
                          Borrar
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
