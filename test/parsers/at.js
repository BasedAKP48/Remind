const chai = require('chai');
const moment = require('moment');
const at = require('../../lib/parsers/at');
const Parser = require('../../lib/parsers/parser');

const expect = chai.expect;
const now = Date.now();
/**
 * @typedef {object} Test
 * @property {string} arg the argument to test
 * @property {moment | Function | boolean} [expects] the expected value
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
  { arg: '23-6', expects: moment(now).utcOffset('-06:00').set('hour', 23).startOf('hour') },
  {
    arg: '11@23-5',
    expects: () => {
      const ret = moment(now).utcOffset('-05:00');
      if (ret.date() > 11) {
        ret.add(1, 'month');
      }
      ret.date(11).set('hour', 23).startOf('hour');
      return ret;
    },
  },
  {
    arg: '4-21@8p-6',
    expects: () => {
      const month = 3;
      const day = 21;
      const ret = moment(now).utcOffset('-06:00');
      if (ret.month() >= month && ret.date() > day) {
        ret.add(1, 'year');
      }
      ret.month(month).date(day);
      ret.set('hour', 20).startOf('hour');
      return ret;
    },
  },
  {
    arg: '12/22/90@8-6',
    expects: () => {
      const year = 90;
      const ret = moment(now).utcOffset('-06:00');
      const len = Math.ceil(Math.log10(year + 1)); // Long live the future
      if (ret.year() < (ret.year() - (ret.year() % (10 ** len))) + year) {
        ret.year((ret.year() - (ret.year() % (10 ** len))) + year);
      }
      ret.month(11).date(22);
      ret.set('hour', 8).startOf('hour');
      return ret;
    },
  },
  {
    arg: '12/22/190@8-6',
    expects: () => {
      const year = 190;
      const ret = moment(now).utcOffset('-06:00');
      const len = Math.ceil(Math.log10(year + 1)); // Long live the future
      const finalYear = (ret.year() - (ret.year() % (10 ** len))) + year;
      ret.year(finalYear);
      ret.month(11).date(22);
      ret.set('hour', 8).startOf('hour');
      return ret;
    },
  },
  { arg: '12/22-90@8-6' },
  { arg: '12/22/1990@8-6', expects: false },
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
      if (test.expects instanceof Function) {
        test.expects = test.expects();
      }
      const expectsMoment = test.expects instanceof moment;
      // This parser is very dynamic, we have to add a day in some cases
      if (expectsMoment && test.expects.isBefore(now)) {
        if (test.mutate instanceof Function) {
          test.mutate(test.expects);
        } else if (test.mutate !== false) {
          test.expects.add(1, 'day');
        }
      }
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
