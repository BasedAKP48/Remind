const Parser = require('./parser');

const regex = /tomorrow/;

class Named extends Parser {
  constructor() {
    super(regex);
    this.parse = parse;
  }
}

function parse(string, now) {
  if (string === 'tomorrow') {
    return now + 86400000;
  }
  return false;
}

module.exports = new Named();
