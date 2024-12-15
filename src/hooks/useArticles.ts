import { useState, useEffect } from 'react';
import type { Article, RSSFeed } from '../types';
import { fetchArticlesFromFeed } from '../utils/rss';

export function useArticles(feeds: RSSFeed[]) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllArticles = async () => {
    setLoading(true);
    try {
      const articlesPromises = feeds.map(feed => fetchArticlesFromFeed(feed));
      const results = await Promise.all(articlesPromises);
      const allArticles = results.flat().sort((a, b) => 
        new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
      );
      setArticles(allArticles);
      setError(null);
    } catch (err) {
      setError('Failed to fetch articles');
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (feeds.length > 0) {
      fetchAllArticles();
    }
  }, [feeds]);

  return { articles, loading, error, refetch: fetchAllArticles };
}