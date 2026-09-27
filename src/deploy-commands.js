require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
const config = require('./config');

const commands = [];
const dir = path.join(__dirname, 'commands');
for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.js'))) {
  const cmd = require(path.join(dir, file));
  if (cmd.data) commands.push(cmd.data.toJSON());
}

async function main() {
  if (!config.token || !config.clientId) {
    throw new Error('DISCORD_TOKEN ve DISCORD_CLIENT_ID gerekli');
  }
  const rest = new REST({ version: '10' }).setToken(config.token);
  if (config.guildId) {
    await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), {
      body: commands,
    });
    console.log(`Slash komutlar sunucuya yazildi (${commands.length}).`);
  } else {
    await rest.put(Routes.applicationCommands(config.clientId), { body: commands });
    console.log(`Slash komutlar globale yazildi (${commands.length}). Gelmesi 1 saati bulabilir.`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
