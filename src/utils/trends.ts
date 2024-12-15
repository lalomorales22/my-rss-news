import { Article } from '../types';

// Extended stop words including HTML/programming terms and common words
const STOP_WORDS = new Set([
  // Common HTML/CSS/Programming terms
  'http', 'https', 'href', 'src', 'img', 'div', 'span', 'class', 'style',
  'width', 'height', 'size', 'data', 'type', 'function', 'const', 'let',
  'var', 'async', 'await', 'return', 'true', 'false', 'null', 'undefined',
  'object', 'array', 'string', 'number', 'boolean', 'article', 'section',
  'nav', 'header', 'footer', 'image', 'link', 'script', 'head', 'body',
  'meta', 'title', 'post', 'page', 'content', 'text', 'read', 'loading',
  'error', 'success', 'button', 'input', 'form', 'api', 'url', 'uri',
  'json', 'xml', 'html', 'css', 'js', 'javascript', 'png', 'jpg', 'jpeg',
  'svg', 'icon', 'logo', 'image', 'video', 'audio', 'media', 'file',
  'upload', 'download', 'save', 'delete', 'remove', 'add', 'create', 'update',
  'edit', 'modify', 'list', 'view', 'show', 'hide', 'toggle', 'click',
  'hover', 'focus', 'blur', 'change', 'submit', 'cancel', 'close', 'open',

  // Common English stop words
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it',
  'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this',
  'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or',
  'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
  'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know',
  'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could',
  'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come',
  'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how',
  'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because',
  'any', 'these', 'give', 'day', 'most', 'us', 'has', 'was', 'were',
  'much', 'where', 'very', 'need', 'here', 'such', 'without', 'within',
  'between', 'both', 'each', 'few', 'more', 'most', 'other', 'such',
  'why', 'been', 'before', 'being', 'below', 'again', 'further', 'then',
  'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any',
  'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such'
]);

export interface TrendingKeyword {
  keyword: string;
  count: number;
  articles: Article[];
}

function isValidWord(word: string): boolean {
  return (
    word.length > 3 && // Only words longer than 3 characters
    !STOP_WORDS.has(word.toLowerCase()) && // Not in stop words
    !/^\d+$/.test(word) && // Not just numbers
    !/^[^a-zA-Z]+$/.test(word) && // Contains at least one letter
    !/^https?:\/\//.test(word) && // Not a URL
    !word.includes('.') && // Not a file extension or URL
    !word.includes('_') && // Not a programming variable
    !word.includes('-') && // Not a CSS class
    !word.includes('/') && // Not a path
    !word.includes('\\') // Not a path
  );
}

export function extractTrendingKeywords(articles: Article[], minCount: number = 3): TrendingKeyword[] {
  const keywordMap = new Map<string, { count: number; articles: Set<Article> }>();

  // Process each article
  articles.forEach(article => {
    // Focus more on title keywords as they're more significant
    const titleWords = article.title.toLowerCase()
      .replace(/[^a-zA-Z\s]/g, ' ')
      .split(/\s+/)
      .filter(isValidWord);

    // Give title words more weight (count them twice)
    titleWords.forEach(word => {
      if (!keywordMap.has(word)) {
        keywordMap.set(word, { count: 0, articles: new Set() });
      }
      const entry = keywordMap.get(word)!;
      entry.count += 2; // Double weight for title words
      entry.articles.add(article);
    });

    // Process content with normal weight
    if (typeof article.content === 'string') {
      const contentText = article.content
        .replace(/<[^>]+>/g, ' ') // Remove HTML tags
        .replace(/[^a-zA-Z\s]/g, ' ') // Remove special characters
        .toLowerCase();

      const words = contentText.split(/\s+/).filter(isValidWord);

      // Count unique words in this article
      const uniqueWords = new Set(words);
      uniqueWords.forEach(word => {
        if (!keywordMap.has(word)) {
          keywordMap.set(word, { count: 0, articles: new Set() });
        }
        const entry = keywordMap.get(word)!;
        entry.count++;
        entry.articles.add(article);
      });
    }
  });

  // Convert to array and sort by frequency
  return Array.from(keywordMap.entries())
    .filter(([_, data]) => data.count >= minCount && data.articles.size >= 2) // Must appear in at least 2 articles
    .map(([keyword, data]) => ({
      keyword,
      count: data.count,
      articles: Array.from(data.articles)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15); // Limit to top 15 trending keywords
}