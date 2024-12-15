import React, { useState } from 'react';
import { ListMusic, X, Share2, Check } from 'lucide-react';
import type { Article } from '../types';

interface NewsPlaylistProps {
  articles: Article[];
  isVisible: boolean;
  onClose: () => void;
}

export function NewsPlaylist({ articles, isVisible, onClose }: NewsPlaylistProps) {
  const [selectedArticles, setSelectedArticles] = useState<Set<string>>(new Set());
  const [isSelecting, setIsSelecting] = useState(true);

  const toggleArticle = (articleId: string) => {
    const newSelected = new Set(selectedArticles);
    if (newSelected.has(articleId)) {
      newSelected.delete(articleId);
    } else {
      newSelected.add(articleId);
    }
    setSelectedArticles(newSelected);
  };

  const generateTwitterText = () => {
    const selectedList = articles
      .filter(article => selectedArticles.has(article.guid || article.link))
      .map(article => `${article.title}\n${article.link}`)
      .join('\n\n');

    const tweetText = encodeURIComponent(`📰 My News Playlist:\n\n${selectedList}`);
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-2">
            <ListMusic className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Create News Playlist</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4">
          {isSelecting ? (
            <div className="space-y-2">
              {articles.map(article => (
                <div
                  key={article.guid || article.link}
                  className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                    selectedArticles.has(article.guid || article.link)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => toggleArticle(article.guid || article.link)}
                >
                  <div className="flex items-start gap-3">
                    <div className="pt-1">
                      {selectedArticles.has(article.guid || article.link) ? (
                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{article.title}</h3>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">{article.feedTitle}</p>
                        <a 
                          href={article.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline break-all"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {article.link}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-lg">Selected Articles:</p>
              {articles
                .filter(article => selectedArticles.has(article.guid || article.link))
                .map(article => (
                  <div key={article.guid || article.link} className="p-3 border rounded-lg">
                    <h3 className="font-medium">{article.title}</h3>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">{article.feedTitle}</p>
                      <a 
                        href={article.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline break-all"
                      >
                        {article.link}
                      </a>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-between">
          {isSelecting ? (
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsSelecting(false)}
                disabled={selectedArticles.size === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => setIsSelecting(true)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                onClick={generateTwitterText}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share on X
              </button>
            </div>
          )}
          <p className="text-sm text-gray-500 self-center">
            {selectedArticles.size} articles selected
          </p>
        </div>
      </div>
    </div>
  );
}