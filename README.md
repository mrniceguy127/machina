![](readme-assets/banner.png)

# Intro

A general purpose Discord bot that uses a POSIX-style command syntax.

# Requirements

These are required for the bot to be able to play audio in voice channels.
https://discord.js.org/#/docs/main/stable/general/faq

- ffmpeg
- Fulfilled requirements for node-opus.

# Installation + Running

```
git clone https://github.com/mrniceguy127/machina
cd machina
npm i
npm start
```

# Required Environment Variables

dotenv is supported, so you can put these in a .env file at the root of the project.

`CMD_PREFIX` - The bot command prefix.

`DISCORD_TOKEN` - The bot token.

`OWNER` - The ID of the bot owner.
