import { useState, useEffect } from 'react';
import { PodcastFeed, PodcastEpisode, PodcastState } from '@/types/podcast';

const RSS_FEED_URL = 'https://feed.pod.space/division9';

export const usePodcast = () => {
  const [state, setState] = useState<PodcastState>({
    feed: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const fetchPodcastFeed = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        
        // Use a CORS proxy to avoid CORS issues
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(RSS_FEED_URL)}`;
        const response = await fetch(proxyUrl);
        const data = await response.json();
        
        if (!data.contents) {
          throw new Error('Failed to fetch RSS feed');
        }

        // Parse the XML content
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data.contents, 'text/xml');
        
        // Extract podcast feed information
        const channel = xmlDoc.querySelector('channel');
        if (!channel) {
          throw new Error('Invalid RSS feed structure');
        }

        const title = channel.querySelector('title')?.textContent || 'Division9';
        const description = channel.querySelector('description')?.textContent || '';
        const link = channel.querySelector('link')?.textContent || '';
        const language = channel.querySelector('language')?.textContent || 'sv';
        const lastBuildDate = channel.querySelector('lastBuildDate')?.textContent || '';
        
        // Extract image
        const image = channel.querySelector('image');
        const imageUrl = image?.querySelector('url')?.textContent || '';

        // Extract episodes
        const items = channel.querySelectorAll('item');
        const episodes: PodcastEpisode[] = Array.from(items).map((item, index) => {
          const title = item.querySelector('title')?.textContent || '';
          const description = item.querySelector('description')?.textContent || '';
          const pubDate = item.querySelector('pubDate')?.textContent || '';
          const link = item.querySelector('link')?.textContent || '';
          const guid = item.querySelector('guid')?.textContent || '';
          
          // Extract duration from enclosure or itunes:duration
          const duration = item.querySelector('itunes\\:duration')?.textContent || 
                          item.querySelector('duration')?.textContent || '';
          
          // Extract audio URL from enclosure
          const enclosure = item.querySelector('enclosure');
          const audioUrl = enclosure?.getAttribute('url') || '';

          return {
            id: guid || `episode-${index}`,
            title,
            description,
            pubDate,
            duration,
            audioUrl,
            link,
            guid,
          };
        });

        const feed: PodcastFeed = {
          title,
          description,
          imageUrl,
          link,
          language,
          episodes,
          lastUpdated: lastBuildDate,
        };

        setState({
          feed,
          isLoading: false,
          error: null,
        });

      } catch (error) {
        console.error('Error fetching podcast feed:', error);
        setState({
          feed: null,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch podcast feed',
        });
      }
    };

    fetchPodcastFeed();
  }, []);

  return state;
}; 