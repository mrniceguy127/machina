const Queue = require('./queue');

class LimitQueue extends Queue {
  constructor(lim) {
    super();
    this.__limit = lim; // Max value of this.__items.length
  }

  getLimit() {
    return this.__limit;
  }

  isFull() {
    return this.__items.length === this.__limit;
  }

  enqueue(item) {
    if (this.isFull()) {
      throw Error("LimitQueue overflow");
    } else {
      super.enqueue(item);
    }
  }
};

module.exports = LimitQueue;
