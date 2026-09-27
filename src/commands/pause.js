const { SlashCommandBuilder } = require('discord.js');
const { requireQueue } = require('../music/distube');

module.exports = {
  data: new SlashCommandBuilder().setName('pause').setDescription('Muzigi duraklat'),
  aliases: ['duraklat'],
  async execute(ctx) {
    const { queue, text } = requireQueue(ctx.guild, ctx.client);
    if (!queue) return ctx.reply(text);
    if (queue.paused) return ctx.reply('Zaten duraklatildi.');
    queue.pause();
    return ctx.reply('Duraklatildi.');
  },
};
