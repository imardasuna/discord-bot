const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const config = require('../config');

function pages() {
  const p = config.prefix;
  return {
    muzik: new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle('Yardim — Muzik')
      .setDescription(
        [
          'Sohbet oneki `' + p + '` veya slash `/`',
          '',
          '`' + p + 'play <sarki|link>` / `/play` — cal veya kuyruga ekle',
          '`' + p + 'pause` / `/pause` — duraklat',
          '`' + p + 'resume` / `/resume` — devam',
          '`' + p + 'skip` / `/skip` — sonraki',
          '`' + p + 'stop` / `/stop` — durdur, kanaldan cik',
          '`' + p + 'queue` / `/queue` — kuyruk',
          '`' + p + 'np` / `/nowplaying` — simdi calan',
          '`' + p + 'volume 80` / `/volume` — ses 0-150',
          '`' + p + 'shuffle` / `/shuffle` — karistir',
          '`' + p + 'loop song` / `/loop` — off | song | queue',
          '`' + p + 'remove 3` / `/remove` — kuyruktan sil',
          '`' + p + 'skipto 5` / `/skipto` — o siraya atla',
          '`' + p + 'lyrics` / `/lyrics` — sozleri goster',
        ].join('\n'),
      ),
    spotify: new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle('Yardim — Spotify')
      .setDescription(
        [
          'Spotify sesini dogrudan akitmaz. Parca adini alir, YouTube/SoundCloud\'dan calar.',
          '',
          '`/spotify login` — hesabini bagla',
          '`/spotify logout` — baglantiyi kes',
          '`/spotify durum` — bagli mi?',
          '`/spotify now` — Spotify\'da su an calan + aktif liste',
          '`/spotify aktif` — o listeyi Discord\'da cal',
          '`/spotify playlists` — listelerini goster',
          '`/spotify playlists numara:1` — o listeyi cal',
          '`/spotify liked` — begenilenler (ilk 30)',
          '`/spotify recent` — son dinlenenler',
          '',
          'Sohbet: `' + p + 'sp now` `' + p + 'sp aktif` `' + p + 'sp playlists`',
          'Yeni izin icin: `/spotify logout` sonra tekrar `/spotify login`.',
        ].join('\n'),
      ),
    bilgi: new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle('Yardim — Bilgi')
      .setDescription(
        [
          'Once ses kanalina gir, sonra komut yaz.',
          'Botun Connect + Speak izni olmali.',
          '`!play` calismiyorsa Discord Developer Portal\'da Message Content Intent acik olsun.',
          'Slash komut yoksa projede `npm run deploy` calistir.',
          '',
          'Repo: https://github.com/imardasuna/discord-bot',
        ].join('\n'),
      ),
  };
}

function row(active) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('help:muzik')
      .setLabel('Muzik')
      .setStyle(active === 'muzik' ? ButtonStyle.Success : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('help:spotify')
      .setLabel('Spotify')
      .setStyle(active === 'spotify' ? ButtonStyle.Success : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('help:bilgi')
      .setLabel('Bilgi')
      .setStyle(active === 'bilgi' ? ButtonStyle.Success : ButtonStyle.Secondary),
  );
}

module.exports = {
  data: new SlashCommandBuilder().setName('help').setDescription('Komut listesi ve yardim'),
  aliases: ['yardim', 'h', 'komutlar'],
  async execute(ctx) {
    return ctx.reply({
      embeds: [pages().muzik],
      components: [row('muzik')],
    });
  },
  async handleButton(interaction) {
    const key = interaction.customId.split(':')[1];
    const all = pages();
    const embed = all[key] || all.muzik;
    await interaction.update({
      embeds: [embed],
      components: [row(all[key] ? key : 'muzik')],
    });
  },
};
