import { useState } from 'react';
import { BASE_IOS_LIST } from '../data/ciosData';
import { BaseIOSInfo, ConsoleType } from '../types';
import { Disc, Search, Shield, ChevronRight, Layers, FileCode } from 'lucide-react';

interface BaseMapsViewerProps {
  initialConsole?: ConsoleType;
}

export function BaseMapsViewer({ initialConsole }: BaseMapsViewerProps) {
  const [filterConsole, setFilterConsole] = useState<string>(initialConsole || 'all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBase, setSelectedBase] = useState<BaseIOSInfo>(BASE_IOS_LIST[0]);

  const filteredBases = BASE_IOS_LIST.filter(b => {
    if (filterConsole !== 'all' && b.console !== filterConsole) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchIos = `ios${b.ios}`.includes(q) || b.ios.toString().includes(q);
      const matchDesc = b.description.toLowerCase().includes(q);
      const matchFeatures = b.features.some(f => f.toLowerCase().includes(q));
      return matchIos || matchDesc || matchFeatures;
    }
    return true;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* List of Bases */}
      <div className="lg:col-span-5 space-y-4">
        {/* Search and Filters */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search bases by IOS number or feature..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {['all', 'wii', 'wiimini', 'vwii'].map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setFilterConsole(c)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-colors ${
                  filterConsole === c
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-950/60'
                }`}
              >
                {c === 'all' ? 'All Bases' : c === 'wiimini' ? 'Wii Mini' : c.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Bases list */}
        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
          {filteredBases.map((base) => {
            const isSelected = selectedBase.ios === base.ios && selectedBase.version === base.version && selectedBase.console === base.console;
            return (
              <div
                key={`${base.console}-${base.ios}-${base.version}`}
                onClick={() => setSelectedBase(base)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500/60 shadow-md'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-white">IOS{base.ios}</span>
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                      v{base.version}
                    </span>
                    <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${
                      base.console === 'wii'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                        : base.console === 'wiimini'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                    }`}>
                      {base.console}
                    </span>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-cyan-400 translate-x-0.5' : 'text-slate-600'}`} />
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {base.description}
                </p>
                <div className="mt-2.5 flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                  <span>{base.contentsCount} contents</span>
                  <span>•</span>
                  <span>{base.modulesCount} modules</span>
                  {base.recommendedSlot && (
                    <>
                      <span>•</span>
                      <span className="text-cyan-400 font-semibold">Slot {base.recommendedSlot}</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Base Detailed View */}
      <div className="lg:col-span-7 space-y-5">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <Disc className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-bold text-white font-mono">
                  Base IOS{selectedBase.ios} (v{selectedBase.version})
                </h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase bg-slate-800 text-slate-300">
                  {selectedBase.console}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {selectedBase.description}
              </p>
            </div>
            {selectedBase.recommendedSlot && (
              <div className="px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-right">
                <span className="text-[10px] text-slate-400 block uppercase">Standard Target</span>
                <span className="text-xs font-bold text-cyan-300 font-mono">Slot {selectedBase.recommendedSlot}</span>
              </div>
            )}
          </div>

          {/* Key Features */}
          <div className="mt-4">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              Base Profile Highlights
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {selectedBase.features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/60 text-xs text-slate-300 border border-slate-800/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  {feat}
                </div>
              ))}
            </div>
          </div>

          {/* Patches Breakdown */}
          <div className="mt-6">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-blue-400" />
              Applied Kernel Patches ({selectedBase.patches.length})
            </h3>
            <div className="space-y-2">
              {selectedBase.patches.map((patch, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-white">{patch.description}</span>
                    <span className="text-[11px] font-mono text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                      Content {patch.contentId} @ {patch.offset}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono mt-2">
                    <div className="p-2 rounded bg-slate-900/90 text-red-300/90 overflow-x-auto">
                      <span className="text-[10px] text-slate-500 block">Original Bytes:</span>
                      {patch.originalBytes}
                    </div>
                    <div className="p-2 rounded bg-slate-900/90 text-emerald-300/90 overflow-x-auto">
                      <span className="text-[10px] text-slate-500 block">Patched Bytes:</span>
                      {patch.newBytes}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Integrated Modules */}
          <div className="mt-6">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Injected cIOS Modules ({selectedBase.modules.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {selectedBase.modules.map((m, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-white">{m.name}.app</span>
                    <span className="text-[10px] font-mono text-slate-400">ID {m.id}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    TMD Module: {m.tmdModuleId === -1 ? 'None (Dynamic)' : m.tmdModuleId}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
