const {
    isCorrectCountMessage,
    extractAndCompareUsingRegex,
} = require("../../utils/count");
const {
    generateNoMatchEmbed,
    sendReqNotifyEmbed,
} = require("../../utils/embed");
const data = require("./../../data.json");
const { AUTO_CHANNEL_ID, LOGS_CHANNEL_ID, VOTE_CHANNEL_ID, GENERAL_CHANNEL, MOD_COMMANDS_CHANNEL } = process.env;
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
        const hasRole = member.roles.cache.has(data.configuration.COUNTING_ROLE_ID);

        // New Check: Saves for Role Holders
        if (hasRole) {
            const isMatch = extractAndCompareUsingRegex(globalStatField.value);

            if (!isMatch.includes("match found")) {
                // Invalid stats format, no action needed
                return; 
            }

            const savesMatch = isMatch.match(/Saves:\s*(\d+)/);
            const saves = savesMatch ? parseInt(savesMatch[1]) : 0;
            
            if (saves < 1.5) { 
                await member.roles.remove(data.configuration.COUNTING_ROLE_ID);

                const removalMessage = `You no longer meet the requirements to stay in the counting channel. Please head to <#${VOTE_CHANNEL_ID}> and vote to rejoin.`;
                await referenceMessage.reply({
                    content: removalMessage,
                    allowedMentions: { users: [] }
                });

                const logChannel = message.guild.channels.cache.get(LOGS_CHANNEL_ID);
                if (logChannel) {
                    const logMessage = `${member} was removed from the counting channel due to insufficient saves.`;
                    await logChannel.send(logMessage);
                    console.log(logMessage); 
                }
            }

            // No further action for role holders with sufficient saves
            return;
        }

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

        // Separate logic for AUTO_CHANNEL_ID
        if (channelId === AUTO_CHANNEL_ID) {
            await member.roles.add(data.configuration.COUNTING_ROLE_ID);
            await referenceMessage.reply({
                content: `Congrats! ${member} has met the requirements and got the role`,
                allowedMentions: { users: [] },
            });
            await sendReqNotifyEmbed(member);

            const logChannel = message.guild.channels.cache.get(LOGS_CHANNEL_ID);
            if (logChannel) {
                const botName = message.client.user.username;
                const logMessage = `${member} was granted access to the counting channel by ${botName}.`;
                await logChannel.send(logMessage);
                console.log(logMessage); 
            }
        } 
        // Separate logic for VOTE_CHANNEL_ID
        else if (channelId === VOTE_CHANNEL_ID) {
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

            // Log the potential counter to LOGS_CHANNEL_ID
            const logChannel = message.guild.channels.cache.get(LOGS_CHANNEL_ID);
            if (logChannel) {
                const dateTime = Math.floor(Date.now() / 1000); 
                const logEmbed = new EmbedBuilder()
                    .setColor(0xffa500)
                    .setTitle("Potential Counter")
                    .setDescription(`${member} potentially qualifies for counting. They seem to have the stats required when they ran the command on <t:${dateTime}:F>. If you do grant them access, don't forget to run c!user @${member.displayName} in <#${MOD_COMMANDS_CHANNEL}> to ensure that I calculated it right. Remember, our server requires at least \`${data.configuration.correctRate}%\`, \`${data.configuration.correct} correctly counted\`, and \`${data.configuration.saves} saves\`. Thank you for your help.`);

                await logChannel.send({ embeds: [logEmbed] });
                console.log(`Logged potential counter for ${member.displayName} at <t:${dateTime}:F>`); 
            }
        }
    } catch (error) {
        console.log(error);
    }
};
