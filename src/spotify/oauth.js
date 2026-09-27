const express = require('express');
const config = require('../config');
const { exchangeCode, authUrl } = require('./client');
const store = require('./store');

function startSpotifyServer() {
  if (!config.spotify.clientId || !config.spotify.clientSecret) {
    console.warn('[spotify] Client ID/Secret yok. /spotify login calismaz, public linkler yine calisir.');
    return null;
  }

  const app = express();

  app.get('/login', (req, res) => {
    const userId = req.query.user;
    if (!userId) return res.status(400).send('Eksik kullanici.');
    res.redirect(authUrl(userId));
  });

  app.get('/callback', async (req, res) => {
    try {
      const { code, state: userId } = req.query;
      if (!code || !userId) {
        return res.status(400).send('Spotify yetkilendirme eksik.');
      }
      const tokens = await exchangeCode(code);
      store.set(String(userId), tokens);
      res.send(
        '<html><body style="font-family:sans-serif;background:#121212;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">' +
          '<div style="text-align:center"><h1 style="color:#1DB954">Spotify baglandi</h1>' +
          '<p>Bu sekmeyi kapatip Discord\'a donebilirsin.</p></div></body></html>',
      );
    } catch (error) {
      console.error('[spotify] callback', error);
      res.status(500).send('Baglanti basarisiz. Redirect URI ve client secret kontrol et.');
    }
  });

  return app.listen(config.spotify.port, '127.0.0.1', () => {
    console.log(`[spotify] OAuth sunucusu http://127.0.0.1:${config.spotify.port}`);
  });
}

function loginLink(userId) {
  const port = config.spotify.port;
  return `http://127.0.0.1:${port}/login?user=${encodeURIComponent(userId)}`;
}

module.exports = { startSpotifyServer, loginLink };
