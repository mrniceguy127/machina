const MachinaLib = require('../../../../lib');

module.exports = class VCMusicCommand extends MachinaLib.Command {
  constructor(client, options) {
    super(client, options);
    this.forceMemberVC = !!options.forceMemberVC; // Member must be in a voice channel.
    this.forceSameVC = !!options.forceSameVC; // Member must be in the same voice channel as the client.
  }

  async execute(msg, opts) {
    const url = opts._[0] || opts.url;
    const isPlaylist = opts.playlist; // Is YT playlist?
    const guild = msg.guild;

    const memberVC = msg.member.voiceChannel;
    if (!memberVC && this.forceMemberVC) { // Member not in voice channel but must be?
      return msg.say("You must be in a voice channel to use that command.");
    }

    if (this.forceSameVC) {
      const clientVConn = guild.voiceConnection;
      if (!(clientVConn && memberVC)) { // Is true when either client or member is *not* in a voice channel.
        return msg.say('One of us is not in a voice channel.');
      } else if (clientVConn.channel.id !== memberVC.id) {
        return msg.say("We are not in the same voice channel.");
      }
    }

    return this.conditionalExecute(msg, opts);
  }
}
