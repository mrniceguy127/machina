const MachinaLib = require('../../../lib');
const Command = MachinaLib.Command;
const ytdl = require('ytdl-core');

const ytdlOptions = { filter: 'audioonly' };
const streamOptions = {
    seek: 0,
    volume: 0.25
};

module.exports = class PlayCommand extends MachinaLib.Command {
  constructor(client) {
    super(client, {
      name: 'play',
      aliases: [],
      group: 'music',
      memberName: 'play',
      description: 'Play music command.',
      details: 'Play music command. Usable when in a voice channel.',
      guildOnly: true,
      opts: {
        string: ["url"],
        boolean: ["list"],
        alias: {
          url: 'u',
          list: 'l'
        },
        default: {
          url: '',
          list: false
        }
      },
      examples: [
        process.env.CMD_PREFIX + 'play --help',
        process.env.CMD_PREFIX + 'play https://www.youtube.com/...',
        process.env.CMD_PREFIX + 'play -u https://www.youtube.com/...',
        process.env.CMD_PREFIX + 'play https://www.youtube.com/playlist... -l',
        process.env.CMD_PREFIX + 'play -lu https://www.youtube.com/playlist...',
        process.env.CMD_PREFIX + 'play -l --url https://www.youtube.com/playlist...'
      ]
    });
  }

  getUsage(opts) {
    let usage = super.getUsage() + " ";
    usage += "[URL] [-u|--url=string] [-l|--list]";

    return usage;
  }



  async execute(msg, opts) {
    const url = opts._[0] || opts.url;
    const isList = opts.list; // Is YT playlist?

    if (msg.guild.voiceConnection) { // Already in voice channel?
      msg.say("Already playing music.");
    } else {
      if (isList) {
        msg.say("Playlist feature not available yet. Stay tuned!");
      } else {
        if (ytdl.validateURL(url)) {
          const vc = msg.member.voiceChannel;
          if (vc) { // User in voice channel?
            vc.join().then(() => {
              let dispatcher = vc.connection.playStream(ytdl(url, ytdlOptions), streamOptions);
              msg.say("Now playing.");
              dispatcher.once('end', () => {
                vc.leave();
              });
            })
            .catch((err) => {
              msg.say("Could not connect to voice channel.");
            });
          } else {
            msg.say("You must be in a voice channel to use that command.");
          }
        } else {
          msg.say("Invalid URL.");
        }
      }
    }
  }
}
