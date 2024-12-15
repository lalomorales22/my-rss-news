import axios from 'axios';
import { Article } from '../types';

// xAI API integration
const aiClient = axios.create({
    baseURL: 'https://api.x.ai/v1',
    headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_XAI_API_KEY}`,
        'Content-Type': 'application/json'
    }
});

export interface ArticleAnalysis {
    summary: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    keywords: string[];
    readingTime: number;
}

export async function analyzeArticle(article: Article): Promise<ArticleAnalysis> {
    try {
        const content = typeof article.content === 'string' 
            ? article.content.substring(0, 2000) // Limit content length
            : '';

        const response = await aiClient.post('/chat/completions', {
            model: 'grok-2-1212',  // xAI's model
            messages: [
                {
                    role: 'system',
                    content: 'You are an AI assistant that analyzes news articles. Return ONLY a JSON object with this exact structure, no markdown formatting or other text: {"summary": "2-3 sentence summary", "sentiment": "positive|negative|neutral", "keywords": ["topic1", "topic2"], "readingTime": estimated_minutes_number}'
                },
                {
                    role: 'user',
                    content: `Title: ${article.title}\n\nContent: ${content}`
                }
            ],
            temperature: 0.7,
            max_tokens: 500
        });

        const rawContent = response.data.choices[0].message.content.trim();
        let analysis;
        try {
            analysis = JSON.parse(rawContent);
        } catch (e) {
            // If JSON parse fails, try to extract JSON from markdown
            const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
            analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
        }

        if (!analysis) {
            throw new Error('Failed to parse AI response');
        }

        return {
            summary: analysis.summary || '',
            sentiment: analysis.sentiment || 'neutral',
            keywords: analysis.keywords || [],
            readingTime: analysis.readingTime || 5
        };
    } catch (error) {
        console.error('Error analyzing article:', error);
        // Return fallback values if analysis fails
        return {
            summary: 'Analysis unavailable',
            sentiment: 'neutral',
            keywords: [],
            readingTime: 5
        };
    }
}

export async function getSimilarArticles(article: Article, articles: Article[]): Promise<Article[]> {
    try {
        // Use xAI's embeddings endpoint for better similarity matching
        const articleEmbedding = await aiClient.post('/embeddings', {
            model: 'grok-2-1212',
            input: `${article.title}\n${article.content?.substring(0, 500) || ''}`
        });

        // Get embeddings for comparison articles
        const otherArticlesEmbeddings = await Promise.all(
            articles
                .filter(a => a.guid !== article.guid)
                .slice(0, 10)
                .map(async (a) => {
                    const response = await aiClient.post('/embeddings', {
                        model: 'grok-2-1212',
                        input: `${a.title}\n${a.content?.substring(0, 200) || ''}`
                    });
                    return {
                        article: a,
                        embedding: response.data.data[0].embedding
                    };
                })
        );

        // Calculate similarities using embeddings and cosine similarity
        const similarArticles = otherArticlesEmbeddings
            .map(({ article: a, embedding }) => ({
                article: a,
                similarity: cosineSimilarity(articleEmbedding.data.data[0].embedding, embedding)
            }))
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 5)  // Get top 5 most similar articles
            .map(({ article }) => article);

        return similarArticles;
    } catch (error) {
        console.error('Error finding similar articles:', error);
        return articles.slice(0, 5); // Return first 5 articles as fallback
    }
}

export async function getArticleRecommendations(readArticles: Article[], allArticles: Article[]): Promise<Article[]> {
    try {
        const response = await aiClient.post('/chat/completions', {
            model: 'grok-2-1212',
            messages: [
                {
                    role: 'system',
                    content: 'Given a list of articles a user has read and a list of available articles, return an array of indices (numbers) for the 10 most relevant recommendations. Respond with ONLY the array, example: [1,4,2,7,3,8,9,0,5,6]'
                },
                {
                    role: 'user',
                    content: JSON.stringify({
                        readArticles: readArticles.map(a => ({
                            title: a.title,
                            content: a.content?.substring(0, 200)
                        })),
                        availableArticles: allArticles.map((a, i) => ({
                            index: i,
                            title: a.title,
                            content: a.content?.substring(0, 200)
                        }))
                    })
                }
            ],
            temperature: 0.7
        });

        const indices = JSON.parse(response.data.choices[0].message.content);
        return indices
            .slice(0, 10)
            .map(index => allArticles[index])
            .filter(Boolean);
    } catch (error) {
        console.error('Error getting recommendations:', error);
        return allArticles.slice(0, 10);
    }
}

// Utility function for cosine similarity
function cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, a_i, i) => sum + a_i * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, a_i) => sum + a_i * a_i, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, b_i) => sum + b_i * b_i, 0));
    return dotProduct / (magnitudeA * magnitudeB);
}