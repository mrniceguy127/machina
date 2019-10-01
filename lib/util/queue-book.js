const Book = require('./book');

class QueueBook extends Book {
  constructor(queue, pageSize = 10) {
    super(pageSize);
    this.__queue = queue;
  }

  getQueue() {
    return this.__queue;
  }

  getLength() {
    return this.__queue.getLength();
  }

  getItems() {
    return this.__queue.getItems();
  }
};

module.exports = QueueBook;
