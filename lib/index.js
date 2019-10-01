// Machina Lib

module.exports = {
  Client: require('./client'),
  Command: require('./command'),
  dataStructs: {
    Queue: require('./data-structures/queue'),
    LimitQueue: require('./data-structures/limit-queue')
  },
  util: {
    Book: require('./util/book'),
    QueueBook: require('./util/queue-book')
  },
  Prog: require('./exec/prog')
};
