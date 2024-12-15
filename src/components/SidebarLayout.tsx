import React, { useMemo } from 'react';
import { Newspaper, Tag, Star, Clock } from 'lucide-react';
import { Article, TimeFilter, SortBy } from '../types';

interface SidebarProps {
  articles: Article[];
  onCategorySelect: (category: string | null) => void;
  selectedCategory: string | null;
  sortBy: SortBy;
  onSortChange: (sort: SortBy) => void;
  timeFilter: TimeFilter;
  onTimeFilterChange: (filter: TimeFilter) => void;
}

// Sidebar Component
export function Sidebar({
  articles,
  onCategorySelect,
  selectedCategory,
  sortBy,
  onSortChange,
  timeFilter,
  onTimeFilterChange
}: SidebarProps) {
  const categories = useMemo(() => {
    const allCategories = articles.flatMap(article => 
      (article.categories || []).filter(cat => typeof cat === 'string')
    );
    
    // Count occurrences of each category
    const categoryCounts = allCategories.reduce<Record<string, number>>((acc, cat) => {
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});
    
    return Array.from(new Set(allCategories))
      .filter(Boolean)
      .map(categoryName => ({
        id: `category-${categoryName.toLowerCase().replace(/\s+/g, '-')}`,
        name: categoryName,
        count: categoryCounts[categoryName]
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [articles]);

  return (
    <div className="w-64 bg-white shadow-sm h-screen fixed left-0 top-0 border-r">
      <div className="p-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Newspaper className="w-5 h-5" />
          RSS Reader
        </h2>
      </div>
      
      <nav className="mt-4">
        {/* Sort Controls */}
        <div className="px-4 py-2 text-sm font-medium text-gray-600">
          Sort By
        </div>
        <div className="space-y-1 mb-4">
          <button
            onClick={() => onSortChange('newest')}
            className={`w-full flex items-center gap-2 px-4 py-2 text-sm ${
              sortBy === 'newest' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Clock className="w-4 h-4" />
            Newest First
          </button>
          <button
            onClick={() => onSortChange('oldest')}
            className={`w-full flex items-center gap-2 px-4 py-2 text-sm ${
              sortBy === 'oldest' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Clock className="w-4 h-4" />
            Oldest First
          </button>
        </div>

        {/* Time Filters */}
        <div className="px-4 py-2 text-sm font-medium text-gray-600">
          Time Range
        </div>
        <div className="space-y-1 mb-4">
          {['all', 'today', 'week', 'month'].map((filter) => (
            <button
              key={filter}
              onClick={() => onTimeFilterChange(filter as TimeFilter)}
              className={`w-full flex items-center gap-2 px-4 py-2 text-sm ${
                timeFilter === filter ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Clock className="w-4 h-4" />
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        <div className="px-4 py-2 text-sm font-medium text-gray-600">
          Views
        </div>
        <button
          onClick={() => onCategorySelect(null)}
          className={`w-full flex items-center gap-2 px-4 py-2 text-sm ${
            !selectedCategory ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Clock className="w-4 h-4" />
          All Articles
        </button>
        <button
          onClick={() => onCategorySelect('starred')}
          className={`w-full flex items-center gap-2 px-4 py-2 text-sm ${
            selectedCategory === 'starred' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Star className="w-4 h-4" />
          Starred
        </button>
        
        <div className="px-4 py-2 mt-4 text-sm font-medium text-gray-600">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Categories
          </div>
        </div>
        <div className="space-y-1">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategorySelect(category.name)}
              className={`w-full flex items-center justify-between px-4 py-2 text-sm ${
                selectedCategory === category.name ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="truncate">{category.name}</span>
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100">
                {category.count}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

// Updated App Layout
export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="w-64 flex-shrink-0" /> {/* Sidebar spacer */}
      <main className="flex-1">
        <div className="max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}

// Updated ArticleCard with better type checking
export function ArticleCard({ article }: { article: Article }) {
  if (!article) return null;
  
  const sanitizedCategories = Array.isArray(article.categories) 
    ? article.categories.filter(cat => typeof cat === 'string')
    : [];
  
  return (
    <article className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        <a href={article.link} target="_blank" rel="noopener noreferrer" 
           className="hover:text-blue-600">
          {article.title || 'Untitled'}
        </a>
      </h3>
      <div className="text-sm text-gray-500 mb-4 flex items-center gap-4">
        <span>{article.feedTitle || 'Unknown Feed'}</span>
        <span>•</span>
        <span>{new Date(article.pubDate || Date.now()).toLocaleDateString()}</span>
      </div>
      <p className="text-gray-600 mb-4 line-clamp-3">
        {typeof article.content === 'string' ? article.content.replace(/<[^>]*>/g, '') : ''}
      </p>
      <div className="flex flex-wrap gap-2">
        {sanitizedCategories.map((category, index) => (
          <span
            key={`${article.guid || 'article'}-category-${index}`}
            className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full"
          >
            {category}
          </span>
        ))}
      </div>
    </article>
  );
}
