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

  getItems() {
    return this.__items;
  }

  getLength() {
    return this.__items.length;
  }
};

module.exports = Queue;
