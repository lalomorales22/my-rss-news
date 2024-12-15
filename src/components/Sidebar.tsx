import React, { useMemo, useState } from 'react';
import { SearchBar } from './SearchBar';
import { Article } from '../types';
import { BookOpen, Hash, Star, ChevronDown, ChevronUp, TrendingUp, RefreshCcw } from 'lucide-react';
import { extractTrendingKeywords } from '../utils/trends';

interface SidebarProps {
  articles: Article[];
  onCategorySelect: (category: string | null) => void;
  selectedCategory: string | null;
  sortBy: 'newest' | 'oldest';
  onSortChange: (sort: 'newest' | 'oldest') => void;
  onSearchChange: (query: string) => void;
  searchQuery: string;
}

export function Sidebar({
  articles,
  onCategorySelect,
  selectedCategory,
  sortBy,
  onSortChange,
  onSearchChange,
  searchQuery
}: SidebarProps) {
  const [isRssFeedsCollapsed, setIsRssFeedsCollapsed] = useState(false);
  const [isTopicsCollapsed, setIsTopicsCollapsed] = useState(false);
  const [isTrendsCollapsed, setIsTrendsCollapsed] = useState(false);

  const resetFilters = () => {
    onCategorySelect(null);
    onSearchChange('');
    onSortChange('newest');
  };

  // Get unique categories with counts (3 or more)
  const categories = useMemo(() => {
    const categoryMap = new Map<string, number>();
    
    articles.forEach(article => {
      if (Array.isArray(article.categories)) {
        article.categories.forEach(category => {
          if (category && typeof category === 'string') {
            const current = categoryMap.get(category) || 0;
            categoryMap.set(category, current + 1);
          }
        });
      }
    });

    return Array.from(categoryMap.entries())
      .filter(([_, count]) => count >= 3)
      .sort((a, b) => b[1] - a[1])
      .map(([category, count]) => ({ 
        name: category,
        count: count 
      }));
  }, [articles]);

  // Get unique feeds with counts (10 or more)
  const feedsWithArticles = useMemo(() => {
    const feedMap = new Map<string, number>();
    
    articles.forEach(article => {
      if (article.feedTitle && typeof article.feedTitle === 'string') {
        const current = feedMap.get(article.feedTitle) || 0;
        feedMap.set(article.feedTitle, current + 1);
      }
    });

    return Array.from(feedMap.entries())
      .filter(([_, count]) => count >= 10)
      .sort((a, b) => b[1] - a[1])
      .map(([feed, count]) => ({ 
        name: feed,
        count: count 
      }));
  }, [articles]);

  // Get trending keywords
  const trendingKeywords = useMemo(() => {
    return extractTrendingKeywords(articles);
  }, [articles]);

  return (
    <aside className="w-72 bg-gray-50 h-screen p-6 overflow-y-auto flex flex-col gap-6">
      {/* Search */}
      <div className="mb-6">
        <SearchBar value={searchQuery} onChange={onSearchChange} />
      </div>

      {/* Sort By */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-700 flex items-center gap-2">
          <Hash className="w-4 h-4" />
          Sort By
        </h3>
        <div className="space-y-2">
          <div className="flex gap-2">
            <button
              onClick={() => onSortChange('newest')}
              className={`px-3 py-1 rounded-full text-sm ${
                sortBy === 'newest'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Newest
            </button>
            <button
              onClick={() => onSortChange('oldest')}
              className={`px-3 py-1 rounded-full text-sm ${
                sortBy === 'oldest'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Oldest
            </button>
          </div>
          {(selectedCategory || searchQuery || sortBy !== 'newest') && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors w-full px-3 py-1"
            >
              <RefreshCcw className="w-3 h-3" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* RSS Feeds */}
      <div className="space-y-2">
        <button 
          onClick={() => setIsRssFeedsCollapsed(!isRssFeedsCollapsed)}
          className="w-full font-semibold text-gray-700 flex items-center justify-between hover:bg-gray-100 p-2 rounded-lg transition-colors"
        >
          <span className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            RSS Feeds (10+ stories)
          </span>
          {isRssFeedsCollapsed ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4" />
          )}
        </button>
        {!isRssFeedsCollapsed && (
          <div className="space-y-1 mt-2">
            {feedsWithArticles.map(({ name, count }) => (
              <button
                key={`feed-${name}`}
                onClick={() => onCategorySelect(name)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex justify-between items-center ${
                  selectedCategory === name
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="truncate">{name}</span>
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                  {count}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Topics */}
      <div className="space-y-2">
        <button 
          onClick={() => setIsTopicsCollapsed(!isTopicsCollapsed)}
          className="w-full font-semibold text-gray-700 flex items-center justify-between hover:bg-gray-100 p-2 rounded-lg transition-colors"
        >
          <span className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Topics (3+ stories)
          </span>
          {isTopicsCollapsed ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4" />
          )}
        </button>
        {!isTopicsCollapsed && (
          <div className="flex flex-wrap gap-2 mt-2">
            {categories.map(({ name, count }) => (
              <button
                key={`category-${name}`}
                onClick={() => onCategorySelect(name)}
                className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                  selectedCategory === name
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="truncate">{name}</span>
                <span className="text-xs">({count})</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Trends */}
      <div className="space-y-2">
        <button 
          onClick={() => setIsTrendsCollapsed(!isTrendsCollapsed)}
          className="w-full font-semibold text-gray-700 flex items-center justify-between hover:bg-gray-100 p-2 rounded-lg transition-colors"
        >
          <span className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Trending Keywords
          </span>
          {isTrendsCollapsed ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4" />
          )}
        </button>
        {!isTrendsCollapsed && (
          <div className="flex flex-wrap gap-2 mt-2">
            {trendingKeywords.map(({ keyword, count, articles }) => (
              <button
                key={`trend-${keyword}`}
                onClick={() => onCategorySelect(keyword)}
                className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                  selectedCategory === keyword
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={`Found in ${count} articles`}
              >
                <span className="truncate">{keyword}</span>
                <span className="text-xs">({count})</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}