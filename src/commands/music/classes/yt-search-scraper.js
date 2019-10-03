'use-strict';

const Scraper = require('./scraper');
const cheerio = require('cheerio');

class YTSearchScraper extends Scraper {
  parseHTML(url, html) {
    let $ = cheerio.load(html);

    // Avoid 'branded page boxes' and ads.
    let videoAnchor = $('ol > li')
      .find('> div.yt-lockup-video')
      .find('> div.yt-lockup-dismissable')
      .find('> div.yt-lockup-thumbnail')
      .find('> a')[0];

    const anchorHREF = $(videoAnchor).attr('href');

    if (anchorHREF) {
      const baseURL = "https://www.youtube.com";
      const videoURL = baseURL + anchorHREF;

      return videoURL;
    }
  }
};

module.exports = YTSearchScraper;
