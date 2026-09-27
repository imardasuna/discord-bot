const { DisTube } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');
const { SoundCloudPlugin } = require('@distube/soundcloud');
const { YtDlpPlugin } = require('@distube/yt-dlp');
const { EmbedBuilder } = require('discord.js');
const config = require('../config');

function songEmbed(title, song) {
  return new EmbedBuilder()
    .setColor(config.embedColor)
    .setTitle(title)
    .setDescription(`[${song.name}](${song.url})`)
    .addFields(
      { name: 'Sure', value: song.formattedDuration || '?', inline: true },
      { name: 'Istek', value: song.user ? `<@${song.user.id}>` : '-', inline: true },
    )
    .setThumbnail(song.thumbnail || null);
}

function setupDistube(client) {
  const plugins = [new SoundCloudPlugin(), new YtDlpPlugin({ update: true })];

  if (config.spotify.clientId && config.spotify.clientSecret) {
    plugins.unshift(
      new SpotifyPlugin({
        emitEventsAfterFetching: true,
        api: {
          clientId: config.spotify.clientId,
          clientSecret: config.spotify.clientSecret,
          topTracksCountry: 'TR',
        },
      }),
    );
  } else {
    plugins.unshift(new SpotifyPlugin({ emitEventsAfterFetching: true }));
  }

  const distube = new DisTube(client, {
    emitNewSongOnly: true,
    plugins,
  });

  distube
    .on('playSong', (queue, song) => {
      queue.textChannel?.send({ embeds: [songEmbed('Simdi caliyor', song)] }).catch(() => {});
    })
    .on('addSong', (queue, song) => {
      queue.textChannel?.send({ embeds: [songEmbed('Kuyruga eklendi', song)] }).catch(() => {});
    })
    .on('addList', (queue, playlist) => {
      queue.textChannel
        ?.send({
          embeds: [
            new EmbedBuilder()
              .setColor(config.embedColor)
              .setTitle('Calma listesi eklendi')
              .setDescription(
                `[${playlist.name}](${playlist.url || playlist.source}) — ${playlist.songs.length} parca`,
              ),
          ],
        })
        .catch(() => {});
    })
    .on('error', (first, second) => {
      const error = first instanceof Error ? first : second;
      const queueOrChannel = first instanceof Error ? second : first;
      console.error('[distube]', error);
      const channel = queueOrChannel?.textChannel || (queueOrChannel?.send ? queueOrChannel : null);
      channel
        ?.send(`Muzik hatasi: ${error?.message?.slice(0, 300) || error}`)
        .catch(() => {});
    })
    .on('empty', (queue) => {
      queue.textChannel?.send('Ses kanali bosaldi, cikiyorum.').catch(() => {});
    })
    .on('finish', (queue) => {
      queue.textChannel?.send('Kuyruk bitti.').catch(() => {});
    });

  return distube;
}

async function playQuery(interactionOrMessage, query) {
  const member = interactionOrMessage.member;
  const voice = member?.voice?.channel;
  if (!voice) {
    return { ok: false, text: 'Once bir ses kanalina gir.' };
  }

  const textChannel = interactionOrMessage.channel;
  await interactionOrMessage.client.distube.play(voice, query, {
    member,
    textChannel,
    metadata: { textChannel },
  });
  return { ok: true };
}

function requireQueue(guild, client) {
  const queue = client.distube.getQueue(guild);
  if (!queue) return { queue: null, text: 'Su anda calan bir sey yok.' };
  return { queue };
}

module.exports = { setupDistube, playQuery, requireQueue, songEmbed };
