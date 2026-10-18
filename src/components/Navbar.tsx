import React from 'react';
import { Volume2, VolumeX, Sparkles, Orbit, Radio, Award } from 'lucide-react';
import { UserProgressState } from '../types';

interface NavbarProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  userProgress: UserProgressState;
  activeSection: string;
  onNavigate: (section: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  soundEnabled,
  onToggleSound,
  userProgress,
  activeSection,
  onNavigate
}) => {
  const navItems = [
    { id: 'galeria', label: 'Fotos NASA & Sagitário A*', icon: Sparkles },
    { id: 'catalogo', label: 'Titãs Extremos (Fotos & Info)', icon: Award },
    { id: 'simulador', label: 'Simulador 3D', icon: Orbit },
    { id: 'alertas', label: 'Dados em Tempo Real', icon: Radio }
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-cyan-500/20 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand & Live Indicator */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 via-teal-500 to-emerald-500 p-0.5 shadow-lg shadow-cyan-500/30 shrink-0">
            <img
              src="https://www.eso.org/public/archives/images/screen/eso2208a.jpg"
              alt="Foto de Perfil Oficial Buraco Negro Sagitário A*"
              className="h-full w-full object-cover rounded-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://www.eso.org/public/archives/images/screen/eso1907a.jpg';
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base font-extrabold tracking-tight text-white sm:text-xl">
                CENTRO DO <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">ABISMO</span>
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/40 bg-cyan-500/15 px-2 py-0.5 text-[10px] font-extrabold text-cyan-300 uppercase tracking-wider shadow-sm">
                O Universo dos Buracos Negros
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                NASA / EHT / ESO ABERTO
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              Arquivo 100% Autêntico e Sem Fotos Repetidas • Ciência Aberta & Física Relativística
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 rounded-full border border-slate-800 bg-slate-900/60 p-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User Engagement XP & Sound Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* User Progress Badge */}
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
            <Award className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Nível {userProgress.level}:</span>
            <span>{userProgress.levelTitle}</span>
            <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-200">
              {userProgress.xp} XP
            </span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Mutar Áudio Cósmico' : 'Ativar Áudio Cósmico'}
            className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all ${
              soundEnabled
                ? 'border-cyan-500/40 bg-cyan-500/20 text-cyan-300'
                : 'border-slate-800 bg-slate-900 text-slate-500 hover:text-slate-300'
            }`}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Bottom Nav Bar */}
      <div className="flex md:hidden border-t border-slate-800 bg-slate-950 px-2 py-1.5">
        <div className="grid w-full grid-cols-4 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center justify-center gap-0.5 rounded-lg py-1 text-[10px] font-medium ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                    : 'text-slate-400'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
