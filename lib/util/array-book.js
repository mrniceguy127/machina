const Book = require('./book');

class ArrayBook extends Book {
  constructor(array, pageSize = 10) {
    super(pageSize);
    this.__array = array;
  }

  getLength() {
    return this.__array.length;
  }

  getItems() {
    return this.__array;
  }
};

module.exports = ArrayBook;
