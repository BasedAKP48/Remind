const moment = require('moment');
const Parser = require('./parser');

const regex = /^(?:(?:([1-9]|1[0-2])([-/]))?([1-9]|[12][0-9]|3[01])(?:\2(\d{2,4}))?@)?([1]?[0-9]|[2][0-3])(?::([0-5]?[0-9]))?(am|pm|[ap])?([+-]\d{1,2}(?::[0-5]?[0-9])?)?$/i;

class At extends Parser {
  constructor() {
    super(regex);
    this.parse = parse;
  }
}

function parse(string, now) {
  const time = moment(now);
  const array = regex.exec(string);
  const yearGroup = array[4];
  const monthGroup = array[1];
  const dayGroup = array[3];
  const hourGroup = array[5];
  const minGroup = array[6];
  const pmGroup = array[7];
  const offsetGroup = array[8];
  if (!dayGroup && !pmGroup && !offsetGroup) return false;
  if (offsetGroup) {
    time.utcOffset(padOffset(offsetGroup));
  }
  if (yearGroup) { // Is year provided?
    let year = parseInt(yearGroup, 10);
    const len = Math.ceil(Math.log10(year + 1));
    if (Math.ceil(Math.log10(time.year() + 1)) > len) {
      year = (time.year() - (time.year() % (10 ** len))) + year;
    } else if (time.year() > year) {
      return false;
    }
    time.year(year);
  }
  if (monthGroup) { // Is month provided? (0 indexed)
    const month = parseInt(monthGroup, 10) - 1;
    if (!yearGroup && time.month() > month) {
      time.add(1, 'year');
    }
    time.month(month);
  }
  if (dayGroup) { // Is day provided?
    const day = parseInt(dayGroup, 10);
    if (!monthGroup && time.date() > day) {
      time.add(1, 'month');
    }
    time.date(day);
  }
  time.set('hour', parseInt(hourGroup, 10)).startOf('hour');
  // Are minutes provided?
  if (minGroup) {
    time.set('m', parseInt(minGroup, 10));
  }
  // Military time
  if (pmGroup) {
    const pm = pmGroup[0] === 'p';
    if (time.get('hours') < 12 && pm) {
      time.add(12, 'hours');
    } else if (time.get('hours') >= 12 && !pm) {
      time.subtract(12, 'hours');
    }
  }

  // Is it past? They probably meant tomorrow.
  if (!dayGroup && time.isBefore(now)) {
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
    ret = `${ret[0]}0${ret.substring(1)}`;
  }
  return ret;
}

module.exports = new At();
