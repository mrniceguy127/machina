'use-strict';

const MachinaLib = require('../../../../lib');
const LimitQueue = MachinaLib.dataStructs.LimitQueue;

class MusicQueue extends LimitQueue {
  constructor(lim) {
    super(lim);
    this.__loopCurr = false;
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
