const { Client, GatewayIntentBits, SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, Colors, REST, Routes, WebhookClient } = require('discord.js');
const express = require('express');

const GUILD_ID = '1478745386586865788';
const BOT_ID = '1485123070921277530';
const VOICE_CHANNEL_ID = '1485109675904208997';

const WELCOME_CHANNEL_ID = '1480025451765436510';
const GENERAL_CHANNEL_ID = '1478745388172181637';

const AVATAR_URL = 'https://cdn.discordapp.com/attachments/1485045973699792916/1485052651392733435/image523523.png?ex=69c0768f&is=69bf250f&hm=5c7e1cfba188b46b04b8fb0c773aa14f23627eaa1bd1215c488dff2614bb6c20&';
const BANNER_URL = 'https://cdn.discordapp.com/attachments/1485138081777713183/1485138106028920963/welusss.png?ex=69c0c625&is=69bf74a5&hm=f0e6e8beb676ae6a7d549d7d3ad595baa5e1f72c259fbea7d4733a3b7b92540c&';
const FOOTER_URL = 'https://cdn.discordapp.com/attachments/1485138081777713183/1485139190978183248/usssfooter.png?ex=69c0c727&is=69bf75a7&hm=58b2261214a4c8f4c7396cff36a316f88efe69e0a71eae5d9a0819f421444f15&';
const WELCOME_COLOR = 0x3322BB;

let welcomeWebhook = null;

const data = new Map();

function getOrdinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

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

client.on('clientReady', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity('U.S. Secret Service | .gg/VFbDuJZFpC', { type: 'WATCHING' });

  // Register slash commands
  const commands = [
    new SlashCommandBuilder().setName('ping').setDescription('Pong!'),
    new SlashCommandBuilder().setName('ban').setDescription('Ban user').addUserOption(o => o.setName('user').setDescription('User to ban').setRequired(true)).addStringOption(o => o.setName('reason').setDescription('Ban reason')).setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    new SlashCommandBuilder().setName('kick').setDescription('Kick user').addUserOption(o => o.setName('user').setDescription('User to kick').setRequired(true)).addStringOption(o => o.setName('reason').setDescription('Kick reason')).setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    // Add more as needed
  ].map(c => c.toJSON());

  const rest = new REST().setToken(process.env.TOKEN);
  try {
    await rest.put(Routes.applicationGuildCommands(client.user.id, GUILD_ID), { body: commands });
    console.log('Slash commands registered.');
  } catch (error) {
    console.error(error);
  }

  // Setup welcome webhook
  const welcomeChannel = client.channels.cache.get(WELCOME_CHANNEL_ID);
  if (welcomeChannel) {
    const webhooks = await welcomeChannel.fetchWebhooks();
    let webhook = webhooks.find(wh => wh.name === 'USSS・Welcome');
    if (!webhook) {
      webhook = await welcomeChannel.createWebhook({
        name: 'USSS・Welcome',
        avatar: AVATAR_URL
      });
      console.log('Created welcome webhook:', webhook.id);
    } else {
      console.log('Found welcome webhook:', webhook.id);
    }
    welcomeWebhook = new WebhookClient({
      id: webhook.id,
      token: webhook.token
    });
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

client.on('messageCreate', async (message) => {
  if (message.mentions.users.has(BOT_ID) && !message.mentions.everyone && message.channel.type === 0 && !message.reference) {
    const response = `Greetings, I am <@${BOT_ID}>. My prefix is \`>\` and I am developed by **Mys1icX**. If you have any questions about the operations of this bot, please make a ticket in <#1480398372027502652>. Have a good day!`;
    const sent = await message.channel.send(response);
    setTimeout(() => {
      sent.delete().catch(() => {});
    }, 10000);
  }
});

client.on('guildMemberAdd', async (member) => {
  if (member.guild.id !== GUILD_ID) return;

  // General message 
  setTimeout(async () => {
    const generalChannel = member.guild.channels.cache.get(GENERAL_CHANNEL_ID);
    if (!generalChannel) return;

    await member.guild.members.fetch();
    const humanCount = member.guild.members.cache.filter(m => !m.user.bot).size;
    const ordinal = getOrdinal(humanCount);
    const badge = '<:Welcome0:1485348061617062090><:Welcome1:1485348090520273009><:Welcome2:1485348112527790162><:Welcome3:1485348134090575974><:Welcome4:1485348181888729281><:Welcome5:1485348211001659433>';

    const textMsg = `${badge} Welcome to United States Secret Service, ${member.toString()}!\n > You are our \`${ordinal}\` member. Thanks for joining, and check out <#1485028060158890094> for more information.`;

    await generalChannel.send(textMsg);
  }, 30000);

  // Welcome webhook message
  if (!welcomeWebhook) return;
  const desc = `> Thank you for joining USSS, ${member.toString()},\n\nThe United States Secret Service is an elite federal agency tasked with the protection of national leaders and the preservation of financial security. Within Liberty County State Roleplay, USSS operates as a highly trained, professional unit focused on protective intelligence, threat mitigation, and high-risk security operations.\n\n> 1. You must read our server-rules listed in <#1480024585280815225>.\n> 2. You must verify with our automation services in ⁠<#1480306233889259691>.\n> 3. In order to learn more about our community, please evaluate our <#1485028060158890094>.\n> 4. If you are ever in need of staff to answer any of your questions, you can create a General Inquiry ticket in ⁠<#1480398372027502652>.\n\nOtherwise, have a fantastic day, and we hope to see you interact with our community events, channels, and features.`;

  const embeds = [
    {
      image: {
        url: BANNER_URL
      },
      color: WELCOME_COLOR
    },
    {
      title: 'Welcome to United States Secret Service!',
      description: desc,
      color: WELCOME_COLOR
    },
    {
      image: {
        url: FOOTER_URL
      },
      color: WELCOME_COLOR
    }
  ];

  await welcomeWebhook.send({
    embeds,
    username: 'USSS・Welcome',
    avatarUrl: AVATAR_URL
  });
});

client.login(process.env.TOKEN);
