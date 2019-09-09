// Machina Lib

module.exports = {
  Client: require('./client'),
  Command: require('./command'),
  dataStructs: {
    Queue: require('./data-structures/queue'),
    LimitQueue: require('./data-structures/limit-queue')
  },
  Prog: require('./exec/prog')
};
