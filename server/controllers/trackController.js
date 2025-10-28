const Track = require('../models/Track');
const sampleTracks = require('../data/sampleTracks');
const axios = require('axios');

const SPOTIFY_API_URL = 'https://v1.nocodeapi.com/srijakompelli/spotify/vNqOiqHByEOISGar';

exports.search = async (req, res) => {
  const q = req.query.q?.toLowerCase() || '';
  console.log('Search called with q:', q);
  try {
    // Fetch from Spotify API
    const spotifyResponse = await axios.get(`${SPOTIFY_API_URL}/search`, {
      params: {
        q: q || 'popular',
        type: 'track',
        limit: 20
      }
    });

    console.log('Spotify search response status:', spotifyResponse.status);
    console.log('Spotify search response data keys:', Object.keys(spotifyResponse.data));

    // Check if response has tracks
    if (!spotifyResponse.data || !spotifyResponse.data.tracks || !spotifyResponse.data.tracks.items) {
      console.error('Unexpected response structure:', spotifyResponse.data);
      return res.status(500).json({ error: 'Unexpected API response structure' });
    }

    const spotifyTracks = spotifyResponse.data.tracks.items.map(track => {
      const hasPreview = !!track.preview_url;
      console.log(`Track "${track.name}" has preview: ${hasPreview}, preview_url: ${track.preview_url}`);
      return {
        title: track.name,
        artist: track.artists.map(a => a.name).join(', '),
        genre: track.album.genres ? track.album.genres.join(', ') : 'Unknown',
        duration: `${Math.floor(track.duration_ms / 60000)}:${((track.duration_ms % 60000) / 1000).toFixed(0).padStart(2, '0')}`,
        url: track.preview_url || track.external_urls.spotify,
        coverImage: track.album.images[0]?.url || 'https://via.placeholder.com/300',
        mood: ['popular'], // Default mood
        hasPreview: hasPreview
      };
    });

    console.log('Mapped tracks count:', spotifyTracks.length);
    res.json(spotifyTracks);
  } catch (err) {
    console.error('Search error:', err.message);
    if (err.response) {
      console.error('Error response status:', err.response.status);
      console.error('Error response data:', err.response.data);
    }
    res.status(500).json({ error: 'Failed to fetch tracks from Spotify' });
  }
};

exports.getTracks = async (req, res) => {
  console.log('getTracks called');
  try {
    // If a mood query is provided, return saved tracks from the DB that match the mood
    const moodQuery = req.query.mood;
    if (moodQuery) {
      console.log('Fetching tracks from DB with mood:', moodQuery);
      // case-insensitive exact match on mood values
      const regex = new RegExp(`^${moodQuery}$`, 'i');
      const dbTracks = await Track.find({ moods: { $in: [regex] } }).lean();
      // Map DB documents to the same response shape the client expects
      const mapped = (dbTracks || []).map(t => ({
        _id: t._id,
        title: t.title,
        artist: t.artist,
        genre: t.genre,
        duration: t.duration,
        url: t.url,
        coverImage: t.coverImage || 'https://via.placeholder.com/300',
        moods: t.moods || [],
        hasPreview: !!t.url
      }));
      return res.json(mapped);
    }

    // Fetch popular tracks from Spotify using search
    const spotifyResponse = await axios.get(`${SPOTIFY_API_URL}/search`, {
      params: {
        q: 'popular',
        type: 'track',
        limit: 20
      }
    });

    console.log('Spotify getTracks response status:', spotifyResponse.status);
    console.log('Spotify getTracks response data keys:', Object.keys(spotifyResponse.data));

    // Check if response has tracks
    if (!spotifyResponse.data || !spotifyResponse.data.tracks || !spotifyResponse.data.tracks.items) {
      console.error('Unexpected response structure:', spotifyResponse.data);
      return res.status(500).json({ error: 'Unexpected API response structure' });
    }

    const spotifyTracks = spotifyResponse.data.tracks.items.map(track => {
      const hasPreview = !!track.preview_url;
      console.log(`Track "${track.name}" has preview: ${hasPreview}, preview_url: ${track.preview_url}`);
      return {
        title: track.name,
        artist: track.artists.map(a => a.name).join(', '),
        genre: track.album.genres ? track.album.genres.join(', ') : 'Unknown',
        duration: `${Math.floor(track.duration_ms / 60000)}:${((track.duration_ms % 60000) / 1000).toFixed(0).padStart(2, '0')}`,
        url: track.preview_url || track.external_urls.spotify,
        coverImage: track.album.images[0]?.url || 'https://via.placeholder.com/300',
        mood: ['popular'], // Default mood
        hasPreview: hasPreview
      };
    });

    console.log('getTracks mapped tracks count:', spotifyTracks.length);
    res.json(spotifyTracks);
  } catch (err) {
    console.error('Get tracks error:', err.message);
    if (err.response) {
      console.error('Error response status:', err.response.status);
      console.error('Error response data:', err.response.data);
    }
    res.status(500).json({ error: 'Failed to fetch tracks from Spotify or DB' });
  }
};

exports.saveTrack = async (req, res) => {
  try {
    const { title, artist, genre, url, duration, coverImage, mood } = req.body;
    let track = await Track.findOne({ url });
    if (!track) {
      track = new Track({ title, artist, genre, url, duration, coverImage, metadata: {}, moods: Array.isArray(mood) ? mood : (mood ? [mood] : []) });
      await track.save();
    }
    res.json(track);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.proxyAudio = async (req, res) => {
  console.log('Proxy audio called with url:', req.query.url);
  try {
    const { url } = req.query;
    if (!url) return res.status(400).send('URL required');

    // If it's a Spotify preview URL, try to get the actual audio
    if (url.includes('p.scdn.co')) {
      console.log('Fetching Spotify preview audio from:', url);
      const response = await axios.get(url, {
        responseType: 'stream',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Range': 'bytes=0-'
        }
      });
      console.log('Response status:', response.status);
      console.log('Content-Type:', response.headers['content-type']);
      res.setHeader('Content-Type', response.headers['content-type'] || 'audio/mpeg');
      res.setHeader('Accept-Ranges', 'bytes');
      response.data.pipe(res);
    } else {
      // For non-preview URLs, redirect to Spotify web player
      console.log('Redirecting to Spotify web player:', url);
      res.redirect(url);
    }
  } catch (err) {
    console.error('Proxy error:', err.message);
    if (err.response) {
      console.error('Proxy error response data:', err.response.data);
      console.error('Proxy error response status:', err.response.status);
      console.error('Proxy error response headers:', err.response.headers);
    }
    res.status(500).send('Proxy error');
  }
};
