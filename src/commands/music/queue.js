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
  getQueueDisplay(startIndex, queueBook, page) {
    const pageItems = queueBook.getPageItems(page);

    let disp = "__Queue (Page " + page + "/" + queueBook.getMaxPage() + ")__";

    let i;
    for (i = 0; i < pageItems.length; i++) {
      if (i === 0 && startIndex === 0) {
        disp += "\n~> " + pageItems[i].getURL();
      } else {
        disp += "\n" + (startIndex + i) + ") <" + pageItems[i].getURL() + ">";
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

    const queueBook = queue.getBook();

    let pageOpt = opts.page || opts._[0];
    if (Array.isArray(pageOpt)) pageOpt = pageOpt[0];

    const page = queueBook.getValidPage(parseInt(pageOpt));
    const startIndex = queueBook.getPageQueueStartIndex(page);

    const queueDisp = this.getQueueDisplay(startIndex, queueBook, page);

    return msg.say(queueDisp);
  }
}
