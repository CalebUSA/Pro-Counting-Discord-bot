const { CommandType } = require("wokcommands");
const {
  handleInteractionError,
  replyOrEditInteraction,
} = require("../utils/interaction");

const data = require("./../data.json");
const { PermissionFlagsBits } = require("discord.js");

module.exports = {
  // Required for slash commands
  description: "View the configuration",
  // Create a legacy and slash command
  //   permissions: [PermissionFlagsBits.Administrator],
  type: CommandType.SLASH,

  callback: async ({ interaction }) => {
    try {
      const { configuration } = data;

      const content = `**Correct Rate Percentage:** ${configuration.correctRate}\n**Correct ✅:** ${configuration.correct}\n**Saves:** ${configuration.saves}`;

      await replyOrEditInteraction(interaction, {
        content,
        ephemeral: true,
      });
    } catch (err) {
      await handleInteractionError(err, interaction);
    }
  },
};
