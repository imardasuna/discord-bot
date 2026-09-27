const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config');
const store = require('../spotify/store');
const { apiForUser, trackQuery } = require('../spotify/client');
const { loginLink } = require('../spotify/oauth');
const { playQuery } = require('../music/distube');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('spotify')
    .setDescription('Spotify hesabini bagla ve listelerini cal')
    .addSubcommand((s) => s.setName('login').setDescription('Spotify hesabini bagla'))
    .addSubcommand((s) => s.setName('logout').setDescription('Spotify baglantisini kes'))
    .addSubcommand((s) => s.setName('durum').setDescription('Baglanti durumunu goster'))
    .addSubcommand((s) =>
      s.setName('liked').setDescription('Begenilen sarkilardan cal (ilk 30)'),
    )
    .addSubcommand((s) =>
      s.setName('recent').setDescription('Son dinlediklerinden cal (ilk 20)'),
    )
    .addSubcommand((s) =>
      s
        .setName('playlists')
        .setDescription('Spotify listelerini goster veya birini cal')
        .addIntegerOption((o) =>
          o.setName('numara').setDescription('Calmak icin listedeki sira no').setMinValue(1),
        ),
    ),
  aliases: ['sp'],
  async execute(ctx, args) {
    const sub = ctx.options?.getSubcommand?.() || args[0] || 'durum';
    const userId = ctx.user?.id || ctx.author.id;

    if (sub === 'login') {
      if (!config.spotify.clientId) {
        return ctx.reply({
          content: 'SPOTIFY_CLIENT_ID / SECRET .env icine yazilmamis.',
          ephemeral: true,
        });
      }
      const url = loginLink(userId);
      const body =
        'Spotify baglamak icin bu linki **botun calistigi bilgisayarda** ac:\n' +
        url +
        '\n\nSpotify Dashboard\'da Redirect URI `http://127.0.0.1:8888/callback` olmali.';
      try {
        await (ctx.user || ctx.author).send(body);
        return ctx.reply({ content: 'Linki DM olarak attim.', ephemeral: true });
      } catch {
        return ctx.reply({ content: body, ephemeral: true });
      }
    }

    if (sub === 'logout') {
      store.remove(userId);
      return ctx.reply({ content: 'Spotify baglantisi silindi.', ephemeral: true });
    }

    if (sub === 'durum') {
      const saved = store.get(userId);
      return ctx.reply({
        content: saved
          ? 'Spotify hesabin bagli. `/spotify liked` veya `/spotify playlists` dene.'
          : 'Bagli degil. `/spotify login` yaz.',
        ephemeral: true,
      });
    }

    let api;
    try {
      api = await apiForUser(userId);
    } catch (error) {
      if (error.message === 'SPOTIFY_NOT_LINKED') {
        return ctx.reply('Once `/spotify login` ile hesabini bagla.');
      }
      return ctx.reply(`Spotify hatasi: ${error.message}`);
    }

    if (sub === 'liked') {
      const { body } = await api.getMySavedTracks({ limit: 30 });
      const tracks = body.items.map((i) => i.track).filter(Boolean);
      return playTracks(ctx, tracks, 'Begenilen sarkilar');
    }

    if (sub === 'recent') {
      const { body } = await api.getMyRecentlyPlayedTracks({ limit: 20 });
      const tracks = body.items.map((i) => i.track).filter(Boolean);
      return playTracks(ctx, tracks, 'Son dinlenenler');
    }

    if (sub === 'playlists' || sub === 'list') {
      const { body } = await api.getUserPlaylists({ limit: 20 });
      const lists = body.items || [];
      if (!lists.length) return ctx.reply('Hic calma listen yok (veya gizli).');

      const index =
        ctx.options?.getInteger('numara') ??
        (args[1] ? Number(args[1]) : NaN);

      if (!index) {
        const desc = lists
          .map((p, i) => `**${i + 1}.** ${p.name} (${p.tracks.total} parca)`)
          .join('\n');
        return ctx.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(config.embedColor)
              .setTitle('Spotify listelerin')
              .setDescription(desc + '\n\nCalmak icin `/spotify playlists numara:1`'),
          ],
        });
      }

      const playlist = lists[index - 1];
      if (!playlist) return ctx.reply('O numarada liste yok.');
      const tracks = [];
      let offset = 0;
      while (tracks.length < 50) {
        const page = await api.getPlaylistTracks(playlist.id, { limit: 50, offset });
        const batch = page.body.items.map((i) => i.track).filter((t) => t && t.id);
        tracks.push(...batch);
        if (!page.body.next || batch.length === 0) break;
        offset += 50;
      }
      return playTracks(ctx, tracks, playlist.name);
    }

    return ctx.reply('Alt komut: `login`, `logout`, `durum`, `liked`, `recent`, `playlists`');
  },
};

async function playTracks(ctx, tracks, title) {
  if (!tracks.length) return ctx.reply('Parca bulunamadi.');
  const queries = tracks.map(trackQuery);
  if (ctx.deferReply) await ctx.deferReply();
  else await ctx.reply(`**${title}** kuyruga ekleniyor (${queries.length} parca)...`);

  const first = await playQuery(ctx, queries[0]);
  if (!first.ok) {
    if (ctx.editReply) return ctx.editReply(first.text);
    return ctx.channel.send(first.text);
  }

  const voice = ctx.member.voice.channel;
  for (const q of queries.slice(1)) {
    try {
      await ctx.client.distube.play(voice, q, {
        member: ctx.member,
        textChannel: ctx.channel,
      });
    } catch (error) {
      console.warn('[spotify] parca atlandi', q, error.message);
    }
  }

  const done = `**${title}** — ${queries.length} parca kuyrukta.`;
  if (ctx.editReply) return ctx.editReply(done);
}
