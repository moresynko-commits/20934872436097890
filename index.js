const { Client, GatewayIntentBits, SlashCommandBuilder, PermissionFlagsBits, Colors, EmbedBuilder, time } = require('discord.js');
const db = require('quick.db');
const express = require('express');
const fs = require('fs');

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
app.get('/', (req, res) => res.send('USSS Bot is online and protecting the server.'));
app.listen(process.env.PORT || 3000, () => console.log('Express listening'));

const commands = [
    new SlashCommandBuilder().setName('ping').setDescription('Pong.').setDMPermission(false),
    new SlashCommandBuilder().setName('ban').setDescription('Permanently removes a user from the server.').addUserOption(option => option.setName('user').setDescription('User to ban.').setRequired(true)).addStringOption(option => option.setName('reason').setDescription('Reason.')).setDefaultMemberPermissions(PermissionFlagsBits.BanMembers).setDMPermission(false),
    new SlashCommandBuilder().setName('unban').setDescription('Removes a ban, allowing the user to rejoin.').addStringOption(option => option.setName('user').setDescription('User ID.').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.BanMembers).setDMPermission(false),
    new SlashCommandBuilder().setName('kick').setDescription('Removes a user (they can rejoin with an invite).').addUserOption(option => option.setName('user').setDescription('User to kick.').setRequired(true)).addStringOption(option => option.setName('reason').setDescription('Reason.')).setDefaultMemberPermissions(PermissionFlagsBits.KickMembers).setDMPermission(false),
    new SlashCommandBuilder().setName('timeout').setDescription('Temporarily prevents a user from talking.').addUserOption(option => option.setName('user').setDescription('User.').setRequired(true)).addStringOption(option => option.setName('duration').setDescription('1d, 1h, 1m, 1min, 1hr, 7d etc.').setRequired(true)).addStringOption(option => option.setName('reason').setDescription('Reason.')).setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers).setDMPermission(false),
    new SlashCommandBuilder().setName('untimeout').setDescription('Removes a timeout early.').addUserOption(option => option.setName('user').setDescription('User.').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers).setDMPermission(false),
    new SlashCommandBuilder().setName('purge').setDescription('Deletes a number of recent messages in a channel.').addIntegerOption(option => option.setName('amount').setDescription('1-100.').setRequired(true).setMinValue(1).setMaxValue(100)).setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages).setDMPermission(false),
    new SlashCommandBuilder().setName('clear').setDescription('Same as purge; sometimes includes filters.').addIntegerOption(option => option.setName('amount').setDescription('1-100.').setRequired(true).setMinValue(1).setMaxValue(100)).setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages).setDMPermission(false),
    new SlashCommandBuilder().setName('warn').setDescription('Gives a warning to a user (usually logged).').addUserOption(option => option.setName('user').setDescription('User.').setRequired(true)).addStringOption(option => option.setName('reason').setDescription('Reason.').setRequired(true)).setDMPermission(false),
    new SlashCommandBuilder().setName('warnings').setDescription('Shows all warnings a user has.').addUserOption(option => option.setName('user').setDescription('User.').setRequired(true)).setDMPermission(false),
    new SlashCommandBuilder().setName('clearwarnings').setDescription('Removes all warnings.').addUserOption(option => option.setName('user').setDescription('User.').setRequired(true)).setDMPermission(false),
    new SlashCommandBuilder().setName('removewarn').setDescription('Deletes a specific warning.').addUserOption(option => option.setName('user').setDescription('User.').setRequired(true)).addIntegerOption(option => option.setName('id').setDescription('Warn ID.').setRequired(true)).setDMPermission(false),
    new SlashCommandBuilder().setName('mute').setDescription('Assigns a mute role (no talking).').addUserOption(option => option.setName('user').setDescription('User.').setRequired(true)).addStringOption(option => option.setName('duration').setDescription('Duration.').setRequired(true)).setDMPermission(false),
    new SlashCommandBuilder().setName('unmute').setDescription('Removes mute role.').addUserOption(option => option.setName('user').setDescription('User.').setRequired(true)).setDMPermission(false),
    new SlashCommandBuilder().setName('userinfo').setDescription('Shows user details (roles, join date, etc.).').setDMPermission(false),
    new SlashCommandBuilder().setName('serverinfo').setDescription('Shows server stats.').setDMPermission(false),
    new SlashCommandBuilder().setName('roleinfo').setDescription('Shows role details.').addRoleOption(option => option.setName('role').setDescription('Role.').setRequired(true)).setDMPermission(false),
    new SlashCommandBuilder().setName('role').setDescription('Gives or removes a role.')
        .addSubcommand(subcommand => subcommand.setName('add').setDescription('Gives a role.').addUserOption(option => option.setName('user').setDescription('User.').setRequired(true)).addRoleOption(option => option.setName('role').setDescription('Role.').setRequired(true)))
        .addSubcommand(subcommand => subcommand.setName('remove').setDescription('Removes a role.').addUserOption(option => option.setName('user').setDescription('User.').setRequired(true)).addRoleOption(option => option.setName('role').setDescription('Role.').setRequired(true)))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles).setDMPermission(false),
    new SlashCommandBuilder().setName('nickname').setDescription('Changes nickname.').addUserOption(option => option.setName('user').setDescription('User.')).addStringOption(option => option.setName('name').setDescription('New name.').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames).setDMPermission(false),
    new SlashCommandBuilder().setName('resetnick').setDescription('Resets nickname.').addUserOption(option => option.setName('user').setDescription('User.').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames).setDMPermission(false),
    new SlashCommandBuilder().setName('announce').setDescription('Sends an official announcement.').addChannelOption(option => option.setName('channel').setDescription('Channel.').setRequired(true)).addStringOption(option => option.setName('message').setDescription('Message.').setRequired(true)).setDMPermission(false),
    new SlashCommandBuilder().setName('say').setDescription('Makes the bot speak.').addStringOption(option => option.setName('message').setDescription('Message.').setRequired(true)).setDMPermission(false),
    new SlashCommandBuilder().setName('embed').setDescription('Sends a formatted embed message.').addStringOption(option => option.setName('message').setDescription('Message.').setRequired(true)).setDMPermission(false),
    new SlashCommandBuilder().setName('setlogchannel').setDescription('Sets where logs go.').addChannelOption(option => option.setName('channel').setDescription('Channel.').setRequired(true)).setDMPermission(false),
    new SlashCommandBuilder().setName('setmodrole').setDescription('Defines moderator role.').addRoleOption(option => option.setName('role').setDescription('Role.').setRequired(true)).setDMPermission(false),
    new SlashCommandBuilder().setName('setmuterole').setDescription('Defines mute role.').addRoleOption(option => option.setName('role').setDescription('Role.').setRequired(true)).setDMPermission(false),
    new SlashCommandBuilder().setName('modlog').setDescription('Shows moderation history.').addUserOption(option => option.setName('user').setDescription('User.').setRequired(true)).setDMPermission(false)
].map(command => command.toJSON());

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity('U.S. Secret Service | .gg/VFbDuJZFpC', { type: 'WATCHING' });

    const guild = await client.guilds.fetch(GUILD_ID);
    await guild.commands.set(commands);
    console.log('All slash commands registered.');

    const updateDuty = async () => {
        try {
            const dutyRole = await guild.roles.fetch(DUTY_ROLE_ID);
            const count = dutyRole.members.cache.size;
            const channel = await guild.channels.fetch(VOICE_CHANNEL_ID);
            await channel.setName(`On-Duty: ${count}`);
            console.log(`On-Duty updated to ${count}`);
        } catch (error) {
            console.error('Duty update failed:', error.message);
        }
    };
    updateDuty();
    setInterval(updateDuty, 600000); // 10 minutes
});

