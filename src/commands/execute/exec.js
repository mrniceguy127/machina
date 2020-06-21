'use-strict';

const MachinaLib = require('../../../lib');
const fs = require('fs');
const path = require('path');

const progsPath = path.resolve('./exec/progs.json');
let progs = {};

if (fs.existsSync(progsPath)) {
  progs = require(progsPath);
}

module.exports = class TestCommand extends MachinaLib.Command {
  constructor(client) {
    super(client, {
      name: 'exec',
      aliases: [],
      group: 'execute',
      memberName: 'exec',
      description: 'Execute commands that are reliant on the bot host.',
      details: 'Execute commands that are reliant on the bot host.',
      guildOnly: false,
      opts: {
        boolean: ['proghelp'],
        default: {
          proghelp: false
        }
      },
      examples: [
        'exec someprogram --someoption optionarg'
      ],
      throttling: {
        usages: 1,
        duration: 2.5 * 60
      }
    });
  }

  getUsage(cmdPfx) {
    let usage = super.getUsage(cmdPfx) + " ";
    usage += "<program> [...opts] [--proghelp]";

    return usage;
  }

  getProgHelp(progDetails) {
    const name = progDetails.name;
    const details = progDetails.details;
    const usage = process.env.CMD_PREFIX + progDetails.usage;
    const examples = ('\n\t' + process.env.CMD_PREFIX) + progDetails.examples.join('\n\t' + process.env.CMD_PREFIX);

    let msgText = 'Name: ' + name;
    msgText += '\nDetails: ' + details;
    msgText += '\nUsage: ' + usage;
    msgText += '\nExamples:' + examples;

    return msgText;
  }

  async execute(msg, opts) {
    const cmdOpts = opts._;
    const user = msg.author;


    if (cmdOpts.length) {
      const progName = cmdOpts[0];
      const progDetails = progs[progName];

      if (progDetails) {
        if (opts.proghelp) {
          msg.say(this.getProgHelp(progDetails));
        } else {
          const Prog = require(path.join('../../../exec/progs/', progName));
          let prog = new Prog();

          prog.exec(msg, progDetails)
          .then(() => {
            msg.say('Program executed successfully');
          })
          .catch((err) => {
            this.clearThrottle(user.id);
            msg.say('Execution failed. Check your command input. As a last resort, contact the bot host.');
          });
        }
      } else {
        msg.say("Program not found.");
      }
    } else {
      msg.say('No program given.');
    }
  }
}
