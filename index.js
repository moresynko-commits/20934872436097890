const { Client, GatewayIntentBits, SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, Colors, REST, Routes } = require('discord.js');
const express = require('express');

const GUILD_ID = '1478745386586865788';
const VOICE_CHANNEL_ID = '1485109675904208997';

const data = new Map();

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ] 
});

const app = express();
app.get('/', (req, res) => res.send('USSS Bot Online'));
app.listen(process.env.PORT || 3000);

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity('U.S. Secret Service | .gg/VFbDuJZFpC', { type: 'WATCHING' });

  // Register slash commands
  const commands = [
    new SlashCommandBuilder().setName('ping').setDescription('Pong!'),
    new SlashCommandBuilder().setName('ban').setDescription('Ban user').addUserOption(o => o.setName('user').setRequired(true)).addStringOption(o => o.setName('reason')).setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    new SlashCommandBuilder().setName('kick').setDescription('Kick user').addUserOption(o => o.setName('user').setRequired(true)).addStringOption(o => o.setName('reason')).setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    // Add more as needed
  ].map(c => c.toJSON());

  const rest = new REST().setToken(process.env.TOKEN);
  try {
    await rest.put(Routes.applicationGuildCommands(client.user.id, GUILD_ID), { body: commands });
    console.log('Slash commands registered.');
  } catch (error) {
    console.error(error);
  }

  // Voice channel update
  const guild = client.guilds.cache.get(GUILD_ID);
  const updateChannel = async () => {
    if (guild) {
      const count = guild.memberCount - 1;
      const channel = guild.channels.cache.get(VOICE_CHANNEL_ID);
      if (channel && channel.manageable) {
        await channel.setName(`Members: ${count}`);
      }
    }
  };
  updateChannel();
  setInterval(updateChannel, 1200000);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ping') {
    await interaction.reply('Pong!');
  } else if (interaction.commandName === 'ban') {
    const member = await interaction.guild.members.fetch(interaction.options.getUser('user').id);
    const reason = interaction.options.getString('reason') || 'No reason provided.';
    await member.ban({ reason });
    const embed = new EmbedBuilder().setDescription(`Banned ${member.user.tag} for: ${reason}`).setColor(Colors.Red);
    await interaction.reply({ embeds: [embed] });
  } else if (interaction.commandName === 'kick') {
    const member = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') || 'No reason provided.';
    await member.kick(reason);
    const embed = new EmbedBuilder().setDescription(`Kicked ${member.user.tag} for: ${reason}`).setColor(Colors.Orange);
    await interaction.reply({ embeds: [embed] });
  }
  // Add handlers for all other commands
});

client.login(process.env.TOKEN);
