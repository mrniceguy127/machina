const VCMusicCommand = require('./classes/vc-music-command');
const MusicQueue = require('./classes/music-queue');
const ytdl = require('ytdl-core');

const ytdlOptions = { filter: 'audioonly' };
const streamOptions = {
    seek: 0,
    volume: 0.25
};
const limQSize = 256;

module.exports = class PlayCommand extends VCMusicCommand {
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
        boolean: ["playlist"],
        alias: {
          url: 'u',
          list: 'p'
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
        process.env.CMD_PREFIX + 'play -pu https://www.youtube.com/playlist...',
        process.env.CMD_PREFIX + 'play -p --url https://www.youtube.com/playlist...',
      ],
      forceMemberVC: true
    });
  }

  getUsage(opts) {
    let usage = super.getUsage() + " ";
    usage += "[URL] [-u|--url=string] [-p|--playlist]";

    return usage;
  }

  async playSongs(msg, opts) {
    let guild = msg.guild;
    let vc = guild.voiceConnection.channel;
    let queue = this.client.globals.queues[guild.id];
    if (!vc.connection.dispatcher) { // Play song *only* if it is at the front of the queue and nothing else is playing.
      let songURL = queue.getHead();

      if (songURL) {
        let dispatcher = vc.connection.playStream(ytdl(songURL, ytdlOptions), streamOptions);

        dispatcher.once('end', () => {
          if (!queue.isLoopingOne()) {
            queue.dequeue()
          }

          this.playSongs(msg, opts);
        });
      } else {
        vc.leave();
      }
    }
  }

  async conditionalExecute(msg, opts) {
    const url = opts._[0] || opts.url;
    const isPlaylist = opts.playlist; // Is YT playlist?
    const guild = msg.guild;

    if (isPlaylist) {
      msg.say("Playlist feature not available yet. Stay tuned!");
    } else {
      if (ytdl.validateURL(url)) {
        const vc = msg.member.voiceChannel;

        // Create queue if one does not already exist
        let queues = this.client.globals.queues;

        if (!queues[guild.id]) {
          let newQueue = new MusicQueue(limQSize);
          queues[guild.id] = newQueue;
        }

        // Append song to queue.
        let queue = queues[guild.id];
        if (!queue.isFull()) {
          queue.enqueue(url);

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
        msg.say("Invalid URL");
      }
    }
  }
}
