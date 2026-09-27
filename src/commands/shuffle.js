const { SlashCommandBuilder } = require('discord.js');
const { requireQueue } = require('../music/distube');

module.exports = {
  data: new SlashCommandBuilder().setName('shuffle').setDescription('Kuyrugu karistir'),
  aliases: ['karistir'],
  async execute(ctx) {
    const { queue, text } = requireQueue(ctx.guild, ctx.client);
    if (!queue) return ctx.reply(text);
    queue.shuffle();
    return ctx.reply('Kuyruk karistirildi.');
  },
};
