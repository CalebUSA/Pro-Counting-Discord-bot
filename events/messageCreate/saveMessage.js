const { PermissionsBitField } = require("discord.js");
const { isCorrectCountMessage } = require("../../utils/count");
const { sendLockChannelEmbed } = require("../../utils/embed");
const data = require("./../../data.json");
const { COUNTING_CHANNNEL_ID, LOGS_CHANNEL_ID, ADMIN_ROLE, MOD_ROLE, GENERAL_CHANNEL, VOTE_CHANNEL_ID } = process.env;

module.exports = async (message) => {
   try {
      const { channel, content, guild } = message;

      if (channel.id !== process.env.COUNTING_CHANNNEL_ID) return;

      console.log(`"${content}" was sent in the counting channel by "${user}"`);
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
      const generalChannel = guild.channels.cache.get(GENERAL_CHANNEL);

      // If it's a personal save, check the remaining saves
      if (personSaveUsed) {
         console.log("Content of the message: ", content); // Debugging line
         const remainingSavesMatch = content.match(/You have \*\*(\d+(?:\.\d+)?)\*\* left/);
         if (remainingSavesMatch) {
            const remainingSaves = parseFloat(remainingSavesMatch[1]);
            const logMessage = `Uh oh! ${user} made a mistake in counting. They have ${remainingSaves} saves left.`;

            console.log(logMessage);
            if (logChannel) {
               logChannel.send(logMessage);
            }

            let generalMessage;
            if (remainingSaves >= 2) {
               const keepRoleMessage = "Since they now have more than 2 saves, we let them keep the counting role.";
               console.log(keepRoleMessage);
               if (logChannel) {
                  logChannel.send(keepRoleMessage);
               }
            } else {
               const removeRoleMessage = "Since they now have less than two saves, we took away the counting role from them.";
               console.log(removeRoleMessage);
               if (logChannel) {
                  logChannel.send(removeRoleMessage);
               }

               generalMessage = `I'm sorry ${user}, but since you made a mistake counting, you no longer meet the counting requirements for Counting Cove. We require at least \`${data.configuration.correctRate}%\`, \`${data.configuration.correct} correctly counted\`, and \`${data.configuration.saves} saves\`. To get more saves type c!vote in <#${VOTE_CHANNEL_ID}>.`;
            }

         } else {
            console.log("Could not find remaining saves in the message.");
            return;
         }
      }

      await referenceMessage.member.roles.remove(
         data.configuration.COUNTING_ROLE_ID
      );

      if (guildSaveUsed) {
         console.log("removing perms");

         // notify
         await channel.permissionOverwrites.set([
            ...channel.permissionOverwrites.cache.values(),
            {
               id: data.configuration.COUNTING_ROLE_ID,
               deny: [
                  PermissionsBitField.Flags.SendMessages,
                  PermissionsBitField.Flags.ManageMessages,
               ],
            },
         ]);

         const adminRole = guild.roles.cache.get(ADMIN_ROLE);
         const modRole = guild.roles.cache.get(MOD_ROLE);
         const guildSaveMessage = `${adminRole} ${modRole} ${user} used a guild save! I locked the channel from the counting role but please check the channel asap to see if someone is trying to ruin our count.`;

         console.log(guildSaveMessage);
         if (logChannel) {
            logChannel.send(guildSaveMessage);
         }
      }

      await sendLockChannelEmbed(referenceMessage.member, hasRole);
   } catch (error) {
      console.log(error);
   }
};
