import type { Article, RSSFeed } from '../types';

export async function fetchArticlesFromFeed(feed: RSSFeed): Promise<Article[]> {
  const response = await fetch(`/api/fetch-rss?url=${encodeURIComponent(feed.url)}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch RSS feed: ${feed.url}`);
  }
  const articles = await response.json();
  return articles.map((article: any) => ({
    ...article,
    feedId: feed.id,
    feedTitle: feed.title,
  }));
}

export async function validateRSSFeed(url: string) {
  const response = await fetch(`/api/validate-rss?url=${encodeURIComponent(url)}`);
  if (!response.ok) {
    throw new Error('Failed to validate RSS feed');
  }
  return response.json();
}