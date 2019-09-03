const MachinaLib = require('../../../lib');
const Command = MachinaLib.Command;

module.exports = class SkipCommand extends MachinaLib.Command {
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
      ]
    });
  }

  getUsage(opts) {
    let usage = super.getUsage();

    return usage;
  }



  async execute(msg, opts) {
    const memVC = msg.member.voiceChannel;
    const cliVC = msg.guild.voiceConnection.channel;

    if (memVC && cliVC) {
      const memVCID = memVC.id;
      const cliVCID = cliVC.id;

      if (memVCID === cliVCID) {
        cliVC.connection.dispatcher.end();
        msg.say("Skipped song.");
      } else {
        msg.say("We must be in the same voice channel to do that.");
      }
    } else {
      msg.say("One of us is not in a voice channel.");
    }
  }
}
