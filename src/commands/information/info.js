'use-strict';

const MachinaLib = require('../../../lib');

module.exports = class TestCommand extends MachinaLib.Command {
  constructor(client) {
    super(client, {
      name: 'info',
      aliases: [
        'about'
      ],
      group: 'information',
      memberName: 'info',
      description: 'Get info about the bot.',
      details: 'Get info about the bot.',
      guildOnly: false,
      opts: {},
      examples: [
        process.env.CMD_PREFIX + 'info'
      ],
      ownerOnly: false
    });
  }

  async execute(msg, opts) {
    msg.say('Author: <@222102269745823744>\n' +
            'GitHub: https://github.com/mrniceguy127/machina');
  }
}
