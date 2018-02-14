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
  {
    arg: '8-9',
    expects: moment(now).utcOffset('-09:00').set('hour', 8).startOf('hour'),
    mutate: m => (m.isBefore(now) ? m.add(1, 'day') : m),
  },
];

describe('all parsers', () => {
  tests.forEach((t) => {
    describe(t.arg, () => {
      if (t.throws) {
        it(`should error: ${t.throws}`, () =>
          parsers(t.arg, now)
            .catch(e => expect(e.message).to.equal(t.throws)));
        return;
      }
      const expectsMoment = t.expects instanceof moment;
      const expects = expectsMoment ? t.expects.toISOString(true) : t.expects;
      it(`Returns ${expects}`, () =>
        parsers(t.arg, now)
          .then((ret) => {
            if (expectsMoment) {
              if (t.mutate) {
                t.mutate(t.expects);
              }
              expect(ret.toISOString()).to.equal(t.expects.toISOString());
            } else {
              expect(ret).to.equal(t.expects);
            }
            return ret;
          }));
    });
  });
});
