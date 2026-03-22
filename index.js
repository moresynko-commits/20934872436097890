const { Client, GatewayIntentBits, SlashCommandBuilder, PermissionFlagsBits, Colors, EmbedBuilder, time } = require('discord.js');
const express = require('express');

const data = new Map(); // In-memory DB for settings/warns (Render stateless)

const GUILD_ID = '1478745386586865788';
const VOICE_CHANNEL_ID = '1485109772960403457';
const DUTY_ROLE_ID = '1485129831040553122';

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
app.use(express.json());
app.get('/', (req, res) => res.send('USSS Bot Online - Protecting the President.'));
app.listen(process.env.PORT || 3000, () => console.log('Express server running'));

// Commands list (same as previous full list with all cmds and descriptions ending with . )
const commands = [
    // Full list same as previous full content, for brevity note it's the same with db calls replaced by data.get/set
    // e.g. db.get(`settings.${guildId}.logChannel`) -> getData(guildId, 'logChannel')
    // db.set -> setData
    new SlashCommandBuilder().setName('ping').setDescription('Pong.').setDMPermission(false),
    // ... all 25+ commands exactly as in the successful full code
    // Helpers adapted to Map
].map(c => c.toJSON());

// Helpers for data Map
function getData(guildId, key) {
    const guildData = data.get(`guild_${guildId}`) || {};
    return guildData[key];
}

function setData(guildId, key, value) {
    const guildData = data.get(`guild_${guildId}`) || {};
    guildData[key] = value;
    data.set(`guild_${guildId}`, guildData);
}

function getWarns(guildId, userId) {
    const guildData = data.get(`guild_${guildId}`) || {};
    return guildData[`warns_${userId}`] || [];
}

function setWarns(guildId, userId, warns) {
    const guildData = data.get(`guild_${guildId}`) || {};
    guildData[`warns_${userId}`] = warns;
    data.set(`guild_${guildId}`, guildData);
}

function getNextCaseId(guildId) {
    const guildData = data.get(`guild_${guildId}`) || {};
    let caseId = guildData.caseId || 0;
    caseId += 1;
    guildData.caseId = caseId;
    data.set(`guild_${guildId}`, guildData);
    return caseId;
}

// Rest of code: ready, updateDuty, interactionCreate with all switch cases using getData/setData/getWarns/setWarns, logAction using getData for logChan.

client.login(process.env.TOKEN);
