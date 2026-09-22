import { useState } from 'react';
import { CIOS_MODULES } from '../data/ciosData';
import { CIOSModule } from '../types';
import { Terminal, Cpu, Shield, HardDrive, Disc, Code, ChevronRight, Zap } from 'lucide-react';

export function ModuleArchitecture() {
  const [selectedModule, setSelectedModule] = useState<CIOSModule>(CIOS_MODULES[0]);

  const getModuleIcon = (name: string) => {
    switch (name) {
      case 'DIPP': return Disc;
      case 'EHCI': return Zap;
      case 'ES': return Shield;
      case 'FAT': return HardDrive;
      case 'FFSP': return Code;
      case 'MLOAD': return Cpu;
      case 'SDHC': return HardDrive;
      default: return Terminal;
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <Terminal className="w-5 h-5 text-cyan-400" />
          d2xl Modular Architecture & Kernel Extensions
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          d2xl decomposes custom IOS functionality into 8 specialized binaries compiled into `.app` modules,
          hooking into Nintendo IOS syscalls, interrupt handlers (IRQ9), and IOCTL dispatch tables.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Module Selector */}
        <div className="lg:col-span-4 space-y-2">
          {CIOS_MODULES.map((mod) => {
            const Icon = getModuleIcon(mod.name);
            const isSelected = selectedModule.name === mod.name;
            return (
              <div
                key={mod.name}
                onClick={() => setSelectedModule(mod)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500/60 shadow-md'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-white">{mod.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">~{mod.elfSizeApprox}</span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1">{mod.fullName}</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-600'}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Module Details */}
        <div className="lg:col-span-8 space-y-5">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded-lg font-mono font-bold text-sm bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {selectedModule.name}.app
                  </span>
                  <h3 className="text-lg font-bold text-white">
                    {selectedModule.fullName}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {selectedModule.description}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] text-slate-500 uppercase block">Compiled Footprint</span>
                <span className="text-xs font-mono font-bold text-slate-300">{selectedModule.elfSizeApprox}</span>
              </div>
            </div>

            {/* Key Responsibilities */}
            <div className="mt-5">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-cyan-400" />
                Key Responsibilities & Kernel Roles
              </h4>
              <ul className="space-y-2">
                {selectedModule.keyResponsibilities.map((resp, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0"></span>
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* IOCTLs / Syscall Hooks */}
            {selectedModule.ioctlOrSyscalls.length > 0 && (
              <div className="mt-6">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-indigo-400" />
                  Primary IOCTLs & Intercepted Commands
                </h4>
                <div className="space-y-2">
                  {selectedModule.ioctlOrSyscalls.map((call, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-bold text-cyan-300">{call.name}</code>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                            {call.code}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{call.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Author note */}
            <div className="mt-6 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-2.5">
              <span className="text-xs font-semibold text-slate-400 shrink-0">Heritage:</span>
              <p className="text-xs text-slate-400 italic">
                {selectedModule.authorNote}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
