const express = require('express');
const router = express.Router();
const axios = require('axios');
const querystring = require('querystring');
const config = require('../config');

const CLIENT_ID = config.spotify.clientId;
const CLIENT_SECRET = config.spotify.clientSecret;
const REDIRECT_URI = config.spotify.redirectUri;

// Generate a random string for state
function generateRandomString(length) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

// Login route
router.get('/login', (req, res) => {
  const state = generateRandomString(16);
  req.session.state = state;

  const scope = 'user-read-private user-read-email user-top-read user-library-read playlist-read-private playlist-read-collaborative';

  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: CLIENT_ID,
      scope: scope,
      redirect_uri: REDIRECT_URI,
      state: state
    }));
});

// Callback route
router.get('/callback', async (req, res) => {
  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState = req.session.state || null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
    return;
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      data: querystring.stringify({
        code: code,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code'
      }),
      headers: {
        'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    // Get access token and refresh token
    const { access_token, refresh_token, expires_in } = tokenResponse.data;
    
    // Save tokens to session
    req.session.access_token = access_token;
    req.session.refresh_token = refresh_token;
    
    // Get user data
    const userResponse = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': 'Bearer ' + access_token
      }
    });
    
    req.session.user = userResponse.data;
    
    // Redirect to dashboard
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error in callback:', error.message);
    res.redirect('/#' +
      querystring.stringify({
        error: 'invalid_token'
      }));
  }
});

// Refresh token route
router.get('/refresh_token', async (req, res) => {
  const refresh_token = req.session.refresh_token;
  
  if (!refresh_token) {
    return res.status(400).json({ error: 'No refresh token provided' });
  }

  try {
    const response = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      data: querystring.stringify({
        grant_type: 'refresh_token',
        refresh_token: refresh_token
      }),
      headers: {
        'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const { access_token, expires_in } = response.data;
    req.session.access_token = access_token;
    
    res.json({ access_token, expires_in });
  } catch (error) {
    console.error('Error refreshing token:', error.message);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

// Logout route
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
