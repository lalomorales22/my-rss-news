import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink, Check, Brain } from 'lucide-react';
import type { Article } from '../types';
import { ArticleAIInsights } from './ArticleAIInsights';

interface ArticleCardProps {
  article: Article;
  allArticles: Article[];
  isPlaylistMode?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function ArticleCard({ 
  article, 
  allArticles,
  isPlaylistMode, 
  isSelected, 
  onSelect 
}: ArticleCardProps) {
  const [showAIInsights, setShowAIInsights] = useState(false);

  // Function to strip HTML tags and decode HTML entities
  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  // Get clean content without HTML tags
  const cleanContent = typeof article.content === 'string' 
    ? stripHtml(article.content)
    : '';

  // Extract first image from content if it exists
  const getFirstImage = (content: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = content;
    const img = tmp.querySelector('img');
    return img?.src;
  };

  const thumbnailUrl = typeof article.content === 'string' 
    ? getFirstImage(article.content)
    : null;

  return (
    <article 
      className={`group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${
        isPlaylistMode ? 'cursor-pointer' : ''
      }`}
      onClick={() => isPlaylistMode && onSelect?.()}
    >
      <div className="relative">
        {thumbnailUrl && (
          <div className="w-full h-48 overflow-hidden">
            <img 
              src={thumbnailUrl} 
              alt={article.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
        {isPlaylistMode && (
          <div 
            className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
              isSelected 
                ? 'bg-blue-500 border-blue-500' 
                : 'bg-white border-gray-300 group-hover:border-blue-500'
            }`}
          >
            {isSelected && <Check className="w-4 h-4 text-white" />}
          </div>
        )}
      </div>
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {article.feedTitle || 'Unknown Source'}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAIInsights(!showAIInsights)}
                className={`p-1 rounded-full transition-colors ${
                  showAIInsights 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-400 hover:text-blue-600'
                }`}
                title="Show AI Insights"
              >
                <Brain className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(article.pubDate), { addSuffix: true })}
              </span>
            </div>
          </div>
          <h2 className="text-xl font-semibold">
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 flex items-center gap-2 group"
              onClick={(e) => isPlaylistMode && e.preventDefault()}
            >
              {article.title}
              {!isPlaylistMode && (
                <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </a>
          </h2>
          <div className="flex gap-2 flex-wrap">
            {Array.isArray(article.categories) && article.categories.map((category, index) => (
              typeof category === 'string' ? (
                <span
                  key={`${category}-${index}`}
                  className="px-2 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                >
                  {category}
                </span>
              ) : null
            ))}
          </div>
          <p className="text-gray-600 line-clamp-3">
            {cleanContent}
          </p>
        </div>

        {/* AI Insights */}
        {showAIInsights && (
          <ArticleAIInsights 
            article={article} 
            allArticles={allArticles}
            onArticleClick={(selectedArticle) => {
              window.open(selectedArticle.link, '_blank');
            }}
          />
        )}
      </div>
    </article>
  );
}