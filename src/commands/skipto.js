const { SlashCommandBuilder } = require('discord.js');
const { requireQueue } = require('../music/distube');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skipto')
    .setDescription('Kuyrukta belirli siraya atla')
    .addIntegerOption((o) =>
      o.setName('sira').setDescription('Ornek: 5').setMinValue(2).setRequired(true),
    ),
  aliases: ['atla', 'jump'],
  async execute(ctx, args) {
    const { queue, text } = requireQueue(ctx.guild, ctx.client);
    if (!queue) return ctx.reply(text);
    const index = ctx.options?.getInteger('sira') ?? Number(args[0]);
    if (!index || index < 2 || index > queue.songs.length) {
      return ctx.reply('Gecerli bir sira yaz. `/queue` ile numaralara bak.');
    }
    try {
      if (typeof queue.jump === 'function') {
        await queue.jump(index - 1);
      } else {
        queue.songs.splice(1, index - 2);
        await queue.skip();
      }
      return ctx.reply(index + '. parcaya atlandi.');
    } catch (error) {
      return ctx.reply(error.message || 'Atlanamadi.');
    }
  },
};
