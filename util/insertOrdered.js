module.exports = insertOrdered;

function insertOrdered(element, array, comparer, start = 0, end = array.length) { // eslint-disable-line max-len
  if (array.length === 0) {
    array.push(element);
    return 0;
  }

  const pivot = (start + end) >> 1; // eslint-disable-line

  const c = comparer(element, array[pivot]);
  if (end - start <= 1) {
    // eslint-disable-next-line no-nested-ternary
    const ret = c < 0 ? Math.max(pivot - 1, 0) : (c > 0 ? pivot + 1 : pivot);
    array.splice(ret, 0, element);
    return ret;
  }

  if (c < 0) {
    return insertOrdered(element, array, comparer, start, pivot);
  } else if (c > 0) {
    return insertOrdered(element, array, comparer, pivot, end);
  }
  array.splice(pivot, 0, element);
  return pivot;
}
