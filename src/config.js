require('dotenv').config();

function required(name) {
  const value = process.env[name];
  if (!value) {
    console.warn(`[uyari] ${name} .env icinde bos. Bot bazi ozellikleri kullanamayabilir.`);
  }
  return value || '';
}

module.exports = {
  token: required('DISCORD_TOKEN'),
  clientId: required('DISCORD_CLIENT_ID'),
  guildId: process.env.DISCORD_GUILD_ID || '',
  prefix: process.env.PREFIX || '!',
  spotify: {
    clientId: process.env.SPOTIFY_CLIENT_ID || '',
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET || '',
    redirectUri: process.env.SPOTIFY_REDIRECT_URI || 'http://127.0.0.1:8888/callback',
    port: Number(process.env.SPOTIFY_OAUTH_PORT || 8888),
  },
  embedColor: 0x1db954,
};
