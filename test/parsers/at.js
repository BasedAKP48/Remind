const chai = require('chai');
const moment = require('moment');
const at = require('../../lib/parsers/at');
const Parser = require('../../lib/parsers/parser');

const expect = chai.expect;
const now = Date.now();
/**
 * @typedef {object} Test
 * @property {string} arg the argument to test
 * @property {moment | any} [expects] the expected value
 */

// TODO: Random tests
/** @type {Test[]} */
const tests = [
  { arg: '1s2m' },
  { arg: '1am', expects: moment(now).set('hour', 1).startOf('hour') },
  { arg: '12p', expects: moment(now).set('hour', 12).startOf('hour') },
  { arg: '11:30am', expects: moment(now).set('hour', 11).startOf('hour').set('minutes', 30) },
  { arg: '12am+9', expects: moment(now).utcOffset('+09:00').set('hour', 0).startOf('hour') },
  { arg: '2p-6:30', expects: moment(now).utcOffset('-06:30').set('hour', 14).startOf('hour') },
  { arg: '13:20', expects: false },
  { arg: '7:13am', expects: moment(now).set('hour', 7).startOf('hour').set('minutes', 13) },
  { arg: '8-6', expects: moment(now).utcOffset('-06:00').set('hour', 8).startOf('hour') },
];

describe('at', () => {
  it('should be a parser', () => {
    expect(at).to.be.instanceOf(Parser);
  });

  tests.forEach((test) => {
    describe(test.arg, () => {
      const passes = test.expects !== undefined;
      it(`should ${passes ? '' : 'not '}pass`, () => {
        expect(at.test(test.arg)).to.equal(passes);
      });
      if (!passes) return;
      const expectsMoment = test.expects instanceof moment;
      // This parser is very dynamic, we have to add a day in some cases
      if (expectsMoment && test.expects.isBefore(now)) {
        test.expects.add(1, 'day');
      }
      const ret = expectsMoment ? test.expects.toISOString(true) : test.expects;
      it(`Returns ${ret}`, () => {
        if (expectsMoment) {
          expect(at.parse(test.arg, now).toISOString()).to.equal(test.expects.toISOString());
        } else {
          expect(at.parse(test.arg, now)).to.equal(ret);
        }
      });
    });
  });
});
