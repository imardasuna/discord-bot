const { SlashCommandBuilder } = require('discord.js');
const { playQuery } = require('../music/distube');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Sarki, Spotify/YouTube linki veya arama cal')
    .addStringOption((o) =>
      o.setName('sorgu').setDescription('Sarki adi veya link').setRequired(true),
    ),
  aliases: ['p', 'cal'],
  async execute(ctx, args) {
    const query =
      ctx.options?.getString('sorgu') || args.join(' ');
    if (!query) return ctx.reply('Ne calmami istiyorsun? Ornek: `!play drex atlanta`');
    const pending = ctx.deferReply ? ctx.deferReply() : ctx.reply('Ariyorum...');
    await pending;
    try {
      const result = await playQuery(ctx, query);
      if (!result.ok) {
        if (ctx.editReply) return ctx.editReply(result.text);
        return ctx.channel.send(result.text);
      }
      if (ctx.editReply) await ctx.editReply('Kuyruga alindi.');
    } catch (error) {
      const msg = `Calinamadi: ${error.message?.slice(0, 300) || error}`;
      if (ctx.editReply) return ctx.editReply(msg);
      return ctx.channel.send(msg);
    }
  },
};
