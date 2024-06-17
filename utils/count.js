const data = require("./../data.json");

const isCorrectCountMessage = async (message) => {
  const {
    author: { bot, id },
    reference,
    guild,
  } = message;

  if (!bot || id !== process.env.COUNTING_BOT_ID) return;

  if (!reference) return;

  const fetchedMessage = await guild.channels.cache
    .get(reference.channelId)
    .messages.fetch(reference.messageId);

  return fetchedMessage;
};

const extractValue = (pattern, text, parser = parseFloat) => {
  const match = text.match(pattern);

  return match ? parser(match[1].replace(/,/g, "")) : 0;
};

const extractAndCompareUsingRegex = function (text) {
  const correctRate = extractValue(/Correct Rate: \*\*(\d+\.\d+)%\*\*/, text);
  const correct = extractValue(/✅ \*\*([\d,]+)\*\*/, text);
  const countedSaves = extractValue(/Saves: \*\*(\d+(?:\.\d+)?)\//, text);

  const {
    correctRate: targetRate,
    correct: targetCorrect,
    saves: targetSaves,
  } = data.configuration;

  const needed = {
    correctRate: Math.max(0, targetRate - correctRate),
    correct: Math.max(0, targetCorrect - correct),
    saves: Math.max(0, targetSaves - countedSaves),
  };

  if (needed.correctRate > 0 || needed.correct > 0 || needed.saves > 0) {
    return needed;
  }

  return "match found";
};

module.exports = { isCorrectCountMessage, extractAndCompareUsingRegex };
