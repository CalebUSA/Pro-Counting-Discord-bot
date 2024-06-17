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
      return; 
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

    // Check saves for users with the role
    if (hasRole) {
      const saves = parseFloat(globalStatField.value.match(/Saves:\s*(\d+(\.\d+)?)/)?.[1] || 0);
      if (saves < 1.5) {
        await member.roles.remove(data.configuration.COUNTING_ROLE_ID);
        await message.react('❌');
        await message.channel.send({
          content: `${member}, it looks like you are falling behind on saves. Please go to <#${VOTE_CHANNEL_ID}> and do \`c!vote\`. Once you get more saves, ask for perms to count again in <#${GENERAL_CHANNEL}>.`,
          allowedMentions: { users: [member.id] },
        });
      } else {
        // React with a checkmark if they have enough saves
        await message.react('✅');
      }
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

    // Separate logic for AUTO_CHANNEL_ID based on role status
    if (channelId === AUTO_CHANNEL_ID) {
        // ... (rest of the AUTO_CHANNEL_ID logic is the same)
    } 
    // Separate logic for VOTE_CHANNEL_ID
    else if (channelId === VOTE_CHANNEL_ID) {
        // ... (rest of the VOTE_CHANNEL_ID logic is the same)
    } 
  } catch (error) {
    console.log(error);
  }
};
