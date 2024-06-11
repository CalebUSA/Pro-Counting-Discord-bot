const {
    isCorrectCountMessage,
    extractAndCompareUsingRegex,
} = require("../../utils/count");
const {
    generateNoMatchEmbed,
    sendReqNotifyEmbed,
} = require("../../utils/embed");
const data = require("./../../data.json");
const { AUTO_CHANNEL_ID, LOGS_CHANNEL_ID, VOTE_CHANNEL_ID, GENERAL_CHANNEL } = process.env; // Pull AUTO_CHANNEL_ID, LOGS_CHANNEL_ID, VOTE_CHANNEL_ID, and GENERAL_CHANNEL from environment variables
const { EmbedBuilder } = require('discord.js');

module.exports = async (message) => {
    try {
        if (![AUTO_CHANNEL_ID, VOTE_CHANNEL_ID].includes(message.channel.id)) {
            return; // Stop execution if not in the correct channels
        }
        
        const { embeds } = message;

        const globalStatField = embeds[0]?.data?.fields?.find(
            (field) => field.name === "Global Stats"
        );

        if (!globalStatField) return;

        const referenceMessage = await isCorrectCountMessage(message);

        if (!referenceMessage) return;

        const member = referenceMessage.member;
        const channelId = message.channel.id;

        // Check if the user has the counting role
        const hasRole = member.roles.cache.has(data.configuration.COUNTING_ROLE_ID);

        if (channelId === AUTO_CHANNEL_ID) {
            const [isCommand] = referenceMessage.content.split(" ");

            if (isCommand !== "c!user") return;

            if (
                referenceMessage.author.id !==
                (referenceMessage.mentions.parsedUsers.first()?.id ??
                    referenceMessage.author.id)
            )
                return;

            const isMatch = extractAndCompareUsingRegex(globalStatField.value);

            if (isMatch !== "match found") {
                const embed = generateNoMatchEmbed(member, isMatch);

                return await referenceMessage.reply({
                    embeds: [embed],
                    allowedMentions: { users: [] },
                });
            }

            if (isMatch === "match found") {
                if (hasRole) return;

                await member.roles.add(data.configuration.COUNTING_ROLE_ID);

                await referenceMessage.reply({
                    content: `Congrats! ${member} has met the requirements and got the role`,
                    allowedMentions: { users: [] },
                });

                await sendReqNotifyEmbed(member);

                const logChannel = message.guild.channels.cache.get(LOGS_CHANNEL_ID);
                if (logChannel) {
                    const botName = message.client.user.username; // Get the bot's name
                    const logMessage = `${member} was granted access to the counting channel by ${botName}.`;
                    await logChannel.send(logMessage);
                    console.log(logMessage); // Log the message to the console
                }
            }
        } else if (channelId === VOTE_CHANNEL_ID) {
            if (hasRole) return; // User already has the role, no action needed

            const isMatch = extractAndCompareUsingRegex(globalStatField.value);

            if (isMatch !== "match found") {
                const embed = generateNoMatchEmbed(member, isMatch);

                return await referenceMessage.reply({
                    embeds: [embed],
                    allowedMentions: { users: [] },
                });
            }

            if (isMatch === "match found") {
                // User meets the stats but won't be granted the role automatically
                const embed = new EmbedBuilder()
                    .setColor(0x0099ff)
                    .setTitle("Potential Eligibility for Counting Cove")
                    .setDescription(`You may meet the stats required for the Counting Cove. If you would like to join, please ping a mod or admin in <#${GENERAL_CHANNEL}>. Please note: Whether you are granted access or not is ultimately up to the admins of the server and their decision is final.`)
                    .setThumbnail(member.displayAvatarURL());

                await referenceMessage.reply({
                    embeds: [embed],
                    allowedMentions: { users: [member.id] },
                });
            }
        }
    } catch (error) {
        console.log(error);
    }
};
