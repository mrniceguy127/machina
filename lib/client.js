'use-strict';

const commando = require('discord.js-commando');

class Client extends commando.Client {
  constructor(options) {
    super(options);
    this.globals = options.globals || {}; // Data to be accessed by anything with access to the client.
  }
}

module.exports = Client;
