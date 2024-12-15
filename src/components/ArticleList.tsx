import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink } from 'lucide-react';
import { Article } from '../types';

interface ArticleListProps {
  articles: Article[];
  loading: boolean;
}

export function ArticleList({ articles, loading }: ArticleListProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!articles.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">No articles found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {articles.map((article) => (
        <article key={article.guid} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{article.feedTitle}</span>
              <span className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(article.pubDate), { addSuffix: true })}
              </span>
            </div>
            <h2 className="text-xl font-semibold">
              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-600 flex items-center gap-2"
              >
                {article.title}
                <ExternalLink className="w-4 h-4" />
              </a>
            </h2>
            <div className="flex gap-2 flex-wrap">
              {article.categories?.map((category, index) => (
                <span
                  key={`${category}-${index}`}
                  className="px-2 py-1 text-sm bg-gray-100 text-gray-700 rounded-full"
                >
                  {category}
                </span>
              ))}
            </div>
            <p className="text-gray-600 line-clamp-3">{article.content}</p>
          </div>
        </article>
      ))}
    </div>
  );
}