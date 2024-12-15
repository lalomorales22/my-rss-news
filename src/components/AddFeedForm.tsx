import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { validateRSSFeed } from '../utils/rss';

interface AddFeedFormProps {
  onFeedAdded: () => void;
}

export function AddFeedForm({ onFeedAdded }: AddFeedFormProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await validateRSSFeed(url);
      if (!data.valid) {
        setError('Invalid RSS feed URL');
        return;
      }

      const { error: supabaseError } = await supabase
        .from('feeds')
        .insert([{ url, title: data.title, description: data.description }]);

      if (supabaseError) throw supabaseError;

      setUrl('');
      onFeedAdded();
    } catch (err) {
      setError('Failed to add feed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter RSS feed URL"
          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center gap-2"
        >
          <PlusCircle className="w-5 h-5" />
          Add Feed
        </button>
      </div>
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </form>
  );
}