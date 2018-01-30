const moment = require('moment');
const Parser = require('./parser');

const regex = /^(\d{1,2})(?::(\d{1,2}))?(am|pm|[ap])([+-]\d{1,2}(?::\d{1,2})?)?$/i;

class Moment extends Parser {
  constructor() {
    super(regex);
    this.parse = parse;
  }
}

function parse(string, now) {
  const time = moment(now);
  const array = regex.exec(string);
  const hour = parseInt(array[1], 10);
  const min = parseInt(array[2], 10);
  const pm = array[3] && array[3][0] === 'p';
  const offset = array[4];
  if (offset) {
    time.utcOffset(offset);
  }
  time.set('hour', hour).startOf('hour');
  if (!Number.isNaN(min)) {
    time.set('m', min).startOf('m');
  }
  if (time.get('hours') < 12 && pm) {
    time.add(12, 'hours');
  }
  return time.valueOf();
}

module.exports = new Moment();
