const {
    isCorrectCountMessage,
    extractAndCompareUsingRegex,
} = require("../../utils/count");
const {
    generateNoMatchEmbed,
    sendReqNotifyEmbed,
} = require("../../utils/embed");
const data = require("./../../data.json");
const { AUTO_CHANNEL_ID, LOGS_CHANNEL_ID } = process.env; // Pull AUTO_CHANNEL_ID and LOGS_CHANNEL_ID from environment variables

module.exports = async (message) => {
    try {
        if (message.channel.id !== AUTO_CHANNEL_ID) {
            return; // Stop execution if not in the correct channel
        }
        
        const { embeds } = message;

        const globalStatField = embeds[0]?.data?.fields?.find(
            (field) => field.name === "Global Stats"
        );

        if (!globalStatField) return;

        const referenceMessage = await isCorrectCountMessage(message);

        if (!referenceMessage) return;

        const [isCommand] = referenceMessage.content.split(" ");

        if (isCommand !== "c!user") return;

        const member = referenceMessage.member;

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
            const hasRole = member.roles.cache.has(
                data.configuration.COUNTING_ROLE_ID
            );

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
    } catch (error) {
        console.log(error);
    }
};
