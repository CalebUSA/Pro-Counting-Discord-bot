const {
  isCorrectCountMessage,
  extractAndCompareUsingRegex,
} = require("../../utils/count");
const {
  generateNoMatchEmbed,
  sendReqNotifyEmbed,
} = require("../../utils/embed");

module.exports = async (message) => {
  try {
    const { embeds, guild } = message;

    const globalStatField = embeds[0]?.data?.fields?.find(
      (field) => field.name === "Global Stats"
    );

    if (!globalStatField) return;

    const referenceMessage = await isCorrectCountMessage(message);

    if (!referenceMessage) return;

    const [isCommand] = referenceMessage.content.split(" ");

    if (isCommand !== "c!user") return;

    let member = referenceMessage.member;

    if (referenceMessage.mentions.parsedUsers.first())
      member = referenceMessage.mentions.parsedUsers.first();

    const isMatch = extractAndCompareUsingRegex(globalStatField.value);

    const cachedMember = guild.members.cache.get(member.id);

    if (isMatch !== "match found") {
      const embed = generateNoMatchEmbed(cachedMember, isMatch);

      return await referenceMessage.reply({
        embeds: [embed],
        allowedMentions: { users: [] },
      });
    }

    if (isMatch === "match found") {
      const hasRole = cachedMember.roles.cache.has(
        process.env.COUNTING_ROLE_ID
      );

      if (hasRole) return;

      await cachedMember.roles.add(process.env.COUNTING_ROLE_ID);

      await referenceMessage.reply({
        content: `Congrats! ${cachedMember} has met the requirements and got the role`,
        allowedMentions: { users: [] },
      });

      await sendReqNotifyEmbed(cachedMember);
    }
  } catch (error) {
    console.log(error);
  }
};
