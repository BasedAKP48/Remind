const math = require('mathjs');
const Parser = require('./parser');

class Abstract extends Parser {
  // Bleh
}

Abstract.prototype.test = test;
Abstract.prototype.parse = parse;

function test(string) {
  try {
    this.last = math.eval(string);
    return true;
  } catch (e) {
    return false;
  }
}

function parse(string, now) {
  return now + this.last;
}

module.exports = new Abstract();