async function getNextCaseId(guildId) {
    let caseId = db.get(`case_counter.${guildId}`) || 0;
    caseId += 1;
    db.set(`case_counter.${guildId}`, caseId);
    return caseId;
}

async function logAction(guild, type, target, mod, reason, caseId) {
    const logChanId = db.get(`settings.${guild.id}.logChannel`);
    if (!logChanId) return;
    const channel = guild.channels.cache.get(logChanId);
    if (!channel) return;
    const embed = new EmbedBuilder()
        .setTitle(`${type} | Case #${caseId}`)
        .addFields(
            { name: 'Target', value: `${target.username || target.id}`, inline: true },
            { name: 'Moderator', value: mod.username, inline: true },
            { name: 'Reason', value: reason || 'No reason provided.', inline: false },
            { name: 'Timestamp', value: `<t:${Math.floor(Date.now()/1000)}:F>`, inline: true }
        )
        .setColor(type === 'BAN' ? Colors.DarkRed : Colors.Orange)
        .setFooter({ text: 'U.S. Secret Service Mod Log' });
    await channel.send({ embeds: [embed] });
}

function parseDuration(str) {
    str = str.toLowerCase()
        .replace(/minutes?|mins?/g, 'm')
        .replace(/hours?|hrs?/g, 'h')
        .replace(/days?/g, 'd')
        .replace(/seconds?/g, 's')
        .trim();
    const match = str.match(/(\d+)([smhd])/g);
    if (!match) return null;
    let ms = 0;
    match.forEach(m => {
        const num = parseInt(m[0]);
        const unit = m[1];
        ms += num * {s:1000, m:60000, h:3600000, d:86400000}[unit];
    });
    return ms;
}

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const guildId = interaction.guild.id;
    const member = interaction.member;
    const { commandName, options } = interaction;
    await interaction.deferReply({ ephemeral: true });

    const isAdmin = member.permissions.has(PermissionFlagsBits.Administrator);
    const modRoleId = db.get(`settings.${guildId}.modRole`);
    const hasModRole = modRoleId && member.roles.cache.has(modRoleId);

    const checkPerm = flag => member.permissions.has(flag) || hasModRole;

    // Permission checks
    let permOk = true;
    const errorMsg = '❌ Insufficient permissions.';
    switch (commandName) {
        case 'ping':
        case 'userinfo':
        case 'serverinfo':
        case 'roleinfo':
        case 'warnings':
            break;
        case 'setlogchannel':
        case 'setmodrole':
        case 'setmuterole':
        case 'clearwarnings':
        case 'announce':
        case 'say':
        case 'embed':
            if (!isAdmin) permOk = false;
            break;
        case 'ban':
        case 'unban':
            if (!checkPerm(PermissionFlagsBits.BanMembers)) permOk = false;
            break;
        case 'kick':
            if (!checkPerm(PermissionFlagsBits.KickMembers)) permOk = false;
            break;
        case 'timeout':
        case 'untimeout':
        case 'mute':
        case 'unmute':
            if (!checkPerm(PermissionFlagsBits.ModerateMembers)) permOk = false;
            break;
        case 'purge':
        case 'clear':
            if (!checkPerm(PermissionFlagsBits.ManageMessages)) permOk = false;
            break;
        case 'warn':
        case 'removewarn':
            if (!checkPerm(PermissionFlagsBits.ManageMessages)) permOk = false;
            break;
        case 'role':
            if (!checkPerm(PermissionFlagsBits.ManageRoles)) permOk = false;
            break;
        case 'nickname':
        case 'resetnick':
            if (!checkPerm(PermissionFlagsBits.ManageNicknames)) permOk = false;
            break;
        default:
            permOk = false;
    }
    if (!permOk) return interaction.editReply(errorMsg);

    try {
        const caseId = await getNextCaseId(guildId);
        const reason = options.getString('reason') || 'No reason.';
        let targetUser, targetMember;

        switch (commandName) {
            case 'ping':
                interaction.editReply('🏓 Pong!');
                return;
            case 'ban':
                targetUser = options.getUser('user');
                await interaction.guild.members.ban(targetUser, { reason });
                await logAction(interaction.guild, 'BAN', targetUser, member.user, reason, caseId);
                interaction.editReply(`✅ Banned ${targetUser.tag} | Case #${caseId}`);
                return;
            case 'unban':
                const userId = options.getString('user');
                await interaction.guild.bans.remove(userId);
                interaction.editReply(`✅ Unbanned <@${userId}> | Case #${caseId}`);
                return;
            case 'kick':
                targetMember = options.getMember('user');
                await targetMember.kick(reason);
                await logAction(interaction.guild, 'KICK', targetMember.user, member.user, reason, caseId);
                interaction.editReply(`✅ Kicked ${targetMember.user.tag} | Case #${caseId}`);
                return;
            case 'timeout':
                targetMember = options.getMember('user');
                const durationStr = options.getString('duration');
                const duration = parseDuration(durationStr);
                if (!duration || duration > 28 * 24 * 60 * 60 * 1000) return interaction.editReply('Invalid duration (max 28 days).');
                await targetMember.timeout(duration, reason);
                await logAction(interaction.guild, 'TIMEOUT', targetMember.user, member.user, reason, caseId);
                interaction.editReply(`✅ Timed out ${targetMember.user.tag} for ${durationStr} | Case #${caseId}`);
                return;
            case 'untimeout':
                targetMember = options.getMember('user');
                await targetMember.timeout(null);
                interaction.editReply(`✅ Untimed out ${targetMember.user.tag} | Case #${caseId}`);
                return;
            case 'purge':
            case 'clear':
                const amount = options.getInteger('amount');
                const messages = await interaction.channel.messages.fetch({ limit: amount });
                await interaction.channel.bulkDelete(messages.filter(m => Date.now() - m.createdTimestamp < 12000000), true); // 14 days limit
                interaction.editReply(`✅ Deleted ${amount} messages.`).then(reply => setTimeout(() => reply.delete().catch(() => {}), 3000));
                return;
            case 'warn':
                targetUser = options.getUser('user');
                let warns = db.get(`warns.${guildId}.${targetUser.id}`) || [];
                warns.push({
                    id: warns.length + 1,
                    caseId,
                    mod: member.user.id,
                    reason,
                    timestamp: Date.now()
                });
                db.set(`warns.${guildId}.${targetUser.id}`, warns);
                await logAction(interaction.guild, 'WARN', targetUser, member.user, reason, caseId);
                interaction.editReply(`✅ Warned ${targetUser.tag} | Case #${caseId}`);
                return;
            case 'warnings':
                targetUser = options.getUser('user') || interaction.user;
                let userWarns = db.get(`warns.${guildId}.${targetUser.id}`) || [];
                if (userWarns.length === 0) return interaction.editReply('No warnings.');
                const warnEmbed = new EmbedBuilder().setTitle(`${targetUser.tag}'s Warnings`).setColor(Colors.Yellow);
                userWarns.slice(-10).forEach(w => warnEmbed.addFields({ name: `Warn #${w.id} (Case #${w.caseId})`, value: `${w.reason.substring(0,100)}... | <t:${Math.floor(w.timestamp/1000)}:R>` }));
                interaction.editReply({ embeds: [warnEmbed] });
                return;
            case 'clearwarnings':
                targetUser = options.getUser('user');
                db.delete(`warns.${guildId}.${targetUser.id}`);
                interaction.editReply(`✅ Cleared warnings for ${targetUser.tag}`);
                return;
            case 'removewarn':
                targetUser = options.getUser('user');
                const warnId = options.getInteger('id');
                let rwWarns = db.get(`warns.${guildId}.${targetUser.id}`) || [];
                const warnIndex = rwWarns.findIndex(w => w.id === warnId);
                if (warnIndex === -1) return interaction.editReply('Warn not found.');
                rwWarns.splice(warnIndex, 1);
                rwWarns.forEach((w, i) => w.id = i+1);
                db.set(`warns.${guildId}.${targetUser.id}`, rwWarns);
                interaction.editReply(`✅ Removed warn #${warnId}`);
                return;
            case 'mute':
                targetMember = options.getMember('user');
                const muteRoleId = db.get(`settings.${guildId}.muteRole`);
                if (!muteRoleId) return interaction.editReply('Set mute role first.');
                const muteRoleObj = interaction.guild.roles.cache.get(muteRoleId);
                await targetMember.roles.add(muteRoleObj);
                const muteDuration = parseDuration(options.getString('duration'));
                if (muteDuration) setTimeout(() => targetMember.roles.remove(muteRoleObj).catch(() => {}), muteDuration);
                await logAction(interaction.guild, 'MUTE', targetMember.user, member.user, reason, caseId);
                interaction.editReply(`✅ Muted ${targetMember.user.tag} | Case #${caseId}`);
                return;
            case 'unmute':
                targetMember = options.getMember('user');
                const umRoleId = db.get(`settings.${guildId}.muteRole`);
                const umRole = interaction.guild.roles.cache.get(umRoleId);
                await targetMember.roles.remove(umRole);
                interaction.editReply(`✅ Unmuted ${targetMember.user.tag} | Case #${caseId}`);
                return;
            case 'userinfo':
                targetMember = options.getMember('user') || member;
                const userInfoEmbed = new EmbedBuilder()
                    .setTitle(targetMember.user.tag)
                    .addFields(
                        { name: 'ID', value: targetMember.user.id, inline: true },
                        { name: 'Joined Server', value: time(targetMember.joinedTimestamp, 'F'), inline: true },
                        { name: 'Account Age', value: time(targetMember.user.createdTimestamp, 'R'), inline: true },
                        { name: 'Roles', value: targetMember.roles.cache.size > 1 ? targetMember.roles.cache.map(r => r.name).slice(0, -1).reverse().join(', ') : 'None', inline: false }
                    )
                    .setThumbnail(targetMember.user.displayAvatarURL())
                    .setColor(Colors.Blue);
                interaction.editReply({ embeds: [userInfoEmbed] });
                return;
            case 'serverinfo':
                const serverEmbed = new EmbedBuilder()
                    .setTitle(interaction.guild.name)
                    .addFields(
                        { name: 'Members (Human)', value: (interaction.guild.memberCount - interaction.guild.members.cache.filter(m => m.user.bot).size).toString(), inline: true },
                        { name: 'Channels', value: interaction.guild.channels.cache.size.toString(), inline: true },
                        { name: 'Roles', value: interaction.guild.roles.cache.size.toString(), inline: true },
                        { name: 'Boost Level', value: interaction.guild.premiumTier.toString(), inline: true }
                    )
                    .setThumbnail(interaction.guild.iconURL())
                    .setColor(Colors.Green);
                interaction.editReply({ embeds: [serverEmbed] });
                return;
            case 'roleinfo':
                const role = options.getRole('role');
                const roleEmbed = new EmbedBuilder()
                    .setTitle(role.name)
                    .addFields(
                        { name: 'ID', value: role.id, inline: true },
                        { name: 'Members', value: role.members.cache.size.toString(), inline: true },
                        { name: 'Color', value: role.hexColor === '#000000' ? 'Default' : role.hexColor, inline: true },
                        { name: 'Hoisted', value: role.hoist ? 'Yes' : 'No', inline: true },
                        { name: 'Mentionable', value: role.mentionable ? 'Yes' : 'No', inline: true }
                    )
                    .setColor(role.hexColor === '#000000' ? Colors.Grey : role.hexColor)
                    .setTimestamp();
                interaction.editReply({ embeds: [roleEmbed] });
                return;
            case 'role':
                const subCmd = options.getSubcommand();
                targetMember = options.getMember('user');
                const targetRole = options.getRole('role');
                if (subCmd === 'add') {
                    await targetMember.roles.add(targetRole);
                    await logAction(interaction.guild, 'ROLE ADD', targetMember.user, member.user, `Added ${targetRole.name}`, caseId);
                    interaction.editReply(`✅ Added ${targetRole.name} to ${targetMember.user.tag}.`);
                } else {
                    await targetMember.roles.remove(targetRole);
                    await logAction(interaction.guild, 'ROLE REMOVE', targetMember.user, member.user, `Removed ${targetRole.name}`, caseId);
                    interaction.editReply(`✅ Removed ${targetRole.name} from ${targetMember.user.tag}.`);
                }
                return;
            case 'nickname':
                targetMember = options.getMember('user') || member;
                const newNick = options.getString('name');
                await targetMember.setNickname(newNick, reason);
                interaction.editReply(`✅ Set nickname of ${targetMember.user.tag} to ${newNick}.`);
                return;
            case 'resetnick':
                targetMember = options.getMember('user');
                await targetMember.setNickname(null);
                interaction.editReply(`✅ Reset nickname of ${targetMember.user.tag}.`);
                return;
            case 'announce':
                const chan = options.getChannel('channel');
                const msg = options.getString('message');
                await chan.send({ content: `**📢 Announcement from ${member.user.tag}**\\n${msg}` });
                interaction.editReply('✅ Announced.');
                return;
            case 'say':
                const sayMsg = options.getString('message');
                await interaction.channel.send(sayMsg);
                interaction.editReply('✅ Said.');
                return;
            case 'embed':
                const embedMsg = options.getString('message');
                await interaction.channel.send({ embeds: [new EmbedBuilder().setDescription(embedMsg).setColor(Colors.Blurple)] });
                interaction.editReply('✅ Embedded.');
                return;
            case 'setlogchannel':
                const logChan = options.getChannel('channel');
                db.set(`settings.${guildId}.logChannel`, logChan.id);
                interaction.editReply(`✅ Log channel set to ${logChan}.`);
                return;
            case 'setmodrole':
                const modRole = options.getRole('role');
                db.set(`settings.${guildId}.modRole`, modRole.id);
                interaction.editReply(`✅ Mod role set to ${modRole.name}.`);
                return;
            case 'setmuterole':
                const setMuteRole = options.getRole('role');
                db.set(`settings.${guildId}.muteRole`, setMuteRole.id);
                interaction.editReply(`✅ Mute role set to ${setMuteRole.name}.`);
                return;
            case 'modlog':
                targetUser = options.getUser('user');
                // Placeholder for full modlog query, list cases
                interaction.editReply('Mod log feature - list bans/warns etc. Implement query.');
                return;
            default:
                interaction.editReply('Command not fully implemented yet.');
        }
    } catch (error) {
        console.error(`Error in ${commandName}:`, error);
        interaction.editReply('An error occurred while executing this command.');
    }
});

client.login(process.env.TOKEN);
