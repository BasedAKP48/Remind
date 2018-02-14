const moment = require('moment');
const Parser = require('./parser');

// TODO: support date@time
const regex = /^(\d{1,2})(?::(\d{1,2}))?(am|pm|[ap])?([+-]\d{1,2}(?::\d{2})?)?$/i;

class At extends Parser {
  constructor() {
    super(regex);
    this.parse = parse;
  }
}

function parse(string, now) {
  const time = moment(now);
  const array = regex.exec(string);
  if (!array[3] && !array[4]) return false;
  const hour = parseInt(array[1], 10);
  const min = parseInt(array[2], 10);
  const pm = array[3] && array[3][0] === 'p';
  const offset = array[4];
  if (offset) {
    time.utcOffset(padOffset(offset));
  }
  time.set('hour', hour).startOf('hour');
  // Are minutes provided?
  if (!Number.isNaN(min)) {
    time.set('m', min);
  }
  // Military time
  if (time.get('hours') < 12 && pm) {
    time.add(12, 'hours');
  } else if (time.get('hours') >= 12 && !pm) {
    time.subtract(12, 'hours');
  }
  // Is it past? They probably meant tomorrow.
  if (time.isBefore(now)) {
    time.add(1, 'day');
  }
  return time;
}

function padOffset(offset) {
  if (offset.length === 6) return offset;
  let ret = offset;
  if (ret.indexOf(':') === -1) {
    ret += ':00';
  }
  if (ret.indexOf(':') === 2) {
    ret = `${ret[0]}0${ret[1]}${ret.substring(2)}`;
  }
  return ret;
}

module.exports = new At();
