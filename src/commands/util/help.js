'use-strict';

const MachinaLib = require('../../../lib');
const ArrayBook = MachinaLib.util.ArrayBook;

const maxCmdBookPageSize = 5;

module.exports = class HelpCommand extends MachinaLib.Command {
  constructor(client) {
    super(client, {
      name: 'help',
      aliases: [
        'h'
      ],
      group: 'util',
      memberName: 'help',
      description: 'View command help.',
      details: 'View command help in general or for a specific command.',
      guildOnly: false,
      opts: {
        string: ['page'],
        alias: {
          page: 'p'
        }
      },
      examples: [
        'help cmd',
        'cmd --help'
      ],
      ownerOnly: false
    });
  }

  getUsage(cmdPfx) {
    let usage = super.getUsage(cmdPfx) + " ";
    usage += "[cmd/groupID] [pageNumber] [-p|--page=number]";

    return usage;
  }

  getCommandoCommandHelp(msg, cmd) {
    const commandPrefix = this.getCommandPrefix(msg);

    return ("*[COMMANDO DEFAULT]*\n" +
            "Name: " + cmd.name + "\n" +
            "Details: " + cmd.details + "\n" +
            "Guild Only: " + cmd.guildOnly + "\n" +
            "*Format*: " + commandPrefix + cmd.name + " " + cmd.format + '\n' +
            "Examples:\n\t" + commandPrefix + cmd.examples.join("\n\t" + commandPrefix));
  }

  formatCmds(msg, opts, cmds, group) {
    let cmdsHelp = '__' + group.name + ' Help__';

    const cmdsToDisp = cmds.array().filter((cmd) => cmd.group.id === group.id);
    const cmdBook = new ArrayBook(cmdsToDisp, maxCmdBookPageSize);
    const pageOpt = opts.page || opts._[1];
    const page = cmdBook.getValidPage(pageOpt);
    const pageItems = cmdBook.getPageItems(page);

    let i;
    for (i = 0; i < pageItems.length; i++) {
      const cmd = pageItems[i];
      cmdsHelp += '\n' + cmd.name + ': ' + cmd.description + '\n\t';

      if (cmd.getUsage) {
        cmdsHelp += cmd.getUsage(this.getCommandPrefix(msg));
      } else {
        cmdsHelp += cmd.format;
      }
    }

    cmdsHelp += '\nPage (' + page + '/' + cmdBook.getMaxPage() + ')';

    return cmdsHelp;
  }

  formatGroups(msg, opts, groups) {
    let commandPrefix = this.getCommandPrefix(msg);

    let groupsHelp = '__**Help**__\nDo `' +
      commandPrefix + 'help [groupId]` for details about a command group or `' +
      commandPrefix + 'help [cmd]` for details about a specific command.' +
      '\nGroup IDs:';

    groupsHelp += ' ' + groups.array().map(group => group.id).join(', ');

    return groupsHelp;
  }

  formatHelp(msg, opts, cmds, groups) {
    let specificSection = opts._[0];

    const foundCmds = cmds.filter((cmd) => {
      if (cmd.name === specificSection || cmd.aliases.includes(specificSection)) {
        return cmd;
      }
    });

    const foundGroups = groups.filter((group) => {
      if (group.id === specificSection) {
        return group;
      }
    });

    if (foundCmds.size) {
      const cmd = foundCmds.first();
      if (cmd.getHelp) {
        return cmd.getHelp(msg);
      } else {
        return this.getCommandoCommandHelp(msg, cmd);
      }
    } else if (foundGroups.size) {
      return this.formatCmds(msg, opts, cmds, foundGroups.first());
    }

    return this.formatGroups(msg, opts, groups);
  }

  async execute(msg, opts) {
    const registry = this.client.registry;
    const cmds = registry.commands;
    const groups = registry.groups;
    const argsLength = opts._.length;

    msg.say(this.formatHelp(msg, opts, cmds, groups));
  }
}
