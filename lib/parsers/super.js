const Parser = require('./parser');

const regex = /^(?:\d+:){0,3}\d+[smh]?$/;

const second = 1000;
const minute = second * 60;
const hour = minute * 60;
const day = hour * 24;
const units = [
  second, minute, hour, day,
];

class Super extends Parser {
  constructor() {
    super(regex);
    this.parse = parse;
  }
}

function parse(s) {
  let unit = getUnit(s);
  const string = !~unit ? (unit += 1, s) : s.substring(0, s.length - 1);
  let ret = 0;
  for (let end = string.length, last = string.lastIndexOf(':');
    end > 0 && unit < units.length;
    end = last, last = string.lastIndexOf(':', end - 1)) {
    ret += parseInt(string.substring(last + 1, end), 10) * units[unit];
    unit += 1;
  }
  return ret;
}

function getUnit(string) {
  switch (string.substring(string.length - 1)) {
    case 'h': return 2;
    case 'm': return 1;
    case 's': return 0;
    default: return -1;
  }
}

module.exports = new Super();
