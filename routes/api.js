const express = require('express');
const router = express.Router();
const axios = require('axios');

// Middleware to check if user is authenticated
function ensureAuthenticated(req, res, next) {
  if (!req.session.access_token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Get user's top tracks
router.get('/top-tracks', ensureAuthenticated, async (req, res) => {
  try {
    const response = await axios.get('https://api.spotify.com/v1/me/top/tracks', {
      headers: {
        'Authorization': 'Bearer ' + req.session.access_token
      },
      params: {
        limit: 20,
        time_range: req.query.time_range || 'medium_term'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching top tracks:', error.message);
    res.status(500).json({ error: 'Failed to fetch top tracks' });
  }
});

// Get user's top artists
router.get('/top-artists', ensureAuthenticated, async (req, res) => {
  try {
    const response = await axios.get('https://api.spotify.com/v1/me/top/artists', {
      headers: {
        'Authorization': 'Bearer ' + req.session.access_token
      },
      params: {
        limit: 20,
        time_range: req.query.time_range || 'medium_term'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching top artists:', error.message);
    res.status(500).json({ error: 'Failed to fetch top artists' });
  }
});

// Get user's playlists
router.get('/playlists', ensureAuthenticated, async (req, res) => {
  try {
    const response = await axios.get('https://api.spotify.com/v1/me/playlists', {
      headers: {
        'Authorization': 'Bearer ' + req.session.access_token
      },
      params: {
        limit: 50
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching playlists:', error.message);
    res.status(500).json({ error: 'Failed to fetch playlists' });
  }
});

// Get tracks from a playlist
router.get('/playlist/:id', ensureAuthenticated, async (req, res) => {
  try {
    const response = await axios.get(`https://api.spotify.com/v1/playlists/${req.params.id}`, {
      headers: {
        'Authorization': 'Bearer ' + req.session.access_token
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching playlist:', error.message);
    res.status(500).json({ error: 'Failed to fetch playlist' });
  }
});

// Search for tracks, artists, albums
router.get('/search', ensureAuthenticated, async (req, res) => {
  try {
    const response = await axios.get('https://api.spotify.com/v1/search', {
      headers: {
        'Authorization': 'Bearer ' + req.session.access_token
      },
      params: {
        q: req.query.q,
        type: req.query.type || 'track,artist,album',
        limit: req.query.limit || 20
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error searching:', error.message);
    res.status(500).json({ error: 'Failed to search' });
  }
});

module.exports = router;
