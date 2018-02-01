const chai = require('chai');
const moment = require('moment');
const at = require('../../lib/parsers/at');
const Parser = require('../../lib/parsers/parser');

const expect = chai.expect;
const now = Date.now();

// TODO: Random tests
const tests = [
  { arg: '1s2m' },
  { arg: '1am', expects: moment(now).set('hour', 1).startOf('hour') },
  { arg: '12p', expects: moment(now).set('hour', 12).startOf('hour') },
  { arg: '11:30am', expects: moment(now).set('hour', 11).startOf('hour').set('minutes', 30) },
  { arg: '12am+9', expects: moment(now).utcOffset('+9').set('hour', 0).startOf('hour') },
  { arg: '2p-6:30', expects: moment(now).utcOffset('-6:30').set('hour', 14).startOf('hour') },
  { arg: '13:20' },
  { arg: '7:13am', expects: moment(now).set('hour', 7).startOf('hour').set('minutes', 13) },
];

describe('at', () => {
  it('should be a parser', () => {
    expect(at).to.be.instanceOf(Parser);
  });

  tests.forEach((test) => {
    describe(test.arg, () => {
      const passes = !!test.expects;
      it(`should ${passes ? '' : 'not '}pass`, () => {
        expect(at.test(test.arg)).to.equal(passes);
      });
      if (!passes) return;
      // This parser is very dynamic, we have to add a day in some cases
      if (test.expects.isBefore(now)) {
        test.expects.add(1, 'day');
      }
      it(`Returns ${test.expects.toISOString(true)}`, () => {
        expect(at.parse(test.arg, now).toISOString()).to.equal(test.expects.toISOString());
      });
    });
  });
});
