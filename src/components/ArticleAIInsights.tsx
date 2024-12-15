import React, { useEffect, useState } from 'react';
import { Article } from '../types';
import { ArticleAnalysis, analyzeArticle, getSimilarArticles } from '../services/aiService';
import { Clock, ThumbsUp, ThumbsDown, Minus, Tags, Sparkles, AlertCircle } from 'lucide-react';

interface ArticleAIInsightsProps {
  article: Article;
  allArticles: Article[];
  onArticleClick: (article: Article) => void;
}

export function ArticleAIInsights({ article, allArticles, onArticleClick }: ArticleAIInsightsProps) {
  const [analysis, setAnalysis] = useState<ArticleAnalysis | null>(null);
  const [similarArticles, setSimilarArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [articleAnalysis, similar] = await Promise.all([
          analyzeArticle(article),
          getSimilarArticles(article, allArticles)
        ]);

        setAnalysis(articleAnalysis);
        setSimilarArticles(similar);
      } catch (err) {
        setError('Failed to load AI insights');
        console.error('AI analysis error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [article, allArticles]);

  if (loading) {
    return (
      <div className="mt-4 space-y-2 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 text-red-500 flex items-center gap-2">
        <AlertCircle className="w-4 h-4" />
        {error}
      </div>
    );
  }

  if (!analysis) return null;

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <ThumbsUp className="w-4 h-4 text-green-500" />;
      case 'negative': return <ThumbsDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="mt-4 space-y-4 border-t pt-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center gap-2">
          {getSentimentIcon(analysis.sentiment)}
          <span className="text-sm capitalize">{analysis.sentiment}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-sm">{analysis.readingTime} min read</span>
        </div>
        <div className="flex items-center gap-2">
          <Tags className="w-4 h-4 text-gray-500" />
          <span className="text-sm">{analysis.keywords.length} topics</span>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Summary</h4>
        <p className="text-sm text-gray-600">{analysis.summary}</p>
      </div>

      {analysis.keywords.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Key Topics</h4>
          <div className="flex flex-wrap gap-2">
            {analysis.keywords.map((keyword, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {similarArticles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            Similar Articles
          </h4>
          <ul className="space-y-2">
            {similarArticles.map((similar, index) => (
              <li key={index}>
                <button
                  onClick={() => onArticleClick(similar)}
                  className="text-sm text-left text-blue-600 hover:text-blue-800"
                >
                  {similar.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}