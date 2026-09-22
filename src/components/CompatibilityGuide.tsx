import { useState } from 'react';
import { POPULAR_GAMES_COMPATIBILITY } from '../data/ciosData';
import { Search, Sparkles, HelpCircle, HardDrive, CheckCircle2 } from 'lucide-react';

export function CompatibilityGuide() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  const allTags = Array.from(new Set(POPULAR_GAMES_COMPATIBILITY.flatMap(g => g.tags)));

  const filteredGames = POPULAR_GAMES_COMPATIBILITY.filter(game => {
    if (selectedTag !== 'all' && !game.tags.includes(selectedTag)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return game.title.toLowerCase().includes(q) ||
        game.id.toLowerCase().includes(q) ||
        game.reason.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          Game Title Compatibility Directory & Optimal cIOS Mapping
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Certain complex Wii games require specific cIOS base versions, USB accessory handles, or NAND emulation patches.
          Look up your game to see which cIOS slot and base IOS you should configure in your USB loader (USB Loader GX, WiiFlow, CFG).
        </p>

        {/* Search and tags */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4 pt-4 border-t border-slate-800">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by game name (e.g. Smash, Call of Duty, Rock Band) or Game ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setSelectedTag('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedTag === 'all'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-950'
              }`}
            >
              All Categories
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedTag === tag
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-950'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Game Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredGames.map((game) => (
          <div key={game.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h3 className="text-sm font-bold text-white">{game.title}</h3>
                  <span className="text-[11px] font-mono text-cyan-400">{game.id}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Slot {game.recommendedSlot}
                  </span>
                  <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Base {game.recommendedBase}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mt-2">
                {game.reason}
              </p>

              {game.specialNotes && (
                <div className="mt-3 p-2.5 rounded-lg bg-slate-950 text-xs text-slate-400 border border-slate-800/80 flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{game.specialNotes}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-slate-800/60">
              {game.tags.map(t => (
                <span key={t} className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400">
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
