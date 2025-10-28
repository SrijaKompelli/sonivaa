const axios = require('axios');

// Updated FMA API integration using their new API
const FMA_BASE = process.env.FMA_API_BASE || 'https://freemusicarchive.org/api/v1';

exports.searchFMA = async (q, limit = 20) => {
  try {
    // First search for tracks
    const url = `${FMA_BASE}/tracks`;
    const { data } = await axios.get(url, {
      params: {
        limit,
        q: q,
        sort: 'play_count',
        order: 'desc'
      },
      headers: {
        'Accept': 'application/json'
      }
    });

    // Map the response to our expected format
    return {
      dataset: data.data.map(track => ({
        track_id: track.track_id,
        title: track.track_title,
        artist_name: track.artist_name,
        genre: track.track_genres.map(g => g.genre_name).join(', '),
        track_url: track.track_url,
        duration: track.track_duration,
        stream_url: track.track_file_url
      }))
    };
  } catch (err) {
    console.warn('FMA search error:', err.message);
    return { dataset: [] };
  }
};