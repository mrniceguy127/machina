'use-strict';

const VCMusicCommand = require('./classes/vc-music-command');

module.exports = class LoopCommand extends VCMusicCommand {
  constructor(client) {
    super(client, {
      name: 'loop',
      aliases: [],
      group: 'music',
      memberName: 'loop',
      description: 'Command to enable, disable, or toggle looping of the current song in the queue.',
      details: 'Command to enable, disable, toggle, or check looping of the current song in the queue.',
      guildOnly: true,
      opts: {},
      examples: [
        process.env.CMD_PREFIX + 'loop',
        process.env.CMD_PREFIX + 'loop true',
        process.env.CMD_PREFIX + 'loop false',
        process.env.CMD_PREFIX + 'loop ?'
      ],
      forceSameVC: true
    });
  }

  getUsage(opts) {
    let usage = super.getUsage() + " ";
    usage += "[true|false|?]";

    return usage;
  }

  getHelp(msg) {
    const basicHelp = super.getHelp();

    let newHelp = basicHelp + '\nArguments:\n\t' +
                  'true - Enable looping\n\t' +
                  'false - Disable looping\n\t' +
                  '? - Is the song looping?\n\t' +
                  '*NO ARGUMENT* - Toggle looping.';

    return newHelp;
  }

  async conditionalExecute(msg, opts) {
    const shouldLoopOpt = opts._[0]; // Whether or not to loop the current song. undefined if should toggle.
    const guild = msg.guild;
    let queue = this.client.globals.queues[guild.id];

    if (shouldLoopOpt === '?') {
      return msg.say('Song is ' + (queue.isLoopingOne() ? '' : 'NOT ') + 'looping.');
    }


    // Opt is always a string, unless it is undefined.
    const optIsBool = typeof shouldLoopOpt === 'string' ? (shouldLoopOpt.toLowerCase() === 'true') || (shouldLoopOpt.toLowerCase() === 'false') : false;

    if (!optIsBool) {
      if (shouldLoopOpt !== undefined) {
        return msg.say("Unrecognized option. Should be true, false, or omitted entirely (toggle).");
      } else {
        queue.toggleLoopOne();
        return msg.say('Toggled looping song (' + (queue.isLoopingOne() ? 'LOOPING' : 'STOPPED LOOPING') + ').');
      }
    } else {
      const shouldLoop = shouldLoopOpt.toLowerCase() === 'true';
      if (shouldLoop) {
        queue.enableLoopOne();
        return msg.say('Now looping song.');
      } else {
        queue.disableLoopOne();
        return msg.say('Stopped looping song.');
      }
    }
  }
}
