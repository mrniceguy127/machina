'use-strict';

const cheerio = require('cheerio');
const Scraper = require('./scraper');

class YTPlaylistScraper extends Scraper {
  getVideoID(videoURL) {
    return (new URL(videoURL)).searchParams.get("v");
  }

  // Parse HTML with a provided URL of the page.
  parseHTML(url, html) {
    const $ = cheerio.load(html);
    const playlistVideosAnchors = $('.playlist-video');
    const startVideoID = this.getVideoID(url) // ID of the video to start at. URL already validated by dlPage.

    let videoURLs = [];
    let beginAppending = false;

    const getVideoID = this.getVideoID; // Handle scope of 'this'
    playlistVideosAnchors.each(function(i, elem) {
      const anchorHREF = $(this).attr('href');
      const baseURL = "https://www.youtube.com";
      const videoURL = baseURL + anchorHREF;
      const videoID = getVideoID(videoURL); // URL valid if YT gives a valid URL.

      if (videoID === startVideoID) {
        beginAppending = true;
      }

      if (beginAppending) { // Append only when reached start video.
        videoURLs.push(videoURL);
      }
    });

    return videoURLs;
  }
};

module.exports = YTPlaylistScraper;
