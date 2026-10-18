import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, BookOpen, Play, FileText, ArrowRight } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';

const GlobalSearch: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { tracks } = useData();
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const allModules = tracks.flatMap(t => t.modules.map(m => ({ ...m, trackTitle: t.title, trackId: t.id, trackType: t.type })));
  
  const results = query.trim() === '' ? [] : [
    ...tracks.filter(t => t.title.toLowerCase().includes(query.toLowerCase())).map(t => ({ ...t, resultType: 'TRACK' })),
    ...allModules.filter(m => m.title.toLowerCase().includes(query.toLowerCase())).map(m => ({ ...m, resultType: 'MODULE' }))
  ].slice(0, 6);

  const handleSelect = (item: any) => {
    setIsOpen(false);
    setQuery('');
    if (item.resultType === 'TRACK') {
      navigate(`/tracks?trackId=${item.id}`);
    } else {
      if (item.trackType === 'CLASS') {
        navigate(`/recorded-classes?moduleId=${item.id}`);
      } else {
        navigate(`/tracks?trackId=${item.trackId}&moduleId=${item.id}`);
      }
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-3 px-4 py-2 bg-vertus-gray/30 border border-vertus-gray/50 rounded-2xl text-vertus-white/40 hover:text-vertus-white hover:border-vertus-gold/30 transition-all group"
      >
        <Search className="w-4 h-4" />
        <span className="text-xs font-medium">Buscar aula ou trilha</span>
        <kbd className="text-[10px] bg-vertus-gray px-1.5 py-0.5 rounded border border-vertus-white/10 font-sans">⌘K</kbd>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="relative w-full max-w-2xl bg-vertus-card border border-vertus-gray rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-vertus-gray flex items-center gap-4">
                <Search className="w-6 h-6 text-vertus-gold" />
                <input
                  autoFocus
                  type="text"
                  placeholder="O que você quer aprender hoje?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-xl placeholder:text-vertus-white/20"
                />
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-vertus-gray rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-vertus-white/40" />
                </button>
              </div>

              <div className="p-4 max-h-[60vh] overflow-y-auto scrollbar-thin">
                {results.length > 0 ? (
                  <div className="space-y-2">
                    {results.map((item: any, index) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-vertus-gray/30 border border-transparent hover:border-vertus-gold/20 transition-all text-left group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-vertus-gray flex items-center justify-center text-vertus-gold group-hover:bg-vertus-gold group-hover:text-vertus-bg transition-all">
                          {item.resultType === 'TRACK' ? <BookOpen className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-vertus-white truncate">{item.title}</h4>
                          <p className="text-xs text-vertus-white/40 truncate">
                            {item.resultType === 'TRACK' ? 'Trilha de Conhecimento' : `Aula em ${item.trackTitle}`}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-vertus-white/20 group-hover:text-vertus-gold group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                ) : query.trim() !== '' ? (
                  <div className="py-12 text-center space-y-4">
                    <div className="w-16 h-16 bg-vertus-gray/30 rounded-full flex items-center justify-center mx-auto">
                      <Search className="w-8 h-8 text-vertus-white/20" />
                    </div>
                    <p className="text-vertus-white/40">Nenhum resultado encontrado para "{query}"</p>
                  </div>
                ) : (
                  <div className="py-8 px-4">
                    <p className="text-[10px] uppercase tracking-widest text-vertus-white/30 font-bold mb-4">Sugestões</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {tracks.slice(0, 4).map(track => (
                        <button
                          key={track.id}
                          onClick={() => handleSelect({ ...track, resultType: 'TRACK' })}
                          className="flex items-center gap-3 p-3 rounded-xl bg-vertus-gray/20 border border-vertus-gray/50 hover:border-vertus-gold/20 transition-all text-left"
                        >
                          <BookOpen className="w-4 h-4 text-vertus-gold" />
                          <span className="text-sm font-medium">{track.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-vertus-gray/20 border-t border-vertus-gray flex items-center justify-between text-[10px] text-vertus-white/30 font-bold uppercase tracking-widest">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1"><kbd className="bg-vertus-gray px-1 rounded border border-white/5">↑↓</kbd> Navegar</span>
                  <span className="flex items-center gap-1"><kbd className="bg-vertus-gray px-1 rounded border border-white/5">↵</kbd> Selecionar</span>
                </div>
                <span>Pressione <kbd className="bg-vertus-gray px-1 rounded border border-white/5">ESC</kbd> para fechar</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GlobalSearch;
