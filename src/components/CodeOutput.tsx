import { useState, useMemo } from 'react';
import { GeneratorConfig } from '../types';
import { generateCiosMapsXml, generateD2xBat, generateReadMe, downloadTextFile } from '../utils/generator';
import { Copy, Check, Download, FileCode, Terminal, FileText, Info } from 'lucide-react';

interface CodeOutputProps {
  config: GeneratorConfig;
}

export function CodeOutput({ config }: CodeOutputProps) {
  const [activeFile, setActiveFile] = useState<'xml' | 'bat' | 'readme'>('xml');
  const [copied, setCopied] = useState<boolean>(false);

  const xmlContent = useMemo(() => generateCiosMapsXml(config), [config]);
  const batContent = useMemo(() => generateD2xBat(config), [config]);
  const readmeContent = useMemo(() => generateReadMe(config), [config]);

  const currentContent = activeFile === 'xml' ? xmlContent : activeFile === 'bat' ? batContent : readmeContent;
  const currentFilename = activeFile === 'xml' ? 'ciosmaps.xml' : activeFile === 'bat' ? 'd2x-beta.bat' : 'ReadMe.txt';

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadTextFile(currentFilename, currentContent);
  };

  const lineCount = currentContent.split('\n').length;

  return (
    <div className="space-y-5">
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <FileCode className="w-5 h-5 text-cyan-400" />
              Generated Distribution Packages & Configuration Files
            </h2>
            <p className="text-xs text-slate-400">
              Download or copy generated files for deployment to SD Card / USB drive or ModMii batch builder.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-white transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Download {currentFilename}
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 mt-4 border-b border-slate-800 pb-3">
          <button
            type="button"
            onClick={() => setActiveFile('xml')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeFile === 'xml'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileCode className="w-4 h-4" />
            ciosmaps.xml (cIOS Installer)
          </button>
          <button
            type="button"
            onClick={() => setActiveFile('bat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeFile === 'bat'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Terminal className="w-4 h-4" />
            d2x-beta.bat (ModMii)
          </button>
          <button
            type="button"
            onClick={() => setActiveFile('readme')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeFile === 'readme'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            ReadMe.txt
          </button>
        </div>

        {/* Code viewer */}
        <div className="mt-4 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
          <div className="px-4 py-2 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>{currentFilename}</span>
            <span>{lineCount} lines</span>
          </div>
          <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-[500px] leading-relaxed selection:bg-cyan-500/30">
            {currentContent}
          </pre>
        </div>

        {/* Deployment guide */}
        <div className="mt-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3 text-xs text-slate-400">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-slate-200">How to use on your SD Card / USB:</span>
            <p>
              Copy <code className="text-cyan-300 bg-slate-900 px-1 rounded">ciosmaps.xml</code> into your SD/USB drive at:
              <code className="text-cyan-300 bg-slate-900 px-1 ml-1 rounded">/apps/d2x-cios-installer/ciosmaps.xml</code>.
              When you launch the homebrew installer on your console, it will automatically load this ciosmap definitions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
