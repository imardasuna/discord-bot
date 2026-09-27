const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config');

module.exports = {
  data: new SlashCommandBuilder().setName('help').setDescription('Komut listesi'),
  aliases: ['yardim', 'h'],
  async execute(ctx) {
    const p = config.prefix;
    return ctx.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(config.embedColor)
          .setTitle('Sohbet muzik botu')
          .setDescription(
            [
              'Spotify sesini dogrudan akitmak yasal olarak mumkun degil.',
              'Bot parca adini Spotify\'dan alir, sesi YouTube/SoundCloud uzerinden calar.',
              '',
              '**Muzik**',
              `\`${p}play <sarki|link>\` / \`/play\`',
              `\`${p}pause\` \`${p}resume\` \`${p}skip\` \`${p}stop\``,
              `\`${p}queue\` \`${p}np\` \`${p}volume 80\` \`${p}shuffle\` \`${p}loop song\``,
              '',
              '**Spotify hesabin**',
              '`/spotify login` — hesabini bagla',
              '`/spotify liked` — begenilenler',
              '`/spotify playlists` — listelerin',
              '`/spotify recent` — son dinlenenler',
              '',
              'Spotify, YouTube ve SoundCloud linkleri `play` ile yapistirilabilir.',
            ].join('\n'),
          ),
      ],
    });
  },
};
