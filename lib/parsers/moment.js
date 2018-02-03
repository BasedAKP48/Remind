const moment = require('moment');
const Parser = require('./parser');

const regex = /.*/;

class Moment extends Parser {
  constructor() {
    super(regex);
    this.parse = parse;
  }
}

function parse(string, now) {
  const original = moment.suppressDeprecationWarnings;
  moment.suppressDeprecationWarnings = true;
  const time = moment(string);
  moment.suppressDeprecationWarnings = original;
  if (time.isValid()) {
    return time;
  }
  return false;
}

module.exports = new Moment();
