const { SlashCommandBuilder } = require('discord.js');
const { requireQueue } = require('../music/distube');

module.exports = {
  data: new SlashCommandBuilder().setName('resume').setDescription('Muzigi devam ettir'),
  aliases: ['devam', 'unpause'],
  async execute(ctx) {
    const { queue, text } = requireQueue(ctx.guild, ctx.client);
    if (!queue) return ctx.reply(text);
    if (!queue.paused) return ctx.reply('Zaten caliyor.');
    queue.resume();
    return ctx.reply('Devam ediyor.');
  },
};
