import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { RSSFeed } from '../types';

export function useFeeds() {
  const [feeds, setFeeds] = useState<RSSFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeeds = async () => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('feeds')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;
      setFeeds(data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch feeds');
      console.error('Error fetching feeds:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeds();
  }, []);

  return { feeds, loading, error, refetch: fetchFeeds };
}