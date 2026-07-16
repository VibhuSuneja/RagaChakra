import React from 'react';

const YouTubeEmbed = ({ raga }) => {
  // Use the audioRef from the raga data, fallback to Yaman if missing
  const embedUrl = raga?.audioRefs?.[0] || 'https://www.youtube.com/embed/Pj1M3kE_l1s';

  return (
    <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#000', margin: 'var(--space-4) 0' }}>
      <iframe
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
        src={embedUrl}
        title={`${raga?.name || 'Raga'} Classical Performance`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default YouTubeEmbed;
