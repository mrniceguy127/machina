'use-strict';
// TODO Make MusicPlayer class that inherits from MusicQueue (for added media validation and playing)

const VCMusicCommand = require('./classes/vc-music-command');
const MusicQueue = require('./classes/music-queue');
const Song = require('./classes/song');
const ytdl = require('ytdl-core');
const request = require('request');
const YTPlaylistScraper = require('./classes/yt-playlist-scraper');
const YTSearchScraper = require('./classes/yt-search-scraper');

const plScraper = new YTPlaylistScraper();
const searchScraper = new YTSearchScraper()

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
        boolean: ["playlist", "file", "search"],
        alias: {
          url: 'u',
          playlist: 'p',
          file: 'f',
          search: 's'
        },
        default: {
          url: '',
          playlist: false,
          search: false,
          file: false
        }
      },
      examples: [
        'play --help',
        'play https://www.youtube.com/...',
        'play -u https://www.youtube.com/...',
        'play https://www.youtube.com/playlist... -l',
        'play --playlist --url https://www.youtube.com/playlist...',
        'play -pu https://www.youtube.com/playlist...',
        'play --file https://.../....mp3',
        'play -f --url https://.../....mp3'
      ],
      forceMemberVC: true
    });
  }

  getUsage(cmdPfx) {
    let usage = super.getUsage(cmdPfx) + " ";
    usage += "[URL] [-u|--url=string] [-p|--playlist] [-f|--file] [-s|--search]";

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

  async postEnqueue(msg, opts, queue, wasPlaylist) {
    const vc = msg.member.voiceChannel;
    const queueLength = queue.getLength();

    if (queueLength === 1) {
      msg.say("Now playing");
    } else {
      if (wasPlaylist) {
        msg.say("Added songs to queue (" + (queueLength - 1) + "/" + queue.getLimit() + ")");
      } else {
        msg.say("Added song to queue (" + (queueLength - 1) + "/" + queue.getLimit() + ")");
      }
    }

    vc.join().then(() => {
      this.playSongs(msg, opts);
    })
    .catch((err) => {
      console.error(err.stack)
      msg.say("Could not connect to voice channel.");
    });
  }

  getYTURLFromQuery(query) {
    const baseURL = 'https://www.youtube.com/';
    let urlParams = 'results?search_query=' + encodeURIComponent(query);
    let url = baseURL + urlParams;
    return url;
  }


  getGuildQueue(guild) {
    let queues = this.client.globals.queues;
    return queues[guild.id];
  }

  createGuildQueue(guild) {
    this.client.globals.queues[guild.id] = new MusicQueue(limQSize);
  }

  createQueueIfNotExist(guild) {
    // Create queue if one does not already exist

    let queue = this.getGuildQueue(guild);

    if (!queue) {
      this.createGuildQueue(guild);
    }
  }

  async conditionalExecute(msg, opts) {
    let urlOpt = opts._[0] || opts.url;
    let url = "";

    const searchOpt = opts.search;

    if (Array.isArray(urlOpt)) url = urlOpt[0];
    else url = urlOpt;

    if (!url && msg.attachments.size) {
      url = msg.attachments.first().url;
    } else if (!url) {
      return msg.say('No URL given');
    }

    const isPlaylistOpt = opts.playlist; // Is YT playlist?
    const guild = msg.guild;

    if (searchOpt) {
      let searchURL = this.getYTURLFromQuery(opts._.join(' '));
      return searchScraper.scrape(searchURL)
      .then((foundURL) => {
        if (foundURL) {
          this.createQueueIfNotExist(guild);
          let queue = this.getGuildQueue(guild);

          queue.enqueue(new Song(streamTypes.YOUTUBE, foundURL));
          this.postEnqueue(msg, opts, queue, false);
        } else {
          msg.say("No videos found");
        }
      });
    }

    this.getStreamType(url, opts)
    .then((type) => {
      this.createQueueIfNotExist(guild);
      let queue = this.getGuildQueue(guild);

      if (!queue.isFull()) {
        if (type === streamTypes.YOUTUBE && isPlaylistOpt) {
          plScraper.scrape(url)
          .then((urls) => {
            const urlsLen = urls.length;
            if (urlsLen) {
              let i;
              for (i = 0; i < urlsLen; i++) {
                if (!queue.isFull()) {
                  queue.enqueue(new Song(type, urls[i]));
                }
              }

              this.postEnqueue(msg, opts, queue, true);
            } else {
              msg.say("Not a YT playlist");
            }
          })
          .catch((err) => {
            msg.say("Bad URL response.");
          });
        } else {
          queue.enqueue(new Song(type, url));
          this.postEnqueue(msg, opts, queue, false);
        }
      } else {
        msg.say("Queue full (256)");
      }
    })
    .catch((reason) => {
      msg.say(reason || "An error occured");
    });
  }
}
