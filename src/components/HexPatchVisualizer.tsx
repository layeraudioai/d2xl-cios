import { useState } from 'react';
import { BASE_IOS_LIST } from '../data/ciosData';
import { Shield, Cpu, Binary, Search } from 'lucide-react';

export function HexPatchVisualizer() {
  const [selectedBaseIndex, setSelectedBaseIndex] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const currentBase = BASE_IOS_LIST[selectedBaseIndex];

  const filteredPatches = currentBase.patches.filter(p => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return p.description.toLowerCase().includes(term) ||
      p.offset.toLowerCase().includes(term) ||
      p.contentId.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <Binary className="w-5 h-5 text-cyan-400" />
          Low-Level Hex Patch Visualizer & IOS Disassembly Inspector
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          d2xl applies precise byte patches to compiled Nintendo IOS binaries in memory and TMD content files.
          Inspect the exact memory offsets, original Nintendo opcodes, and the injected d2xl instructions.
        </p>

        {/* Base selector */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-800">
          {BASE_IOS_LIST.map((b, idx) => (
            <button
              key={`${b.console}-${b.ios}-${b.version}`}
              type="button"
              onClick={() => setSelectedBaseIndex(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                selectedBaseIndex === idx
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800'
              }`}
            >
              IOS{b.ios} v{b.version} ({b.console})
            </button>
          ))}
        </div>
      </div>

      {/* Search and stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search patch by description, offset, or content ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Showing {filteredPatches.length} patches for Base IOS{currentBase.ios}
        </div>
      </div>

      {/* Hex diff cards */}
      <div className="space-y-4">
        {filteredPatches.map((patch, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-mono text-xs font-bold border border-cyan-500/30">
                  {idx + 1}
                </span>
                <div>
                  <h3 className="text-xs font-semibold text-white">{patch.description}</h3>
                  <span className="text-[11px] font-mono text-slate-400">
                    Target Content ID: <code className="text-cyan-300 font-semibold">{patch.contentId}</code>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                  Offset: <span className="text-cyan-400">{patch.offset}</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                  Size: {patch.size} {patch.size === 1 ? 'byte' : 'bytes'}
                </span>
              </div>
            </div>

            {/* Hex comparison grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              {/* Original */}
              <div className="p-3 rounded-lg bg-slate-950 border border-red-950/40">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-red-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                    Original Nintendo Bytes
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">HEX RAW</span>
                </div>
                <div className="font-mono text-xs text-red-200/80 bg-red-950/20 p-2.5 rounded border border-red-900/30 break-all leading-relaxed">
                  {patch.originalBytes}
                </div>
              </div>

              {/* Patched */}
              <div className="p-3 rounded-lg bg-slate-950 border border-emerald-950/40">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    d2xl Injected Bytes
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">HEX PATCH</span>
                </div>
                <div className="font-mono text-xs text-emerald-200/80 bg-emerald-950/20 p-2.5 rounded border border-emerald-900/30 break-all leading-relaxed">
                  {patch.newBytes}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
