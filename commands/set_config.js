const fs = require("fs");
const path = require("path");
const { CommandType } = require("wokcommands");
const {
	handleInteractionError,
	replyOrEditInteraction,
} = require("../utils/interaction");

const data = require("./../data.json");
const { PermissionFlagsBits } = require("discord.js");

module.exports = {
	// Required for slash commands
	description: "Setup configuration",
	// Create a legacy and slash command
	type: CommandType.SLASH,
	//   permissions: [PermissionFlagsBits.Administrator],

	options: [
		{
			name: "correct_rate",
			description: "correct rate in percentage",
			type: 10,
			required: true,
		},
		{
			name: "correct",
			description: "correct ✅",
			type: 10,
			required: true,
		},
		{
			name: "saves",
			description: "saves",
			type: 10,
			required: true,
		},
		{
			name: "count_role",
			description: "role that will be given on stats complete",
			type: 8,
			required: true,
		},
		{
			name: "vote_saves",
			description: "set saves for vote command",
			type: 10,
			required: true,
		},
		{
			name: "vote_save_role",
			description: "set vote save role",
			type: 8,
			required: true,
		},
	],
	callback: async ({ interaction }) => {
		const { options } = interaction;
		try {
			await interaction.deferReply({ ephemeral: true });

			const correctRate = options.getNumber("correct_rate");
			const correct = options.getNumber("correct");
			const saves = options.getNumber("saves");
			const vote_saves = options.getNumber("vote_saves");
			const { id: COUNTING_ROLE_ID } = options.getRole("count_role");
			const { id: VOTE_SAVE_ROLE_ID } = options.getRole("vote_save_role");

			data.configuration = {
				correctRate,
				correct,
				saves,
				COUNTING_ROLE_ID,
				vote_saves,
				VOTE_SAVE_ROLE_ID,
			};

			fs.writeFileSync(
				path.join(__dirname, "..", "data.json"),
				JSON.stringify(data)
			);

			await replyOrEditInteraction(interaction, {
				content: "Changed the config!",
			});
		} catch (err) {
			await handleInteractionError(err, interaction);
		}
	},
};const fs = require("fs");
const path = require("path");
const { CommandType } = require("wokcommands");
const {
	handleInteractionError,
	replyOrEditInteraction,
} = require("../utils/interaction");

const data = require("./../data.json");
const { PermissionFlagsBits } = require("discord.js");

module.exports = {
	// Required for slash commands
	description: "Setup configuration",
	// Create a legacy and slash command
	type: CommandType.SLASH,
	//   permissions: [PermissionFlagsBits.Administrator],

	options: [
		{
			name: "correct_rate",
			description: "correct rate in percentage",
			type: 10,
			required: true,
		},
		{
			name: "correct",
			description: "correct ✅",
			type: 10,
			required: true,
		},
		{
			name: "saves",
			description: "saves",
			type: 10,
			required: true,
		},
		{
			name: "count_role",
			description: "role that will be given on stats complete",
			type: 8,
			required: true,
		},
		{
			name: "vote_saves",
			description: "set saves for vote command",
			type: 10,
			required: true,
		},
		{
			name: "vote_save_role",
			description: "set vote save role",
			type: 8,
			required: true,
		},
	],
	callback: async ({ interaction }) => {
		const { options } = interaction;
		try {
			await interaction.deferReply({ ephemeral: true });

			const correctRate = options.getNumber("correct_rate");
			const correct = options.getNumber("correct");
			const saves = options.getNumber("saves");
			const vote_saves = options.getNumber("vote_saves");
			const { id: COUNTING_ROLE_ID } = options.getRole("count_role");
			const { id: VOTE_SAVE_ROLE_ID } = options.getRole("vote_save_role");

			data.configuration = {
				correctRate,
				correct,
				saves,
				COUNTING_ROLE_ID,
				vote_saves,
				VOTE_SAVE_ROLE_ID,
			};

			fs.writeFileSync(
				path.join(__dirname, "..", "data.json"),
				JSON.stringify(data)
			);

			await replyOrEditInteraction(interaction, {
				content: "Changed the config!",
			});
		} catch (err) {
			await handleInteractionError(err, interaction);
		}
	},
};
