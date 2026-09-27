const { SlashCommandBuilder } = require('discord.js');
const { requireQueue } = require('../music/distube');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Kuyruktan sira numarasiyla parca sil')
    .addIntegerOption((o) =>
      o.setName('sira').setDescription('1 = calan, 2 = sonraki...').setMinValue(2).setRequired(true),
    ),
  aliases: ['rm', 'sil'],
  async execute(ctx, args) {
    const { queue, text } = requireQueue(ctx.guild, ctx.client);
    if (!queue) return ctx.reply(text);
    const index = ctx.options?.getInteger('sira') ?? Number(args[0]);
    if (!index || index < 2 || index > queue.songs.length) {
      return ctx.reply('Gecerli bir sira yaz. Calan parcayi silmek icin `/skip` kullan.');
    }
    const removed = queue.songs.splice(index - 1, 1)[0];
    return ctx.reply('Silindi: **' + (removed?.name || index) + '**');
  },
};
