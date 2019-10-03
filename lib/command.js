'use-strict';

const commando = require('discord.js-commando');
const getopts = require("getopts");
const { parseArgsStringToArgv } = require('string-argv');

class Command extends commando.Command {
  /*
    opts: Array of objects representing parameters for a command (using the getopts module syntax).
  */
  constructor(client, options) {
    super(client, Object.assign({ args: undefined }, options));

    let defaultIncludedOpts = {
      alias: {
        help: 'h'
      },
      default: {

      }
    };

    let combinedOpts = options.opts;
    combinedOpts.alias = Object.assign(defaultIncludedOpts.alias, options.opts.alias);
    combinedOpts.default = Object.assign(defaultIncludedOpts.default, options.opts.default);

    this.opts = Object.assign(defaultIncludedOpts, options.opts);
  }

  clearThrottle(userId) {
    this._throttles.delete(userId);
  }

  getCommandPrefix(msg) {
    const guild = msg.guild;

    if (guild) {
      if (guild.commandPrefix) {
        return guild.commandPrefix;
      }
    }

    return process.env.CMD_PREFIX;
  }

  getOpts(msg) {
    let regExp = null;
    let commandPrefix = this.getCommandPrefix(msg);

    const aliases = this.aliases;
    const aliasesRegEx = '(' + aliases.join(')|(') + ')';

    // Remove cmd prefix + base cmd from args.
    if (msg.channel.type === 'dm') { // Account for now prefix and prefix in DMs.
      let regExpString = String.raw`^([\s]*)((${commandPrefix})?)([\s]*)(${this.name})|${aliasesRegEx}([\s]*)`;
      regExp = new RegExp(regExpString);
    } else {
      let regExpString = String.raw`^([\s]*)(${commandPrefix})([\s]*)((${this.name})|${aliasesRegEx})([\s]*)`;
      regExp = new RegExp(regExpString);
    }
    const optsString = msg.content.replace(regExp, '');
    const passedOpts = parseArgsStringToArgv(optsString);

    try {
      let opts = getopts(passedOpts, this.opts);
      return opts;
    } catch (err) {
      msg.say("Failed to parse command options. Check your input and try again?");
      return null;
    }
  }

  // Override if necessary.
  getUsage(commandPrefix) {
    return commandPrefix + this.name;
  }

  // Overridable. Send help message.
  getHelp(msg) {
    const commandPrefix = this.getCommandPrefix(msg);

    return ("Name: " + this.name + "\n" +
            "Details: " + this.details + "\n" +
            "Guild Only: " + this.guildOnly + "\n" +
            "Usage: " + this.getUsage(commandPrefix) + '\n' +
            "Examples:\n\t" + commandPrefix + this.examples.join("\n\t" + commandPrefix));
  }

  async sendHelp(msg) {
    const help = this.getHelp(msg);
    return msg.say(help);
  }

  // Abstract method. Executed the command.
  async execute(msg, opts) {

  }

  // Do not override!!!
  async run(msg, args) {
    let opts = this.getOpts(msg);

    if (opts.help) {
      this.sendHelp(msg);
    } else {
      this.execute(msg, opts);
    }
  }
}

module.exports = Command;
