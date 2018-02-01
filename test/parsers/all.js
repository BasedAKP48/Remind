const chai = require('chai');
const moment = require('moment');
const parsers = require('../../lib/parsers');

const expect = chai.expect;
const now = Date.now();
const throwUnknown = 'Unknown input:';

// TODO: random tests (is this possible?)
const tests = [
  { arg: 'unknown', throws: `${throwUnknown} unknown` },
  { arg: 'tomorrow', expects: now + 86400000 },
];

describe('all parsers', () => {
  tests.forEach((t) => {
    describe(t.arg, () => {
      if (t.throws) {
        it(`should error: ${t.throws}`, () => {
          parsers(t.arg, now)
            .catch(e => expect(e.message).to.equal(t.throws));
        });
        return;
      }
      const expects = t.expects instanceof moment ? t.expects.toISOString(true) : t.expects;
      it(`Returns ${expects}`, function test() { // eslint-disable-line prefer-arrow-callback
        parsers(t.arg, now)
          .then((ret) => {
            if (ret instanceof moment) {
              expect(ret.toISOString()).to.equal(t.expects.toISOString());
            } else {
              expect(ret).to.equal(t.expects);
            }
            return ret;
          });
      });
    });
  });
});
