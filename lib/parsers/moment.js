const moment = require('moment');
const Parser = require('./parser');


class Moment extends Parser {
  constructor() {
    super();
    this.parse = parse;
    this.test = test;
  }
}

function test(string) {
  const original = moment.suppressDeprecationWarnings;
  moment.suppressDeprecationWarnings = true;
  this.last = moment(string);
  moment.suppressDeprecationWarnings = original;
  return this.last.isValid();
}

function parse(string) {
  return this.last;
}

module.exports = new Moment();
