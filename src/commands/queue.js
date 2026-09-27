const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { requireQueue } = require('../music/distube');
const config = require('../config');

module.exports = {
  data: new SlashCommandBuilder().setName('queue').setDescription('Kuyrugu goster'),
  aliases: ['q', 'kuyruk'],
  async execute(ctx) {
    const { queue, text } = requireQueue(ctx.guild, ctx.client);
    if (!queue) return ctx.reply(text);
    const lines = queue.songs.slice(0, 15).map((song, i) => {
      const prefix = i === 0 ? 'Calan' : `${i}.`;
      return `**${prefix}** ${song.name} \`${song.formattedDuration}\``;
    });
    const extra = queue.songs.length > 15 ? `\n... +${queue.songs.length - 15} parca` : '';
    return ctx.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(config.embedColor)
          .setTitle(`Kuyruk (${queue.songs.length})`)
          .setDescription(lines.join('\n') + extra),
      ],
    });
  },
};
