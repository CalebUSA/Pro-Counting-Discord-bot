const { isCorrectCountMessage } = require("../../utils/count");
const data = require("./../../data.json");

module.exports = async (message) => {
	try {
		const { embeds } = message;

		if (embeds[0]?.data?.title !== "Vote for counting to earn saves") return;

		const referenceMessage = await isCorrectCountMessage(message);

		if (!referenceMessage) return;

		const {
			member: { roles, user },
		} = referenceMessage;

		console.log(embeds[0]);

		// for hours check embeds[0].data.fields

		const regex = /You currently have \*\*(\d+(\.\d+)?)/;

		const match = embeds[0].data.description.match(regex);

		if (!match) return;

		const userSaves = parseFloat(match[1]);

		console.log(userSaves);

		if (userSaves >= data.configuration.vote_saves) {
			await message.react('✅');
			console.log("user had the required saves");
		}

		if (userSaves < data.configuration.vote_saves) {
			await message.react('❌');
			await roles.remove(data.configuration.VOTE_SAVE_ROLE_ID);
			await message.channel.send(`Uh oh! <@${user.id}>, it looks like you are under 1 save. Please vote to get more saves. I'm sorry for the hassle, but this is a precaution to protect our count.`);
			console.log("user was missing the required saves");

			const logsChannel = message.guild.channels.cache.get(process.env.LOGS_CHANNEL_ID);
			if (logsChannel) {
				await logsChannel.send(`${user.username} typed c!vote in <#${process.env.VOTE_CHANNEL_ID}> and they have ${userSaves} saves. Since that was less than 1 save, we took the counting role away from them to protect our count.`);
			}
		}
	} catch (error) {
		console.log(error);
	}
};
