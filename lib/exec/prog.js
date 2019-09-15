'use-strict';

const { exec } = require('child_process');

class Prog {

  // Overridable. Return parsed opts however you like. Keep it tidy at least.
  // msg is the message sent by a user to execute a command.
  // prog is an object. Is an entry in progs.json in the the exec folder at the root of the project.
  // This should be called WITHIN exec()!!!
  parseOpts(msg, prog) {
    return {};
  }

  // Execute system command. Returns Promise based on success or failure.
  async sys_exec(cmd) {
    return new Promise((res, rej) => {
      exec(cmd, (err, stdout) => {
        if (err) {
          rej(err);
        } else {
          res(stdout);
        }
      })
    });
  }

  // Override!!! Returns promise.
  // prog is an object. Is an entry in progs.json in the the exec folder at the root of the project.
  // msg is the command message sent in Discord from the user.
  async exec(msg, prog) {
    return Promise.resolve();
  }
};

module.exports = Prog;
