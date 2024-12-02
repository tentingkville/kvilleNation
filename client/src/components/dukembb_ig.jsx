import React, { useEffect } from 'react';

const InstagramEmbedDukeMBB = () => {
  useEffect(() => {
    // Create a script element
    const script = document.createElement('script');
    script.async = true;
    script.src = "//www.instagram.com/embed.js";
    // Append the script to the body
    document.body.appendChild(script);

    // This function is provided by the Instagram embed script to process embeds
    script.onload = () => {
      window.instgrm && window.instgrm.Embeds.process();
    };
  }, []);

  return (
    <blockquote
      className="instagram-media"
      data-instgrm-permalink="https://www.instagram.com/dukembb/?utm_source=ig_embed&amp;utm_campaign=loading"
      data-instgrm-version="14"
      style={{
        background: '#FFF',
        border: '0',
        borderRadius: '3px',
        boxShadow: '0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)',
        margin: '1px',
        maxWidth: '540px',
        minWidth: '326px',
        padding: '0',
        width: '100%',
      }}
    >
      <div style={{ padding: '16px' }}>
        <a href="https://www.instagram.com/dukembb/?utm_source=ig_embed&amp;utm_campaign=loading"
           style={{ background: '#FFFFFF', lineHeight: '0', padding: '0 0', textAlign: 'center', textDecoration: 'none', width: '100%' }}
           target="_blank">
          View this profile on Instagram
        </a>
      </div>
      <p style={{
        color: '#c9c8cd',
        fontFamily: 'Arial,sans-serif',
        fontSize: '14px',
        lineHeight: '17px',
        marginBottom: '0',
        marginTop: '8px',
        overflow: 'hidden',
        padding: '8px 0 7px',
        textAlign: 'center',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        <a href="https://www.instagram.com/dukembb/?utm_source=ig_embed&amp;utm_campaign=loading"
           style={{ color: '#c9c8cd', fontFamily: 'Arial,sans-serif', fontSize: '14px', fontStyle: 'normal', fontWeight: 'normal', lineHeight: '17px' }}
           target="_blank">
          Duke Men’s Basketball (@dukembb) • Instagram photos and videos
        </a>
      </p>
    </blockquote>
  );
};

export default InstagramEmbedDukeMBB;
