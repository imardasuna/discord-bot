const { SlashCommandBuilder } = require('discord.js');
const { requireQueue, songEmbed } = require('../music/distube');

module.exports = {
  data: new SlashCommandBuilder().setName('nowplaying').setDescription('Simdi calani goster'),
  aliases: ['np', 'simdi'],
  async execute(ctx) {
    const { queue, text } = requireQueue(ctx.guild, ctx.client);
    if (!queue) return ctx.reply(text);
    return ctx.reply({ embeds: [songEmbed('Simdi caliyor', queue.songs[0])] });
  },
};
