import React from 'react';
import { extractYouTubeId, extractSpotifyId } from '../../utils/helpers';

interface MediaEmbedProps {
  embedData: {
    type: 'youtube' | 'spotify' | 'image' | 'link';
    url: string;
    title?: string;
  };
}

export const MediaEmbed: React.FC<MediaEmbedProps> = ({ embedData }) => {
  if (embedData.type === 'youtube') {
    const videoId = extractYouTubeId(embedData.url);
    if (!videoId) return null;
    
    return (
      <div className="relative aspect-video rounded-lg overflow-hidden">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full"
        />
      </div>
    );
  }

  if (embedData.type === 'spotify') {
    const spotifyData = extractSpotifyId(embedData.url);
    if (!spotifyData) return null;
    
    return (
      <div className="rounded-lg overflow-hidden">
        <iframe
          src={`https://open.spotify.com/embed/${spotifyData.type}/${spotifyData.id}`}
          width="100%"
          height="80"
          frameBorder="0"
          allow="encrypted-media"
          className="rounded-lg"
        />
      </div>
    );
  }

  if (embedData.type === 'image') {
    return (
      <img
        src={embedData.url}
        alt={embedData.title || 'Embedded image'}
        className="max-w-full rounded-lg cursor-pointer"
        onClick={() => window.open(embedData.url, '_blank')}
      />
    );
  }

  if (embedData.type === 'link') {
    return (
      <a
        href={embedData.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[var(--accent)] hover:underline break-all"
      >
        {embedData.title || embedData.url}
      </a>
    );
  }

  return null;
};
