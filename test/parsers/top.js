const chai = require('chai');
const moment = require('moment');
const parser = require('../../lib/parsers/top');
const Parser = require('../../lib/parsers/parser');

const expect = chai.expect;
const now = Date.now(); // top does not use "now"

const hour = moment().startOf('hour').add(1, 'hour');
const minute = moment().startOf('minute').add(1, 'minute');

const tests = [
  { arg: 'next-day' },
  { arg: 'next-hour', expects: hour },
  { arg: 'next-minute', expects: minute },
  { arg: 'top-hour', expects: hour },
  { arg: 'top-minute', expects: minute },
  { arg: 'next-h', expects: hour },
  { arg: 'next-m', expects: minute },
  { arg: 'top-h', expects: hour },
  { arg: 'top-m', expects: minute },
];

describe('top', () => {
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
      it(`Returns ${test.expects.toISOString(true)}`, () => {
        expect(parser.parse(test.arg, now).toISOString()).to.equal(test.expects.toISOString());
      });
    });
  });
});
