const { SlashCommandBuilder } = require('discord.js');
const { requireQueue } = require('../music/distube');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Ses seviyesi (0-150)')
    .addIntegerOption((o) =>
      o.setName('seviye').setDescription('0-150').setMinValue(0).setMaxValue(150).setRequired(true),
    ),
  aliases: ['vol', 'ses'],
  async execute(ctx, args) {
    const { queue, text } = requireQueue(ctx.guild, ctx.client);
    if (!queue) return ctx.reply(text);
    const value = ctx.options?.getInteger('seviye') ?? Number(args[0]);
    if (Number.isNaN(value)) return ctx.reply('Ornek: `!volume 80`');
    queue.setVolume(value);
    return ctx.reply(`Ses: **${value}%**`);
  },
};
