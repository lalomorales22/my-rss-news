import express from 'express';
import Parser from 'rss-parser';
import cors from 'cors';
import http from 'http';
import https from 'https';
import axios from 'axios';

const app = express();

// Create parser with custom options
const parser = new Parser({
  timeout: 15000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'application/rss+xml, application/xml, application/atom+xml, application/json, text/xml'
  },
  customFields: {
    item: [['media:content', 'media:content'], ['content:encoded', 'contentEncoded']]
  },
  defaultRSS: 2.0
});

// Configure agents to handle both HTTP and HTTPS
const httpAgent = new http.Agent({
  keepAlive: true
});

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
  keepAlive: true
});

app.use(cors());
app.use(express.json());

// Helper function to fetch RSS content with retries
async function fetchWithRetry(url: string, retries = 3): Promise<string> {
  try {
    const isHttps = url.startsWith('https://');
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, application/atom+xml, application/json, text/xml'
      },
      httpAgent: httpAgent,
      httpsAgent: httpsAgent,
      maxRedirects: 5,
      validateStatus: (status) => status < 500 // Accept all status codes less than 500
    });

    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.data;
  } catch (error) {
    if (retries > 0) {
      console.log(`Retry attempt ${4 - retries} for ${url}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchWithRetry(url, retries - 1);
    }
    throw error;
  }
}

// Fetch RSS articles endpoint
app.get('/api/fetch-rss', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL is required' });
    }

    console.log('Fetching RSS feed:', url);

    // First try to get the raw content
    const feedContent = await fetchWithRetry(url);
    
    // Then parse it
    const feed = await parser.parseString(feedContent);
    
    // Calculate date 2 days ago
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
    const articles = feed.items
      .filter(item => {
        try {
          const pubDate = item.pubDate ? new Date(item.pubDate) : null;
          return pubDate && pubDate >= twoDaysAgo;
        } catch (e) {
          console.error('Error parsing date:', e);
          return false;
        }
      })
      .map(item => {
        try {
          // Extract image URL from various possible sources
          let imageUrl = null;
          if (item['media:content']) {
            imageUrl = item['media:content'].$.url;
          } else if (item.enclosure) {
            imageUrl = item.enclosure.url;
          } else if (item['content:encoded']) {
            const match = item['content:encoded'].match(/<img[^>]+src="([^">]+)"/);
            if (match) imageUrl = match[1];
          }

          return {
            title: item.title || 'Untitled',
            content: item.content || item.contentSnippet || '',
            link: item.link || '',
            pubDate: item.pubDate || new Date().toISOString(),
            categories: item.categories || [],
            author: item.creator || item.author || 'Unknown',
            guid: item.guid || item.link || '',
            imageUrl: imageUrl
          };
        } catch (e) {
          console.error('Error processing item:', e);
          return null;
        }
      })
      .filter(item => item !== null);

    console.log(`Filtered ${articles.length} articles from the last 2 days`);
    return res.json(articles);
  } catch (error) {
    console.error('RSS fetching error:', error);
    return res.status(500).json({ 
      error: `Failed to fetch RSS feed: ${error.message}` 
    });
  }
});

// Validate RSS feed endpoint
app.get('/api/validate-rss', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ valid: false, error: 'URL is required' });
    }

    console.log('Validating RSS feed:', url);
    
    const feedContent = await fetchWithRetry(url);
    const feed = await parser.parseString(feedContent);
    
    return res.json({
      valid: true,
      title: feed.title || 'Untitled Feed',
      description: feed.description || '',
    });
  } catch (error) {
    console.error('RSS validation error:', error);
    return res.status(400).json({ 
      valid: false, 
      error: 'Invalid RSS feed or unable to fetch' 
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`API Server running on port ${PORT}`);
});