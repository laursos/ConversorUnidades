import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import CalculadoraPrescripcion from './components/CalculadoraPrescripcion';
import CalculadoraDensidad from './components/CalculadoraDensidad';
import CalculadoraHL from './components/CalculadoraHL';
import CalculadoraCuba from './components/CalculadoraCuba';
import CalculadoraSuperficie from './components/CalculadoraSuperficie';
import CalculadoraTrampas from './components/CalculadoraTrampas';
import CalculadoraEnergia from './components/CalculadoraEnergia';
import CalculadoraConcentracion from './components/CalculadoraConcentracion';

const TABS_PRINCIPALES = [
  { id: 0, label: 'Prescripción', emoji: '📋', component: <CalculadoraPrescripcion />, desc: 'Dosis completa · Cuba · Plan parcela' },
  { id: 2, label: 'Dosis/hL',    emoji: '🧪', component: <CalculadoraHL />,            desc: 'hL → ha' },
  { id: 3, label: 'Por Cuba',    emoji: '🪣', component: <CalculadoraCuba />,           desc: 'Producto por llenado' },
  { id: 4, label: 'Superficie',  emoji: '🌾', component: <CalculadoraSuperficie />,     desc: 'Total explotación' },
  { id: 5, label: 'Trampas',     emoji: '🪤', component: <CalculadoraTrampas />,        desc: 'Difusores · Feromonas' },
];

const TABS_SECUNDARIAS = [
  { id: 1, label: 'Densidad',   emoji: '⚗', component: <CalculadoraDensidad />,      desc: 'L ↔ kg con densidad' },
  { id: 6, label: 'Energía',    emoji: '⚡', component: <CalculadoraEnergia />,       desc: 'CV · kW · kWh' },
  { id: 7, label: 'Concentr.',  emoji: '💧', component: <CalculadoraConcentracion />, desc: 'mg/L · ppm' },
];

const TODOS_TABS = [...TABS_PRINCIPALES, ...TABS_SECUNDARIAS];

export default function App() {
  const [tabActiva, setTabActiva] = useState(0);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const tab = TODOS_TABS.find(t => t.id === tabActiva) ?? TODOS_TABS[0];
  const esSecundaria = TABS_SECUNDARIAS.some(t => t.id === tabActiva);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    function onClickFuera(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuAbierto(false);
      }
    }
    document.addEventListener('mousedown', onClickFuera);
    return () => document.removeEventListener('mousedown', onClickFuera);
  }, []);

  function seleccionarTab(id: number) {
    setTabActiva(id);
    setMenuAbierto(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-700 text-white shadow-md">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <h1 className="text-xl font-bold tracking-tight">Calculadora Agronómica</h1>
          <p className="text-green-200 text-xs mt-0.5">Conversión de unidades fitosanitarias y fertilizantes</p>
        </div>
      </header>

      {/* Tab bar */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-2">
          <div className="flex items-center gap-1 py-2">

            {/* Pestañas principales */}
            {TABS_PRINCIPALES.map(t => (
              <button
                key={t.id}
                onClick={() => seleccionarTab(t.id)}
                className={clsx(
                  'flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap',
                  tabActiva === t.id
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                <span className="text-base">{t.emoji}</span>
                <span>{t.label}</span>
              </button>
            ))}

            {/* Separador */}
            <div className="w-px h-8 bg-gray-200 mx-1 flex-shrink-0" />

            {/* Botón ··· para pestañas secundarias */}
            <div className="relative flex-shrink-0" ref={menuRef}>
              <button
                onClick={() => setMenuAbierto(v => !v)}
                className={clsx(
                  'flex flex-col items-center px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap',
                  esSecundaria
                    ? 'bg-gray-600 text-white shadow-sm'
                    : menuAbierto
                    ? 'bg-gray-100 text-gray-800'
                    : 'text-gray-500 hover:bg-gray-100'
                )}
                title="Herramientas adicionales"
              >
                <span className="text-base leading-none mb-0.5">···</span>
                <span>{esSecundaria ? tab.label : 'Más'}</span>
              </button>

              {/* Dropdown */}
              {menuAbierto && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-30 overflow-hidden">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Herramientas adicionales</p>
                  </div>
                  {TABS_SECUNDARIAS.map(t => (
                    <button
                      key={t.id}
                      onClick={() => seleccionarTab(t.id)}
                      className={clsx(
                        'w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors text-left',
                        tabActiva === t.id
                          ? 'bg-green-50 text-green-700 font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                      )}
                    >
                      <span className="text-lg">{t.emoji}</span>
                      <div>
                        <p className="font-medium leading-tight">{t.label}</p>
                        <p className="text-xs text-gray-400 leading-tight">{t.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="mb-5 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-800">
                {tab.emoji} {tab.label}
              </h2>
              {esSecundaria && (
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                  adicional
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{tab.desc}</p>
          </div>
          {tab.component}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-400 py-6">
        Calculadora Agronómica · Uso en campo · v1.0
      </footer>
    </div>
  );
}
