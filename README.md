# RSS News Aggregator
<img width="1206" alt="Screenshot 2024-12-15 at 12 01 44 AM" src="https://github.com/user-attachments/assets/fbf59728-0234-42c3-a76a-7b299ab63c56" />

A modern RSS feed reader that allows you to aggregate, filter, and share news from multiple sources. Built with React, TypeScript, and Supabase.

![App Screenshot Placeholder]

## Features

- 📰 Subscribe to multiple RSS feeds
- 🔍 Search across all articles
- 🏷️ Filter by categories and sources
- 📱 Responsive design
- 🎯 Smart categorization of articles
- 📤 Create and share article playlists
- ⚡ Real-time updates
- 🌓 2-day article retention

## Tech Stack

- Frontend:
  - React
  - TypeScript
  - Tailwind CSS
  - Vite
  - date-fns
  - Lucide Icons

- Backend:
  - Supabase (Database & Authentication)
  - Express
  - RSS Parser

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Supabase account

### Setup Supabase

1. Create a new Supabase project

2. Create the following table in your Supabase database:
```sql
CREATE TABLE feeds (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  url TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  last_fetched_at TIMESTAMP WITH TIME ZONE
);
```

3. Set up the following environment variables in your Supabase project dashboard under Project Settings > API:
   - Copy the URL and anon/public key

### Installation

1. Clone the repository
```bash
git clone https://github.com/lalomorales22/my-rss-news.git
cd my-rss-news
```

2. Install dependencies
```bash
npm install
```

3. Rename '.env.example' to `.env` in the root directory and add your Supabase credentials:
```env
VITE_SUPABASE_URL==your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_XAI_API_KEY=your_xai_key
```

4. Start the development server
```bash
npm run dev
```

The app should now be running on http://localhost:5173

## Usage

### Adding RSS Feeds

1. Enter the RSS feed URL
2. Click the "Add Feed" button
3. The feed will be validated and added to your list

### Creating a Playlist

1. Browse your articles
2. Click "Create Playlist"
3. Select articles you want to share
4. Click "Share" to post to X (Twitter)

### Filtering Content

- Use the search bar to find specific articles
- Filter by feed source using the sidebar
- Filter by topic/category using the tags
- Sort by newest or oldest

### XAI Grok Integration

- Click the brain Icon to get a summary and related stories

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with React, Vite, and TypeScript
- Styled with Tailwind CSS
- Backend powered by Supabase
- Icons by Lucide Icons
- RSS parsing by rss-parser

## Support

If you have any questions or run into issues, please open an issue in this repository.
