const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config');
const { requireQueue } = require('../music/distube');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lyrics')
    .setDescription('Calan sarkinin veya aradigin sarkinin sozleri')
    .addStringOption((o) =>
      o.setName('sarki').setDescription('Bos birakirsan su an calani kullanir'),
    ),
  aliases: ['soz', 'sozler', 'ly'],
  async execute(ctx, args) {
    let query = ctx.options?.getString('sarki') || args.join(' ');
    if (!query) {
      const { queue } = requireQueue(ctx.guild, ctx.client);
      query = queue?.songs?.[0]?.name;
    }
    if (!query) return ctx.reply('Sarki adi yaz veya once bir sey cal.');

    if (ctx.deferReply) await ctx.deferReply();
    else await ctx.reply('Sozler araniyor...');

    try {
      const url =
        'https://lrclib.net/api/search?q=' + encodeURIComponent(query);
      const res = await fetch(url, { headers: { 'User-Agent': 'discord-bot/1.0' } });
      if (!res.ok) throw new Error('Lyrics API ' + res.status);
      const results = await res.json();
      const hit = results.find((r) => r.plainLyrics) || results[0];
      if (!hit || !hit.plainLyrics) {
        const msg = 'Soz bulunamadi: ' + query;
        if (ctx.editReply) return ctx.editReply(msg);
        return ctx.channel.send(msg);
      }

      let text = hit.plainLyrics.slice(0, 3900);
      if (hit.plainLyrics.length > 3900) text += '\n...';

      const embed = new EmbedBuilder()
        .setColor(config.embedColor)
        .setTitle((hit.trackName || query) + ' — ' + (hit.artistName || ''))
        .setDescription(text);

      if (ctx.editReply) return ctx.editReply({ content: null, embeds: [embed] });
      return ctx.channel.send({ embeds: [embed] });
    } catch (error) {
      const msg = 'Sozler alinamadi: ' + error.message;
      if (ctx.editReply) return ctx.editReply(msg);
      return ctx.channel.send(msg);
    }
  },
};
