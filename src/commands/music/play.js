const MachinaLib = require('../../../lib');
const Command = MachinaLib.Command;
const LimitQueue = MachinaLib.dataStructs.LimitQueue;
const ytdl = require('ytdl-core');

const ytdlOptions = { filter: 'audioonly' };
const streamOptions = {
    seek: 0,
    volume: 0.25
};
const limQSize = 256;

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

  async playSongs(msg, opts) {
    let guild = msg.guild;
    let vc = guild.voiceConnection.channel;
    let queue = this.client.globals.queues[guild.id];
    if (!vc.connection.dispatcher) { // Play song *only* if it is at the front of the queue and nothing else is playing.
      let songURL = queue.dequeue();

      if (songURL) {
        let dispatcher = vc.connection.playStream(ytdl(songURL, ytdlOptions), streamOptions);

        dispatcher.once('end', () => {
          this.playSongs(msg, opts);
        });
      } else {
        vc.leave();
      }
    }
  }

  async execute(msg, opts) {
    const url = opts._[0] || opts.url;
    const isList = opts.list; // Is YT playlist?
    const guild = msg.guild;

    if (isList) {
      msg.say("Playlist feature not available yet. Stay tuned!");
    } else {
      if (ytdl.validateURL(url)) {
        const vc = msg.member.voiceChannel;
        if (vc) { // User in voice channel?

          // Create queue if one does not already exist
          let queues = this.client.globals.queues;

          if (!queues[guild.id]) queues[guild.id] = new LimitQueue(limQSize);

          // Append song to queue.
          let queue = queues[guild.id];
          if (!queue.isFull()) {
            queues[guild.id].enqueue(url);

            msg.say("Added song to queue (" + queue.getLength() + "/" + queue.getLimit() + ")");

            vc.join().then(() => {
              this.playSongs(msg, opts);
            })
            .catch((err) => {
              msg.say("Could not connect to voice channel.");
            });
          } else {
            msg.say("Queue full (256)");
          }
        } else {
          msg.say("You must be in a voice channel to use that command.");
        }
      } else {
        msg.say("Invalid URL");
      }
    }
  }
}
