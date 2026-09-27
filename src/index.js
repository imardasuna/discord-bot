require('dotenv').config();
const fs = require('fs');
const path = require('path');
const {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  Partials,
} = require('discord.js');
const config = require('./config');
const { setupDistube } = require('./music/distube');
const { startSpotifyServer } = require('./spotify/oauth');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
});

client.commands = new Collection();
client.aliases = new Collection();

const commandsDir = path.join(__dirname, 'commands');
for (const file of fs.readdirSync(commandsDir).filter((f) => f.endsWith('.js'))) {
  const command = require(path.join(commandsDir, file));
  if (!command.data) continue;
  client.commands.set(command.data.name, command);
  for (const alias of command.aliases || []) {
    client.aliases.set(alias, command.data.name);
  }
}

client.distube = setupDistube(client);
startSpotifyServer();

client.once(Events.ClientReady, (ready) => {
  console.log('[bot] ' + ready.user.tag + ' olarak giris yapildi');
  ready.user.setActivity(config.prefix + 'help | /help', { type: 2 });
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (interaction.isButton() && interaction.customId.startsWith('help:')) {
      const help = client.commands.get('help');
      return help.handleButton(interaction);
    }
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    await command.execute(interaction, []);
  } catch (error) {
    console.error(error);
    const payload = { content: 'Komut hatasi: ' + error.message, ephemeral: true };
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp(payload).catch(() => {});
    } else if (interaction.reply) {
      await interaction.reply(payload).catch(() => {});
    }
  }
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot || !message.guild) return;
  if (!message.content.startsWith(config.prefix)) return;

  const parts = message.content.slice(config.prefix.length).trim().split(/\s+/);
  const name = (parts.shift() || '').toLowerCase();
  const command =
    client.commands.get(name) || client.commands.get(client.aliases.get(name));
  if (!command) return;

  try {
    await command.execute(message, parts);
  } catch (error) {
    console.error(error);
    await message.reply('Komut hatasi: ' + error.message).catch(() => {});
  }
});

process.on('unhandledRejection', (error) => {
  console.error('[unhandledRejection]', error);
});

if (!config.token) {
  console.error('DISCORD_TOKEN eksik. .env.example dosyasini .env olarak kopyala.');
  process.exit(1);
}

client.login(config.token);
