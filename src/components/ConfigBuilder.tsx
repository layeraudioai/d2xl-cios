import { useState } from 'react';
import { GeneratorConfig, SlotConfig, ConsoleType } from '../types';
import { CONSOLE_PRESETS, BASE_IOS_LIST } from '../data/ciosData';
import { Plus, Trash2, Sliders, Shield, HardDrive, Cpu, AlertTriangle, CheckCircle2, RotateCcw } from 'lucide-react';

interface ConfigBuilderProps {
  config: GeneratorConfig;
  onChange: (updated: GeneratorConfig) => void;
}

export function ConfigBuilder({ config, onChange }: ConfigBuilderProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>('wii_recommended');

  const applyPreset = (key: string) => {
    setSelectedPreset(key);
    const preset = CONSOLE_PRESETS[key];
    if (!preset) return;

    let targetConsole: ConsoleType = 'wii';
    if (key.includes('wiimini')) targetConsole = 'wiimini';
    if (key.includes('vwii')) targetConsole = 'vwii';

    const newSlots: SlotConfig[] = preset.slots.map(s => ({
      slot: s.slot,
      baseIOS: s.baseIOS,
      version: s.version,
      revision: config.iosRevision || 21010
    }));

    onChange({
      ...config,
      console: targetConsole,
      slots: newSlots,
      features: {
        ...config.features,
        coverOverride: targetConsole === 'wiimini'
      }
    });
  };

  const addSlot = () => {
    const existingSlots = config.slots.map(s => s.slot);
    const candidateSlots = [249, 250, 251, 248, 252, 247, 245];
    const nextSlot = candidateSlots.find(s => !existingSlots.includes(s)) || 246;

    // Pick first available base for the console
    const availableBases = BASE_IOS_LIST.filter(b => b.console === config.console);
    const base = availableBases[0] || BASE_IOS_LIST[0];

    onChange({
      ...config,
      slots: [
        ...config.slots,
        {
          slot: nextSlot,
          baseIOS: base.ios,
          version: base.version,
          revision: config.iosRevision || 21010
        }
      ]
    });
  };

  const removeSlot = (index: number) => {
    const updated = [...config.slots];
    updated.splice(index, 1);
    onChange({ ...config, slots: updated });
  };

  const updateSlot = (index: number, partial: Partial<SlotConfig>) => {
    const updated = [...config.slots];
    updated[index] = { ...updated[index], ...partial };
    onChange({ ...config, slots: updated });
  };

  const handleBaseChange = (index: number, baseIOS: number) => {
    const found = BASE_IOS_LIST.find(b => b.ios === baseIOS && (b.console === config.console || (config.console === 'wiimini' && b.console === 'wii')));
    const version = found ? found.version : 5661;
    updateSlot(index, { baseIOS, version });
  };

  const toggleFeature = (key: keyof GeneratorConfig['features']) => {
    onChange({
      ...config,
      features: {
        ...config.features,
        [key]: !config.features[key]
      }
    });
  };

  const availableBasesForConsole = BASE_IOS_LIST.filter(b => {
    if (config.console === 'wii') return b.console === 'wii';
    if (config.console === 'wiimini') return b.console === 'wiimini' || (b.console === 'wii' && (b.ios === 56 || b.ios === 57));
    if (config.console === 'vwii') return b.console === 'vwii';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Presets card */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-cyan-400" />
              Quick Setup Presets
            </h2>
            <p className="text-xs text-slate-400">
              Apply community-tested slot and base configurations verified for optimal stability.
            </p>
          </div>
          <button
            type="button"
            onClick={() => applyPreset('wii_recommended')}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to Standard
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Object.entries(CONSOLE_PRESETS).map(([key, preset]) => {
            const isSelected = selectedPreset === key && (
              (key === 'wii_recommended' && config.console === 'wii') ||
              (key === 'wiimini_leseratte' && config.console === 'wiimini') ||
              (key === 'vwii_wiiu' && config.console === 'vwii')
            );
            return (
              <button
                key={key}
                type="button"
                onClick={() => applyPreset(key)}
                className={`text-left p-3.5 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500/50 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-white">{preset.name}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-2.5">
                  {preset.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {preset.slots.map(s => (
                    <span key={s.slot} className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                      Slot {s.slot} [base {s.baseIOS}]
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Slots configuration */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-blue-400" />
              cIOS Slots & Base IOS Mapping
            </h2>
            <p className="text-xs text-slate-400">
              Configure which NAND title slots will host which patched base IOS binaries.
            </p>
          </div>
          <button
            type="button"
            onClick={addSlot}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Slot
          </button>
        </div>

        <div className="space-y-3">
          {config.slots.map((slotConfig, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex flex-wrap items-center gap-4">
                {/* Slot Number */}
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-slate-400">Slot:</label>
                  <input
                    type="number"
                    min="200"
                    max="255"
                    value={slotConfig.slot}
                    onChange={(e) => updateSlot(idx, { slot: parseInt(e.target.value) || 249 })}
                    className="w-20 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Base IOS */}
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-slate-400">Base IOS:</label>
                  <select
                    value={slotConfig.baseIOS}
                    onChange={(e) => handleBaseChange(idx, parseInt(e.target.value))}
                    className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                  >
                    {availableBasesForConsole.map(b => (
                      <option key={`${b.ios}-${b.version}`} value={b.ios}>
                        IOS{b.ios} (v{b.version}) - {b.features[0]}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Base Version */}
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-slate-400">Version:</label>
                  <span className="text-xs font-mono text-slate-300 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                    v{slotConfig.version}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">
                  {slotConfig.slot === 249 && 'Primary Loader Slot'}
                  {slotConfig.slot === 250 && 'Secondary (Accessories/COD)'}
                  {slotConfig.slot === 251 && 'Tertiary (Nintendont/USB2)'}
                </span>
                {config.slots.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSlot(idx)}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Remove slot"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Toggles */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            cIOS Modules & Kernel Feature Flags
          </h2>
          <p className="text-xs text-slate-400">
            Control the runtime behavior, optical drive patches, and NAND emulation hooks built into the d2xl cIOS.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Cover Override - Wii Mini Special */}
          <div
            onClick={() => toggleFeature('coverOverride')}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              config.features.coverOverride
                ? 'bg-rose-950/30 border-rose-500/50'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                Wii Mini Optical Cover Override (IOCTL 0xFB/0xFC)
              </span>
              <input
                type="checkbox"
                checked={config.features.coverOverride}
                onChange={() => {}}
                className="rounded accent-rose-500"
              />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Provides homebrew media testing cover override on RVL-201 hardware. Reports physical cover as closed to inspect IOS-side poptop blockers.
            </p>
            {config.console === 'wiimini' && (
              <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 font-medium">
                ★ Highly recommended for Wii Mini
              </span>
            )}
          </div>

          {/* IOS Reload Block */}
          <div
            onClick={() => toggleFeature('iosReloadBlock')}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              config.features.iosReloadBlock
                ? 'bg-blue-950/30 border-blue-500/50'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                IOS Reload Block (Method 2)
              </span>
              <input
                type="checkbox"
                checked={config.features.iosReloadBlock}
                onChange={() => {}}
                className="rounded accent-blue-500"
              />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Prevents multi-IOS games (Metroid Prime Trilogy, Just Dance, COD) from resetting back to unpatched IOS during game transitions.
            </p>
          </div>

          {/* Stealth Mode */}
          <div
            onClick={() => toggleFeature('stealthMode')}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              config.features.stealthMode
                ? 'bg-emerald-950/30 border-emerald-500/50'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                Stealth Mode Protection
              </span>
              <input
                type="checkbox"
                checked={config.features.stealthMode}
                onChange={() => {}}
                className="rounded accent-emerald-500"
              />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Hides custom IOS signature and memory hooks from titles that inspect IOS memory to detect or block homebrew loaders.
            </p>
          </div>

          {/* 4KB Virtual Sectors */}
          <div
            onClick={() => toggleFeature('virtual4kSectors')}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              config.features.virtual4kSectors
                ? 'bg-purple-950/30 border-purple-500/50'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-purple-400" />
                4KB Sector Support (4084 Games WBFS)
              </span>
              <input
                type="checkbox"
                checked={config.features.virtual4kSectors}
                onChange={() => {}}
                className="rounded accent-purple-500"
              />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Bypasses the original 500 game WBFS limitation by mapping 4KB virtual sectors, supporting up to 4084 game entries on 2TB+ drives.
            </p>
          </div>

          {/* Drive LED Blinker */}
          <div
            onClick={() => toggleFeature('ledBlinker')}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              config.features.ledBlinker
                ? 'bg-cyan-950/30 border-cyan-500/50'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                Drive Slot Blue LED Blinker
              </span>
              <input
                type="checkbox"
                checked={config.features.ledBlinker}
                onChange={() => {}}
                className="rounded accent-cyan-500"
              />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Runs a background thread in the FAT module to flash the optical drive slot illumination during write operations.
            </p>
          </div>

          {/* USB Gecko Debug */}
          <div
            onClick={() => toggleFeature('usbGeckoDebug')}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              config.features.usbGeckoDebug
                ? 'bg-amber-950/30 border-amber-500/50'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-amber-400" />
                USB Gecko Kernel Debugging
              </span>
              <input
                type="checkbox"
                checked={config.features.usbGeckoDebug}
                onChange={() => {}}
                className="rounded accent-amber-500"
              />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Routes ARM syscall write logs to the USB Gecko hardware debugger in memory slot B for kernel-level developer telemetry.
            </p>
          </div>
        </div>
      </div>

      {/* Console-specific notice */}
      {config.console === 'wiimini' && (
        <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 space-y-1">
            <p className="font-semibold text-rose-300">Wii Mini (RVL-201) Hardware Note</p>
            <p>
              d2xl modifies the DIP plugin and cover status layer, but does not alter physical optical pickup potentiometer,
              laser power, focus, or analog hardware measurements. Ensure your USB Ethernet or mass storage dongle is connected via the single rear USB port.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
