const {
    isCorrectCountMessage,
    extractAndCompareUsingRegex,
} = require("../../utils/count");
const {
    generateNoMatchEmbed,
    sendReqNotifyEmbed,
} = require("../../utils/embed");
const data = require("./../../data.json");

module.exports = async (message) => {
    try {
        const allowedChannelId = "821743124116144169"; // Replace with the actual ID
        if (message.channel.id !== allowedChannelId) {
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
        }
    } catch (error) {
        console.log(error);
    }
};
