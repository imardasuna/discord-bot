const { SlashCommandBuilder } = require('discord.js');
const { requireQueue } = require('../music/distube');

module.exports = {
  data: new SlashCommandBuilder().setName('stop').setDescription('Durdur ve kanaldan cik'),
  aliases: ['leave', 'ayril', 'dur'],
  async execute(ctx) {
    const { queue, text } = requireQueue(ctx.guild, ctx.client);
    if (!queue) return ctx.reply(text);
    await queue.stop();
    return ctx.reply('Durduruldu, kanaldan ciktım.');
  },
};
