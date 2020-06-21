'use-strict';

const MachinaLib = require('../../../lib');

const requiredPermissions = [ 'MANAGE_MESSAGES' ];

module.exports = class PurgeCommand extends MachinaLib.Command {
  constructor(client) {
    super(client, {
      name: 'purge',
      aliases: [],
      group: 'util',
      memberName: 'purge',
      description: 'Mass delete messages (Max 99, Min 1).',
      details: 'Mass delete the most recent messages up to 99 at a time.',
      guildOnly: true,
      opts: {
        string: ['amount'],
        alias: {
          amount: 'n'
        }
      },
      examples: [
        'purge -n 53',
        'purge --help'
      ],
      ownerOnly: false
    });
  }

  getUsage(cmdPfx) {
    let usage = super.getUsage(cmdPfx) + " ";
    usage += "[amount] [-n|--amount=number]";

    return usage;
  }

  memberHasPermission(member, requiredPermissions, channel) {
    return (
      member.hasPermission(requiredPermissions)
      && member.permissionsIn(channel).has(requiredPermissions)
    );
  }

  async execute(msg, opts) {
    const amountOpt = opts.amount === "" ? opts._[0] : opts.amount;
    const amount = parseInt(amountOpt);
    const guild = msg.guild;
    const member = msg.member;
    const clientMember = guild.me;
    const channel = msg.channel;

    const memberHasPermission = this.memberHasPermission(member, requiredPermissions, channel);
    const clientMemberHasPermission = this.memberHasPermission(clientMember, requiredPermissions, channel);

    if (!clientMemberHasPermission)
      return msg.say("I have insufficient permissions to delete messages");
    if (!memberHasPermission)
      return msg.say("You have insufficient permissions to delete messages");

    if (isNaN(amount)) return msg.say("Invalid number of messages");
    if (amount > 99 || amount < 1)
      return msg.say("The purge amount must be `< 100 and > 0`");
   
    let textChannel = msg.channel;

    return textChannel.bulkDelete(amount + 1)
    .then(() => msg.say(`Successfully deleted ${amount} messages`))
    .catch(() => msg.say("Failed to delete messages"));
  }
}
