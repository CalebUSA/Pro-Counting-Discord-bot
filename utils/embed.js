const { EmbedBuilder } = require("@discordjs/builders");

const generateNoMatchEmbed = function (user, needed) {
  const text = "You dont match and you need the following stats";
  const embed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle("Requirements Missing")

    .setDescription(text)
    .setThumbnail(user.displayAvatarURL())
    .addFields(
      {
        name: "Correct Rate",
        value: `${needed.correctRate
          .toFixed(3)
          .toString()
          .replace(/(\.0+|0+)$/, "")} %`,
        inline: true,
      },
      {
        name: "✅",
        value: `${needed.correct
          .toFixed(3)
          .toString()
          .replace(/(\.0+|0+)$/, "")}`,
        inline: true,
      },
      {
        name: "Saves",
        value: `${needed.saves
          .toFixed(3)
          .toString()
          .replace(/(\.0+|0+)$/, "")}`,
      }
    );

  return embed;
};

const sendReqNotifyEmbed = async (member) => {
  const embed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle("Requirements Completed 🥗")

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
