![](readme-assets/banner.png)

# Intro

A general-purpose Discord bot that uses a POSIX-style command syntax.

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

# Default Commands

## Utility

| Name | Description | Usage |
| --- | -------- | -------- |
| help | Show a list of commands or get details about a specific command. | ->help [cmd/groupID] [pageNumber] [-p\|--page=number], ->cmd --help |
| prefix | Show or set the command prefix (per server). | ->prefix [prefix] |

## Information

| Name | Description | Usage |
| --- | -------- | -------- |
| info | Get info about the bot. | ->info |

## Music

| Name | Description | Usage |
| --- | -------- | -------- |
| play | Play music command. | ->play [URL] [-u\|--url=string] [-p\|--playlist] [-f\|--file] [-s\|--search] |
| queue | Play music command. | ->q [pageNumber] [-p\|--page=number] |
| skip | Skip song command. | ->skip [number] |
| loop | Command to enable, disable, toggle, or check looping of the current song in the queue. | ->loop [true\|false\|?] |

## Execute

| Name | Description | Usage |
| --- | -------- | -------- |
| exec | Execute commands that are reliant on the bot host. | ->exec \<program\> [...opts] [--proghelp] |

# Environment Variables

dotenv is supported, so you can put these in a .env file at the root of the project.

## Required Environment Variables

`CMD_PREFIX` - The bot command prefix.

`DISCORD_TOKEN` - The bot token.

`OWNER` - The ID of the bot owner.

## Optional Environment Variables

`OSU_API_KEY` - API key for osu!. Used for osu! integration.
