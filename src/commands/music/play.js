const VCMusicCommand = require('./classes/vc-music-command');
const MusicQueue = require('./classes/music-queue');
const Song = require('./classes/song');
const ytdl = require('ytdl-core');
const request = require('request');

const ytdlOptions = { filter: 'audioonly' };
const streamOptions = {
    seek: 0,
    volume: 0.25
};
const limQSize = 256;
const maxFileSize =  32 * 1024 * 1024; // 32 MB
const streamTypes = require('./constants/stream-types');

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
        boolean: ["playlist", "file"],
        alias: {
          url: 'u',
          list: 'p',
          file: 'f'
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
        process.env.CMD_PREFIX + 'play --playlist --url https://www.youtube.com/playlist...',
        process.env.CMD_PREFIX + 'play -pu https://www.youtube.com/playlist...',
        process.env.CMD_PREFIX + 'play --file https://.../....mp3',
        process.env.CMD_PREFIX + 'play -f --url https://.../....mp3'
      ],
      forceMemberVC: true
    });
  }

  getUsage(opts) {
    let usage = super.getUsage() + " ";
    usage += "[URL] [-u|--url=string] [-p|--playlist] [-f|--file]";

    return usage;
  }

  // Is the URL safe to stream from?
  validateURLSafety(url) {
    let safe = true;

    if (!url.startsWith('https://')) {
      safe = false;
    }

    return safe;
  }


  // Resolves with nothing.
  // Rejects with a reason (string).
  validateFileURLInfo(url) {
    return new Promise((res, rej) => {
      return request.head(url, (err, resp, body) => {
        if (err) {
          return rej("Bad URL");
        } else {
          const contentType = resp.headers['content-type'];
          const contentLength = resp.headers['content-length'];

          let validContentType = contentType.startsWith('audio/');
          let validContentLength = contentLength <= maxFileSize;

          if (validContentType && validContentLength) {
            return res();
          } else {
            if (!validContentType) {
              return rej("Invalid file type");
            } else if (!validContentLength) {
              const sizeLimMB = (maxFileSize / 1024) / 1024;
              return rej("File size too big (" + sizeLimMB + " MB limit).");
            }
          }
        }
      });
    });
  }

  // Resolves with nothing.
  // Rejects with a reason (string).
  validateFileURL(url) {
    return new Promise((res, rej) => {
      if (!this.validateURLSafety(url)) {
        return rej("Unsafe URL");
      }

      return this.validateFileURLInfo(url)
      .then(() => {
        return res();
      })
      .catch(reason => {
        return rej(reason);
      });
    });
  }

  // Resolves with a string if URL has type and null otherwise.
  // Rejects with a reason (string).
  getStreamType(url, opts) {
    const checkFile = opts.file;

    return new Promise((res, rej) => {
      let type = null;

      if (ytdl.validateURL(url + '')) {
        type = streamTypes.YOUTUBE;
        return res(type);
      }

      if (checkFile) {
        return this.validateFileURL(url)
        .then(() => {
          type = streamTypes.FILE;
          return res(type);
        })
        .catch((reason) => {
          return rej(reason);
        });
      } else {
        return rej('Invalid URL');
      }
    });
  }

  // Get stream based on type.
  getStream(type, url) {
    if (type === streamTypes.YOUTUBE) {
      return ytdl(url, ytdlOptions);
    } else if (type === streamTypes.FILE) {
      return request(url);
    } else {
      return null;
    }
  }

  async playSongs(msg) {
    let guild = msg.guild;
    let vc = guild.voiceConnection.channel;
    let queue = this.client.globals.queues[guild.id];
    if (!vc.connection.dispatcher) { // Play song *only* if it is at the front of the queue and nothing else is playing.
      let song = queue.getHead();

      if (song) {
        let dispatcher = vc.connection.playStream(this.getStream(song.getType(), song.getURL()), streamOptions);

        dispatcher
        .once('end', () => {
          if (!queue.isLoopingOne()) {
            queue.dequeue()
          }

          this.playSongs(msg);
        })
        .once('error', (err) => {
          console.error('Error streaming audio. Was input properly validated?\n' + err.stack);
        });
      } else {
        vc.leave();
        delete this.client.globals.queues[guild.id];
      }
    }
  }

  async conditionalExecute(msg, opts) {
    let urlOpt = opts._[0] || opts.url;
    let url = "";

    if (Array.isArray(urlOpt)) url = urlOpt[0];
    else url = urlOpt;

    if (!url && msg.attachments.size) {
      url = msg.attachments.first().url;
    } else if (!url) {
      return msg.say('No URL given');
    }

    const isPlaylist = opts.playlist; // Is YT playlist?
    const guild = msg.guild;

    if (isPlaylist) {
      msg.say("Playlist feature not available yet. Stay tuned!");
    } else {
      const vc = msg.member.voiceChannel;
      let queues = this.client.globals.queues;

      this.getStreamType(url, opts)
      .then((type) => {
        // Create queue if one does not already exist
        if (!queues[guild.id]) {
          let newQueue = new MusicQueue(limQSize);
          queues[guild.id] = newQueue;
        }

        // Append song to queue.
        let queue = queues[guild.id];
        if (!queue.isFull()) {
          queue.enqueue(new Song(type, url));
          const queueLength = queue.getLength();

          if (queueLength === 1) {
            msg.say("Now playing");
          } else {
            msg.say("Added song to queue (" + (queueLength - 1) + "/" + queue.getLimit() + ")");
          }

          vc.join().then(() => {
            this.playSongs(msg, opts);
          })
          .catch((err) => {
            msg.say("Could not connect to voice channel.");
          });
        } else {
          msg.say("Queue full (256)");
        }
      })
      .catch((reason) => {
        msg.say(reason);
      });
    }
  }
}
