class Queue {
  constructor() {
    this.__items = [];
  }

  enqueue(item) {
    this.__items.push(item);
  }

  dequeue() {
    return this.__items.shift();
  }

  getHead() {
    return this.__items[0];
  }

  getTail() {
    return this.__items[this.__items.length - 1];
  }

  getItems() {
    return this.__items;
  }

  getLength() {
    return this.__items.length;
  }
};

module.exports = Queue;
