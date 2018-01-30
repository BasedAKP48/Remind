const moment = require('moment');
const Parser = require('./parser');

const regex = /^(?:next|top)-(minute|hour|[hm])$/i;

class Top extends Parser {
  constructor() {
    super(regex);
    this.parse = parse;
  }
}

function parse(string) { // Do not use 'now'
  const res = regex.exec(string)[1].toLowerCase();
  return moment().startOf(res).add(1, res);
}

module.exports = new Top();
