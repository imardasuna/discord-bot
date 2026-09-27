const { SlashCommandBuilder } = require('discord.js');
const { requireQueue } = require('../music/distube');

const modes = { off: 0, song: 1, queue: 2 };

module.exports = {
  data: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Dongu modu')
    .addStringOption((o) =>
      o
        .setName('mod')
        .setDescription('off | song | queue')
        .setRequired(true)
        .addChoices(
          { name: 'kapali', value: 'off' },
          { name: 'sarki', value: 'song' },
          { name: 'kuyruk', value: 'queue' },
        ),
    ),
  aliases: ['repeat', 'dongu'],
  async execute(ctx, args) {
    const { queue, text } = requireQueue(ctx.guild, ctx.client);
    if (!queue) return ctx.reply(text);
    const raw = ctx.options?.getString('mod') || args[0] || 'song';
    const mode = modes[raw];
    if (mode === undefined) return ctx.reply('Kullanim: `!loop off|song|queue`');
    queue.setRepeatMode(mode);
    return ctx.reply(`Dongu: **${raw}**`);
  },
};
