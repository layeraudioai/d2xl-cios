import { Terminal, Shield, Cpu, Disc, Sparkles } from 'lucide-react';
import { ConsoleType } from '../types';

interface HeaderProps {
  currentConsole: ConsoleType;
  onConsoleSelect: (console: ConsoleType) => void;
  activeTab: string;
  onTabSelect: (tab: string) => void;
}

export function Header({ currentConsole, onConsoleSelect, activeTab, onTabSelect }: HeaderProps) {
  const tabs = [
    { id: 'builder', label: 'cIOS Builder & Presets', icon: Cpu },
    { id: 'maps', label: 'Base Maps & Patches', icon: Disc },
    { id: 'modules', label: 'Module Architecture', icon: Terminal },
    { id: 'visualizer', label: 'Hex Patch Visualizer', icon: Shield },
    { id: 'compatibility', label: 'Game Compatibility', icon: Sparkles }
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Disc className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  d2xl cIOS Studio
                  <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    v1-beta3
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-400">
                Custom IOS generator, ciosmaps engine & architecture inspector by Leseratte & davebaol
              </p>
            </div>
          </div>

          {/* Console Target Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
            <span className="text-xs font-medium text-slate-400 px-2.5">Console:</span>
            <button
              type="button"
              onClick={() => onConsoleSelect('wii')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentConsole === 'wii'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Nintendo Wii
            </button>
            <button
              type="button"
              onClick={() => onConsoleSelect('wiimini')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                currentConsole === 'wiimini'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
              Wii Mini (RVL-201)
            </button>
            <button
              type="button"
              onClick={() => onConsoleSelect('vwii')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentConsole === 'vwii'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              vWii (Wii U)
            </button>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-3 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabSelect(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
