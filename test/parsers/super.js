const chai = require('chai');
const moment = require('moment');
const parser = require('../../lib/parsers/super');
const Parser = require('../../lib/parsers/parser');
require('moment-duration-format');

const expect = chai.expect;
const now = Date.now();

// TODO: Random tests
const tests = [
  { arg: '1am' },
  { arg: '1s2m' },
  { arg: '1:30', expects: 90000 }, // 1 minute, 30 seconds
  { arg: '1:30s', expects: 90000 }, // 1 minute, 30 seconds
  { arg: '30', expects: 30000 }, // 30 seconds
  { arg: '30s', expects: 30000 }, // 30 seconds
  { arg: '1m', expects: 60000 }, // 1 minute
  { arg: '1:5m', expects: 3900000 }, // 1 hour, 5 minutes
  { arg: '1h', expects: 3600000 }, // 1 hour
  { arg: '1:0h', expects: 86400000 }, // 1 day
  { arg: '1d' }, // This should probably work, I guess
  { arg: '1:00:00', expects: 3600000 }, // 1 hour
  { arg: '1:00:00:00', expects: 86400000 }, // 1 day
  { arg: '100', expects: 100000 }, // 100 seconds
  { arg: '3:1:0h', expects: 86400000 }, // 1 day -- TODO: expects: false
];

describe('super', () => {
  it('should be a parser', () => {
    expect(parser).to.be.instanceOf(Parser);
  });

  tests.forEach((test) => {
    describe(test.arg, () => {
      const passes = test.expects !== undefined;
      it(`should ${passes ? '' : 'not '}pass`, () => {
        expect(parser.test(test.arg)).to.equal(passes);
      });
      if (!passes) return;
      it(`Returns ${moment.duration(test.expects).format()}`, () => {
        expect(parser.parse(test.arg, now)).to.equal(test.expects);
      });
    });
  });
});
