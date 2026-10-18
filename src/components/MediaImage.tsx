
import React, { useState, useEffect } from 'react';
import { getMediaUrl } from '../services/mediaStorage';

interface MediaImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  mediaId?: string;
  fallback?: string;
}

const MediaImage: React.FC<MediaImageProps> = ({ mediaId, fallback, ...props }) => {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let currentUrl: string | null = null;
    
    const loadMedia = async () => {
      if (!mediaId) {
        setUrl(null);
        return;
      }

      if (mediaId.startsWith('http') || mediaId.startsWith('data:')) {
        setUrl(mediaId);
      } else {
        const fetchedUrl = await getMediaUrl(mediaId);
        currentUrl = fetchedUrl;
        setUrl(fetchedUrl);
      }
    };

    loadMedia();

    return () => {
      if (currentUrl && currentUrl.startsWith('blob:')) {
        URL.revokeObjectURL(currentUrl);
      }
    };
  }, [mediaId]);

  return (
    <img 
      src={url || fallback || props.src} 
      {...props} 
      referrerPolicy="no-referrer"
    />
  );
};

export default MediaImage;
