const chai = require('chai');
const moment = require('moment');
const parser = require('../../lib/parsers/korobi');
const Parser = require('../../lib/parsers/parser');

const expect = chai.expect;
const now = Date.now();

// TODO: Random tests
const tests = [
  { arg: '1am' },
  { arg: '1:30' },
  { arg: '1s2m', expects: moment(now).add(1, 's').add(2, 'm') },
  { arg: '2h3h', expects: moment(now).add(5, 'h') },
  { arg: '12d', expects: moment(now).add(12, 'd') },
  { arg: '1y2M', expects: moment(now).add(1, 'y').add(2, 'M') },
  { arg: '12w', expects: moment(now).add(12, 'w') },
];

describe('korobi', () => {
  it('should be a parser', () => {
    expect(parser).to.be.instanceOf(Parser);
  });

  tests.forEach((test) => {
    describe(test.arg, () => {
      const passes = !!test.expects;
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
