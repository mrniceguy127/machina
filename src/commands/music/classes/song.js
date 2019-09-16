class Song {
  constructor(type, url) {
    this.__type = type;
    this.__url = url;
  }

  getType() {
    return this.__type;
  }

  getURL() {
    return this.__url;
  }
};

module.exports = Song;
