
export const getEmbedUrl = (url: string): string => {
  if (!url) return '';

  // YouTube
  // Handles:
  // - youtube.com/watch?v=ID
  // - youtube.com/v/ID
  // - youtube.com/embed/ID
  // - youtu.be/ID
  // - youtube.com/shorts/ID
  const ytRegex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const ytMatch = url.match(ytRegex);
  if (ytMatch && ytMatch[2].length === 11) {
    return `https://www.youtube.com/embed/${ytMatch[2]}`;
  }

  // Vimeo
  // Handles:
  // - vimeo.com/ID
  // - player.vimeo.com/video/ID
  const vimeoRegex = /(?:https?:\/\/)?(?:www\.)?(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  return url;
};
