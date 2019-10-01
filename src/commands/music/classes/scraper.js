'use-strict';

const request = require('request');


// Abstract class for web scrapers.
class Scraper {
  constructor() {
    if (this.constructor === Scraper) {
      throw new Error("You cannot instantiate an abstract class!");
    }
  }

  // Download page HTML
  async dlPage(url) {
    return new Promise((res, rej) => {
      return request(url, (err, resp, body) => {
        if (err) return rej(err);
        else if (resp.statusCode !== 200) {
          return rej(new Error("Bad response"));
        } else {
          return res(body);
        }
      });
    });
  }

  // Parse HTML with a provided URL of the page. Override!
  parseHTML(url, html) {
    throw new Error("You must override the parseHTML method.");
  }

  async scrape(url) {
    return new Promise((res, rej) => {
      return this.dlPage(url)
      .then((html) => {
        const data = this.parseHTML(url, html);
        return res(data);
      })
      .catch((err) => {
        return rej(err);
      });
    });
  }
};

module.exports = Scraper;
