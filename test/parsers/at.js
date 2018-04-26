const chai = require('chai');
const moment = require('moment');
const at = require('../../lib/parsers/at');
const Parser = require('../../lib/parsers/parser');

// TODO: use static times
const expect = chai.expect;
const now = '2018-04-25T22:30:00.000';
/**
 * @typedef {object} Test
 * @property {string} arg the argument to test
 * @property {moment | boolean} [expects] the expected value
 */

// TODO: Random tests
/** @type {Test[]} */
const tests = [
  { arg: '1s2m' },
  { arg: '1am', expects: moment('2018-04-26T01:00:00.000-05:00') },
  { arg: '12p', expects: moment('2018-04-26T12:00:00.000-05:00') },
  { arg: '11:30am', expects: moment('2018-04-26T11:30:00.000-05:00') },
  { arg: '12am+9', expects: moment('2018-04-27T00:00:00.000+09:00') },
  { arg: '2p-6:30', expects: moment('2018-04-26T14:00:00.000-06:30') },
  { arg: '13:20', expects: false },
  { arg: '7:13am', expects: moment('2018-04-26T07:13:00.000-05:00') },
  { arg: '8-6', expects: moment('2018-04-26T08:00:00.000-06:00') },
  { arg: '23-6', expects: moment('2018-04-25T23:00:00.000-06:00') },
  // Next month, the 11th has passed already
  { arg: '11@23-5', expects: moment('2018-05-11T23:00:00.000-05:00') },
  // Next year, April 23rd has passed already
  { arg: '4-23@8p-5', expects: moment('2019-04-23T20:00:00.000-05:00') },
  { arg: '12/22/90@8-6', expects: moment('2090-12-22T08:00:00.000-06:00') },
  { arg: '12/22/190@8-6', expects: moment('2190-12-22T08:00:00.000-06:00') },
  // Both delimiters must match
  { arg: '12/22-90@8-6' },
  // Forcing the past fails
  { arg: '12/22/1990@8-6', expects: false },
  // 30 minutes from "now", still today
  { arg: '25@23-5', expects: moment('2018-04-25T23:00:00.000-05:00') },
  // -30 minutes from "now", next month
  { arg: '25@22-5', expects: moment('2018-05-25T22:00:00.000-05:00') },
  // -30 minutes from "now", next year
  { arg: '4-25@22-5', expects: moment('2019-04-25T22:00:00.000-05:00') },
  // TODO: Round up for both these cases
  { arg: '1/22/00@8-6', expects: moment('2100-01-22T08:00:00.000-06:00') },
  { arg: '1/22/000@8-6', expects: moment('3000-01-22T08:00:00.000-06:00') },
];

describe('at', () => {
  it('should be a parser', () => {
    expect(at).an.instanceOf(Parser);
  });

  tests.forEach((test) => {
    describe(test.arg, () => {
      const passes = test.expects !== undefined;
      it(`should ${passes ? '' : 'not '}pass`, () => {
        expect(at.test(test.arg)).to.equal(passes);
      });
      if (!passes) return;
      const expectsMoment = test.expects instanceof moment;
      const ret = expectsMoment ? test.expects.toISOString(true) : test.expects;
      it(`Returns ${ret}`, () => {
        if (expectsMoment) {
          const result = at.parse(test.arg, now);
          expect(result).an.instanceOf(moment);
          expect(result.toISOString()).to.equal(test.expects.toISOString());
        } else {
          expect(at.parse(test.arg, now)).to.equal(ret);
        }
      });
    });
  });
});
