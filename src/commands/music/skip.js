'use-strict';

const VCMusicCommand = require('./classes/vc-music-command');

module.exports = class SkipCommand extends VCMusicCommand {
  constructor(client) {
    super(client, {
      name: 'skip',
      aliases: [],
      group: 'music',
      memberName: 'skip',
      description: 'Skip song command.',
      details: 'Skip song command. Usable when in a voice channel and a song is playing. Can skip multiple songs at once.',
      guildOnly: true,
      opts: {},
      examples: [
        'skip --help',
        'skip',
        'skip 3'
      ],
      forceSameVC: true
    });
  }

  getUsage(cmdPfx) {
    let usage = super.getUsage(cmdPfx) + " ";
    usage += "[number]";

    return usage;
  }



  async conditionalExecute(msg, opts) {
    const guild = msg.guild;
    const cliVConn = guild.voiceConnection;
    const dispatcher = cliVConn.dispatcher;
    const queue = this.client.globals.queues[guild.id];
    const amountOpt = opts._[0];

    let amount = 1;

    if (amountOpt) {
      const possibleNum = parseInt(amountOpt);
      const isNum = possibleNum !== NaN;
      if (isNum) {
        amount =  possibleNum;
      }
    }

    let i;
    for (i = 0; i < amount - 1; i++) {
      queue.dequeue();
    }

    queue.disableLoopOne();
    dispatcher.end();
    msg.say("Skipped " + amount + " song(s).");
  }
}
