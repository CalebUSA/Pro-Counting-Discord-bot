# Discord Pro Counting Bot

A discord bot made on the top of https://discord.bots.gg/bots/510016054391734273 . It reads messages from the bot whenever someone does `c!user` it'll see if the global stats meet the criteria you set. If yes, it'll give the role and notify in logs channel.

## Features

- **Setup a criteria**: Setup criteria for your users using the command `/set_config [rate] [correct_amount] [saves] [role]` explanation below.
- **Reading messages from Counting bot**: Whenever someone does `c!user` bot will see if user global stats are equal pr greater than the stats mentioned in configuration, if it'll award them the role set.
- **Channel lock on save usage**: If someone uses a save and answers wrong, the channel gets locked and is notified in logs channel.
- **Command**: `/view_config` to see current configuration.

![Example Image of bot working](https://github.com/bilal-the-dev/Pro-Counting-Discord-bot/blob/main/Screenshot%202024-06-04%20000225.png)

## Configuration

To configure the bot, you need to set the following environment variables in the bot's configuration file:

```bash
TOKEN=''

COUNTING_BOT_ID=510016054391734273

COUNTING_CHANNNEL_ID=1245955928298360892
LOGS_CHANNEL_ID=1247226078758441121
VOTE_CHANNEL_ID=1245955928298360892
MAIN_BOT_SERVER_CHANNEL_ID=1247230854766395432

```

# Example Usage

You set the configuration and when someone does c!user, bot will read stats from counting bot, if they are upto criteria bot will add the role. If someone messes up and uses saves in counting, bot will lock the channel :3

## Social Media Links

For more information, visit my posts on:

- [Twitter](https://twitter.com/bilal_the_dev/status/1768520539155427707)
- [LinkedIn](https://www.linkedin.com/feed/update/urn:li:share:7174285804301651968/)
- [Facebook](https://www.facebook.com/permalink.php?story_fbid=pfbid02mXhoPTEx5YKmfP7Rzrnc2UbN12bufduivhfZSwm3Bp2A68gN3fKsDDpanCw3hL3Ul&id=61556182875591&__cft__[0]=AZXUVu8H3vFm8-mKrqog67-gftIXT58S3ewE0NZ0to1UuNNz7gmxc26Af8y_IaQYQVcxkORN1NFp0tRndFczCW55M7hv7gp5YWWIJKX9OZK_Ww&__tn__=%2CO%2CP-R)

## Installation

To get started with the bot, follow the general guide on how to run my Discord bots [here](https://github.com/bilal-the-dev/How-to-run-my-discord-bots). If you encounter any issues, please open an issue on GitHub.
