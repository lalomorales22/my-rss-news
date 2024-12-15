import { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { AddFeedForm } from './components/AddFeedForm';
import { useFeeds } from './hooks/useFeeds';
import { useArticles } from './hooks/useArticles';
import { Sidebar } from './components/Sidebar';
import { ArticleCard } from './components/ArticleCard';
import { ListMusic, Share2, X, RefreshCw } from 'lucide-react';
import type { Article } from './types';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [isPlaylistMode, setIsPlaylistMode] = useState(false);
  const [selectedArticles, setSelectedArticles] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { feeds, loading: feedsLoading, refetch: refetchFeeds } = useFeeds();
  const { articles, loading: articlesLoading, refetch: refetchArticles } = useArticles(feeds);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetchArticles();
    setIsRefreshing(false);
  };

  const toggleArticleSelection = (articleId: string) => {
    const newSelected = new Set(selectedArticles);
    if (newSelected.has(articleId)) {
      newSelected.delete(articleId);
    } else {
      newSelected.add(articleId);
    }
    setSelectedArticles(newSelected);
  };

  const generateTwitterText = () => {
    const selectedList = filteredArticles
      .filter(article => selectedArticles.has(article.guid || article.link))
      .map((article, index) => (
        `${index + 1}. ${article.title}\n${article.link}`
      ))
      .join('\n\n');

    const tweetText = encodeURIComponent(
      `📰 My News Playlist:\n\n${selectedList}`
    );
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
    setIsPlaylistMode(false);
    setSelectedArticles(new Set());
  };

  const createUniqueKey = (article: Article, index: number): string => {
    const feedId = article.feedTitle ? `_${encodeURIComponent(article.feedTitle)}` : '';
    const date = article.pubDate ? `_${new Date(article.pubDate).getTime()}` : '';
    const url = article.guid || article.link || '';
    const urlHash = url.split('').reduce((acc, char) => {
      return ((acc << 5) - acc) + char.charCodeAt(0) >>> 0;
    }, 0);
    return `article_${urlHash}${feedId}${date}_${index}`;
  };

  const validArticles = useMemo(() => {
    const seenUrls = new Set<string>();
    return articles.filter(article => {
      try {
        if (!article || typeof article !== 'object') return false;
        
        const articleUrl = article.guid || article.link;
        if (!articleUrl || seenUrls.has(articleUrl)) return false;
        seenUrls.add(articleUrl);

        return (
          typeof article.title === 'string' &&
          typeof article.pubDate === 'string' &&
          Date.parse(article.pubDate)
        );
      } catch {
        return false;
      }
    });
  }, [articles]);

  const filteredArticles = useMemo(() => {
    try {
      let filtered = validArticles;
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(article => {
          try {
            return (
              (article.title?.toLowerCase().includes(query)) ||
              (article.content?.toLowerCase().includes(query)) ||
              (Array.isArray(article.categories) && 
               article.categories.some(cat => 
                 cat?.toLowerCase().includes(query)
               )) ||
              (article.feedTitle?.toLowerCase().includes(query))
            );
          } catch {
            return false;
          }
        });
      }
      
      if (selectedCategory) {
        filtered = filtered.filter(article => {
          try {
            return (
              article.feedTitle === selectedCategory ||
              (Array.isArray(article.categories) &&
                article.categories.includes(selectedCategory))
            );
          } catch {
            return false;
          }
        });
      }
      
      return [...filtered].sort((a, b) => {
        try {
          const dateA = new Date(a.pubDate).getTime();
          const dateB = new Date(b.pubDate).getTime();
          return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
        } catch {
          return 0;
        }
      });
    } catch (error) {
      console.error('Error filtering articles:', error);
      return [];
    }
  }, [validArticles, selectedCategory, searchQuery, sortBy]);

  const isLoading = feedsLoading || articlesLoading;

  return (
    <div className="flex min-h-screen">
      <Sidebar 
        articles={validArticles}
        onCategorySelect={setSelectedCategory}
        selectedCategory={selectedCategory}
        sortBy={sortBy}
        onSortChange={setSortBy}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <main className="flex-1 p-6 overflow-y-auto bg-gray-50">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex justify-between items-start">
            <Header feeds={feeds} articles={validArticles} />
            <div className="flex items-center gap-3">
              {!isPlaylistMode ? (
                <>
                  <button
                    onClick={() => setIsPlaylistMode(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ListMusic className="w-4 h-4" />
                    Create Playlist
                  </button>
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing || isLoading}
                    className="flex items-center gap-2 p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                    title="Refresh articles"
                  >
                    <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsPlaylistMode(false);
                      setSelectedArticles(new Set());
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={generateTwitterText}
                    disabled={selectedArticles.size === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Share2 className="w-4 h-4" />
                    Share {selectedArticles.size} {selectedArticles.size === 1 ? 'Article' : 'Articles'}
                  </button>
                </>
              )}
            </div>
          </div>
          
          <AddFeedForm onFeedAdded={refetchFeeds} />
          
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={`loading-skeleton-${i}`} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredArticles.map((article, index) => (
                <ArticleCard 
                  key={createUniqueKey(article, index)}
                  article={article}
                  allArticles={filteredArticles}
                  isPlaylistMode={isPlaylistMode}
                  isSelected={selectedArticles.has(article.guid || article.link)}
                  onSelect={() => toggleArticleSelection(article.guid || article.link)}
                />
              ))}
              {filteredArticles.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No articles found matching your criteria.
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ... rest of the components ... */}
    </div>
  );
}

export default App;
