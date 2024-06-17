const { Client, IntentsBitField, Partials } = require("discord.js");
const WOK = require("wokcommands");
const path = require("path");
const dotenv = require("dotenv");

const { DefaultCommands } = WOK;
dotenv.config({ path: "./.env" });

const { TOKEN } = process.env;

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildMessageReactions,
  ],
  partials: [Partials.Channel],
});

client.on("ready", async (readyClient) => {
  try {
    console.log(`${readyClient.user.username} is running 🧶`);
  } catch (err) {
    console.log(err);
  }

  // Initialize wokcommands
  new WOK({
    client,
    commandsDir: path.join(__dirname, "./commands"),
    events: {
      dir: path.join(__dirname, "events"),
    },
    disabledDefaultCommands: [
      DefaultCommands.ChannelCommand,
      DefaultCommands.CustomCommand,
      DefaultCommands.Prefix,
      DefaultCommands.RequiredPermissions,
      DefaultCommands.RequiredRoles,
      DefaultCommands.ToggleCommand,
    ],
    cooldownConfig: {
      errorMessage: "Please wait {TIME} before doing that again.",
      botOwnersBypass: false,
      dbRequired: 300,
    },
  }).on('commandException', (command, error) => {
    console.error(`Command "${command}" encountered an error: ${error}`);
  }).on('commandLoaded', (command) => {
    console.log(`Command "${command}" has been loaded successfully`);
  });

  console.log("WOKCommands initialized");

  // Register commands (this will vary based on your actual setup)
  // Ensure the commands are loaded and registered
  await client.application.commands.set(await client.commands);
  console.log("Commands have been registered");
});

client.login(TOKEN);
