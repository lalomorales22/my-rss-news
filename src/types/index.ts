export interface RSSFeed {
  id: string;
  url: string;
  title: string;
  description?: string;
  category?: string;
  created_at: string;
}

export interface Article {
  guid: string;
  title: string;
  link: string;
  pubDate: string;
  content: string;
  categories: string[];
  feedTitle?: string;
  starred?: boolean;
}

export type TimeFilter = 'all' | 'today' | 'week' | 'month';
export type SortBy = 'newest' | 'oldest';