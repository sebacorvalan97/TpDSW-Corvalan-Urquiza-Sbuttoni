import type { AuthSession } from './AuthPanel';

type Tab = 'recipes' | 'ranking' | 'create' | 'register' | 'auth' | 'admin' | 'substitutes' | 'favorites' | 'discover';

interface Props {
  currentTab: Tab;
  setCurrentTab: (tab: Tab) => void;
  authSession: AuthSession | null;
  onSelectTag: (tag: string) => void;
}

const tags = ['Italiana', 'Vegana', 'Rápida', 'Verano'];

export default function Sidebar({ currentTab, setCurrentTab, authSession, onSelectTag }: Props) {
  const navClass = (tab: Tab) => `flex items-center rounded-lg p-3 transition-colors ${
    currentTab === tab
      ? 'bg-primary-container font-bold text-on-primary-container'
      : 'text-on-surface-variant hover:bg-surface-container-highest'
  }`;

  return (
    <aside className="hidden h-[calc(100vh-80px)] w-64 shrink-0 sticky top-20 flex-col space-y-4 border-r border-outline-variant bg-surface-container-low px-4 py-8 lg:flex">
      <div className="pb-4">
        <h3 className="font-headline-md text-2xl text-primary">Mi cocina</h3>
        <p className="font-label-md text-sm text-on-surface-variant opacity-70">
          {authSession ? authSession.name : 'Explorá recetas'}
        </p>
      </div>

      <nav aria-label="Navegación principal" className="flex-1 space-y-2">
        <button className={`${navClass('recipes')} w-full text-left`} onClick={() => setCurrentTab('recipes')} type="button">
          <span className="material-symbols-outlined mr-3">book</span>
          <span className="font-label-md">Recetas</span>
        </button>
        <button className={`${navClass('discover')} w-full text-left`} onClick={() => setCurrentTab('discover')} type="button">
          <span className="material-symbols-outlined mr-3">explore</span>
          <span className="font-label-md">Descubrir</span>
        </button>
        <div className="flex items-center rounded-lg p-3 text-on-surface-variant">
          <span className="material-symbols-outlined mr-3">category</span>
          <span className="font-label-md">Categorías</span>
        </div>
        {authSession && (
          <button className={`${navClass('substitutes')} w-full text-left`} onClick={() => setCurrentTab('substitutes')} type="button">
            <span className="material-symbols-outlined mr-3">kitchen</span>
            <span className="font-label-md">Mi despensa</span>
          </button>
        )}
      </nav>

      <div className="border-t border-outline-variant pt-6">
        <p className="mb-3 font-label-sm uppercase tracking-widest text-on-surface-variant">Etiquetas populares</p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              className="rounded-full bg-tertiary/10 px-2 py-1 text-xs font-semibold text-tertiary"
              key={tag}
              onClick={() => onSelectTag(tag)}
              type="button"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto border-t border-outline-variant pt-4">
        <div className="flex items-center p-3 text-on-surface-variant">
          <span className="material-symbols-outlined mr-3">settings</span>
          <span className="font-label-md">Configuración</span>
        </div>
        <div className="flex items-center p-3 text-on-surface-variant">
          <span className="material-symbols-outlined mr-3">help</span>
          <span className="font-label-md">Ayuda</span>
        </div>
      </div>
    </aside>
  );
}
