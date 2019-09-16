'use-strict';

const MachinaLib = require('../../../lib');

module.exports = class QueueCommand extends MachinaLib.Command {
  constructor(client) {
    super(client, {
      name: 'queue',
      aliases: [
        'q'
      ],
      group: 'music',
      memberName: 'queue',
      description: 'View the current queue of songs.',
      details: 'Views the current queue of songs.',
      guildOnly: true,
      opts: {
        string: ['page'],
        alias: {
          page: 'p'
        }
      },
      examples: [
        process.env.CMD_PREFIX + 'q',
        process.env.CMD_PREFIX + 'q -p 2',
        process.env.CMD_PREFIX + 'q 2',
        process.env.CMD_PREFIX + 'q --page 3',
      ]
    });
  }

  getUsage(opts) {
    let usage = super.getUsage() + ' ';
    usage += '[number] [-p|--page=number]'

    return usage;
  }


  // queueItems: Queue items to display
  // startIndex: Index of where the display is starting in the queue
  getQueueDisplay(queueItems, startIndex, queue, page) {
    let disp = "__Queue (Page " + page + "/" + queue.getMaxPage() + ")__";

    let i;
    for (i = 0; i < queueItems.length; i++) {
      if (i === 0 && startIndex === 0) {
        disp += "\n~> " + queueItems[i].getURL();
      } else {
        disp += "\n" + (startIndex + i) + ") <" + queueItems[i].getURL() + ">";
      }
    }

    return disp;
  }

  async execute(msg, opts) {
    const guild = msg.guild;
    const queue = this.client.globals.queues[guild.id];

    if (!queue) {
      return msg.say('Nothing playing');
    }

    let pageOpt = opts.page || opts._[0];
    if (Array.isArray(pageOpt)) pageOpt = pageOpt[0];

    const page = queue.getValidPage(parseInt(pageOpt));
    const startIndex = queue.getPageQueueStartIndex(page);

    const pageItems = queue.getPageItems(page);
    const queueDisp = this.getQueueDisplay(pageItems, startIndex, queue, page);

    return msg.say(queueDisp);
  }
}
