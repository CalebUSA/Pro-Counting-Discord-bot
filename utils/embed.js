const { EmbedBuilder, channelMention } = require("discord.js");
const { VOTE_CHANNEL_ID, MAIN_BOT_SERVER_CHANNEL_ID } = process.env;
const data = require("./../data.json");

const generateNoMatchEmbed = function (user, needed) {
  const text = `I'm sorry but you don't meet the counting requirements for Counting Cove. We require at least \`${data.configuration.correctRate} %\`, \`${data.configuration.correct} correctly counted\`, and \`${data.configuration.saves} saves\`. If you need more saves type c!vote in ${channelMention(VOTE_CHANNEL_ID)}. If you need a higher count or percentage you can go to the main counting bot server (found in ${channelMention(MAIN_BOT_SERVER_CHANNEL_ID)}) and raise your stats there then return when you meet the qualifications. Below you can see how much higher stats you need:\n\n**Higher percentage required:** ${needed.correctRate.toFixed(3).toString().replace(/(\.0+|0+)$/, "")} %\n**Higher correct count required:** ${needed.correct.toFixed(3).toString().replace(/(\.0+|0+)$/, "")}\n**Higher saves required:** ${needed.saves.toFixed(3).toString().replace(/(\.0+|0+)$/, "")}`;
  
  const embed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle("Requirements Missing")
    .setDescription(text)
    .setThumbnail(user.displayAvatarURL())
    .setFooter({
      text: "Please note: Whether you are granted access or not is ultimately up to the admins of the server and their decision is final."
    });

  return embed;
};

const sendReqNotifyEmbed = async (member) => {
  const embed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle("Counting Role Added 🔢")
    .setThumbnail(member.displayAvatarURL())
    .addFields({
      name: "User",
      value: `${member}`,
    });
  await sendEmbedLogs(member.guild, embed);
};

const sendLockChannelEmbed = async (member, hasRole) => {
  const embed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle("Channel locked 🚨")
    .setThumbnail(member.displayAvatarURL())
    .addFields(
      {
        name: "User",
        value: `${member}`,
      },
      {
        name: "Has role",
        value: `${hasRole}`,
      }
    );

  await sendEmbedLogs(member.guild, embed);
};

const sendEmbedLogs = async (guild, embed) => {
  const logsCh = guild.channels.cache.get(process.env.LOGS_CHANNEL_ID);
  await logsCh.send({ embeds: [embed] });
};

module.exports = {
  generateNoMatchEmbed,
  sendReqNotifyEmbed,
  sendLockChannelEmbed,
};
