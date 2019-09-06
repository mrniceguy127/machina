'use-strict';

const path = require('path');
const commandGroups = require('./commands/command-groups');

// Callback function for init promise.
async function initPromiseCallback(res, rej) {
  const MachinaLib = require('../lib');
  const MachinaClient = MachinaLib.Client;

  let clientOpts = {
    owner: process.env.OWNER,
    commandPrefix: process.env.CMD_PREFIX,
    unknownCommandResponse: false,
    globals: {
      queues: {}
    }
  };

  let client = new MachinaClient(clientOpts);

  client.registry
  .registerGroups(commandGroups)
  .registerDefaults()
  .registerCommandsIn(path.join(__dirname, 'commands'));

  client.login(process.env.DISCORD_TOKEN)
  .then(() => res(client))
  .catch(rej);
}

// Returns promise after successful / failed login.
async function init() {
  return new Promise(initPromiseCallback);
}

module.exports = {
  init: init
};
