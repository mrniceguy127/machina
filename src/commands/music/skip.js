const VCMusicCommand = require('./classes/vc-music-command');

module.exports = class SkipCommand extends VCMusicCommand {
  constructor(client) {
    super(client, {
      name: 'skip',
      aliases: [],
      group: 'music',
      memberName: 'skip',
      description: 'Skip song command.',
      details: 'Skip song command. Usable when in a voice channel and a song is playing.',
      guildOnly: true,
      opts: {},
      examples: [
        process.env.CMD_PREFIX + 'skip --help',
        process.env.CMD_PREFIX + 'skip',
      ],
      forceSameVC: true
    });
  }

  getUsage(opts) {
    let usage = super.getUsage();

    return usage;
  }



  async conditionalExecute(msg, opts) {
    const guild = msg.guild;
    const cliVConn = guild.voiceConnection;
    const dispatcher = cliVConn.dispatcher;
    const queue = this.client.globals.queues[guild.id];

    queue.disableLoopOne();
    dispatcher.end();
    msg.say("Skipped song.");
  }
}
