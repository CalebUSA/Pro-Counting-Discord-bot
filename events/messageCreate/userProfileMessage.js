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
        const channelId = message.channel.id; // Ensure channelId is defined
        
        const hasRole = member.roles.cache.has(data.configuration.COUNTING_ROLE_ID); // Get the role status

        // Use the same extraction method as in extractAndCompareUsingRegex
        const extractValue = (pattern, text, parser = parseFloat) => {
            const match = text.match(pattern);
            return match ? parser(match[1].replace(/,/g, "")) : 0;
        };

        const countedSaves = extractValue(/Saves: \*\*(\d+(?:\.\d+)?)\//, globalStatField.value);
        console.log(`${member.displayName} has ${countedSaves} saves.`);
        
        if (hasRole) {
            if (referenceMessage.content.trim() !== "c!user") return;
            if (countedSaves > 1.5) {
                // React with a check mark if saves > 1.5
                await message.react('✅');
            } else {
                // Remove role and notify if saves <= 1.5
                await message.react('❌');
                await member.roles.remove(data.configuration.COUNTING_ROLE_ID);
                const logChannel = message.guild.channels.cache.get(LOGS_CHANNEL_ID);
                const botName = message.client.user.username;
                const logMessage = `${member.displayName} had their role removed because they had less than 1.5 saves.`;
                
                if (logChannel) {
                    await logChannel.send(logMessage);
                }

                console.log(logMessage);

                // Notify the user in the channel
                await message.channel.send(
                    `${member}, I'm sorry but it appears you need more saves. Please vote in <#${VOTE_CHANNEL_ID}> by typing \`c!vote\`. Then, once you get your saves back, ask for access in <#${GENERAL_CHANNEL}>. Thanks for understanding!`
                );
            }
            return; // Skip everything else if the user already had the role
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

        // Separate logic for AUTO_CHANNEL_ID based on role status
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
