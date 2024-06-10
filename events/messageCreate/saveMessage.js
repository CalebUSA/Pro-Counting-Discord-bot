const { PermissionsBitField } = require("discord.js");
const { isCorrectCountMessage } = require("../../utils/count");
const { sendLockChannelEmbed } = require("../../utils/embed");
const data = require("./../../data.json");
const { COUNTING_CHANNNEL_ID } = process.env;

module.exports = async (message) => {
	try {
		const { channel, content, guild } = message;

		if (channel.id !== process.env.COUNTING_CHANNNEL_ID) return;

		console.log("Message received in counting channel");
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

		// If it's a personal save, check the remaining saves
		if (personSaveUsed) {
			const remainingSavesMatch = content.match(/You have (\d+(\.\d+)?) left/);
			if (remainingSavesMatch) {
				const remainingSaves = parseFloat(remainingSavesMatch[1]);
				if (remainingSaves >= 2) {
					console.log("User has more than 2 saves left. No action taken.");
					return;
				}
			} else {
				console.log("Could not find remaining saves in the message.");
				return;
			}
		}

		await referenceMessage.member.roles.remove(
			data.configuration.COUNTING_ROLE_ID
		);

		if (!guildSaveUsed) return;

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
		await sendLockChannelEmbed(referenceMessage.member, hasRole);
	} catch (error) {
		console.log(error);
	}
};
