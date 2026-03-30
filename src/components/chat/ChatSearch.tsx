import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, Users } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

export interface SearchResult {
  id: string;
  type: 'message' | 'user' | 'room';
  title: string;
  subtitle?: string;
  avatar?: string;
  timestamp?: Date;
}

interface ChatSearchProps {
  onSearch: (query: string) => Promise<SearchResult[]>;
  onSelectResult: (result: SearchResult) => void;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * ChatSearch Component
 * Searchable input with live results for messages, users, and rooms
 * Shows recent searches and live filtering
 */
export const ChatSearch: React.FC<ChatSearchProps> = ({
  onSearch,
  onSelectResult,
  placeholder = 'Search messages, users, rooms...',
  disabled = false,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle search input
  const handleSearch = async (value: string) => {
    setQuery(value);
    
    if (!value.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const searchResults = await onSearch(value);
      setResults(searchResults);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle result selection
  const handleSelectResult = (result: SearchResult) => {
    onSelectResult(result);
    
    // Add to recent searches
    const newRecent = [result.title, ...recentSearches.filter(s => s !== result.title)].slice(0, 5);
    setRecentSearches(newRecent);
    localStorage.setItem('recentSearches', JSON.stringify(newRecent));
    
    setQuery('');
    setIsOpen(false);
    setResults([]);
  };

  // Load recent searches on mount
  useEffect(() => {
    const stored = localStorage.getItem('recentSearches');
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'message':
        return '💬';
      case 'user':
        return '👤';
      case 'room':
        return '#️⃣';
      default:
        return '🔍';
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Input */}
      <motion.div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full pl-10 pr-10 py-2.5 rounded-lg
            glass-input
            text-sm font-medium
            ${isOpen ? 'ring-2 ring-[var(--theme-accent)]' : ''}
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        />

        {/* Clear Button */}
        {query && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setQuery('');
              setResults([]);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
          >
            <X size={16} />
          </motion.button>
        )}
      </motion.div>

      {/* Results Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="absolute top-full left-0 right-0 mt-2 z-dropdown max-h-96 overflow-y-auto"
          >
            <GlassCard className="p-2">
              {isLoading ? (
                <div className="p-4 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="inline-block"
                  >
                    🔍
                  </motion.div>
                  <p className="text-sm text-white/50 mt-2">Searching...</p>
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-1">
                  {results.map((result) => (
                    <motion.button
                      key={`${result.type}-${result.id}`}
                      whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.1)' }}
                      onClick={() => handleSelectResult(result)}
                      className="w-full px-3 py-2 rounded-lg text-left transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-lg">{getResultIcon(result.type)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {result.title}
                          </p>
                          {result.subtitle && (
                            <p className="text-xs text-white/50 truncate">
                              {result.subtitle}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              ) : query.trim() ? (
                <div className="p-4 text-center">
                  <p className="text-sm text-white/50">No results found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div>
                      <p className="px-3 py-2 text-xs font-semibold text-white/50 uppercase tracking-wide">
                        Recent Searches
                      </p>
                      <div className="space-y-1">
                        {recentSearches.map((search) => (
                          <motion.button
                            key={search}
                            whileHover={{ x: 4 }}
                            onClick={() => handleSearch(search)}
                            className="w-full px-3 py-2 rounded-lg text-left text-sm text-white/70 hover:text-white hover:bg-white/10 flex items-center gap-2"
                          >
                            <Clock size={14} />
                            {search}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tip */}
                  <div className="px-3 py-2 text-xs text-white/40 bg-white/5 rounded border border-white/10">
                    💡 Type to search messages, users, and rooms
                  </div>
                </div>
              )}
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
