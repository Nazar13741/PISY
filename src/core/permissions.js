



const { PermissionFlagsBits } = require('discord.js');
const { config } = require('./config');

function hasRole(member, ids = []) {
    return !!member?.roles?.cache && ids.some((id) => member.roles.cache.has(id));
}

function isAdmin(member) {
    if (!member) return false;
    if (hasRole(member, config.permissions.adminRoleIds)) return true;
    return config.permissions.discordAdminsAreAdmins && member.permissions?.has(PermissionFlagsBits.Administrator);
}


function isCurator(member) {
    if (!member) return false;
    if (isAdmin(member)) return true;
    if (hasRole(member, config.permissions.curatorRoleIds)) return true;
    const userId = member.id || member.user?.id;
    if ((config.permissions.curatorUserIds || []).includes(userId)) return true;
    const guildId = member.guild?.id;
    return !!guildId && require('../services/curators').has(guildId, userId);
}

function isMaster(member) {
    return isAdmin(member) || hasRole(member, config.permissions.masterRoleIds);
}


function canUse(member, level = 'everyone') {
    if (level === 'admin') return isAdmin(member);
    if (level === 'curator') return isCurator(member);
    if (level === 'master') return isMaster(member);
    return true;
}

module.exports = { isAdmin, isCurator, isMaster, canUse };
