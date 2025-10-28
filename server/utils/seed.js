const Track = require('../models/Track');
const sampleTracks = require('../data/sampleTracks');

function parseDuration(dur) {
  if (typeof dur === 'number') return dur;
  const parts = dur.split(':');
  if (parts.length === 2) {
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  }
  return 0;
}

async function seedSampleTracks() {
  try {
    const existing = await Track.countDocuments();
    if (existing > 0) {
      console.log('Tracks already exist in DB, dropping and reseeding');
      await Track.deleteMany({});
    }
    const docs = sampleTracks.map(t => ({
      fmaId: t.fmaId || undefined,
      title: t.title,
      artist: t.artist,
      genre: t.genre,
      coverImage: t.coverImage,
      url: t.url,
      duration: parseDuration(t.duration),
      metadata: t.metadata || {},
      moods: t.mood || t.moods || []
    }));
    await Track.insertMany(docs);
    console.log('Seeded sample tracks into DB');
  } catch (err) {
    console.error('Seeding sample tracks failed', err.message);
  }
}

module.exports = { seedSampleTracks };
