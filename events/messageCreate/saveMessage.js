const { PermissionsBitField } = require("discord.js");
const { isCorrectCountMessage } = require("../../utils/count");
const { sendLockChannelEmbed } = require("../../utils/embed");
const data = require("./../../data.json");
const {
  COUNTING_CHANNNEL_ID,
  LOGS_CHANNEL_ID,
  ADMIN_ROLE,
  MOD_ROLE,
  GENERAL_CHANNEL,
  VOTE_CHANNEL_ID,
  MOD_TALKING_CHANNEL,
  MOD_COMMANDS_CHANNEL,
  VC_CHANNEL,
  USED_GUILD_SAVE_ROLE,
  NO_USER_SAVE_ROLE,
} = process.env; // Added USED_GUILD_SAVE_ROLE and NO_USER_SAVE_ROLE

module.exports = async (message) => {
  try {
    const { channel, content, guild, author } = message;
    if (channel.id !== COUNTING_CHANNNEL_ID) return;

    console.log(
      `${content} was sent in the counting channel by ${author.username} (${author.id})`
    );

    const personSaveUsed = content.toLowerCase().includes("your saves");
    const guildSaveUsed =
      content.toLowerCase().includes("guild saves") ||
      content.toLowerCase().includes("ruined it at");
    if (!personSaveUsed && !guildSaveUsed) return;

    console.log(`${new Date()}: this is a save usage message`);

    const referenceMessage = await isCorrectCountMessage(message);
    if (!referenceMessage) return;

    console.log("ofc a bot message");

    const hasRole = referenceMessage.member.roles.cache.has(
      data.configuration.COUNTING_ROLE_ID
    );
    const user = referenceMessage.member.user;

    const logChannel = guild.channels.cache.get(LOGS_CHANNEL_ID);

    console.log(`Log Channel ID: ${LOGS_CHANNEL_ID}, Fetched: ${!!logChannel}`);

    if (personSaveUsed) {
      console.log("Content of the message: ", content);
      const remainingSavesMatch = content.match(
        /You have \*\*(\d+(?:\.\d+)?)\*\* left/
      );

      if (remainingSavesMatch) {
        const remainingSaves = parseFloat(remainingSavesMatch[1]);
        const logMessage = `Uh oh! ${user.username} (${user.id}) made a mistake in counting. They have ${remainingSaves} saves left.`;
        console.log(logMessage);

        if (logChannel) {
          logChannel.send(logMessage);
        }

        if (remainingSaves >= 1) {
          const keepRoleMessage =
            "Since they now have more than 1 save, no announcement was made.";
          console.log(keepRoleMessage);
          if (logChannel) {
            logChannel.send(keepRoleMessage);
          }
        } else {
          const removeRoleMessage =
            "Since they do not have a save, we made an announcement just in case you want to remove the role.";
          console.log(removeRoleMessage);
          if (logChannel) {
            logChannel.send(removeRoleMessage);
          }

          if (channel) {
            const countingChannelMessage = `Uh oh! ${user} has no saves left!! Please do not count anymore until you have a save 😊`;
            channel.send(countingChannelMessage);
          }

          // Add NO_USER_SAVE_ROLE to the user
          const noUserSaveRole = guild.roles.cache.get(NO_USER_SAVE_ROLE);
          if (noUserSaveRole) {
            await referenceMessage.member.roles.add(noUserSaveRole);
            console.log(`Added NO_USER_SAVE_ROLE to ${user.username} (${user.id})`);
          } else {
            console.error(`NO_USER_SAVE_ROLE not found: ${NO_USER_SAVE_ROLE}`);
          }
        }
      } else {
        console.log("Could not find remaining saves in the message.");
        return;
      }
    }

    if (!guildSaveUsed) return;

    const guildSaveMessage = `${user.username} used a guild save!! Attention needed to maintain the count integrity.`;
    logChannel?.send(guildSaveMessage);
    channel?.send(
      `${user.username} used a guild save!! Please do not count until a solution is devised.`
    );

    const guildSaveBroadcastMessage = `${user.username} used a guild save!! Broadcasted the message so hopefully someone will act to save our count 👍`;
    console.log(guildSaveBroadcastMessage);
    if (logChannel) {
      logChannel.send(guildSaveBroadcastMessage);
    }

    if (channel) {
      const countingChannelBroadcastMessage = `${user.username} used a guild save!! Please do not count until we get a guild save back 👍`;
      channel.send(countingChannelBroadcastMessage);
    }

    // Add USED_GUILD_SAVE_ROLE to the user
    const usedGuildSaveRole = guild.roles.cache.get(USED_GUILD_SAVE_ROLE);
    if (usedGuildSaveRole) {
      await referenceMessage.member.roles.add(usedGuildSaveRole);
      console.log(`Added USED_GUILD_SAVE_ROLE to ${user.username} (${user.id})`);
    } else {
      console.error(`USED_GUILD_SAVE_ROLE not found: ${USED_GUILD_SAVE_ROLE}`);
    }

    // Check if the user has the MOD_ROLE and remove it if they do
    const hasModRole = referenceMessage.member.roles.cache.has(MOD_ROLE);
    if (hasModRole) {
      await referenceMessage.member.roles.remove(MOD_ROLE);
      const modLogMessage = `${user.username} had moderator privileges so I took that away for safety reasons.`;
      console.log(modLogMessage);
      if (logChannel) {
        logChannel.send(modLogMessage);
      }
    } else {
      const modLogMessage = `${user.username} did not have moderator privileges thankfully so we didn't make a mistake with our moderators. Thank you Mods by the way.`;
      console.log(modLogMessage);
      if (logChannel) {
        logChannel.send(modLogMessage);
      }
    }

    await sendLockChannelEmbed(referenceMessage.member, hasRole);
  } catch (error) {
    console.error(`Error processing message: ${error}`);
  }
};
