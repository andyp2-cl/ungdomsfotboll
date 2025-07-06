export interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  pubDate: string;
  duration: string;
  audioUrl: string;
  imageUrl?: string;
  link: string;
  guid: string;
}

export interface PodcastFeed {
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  language: string;
  episodes: PodcastEpisode[];
  lastUpdated: string;
}

export interface PodcastState {
  feed: PodcastFeed | null;
  isLoading: boolean;
  error: string | null;
} 