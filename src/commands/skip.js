const { SlashCommandBuilder } = require('discord.js');
const { requireQueue } = require('../music/distube');

module.exports = {
  data: new SlashCommandBuilder().setName('skip').setDescription('Siradaki parcaya gec'),
  aliases: ['s', 'gec'],
  async execute(ctx) {
    const { queue, text } = requireQueue(ctx.guild, ctx.client);
    if (!queue) return ctx.reply(text);
    try {
      await queue.skip();
      return ctx.reply('Gecildi.');
    } catch (error) {
      return ctx.reply(error.message || 'Gecilmedi.');
    }
  },
};
