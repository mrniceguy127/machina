'use-strict';

const MachinaLib = require('../../../lib');
const request = require('request');

const infoTypes = {
  USER: 'user'
};

module.exports = class OsuCommand extends MachinaLib.Command {
  constructor(client) {
    super(client, {
      name: 'osu',
      aliases: [],
      group: 'fluff',
      memberName: 'osu',
      description: 'osu! integration',
      details: 'osu! inegration. Valid info types: user.',
      guildOnly: false,
      opts: {
        string: ["type"],
        alias: {
          type: 't'
        },
        default: {
          type: infoTypes.USER
        }
      },
      examples: [
        'osu -t user mrniceguy127',
        'osu mrniceguy127 -t user',
        'osu --type user mrniceguy127'
      ],
      ownerOnly: false
    });
  }

  getUsage(cmdPfx) {
    let usage = super.getUsage(cmdPfx) + " ";
    usage += "[-t|--type=string]";

    return usage;
  }

  async reqUserData(msg, user) {
    return new Promise((res, rej) => {
      let userSearchType = 'string'; // Search by username and not ID.
      const encodedUser = encodeURIComponent(user);
      const reqURL = `https://osu.ppy.sh/api/get_user?k=${process.env.OSU_API_KEY}&u=${encodedUser}&type=${userSearchType}`;
      request(reqURL, (err, resp, body) => {
        if (err) {
          return rej(new Error("Error requesting data."));
        } else {
          if (resp.statusCode === 200) {
            return res(JSON.parse(body));
          } else {
            return res(null);
          }
        }
      });
    });
  }

  // Get number with commas. Parameter is a number.
  getCommaNum(num) {
    const numStr = num + '';
    let commaNum = numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return commaNum;
  }

  // Format user for message. Pass parsed user object obtained from osu api.
  formatUser(user) {
    const baseProfileURL = 'https://osu.ppy.sh/users/';

    const firstUser = user[0]; // API returns list.

    // User info
    const userID = firstUser.user_id;
    const username = firstUser.username;
    const playCount = firstUser.playcount;
    const totalScore = firstUser.total_score;
    const globalRank = Math.round(firstUser.pp_rank * 100) / 100;
    const pp = Math.round(firstUser.pp_raw * 100) / 100;; // 0 for inactive players
    const acc = Math.round(parseFloat(firstUser.accuracy) * 100) / 100;
    const country = firstUser.country;
    const countryRank = firstUser.pp_country_rank;

    const userProfileURL = baseProfileURL + userID;

    let display = '__osu!__\n' +
      'User: ' + '**' + username + '** (' + userProfileURL + ')\n' +
      'Play Count: ' + this.getCommaNum(playCount) + '\n' +
      'Total Score: ' + this.getCommaNum(totalScore) + '\n' +
      'PP: ' + this.getCommaNum(pp) + '\n' +
      'Accuracy: ' + acc + '%\n' +
      'Global Rank: #' + this.getCommaNum(globalRank) + '\n' +
      'Country Rank (' + country + '): #' + this.getCommaNum(countryRank);

    return display;
  }

  async execute(msg, opts) {
    if (process.env.OSU_API_KEY) {
      const userOpt = opts._[0];
      const typeOpt = opts.type;
      const type = typeOpt.toLowerCase();

      if (type === infoTypes.USER) {
        if (userOpt) {
          return this.reqUserData(msg, userOpt)
          .then((user) => {
            if (user) {
              return msg.say(this.formatUser(user));
            } else {
              return msg.say("An error occured. Bad status code from osu!.");
            }
          })
          .catch((err) => {
            return msg.say("No user with the name '" + userOpt + "' exists.");
          });
        } else {
          return msg.say("Please provide a user to search for.");
        }
      } else {
        return msg.say("Invalid info type");
      }
    } else {
      return msg.say("The bot host has chosen not to use osu! integration.");
    }
  }
}
