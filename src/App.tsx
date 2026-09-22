import { useState } from 'react';
import { GeneratorConfig, ConsoleType } from './types';
import { Header } from './components/Header';
import { ConfigBuilder } from './components/ConfigBuilder';
import { BaseMapsViewer } from './components/BaseMapsViewer';
import { ModuleArchitecture } from './components/ModuleArchitecture';
import { HexPatchVisualizer } from './components/HexPatchVisualizer';
import { CompatibilityGuide } from './components/CompatibilityGuide';
import { CodeOutput } from './components/CodeOutput';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('builder');

  const [config, setConfig] = useState<GeneratorConfig>({
    console: 'wii',
    majorVersion: 1,
    minorVersion: 'beta3',
    iosRevision: 21010,
    slots: [
      { slot: 249, baseIOS: 56, version: 5661, revision: 21010 },
      { slot: 250, baseIOS: 57, version: 5918, revision: 21010 },
      { slot: 251, baseIOS: 58, version: 6175, revision: 21010 }
    ],
    features: {
      coverOverride: false,
      nandEmulation: 'full',
      iosReloadBlock: true,
      stealthMode: true,
      virtual4kSectors: true,
      ledBlinker: true,
      usbGeckoDebug: false,
      koreanKeyPatch: true
    }
  });

  const handleConsoleSelect = (newConsole: ConsoleType) => {
    let newSlots = [...config.slots];
    let coverOverride = false;

    if (newConsole === 'wiimini') {
      newSlots = [
        { slot: 249, baseIOS: 57, version: 31515, revision: 21010 },
        { slot: 250, baseIOS: 56, version: 5661, revision: 21010 }
      ];
      coverOverride = true;
    } else if (newConsole === 'vwii') {
      newSlots = [
        { slot: 249, baseIOS: 56, version: 5888, revision: 21010 },
        { slot: 250, baseIOS: 57, version: 6175, revision: 21010 },
        { slot: 251, baseIOS: 58, version: 6432, revision: 21010 }
      ];
    } else {
      newSlots = [
        { slot: 249, baseIOS: 56, version: 5661, revision: 21010 },
        { slot: 250, baseIOS: 57, version: 5918, revision: 21010 },
        { slot: 251, baseIOS: 58, version: 6175, revision: 21010 }
      ];
    }

    setConfig({
      ...config,
      console: newConsole,
      slots: newSlots,
      features: {
        ...config.features,
        coverOverride
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header
        currentConsole={config.console}
        onConsoleSelect={handleConsoleSelect}
        activeTab={activeTab}
        onTabSelect={setActiveTab}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'builder' && (
          <div className="space-y-8">
            <ConfigBuilder config={config} onChange={setConfig} />
            <CodeOutput config={config} />
          </div>
        )}

        {activeTab === 'maps' && (
          <BaseMapsViewer initialConsole={config.console} />
        )}

        {activeTab === 'modules' && (
          <ModuleArchitecture />
        )}

        {activeTab === 'visualizer' && (
          <HexPatchVisualizer />
        )}

        {activeTab === 'compatibility' && (
          <CompatibilityGuide />
        )}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p>
            d2xl cIOS Studio — Ported and maintained from Leseratte's <code className="text-slate-400">d2xl-cios</code> (fork of davebaol's d2x & Waninkoko's cIOSX rev21).
          </p>
          <p className="text-[11px] text-slate-600">
            Compatible with Nintendo Wii, Wii Mini (RVL-201 with optical cover override), and vWii (Wii U).
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
