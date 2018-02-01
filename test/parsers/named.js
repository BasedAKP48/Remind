const chai = require('chai');
const moment = require('moment');
const parser = require('../../lib/parsers/named');
const Parser = require('../../lib/parsers/parser');

const expect = chai.expect;
const now = Date.now();

const tests = [
  { arg: 'today' },
  { arg: 'tomorrow', expects: now + 86400000 },
];

describe('named', () => {
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
      it(`Returns ${moment(test.expects)}`, () => {
        expect(parser.parse(test.arg, now)).to.equal(test.expects);
      });
    });
  });
});
