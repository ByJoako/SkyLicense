const { MessageBuilder, Webhook } = require('discord-webhook-node');

class EmbedBuilder {
    constructor() {
        this.embed = new MessageBuilder()
            .setColor('#00b0f4')
            .setTimestamp()
            .setFooter('Sky Licenses', 'https://imgur.com/oNVxaKg.png');
    }
    
    setAuthor(name, avatar) {
        this.embed.setAuthor(name, avatar);
        return this;
    }
    
    setTitle(title) {
        this.embed.setTitle(title);
        return this;
    }

    setDescription(description) {
        this.embed.setDescription(description);
        return this;
    }

    addField(name, value, inline = false) {
        this.embed.addField(name, value, inline);
        return this;
    }

    setColor(color) {
        this.embed.setColor(color);
        return this;
    }

    setTimestamp(timestamp) {
        this.embed.setTimestamp(timestamp);
        return this;
    }

    build() {
        return this.embed;
    }
}

async function sendToDiscord(embed) {
    const webhookUrl = 'https://discord.com/api/webhooks/1190770484653068399/AzMZyDkx0NHozB2Ik1hQMWY23mUiLhTe8WZ40pwt6JlvF7y7MtqAa2NA48TG7rHeHr2g';
    try {
        const hook = new Webhook(webhookUrl);
   
        await hook.send(embed);
    } catch (error) {
        console.error('Error sending to Discord webhook:', error);
    }
}

module.exports = {
  EmbedBuilder,
  sendToDiscord
};