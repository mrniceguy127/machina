'use-strict';

const MachinaLib = require('../../../../lib');
const LimitQueue = MachinaLib.dataStructs.LimitQueue;
const QueueBook = MachinaLib.util.QueueBook;

class MusicQueue extends LimitQueue {
  constructor(lim, pageSize = 10) {
    super(lim);
    this.__loopCurr = false;
    this.__pageSize = pageSize; // Limit for the amount of songs that can be in a page.
    this.__book = new QueueBook(this, pageSize);
  }

  getBook() {
    return this.__book;
  }

  toggleLoopOne() {
    this.__loopCurr = !this.__loopCurr;
  }

  enableLoopOne() {
    this.__loopCurr = true;
  }

  disableLoopOne() {
    this.__loopCurr = false;
  }

  isLoopingOne() {
    return this.__loopCurr;
  }
};

module.exports = MusicQueue;
