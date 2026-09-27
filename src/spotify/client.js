const SpotifyWebApi = require('spotify-web-api-node');
const config = require('../config');
const store = require('./store');

function createApi() {
  return new SpotifyWebApi({
    clientId: config.spotify.clientId,
    clientSecret: config.spotify.clientSecret,
    redirectUri: config.spotify.redirectUri,
  });
}

function authUrl(state) {
  const api = createApi();
  const scopes = [
    'user-read-email',
    'user-read-private',
    'user-library-read',
    'playlist-read-private',
    'playlist-read-collaborative',
    'user-top-read',
    'user-read-recently-played',
  ];
  return api.createAuthorizeURL(scopes, state, true);
}

async function exchangeCode(code) {
  const api = createApi();
  const { body } = await api.authorizationCodeGrant(code);
  return {
    accessToken: body.access_token,
    refreshToken: body.refresh_token,
    expiresAt: Date.now() + body.expires_in * 1000,
  };
}

async function apiForUser(userId) {
  const saved = store.get(userId);
  if (!saved?.refreshToken) {
    throw new Error('SPOTIFY_NOT_LINKED');
  }

  const api = createApi();
  api.setRefreshToken(saved.refreshToken);

  const needsRefresh = !saved.accessToken || Date.now() > (saved.expiresAt || 0) - 60_000;
  if (needsRefresh) {
    const { body } = await api.refreshAccessToken();
    const next = {
      accessToken: body.access_token,
      refreshToken: body.refresh_token || saved.refreshToken,
      expiresAt: Date.now() + body.expires_in * 1000,
    };
    store.set(userId, next);
    api.setAccessToken(next.accessToken);
  } else {
    api.setAccessToken(saved.accessToken);
  }

  return api;
}

function trackQuery(track) {
  const artists = (track.artists || []).map((a) => a.name).join(' ');
  return `${track.name} ${artists}`;
}

module.exports = {
  createApi,
  authUrl,
  exchangeCode,
  apiForUser,
  trackQuery,
};
