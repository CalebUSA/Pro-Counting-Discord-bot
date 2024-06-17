const { SlashCommandBuilder } = require('@discordjs/builders');

console.log("say.js command file loaded");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Delete the command message and send the specified message to a channel.')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message to send')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to send the message to')),
    
    callback: async (interaction) => {
        console.log("say command executed");
        const messageContent = interaction.options.getString('message');
        const targetChannel = interaction.options.getChannel('channel') || interaction.channel;

        // Delete the command message
        await interaction.deferReply({ ephemeral: true });
        await interaction.deleteReply();

        // Send the message to the target channel
        await targetChannel.send(messageContent);

        // Optionally, log the action to the console
        console.log(`Message sent by ${interaction.user.username} to ${targetChannel.name}: ${messageContent}`);
    },
};
