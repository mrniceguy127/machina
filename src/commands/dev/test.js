'use-strict';

const MachinaLib = require('../../../lib');

module.exports = class TestCommand extends MachinaLib.Command {
  constructor(client) {
    super(client, {
      name: 'test',
      aliases: [
        'tst'
      ],
      group: 'dev',
      memberName: 'testmembername',
      description: 'Test command for bot devs.',
      details: 'Test command for bot devs. You should *never* need this unless developing for Machina.',
      guildOnly: false,
      opts: {
        string: ["foo"],
        boolean: ["bar", "hoge"],
        alias: {
          foo: 'f',
          bar: 'b',
          hoge: 'g'
        },
        default: {
          foo: 'nothing passed',
          bar: false,
          hoge: false
        }
      },
      examples: [
        process.env.CMD_PREFIX + 'test',
        process.env.CMD_PREFIX + 'test --help',
        process.env.CMD_PREFIX + 'test --foo'
      ]
    });
  }

  getUsage(opts) {
    let usage = super.getUsage() + " ";
    usage += "[-f|--foo=string] [-b|--bar] [-g|--hoge]";

    return usage;
  }

  async execute(msg, opts) {
    msg.say("foo: " + opts.foo + "----------" + typeof opts.foo + '\n' +
            "bar: " + opts.bar + "----------" + typeof opts.bar + '\n' +
            "hoge: " + opts.hoge + "----------" + typeof opts.hoge + '\n');
  }
}
