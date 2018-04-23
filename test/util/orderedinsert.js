const chai = require('chai');
const insertOrdered = require('../../util/insertOrdered');

const expect = chai.expect;

describe('ordered insertion', () => {
  const queue = [];
  function insert(element) {
    return insertOrdered(element, queue, (a, b) => a - b);
  }
  it('100 should be first', () => {
    expect(insert(100)).to.equal(0);
    expect(queue).to.deep.equal([100]);
  });
  it('2000 should be second', () => {
    expect(insert(2000)).to.equal(1);
    expect(queue).to.deep.equal([100, 2000]);
  });
  it('1000 should be second', () => {
    expect(insert(1000)).to.equal(1);
    expect(queue).to.deep.equal([100, 1000, 2000]);
  });
  it('3000 should be fourth', () => {
    expect(insert(3000)).to.equal(3);
    expect(queue).to.deep.equal([100, 1000, 2000, 3000]);
  });
  it('1500 should be third', () => {
    expect(insert(1500)).to.equal(2);
    expect(queue).to.deep.equal([100, 1000, 1500, 2000, 3000]);
  });
  it('1000 (again) should be second', () => {
    expect(insert(1000)).to.equal(1);
    expect(queue).to.deep.equal([100, 1000, 1000, 1500, 2000, 3000]);
  });
});
