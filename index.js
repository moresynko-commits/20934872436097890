const { Client, GatewayIntentBits } = require('discord.js');

const GUILD_ID = '1478745386586865788';
const VOICE_CHANNEL_ID = process.env.VOICE_CHANNEL_ID || '1485109675904208997';

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers
    ] 
});

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity('U.S. Secret Service | .gg/VFbDuJZFpC', { type: 'WATCHING' });

    try {
        const guild = await client.guilds.fetch(GUILD_ID);
        const updateMembers = async () => {
            try {
                const count = guild.memberCount - 1;
                const channel = await guild.channels.fetch(VOICE_CHANNEL_ID);
                await channel.setName(`Members: ${count}`);
                console.log(`Updated voice channel to Members: ${count}`);
            } catch (error) {
                console.error('Error updating channel:', error);
            }
        };

        // Initial update
        await updateMembers();

        // Update every 20 minutes (1200000 ms)
        setInterval(updateMembers, 1200000);
    } catch (error) {
        console.error('Error fetching guild:', error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'ping') {
        await interaction.reply('Pong!');
    }
});

client.login(process.env.TOKEN);
