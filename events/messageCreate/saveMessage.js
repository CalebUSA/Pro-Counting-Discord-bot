const { PermissionsBitField } = require("discord.js");
const { isCorrectCountMessage } = require("../../utils/count");
const { sendLockChannelEmbed } = require("../../utils/embed");
const { COUNTING_CHANNNEL_ID, COUNTING_ROLE_ID, SAVE_ROLE_ID } = process.env;

module.exports = async (message) => {
  try {
    const { channel, guild, content } = message;

    if (channel.id !== process.env.COUNTING_CHANNNEL_ID) return;

    const isSaveUsedNotification = content.includes("You have used");

    if (!isSaveUsedNotification) return;

    const referenceMessage = await isCorrectCountMessage(message);

    if (!referenceMessage) return;

    const everyoneRole = guild.roles.everyone;

    await channel.permissionOverwrites.set([
      {
        id: everyoneRole.id,
        deny: [PermissionsBitField.Flags.SendMessages],
      },
    ]);

    const hasRole = referenceMessage.member.roles.cache.has(COUNTING_ROLE_ID);

    if (hasRole) await referenceMessage.member.roles.remove(SAVE_ROLE_ID);

    // notify

    await sendLockChannelEmbed(referenceMessage.member, hasRole);
  } catch (error) {
    console.log(error);
  }
};
