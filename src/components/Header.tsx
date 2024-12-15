import React from 'react';
import { Newspaper } from 'lucide-react';
import type { RSSFeed, Article } from '../types';

interface HeaderProps {
  feeds: RSSFeed[];
  articles: Article[];
}

export function Header({ feeds, articles }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">RSS News Hub</h1>
          </div>
          <p className="text-sm text-gray-500">
            {feeds.length} {feeds.length === 1 ? 'feed' : 'feeds'} • 
            {articles.length} {articles.length === 1 ? 'article' : 'articles'}
          </p>
        </div>
      </div>
    </header>
  );
}