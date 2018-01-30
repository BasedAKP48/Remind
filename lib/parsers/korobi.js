const moment = require('moment');
const Parser = require('./parser');

const regex = /^(?:\d+[smhdwMy])+$/;
const split = /\d+([smhdwMy])/g;

class Korobi extends Parser {
  constructor() {
    super(regex);
    this.parse = parse;
  }
}

function parse(string, now) {
  const time = moment(now);
  for (let a = split.exec(string); a !== null; a = split.exec(string)) {
    time.add(parseInt(a[0], 10), a[1]);
  }
  return time;
}

module.exports = new Korobi();
