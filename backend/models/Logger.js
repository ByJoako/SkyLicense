const mongoose = require('mongoose');
const { EmbedBuilder, sendToDiscord } = require('../utils/EmbedBuilder');

const activityLogSchema = new mongoose.Schema({
    user: {
        type: Object,
        required: true
    },
    action: {
        type: String,
        enum: [
            'login',
            'logout',
            'download',
            'reset_key',
            'clear_ip',
            'clear_hwid',
            'create_license',
            'update_license',
            'disable_license',
            'enable_license',
            'create_product',
            'update_product',
            'delete_product',
            'update_user',
            'add_blacklist',
            'remove_blacklist',
            'other'
        ],
        required: true
    },
    details: {
        type: String,
        required: false
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const ActivityLog =  mongoose.model('ActivityLog', activityLogSchema);

function createEmbed(logEntry) {
  try {
    const embed = new EmbedBuilder()
        .setAuthor(logEntry.user.username, `https://cdn.discordapp.com/avatars/${logEntry.user.id}/${logEntry.user.avatar}.png`)
        .addField('Action', logEntry.action, true)
        .addField('Details', logEntry.details || 'No details provided')
        .build();
        
    sendToDiscord(embed);
  } catch (e) {
    console.error(e)
  }
}



module.exports = {
  ActivityLog,
  createEmbed
}