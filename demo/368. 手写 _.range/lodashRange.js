/**
 * _.range([start=0], end, [step=1])
 *
 * Creates an array of numbers progressing from `start` up to, but not
 * including, `end`. A negative `step` produces a descending range. If `end`
 * is not specified it defaults to `start` and `start` defaults to 0.
 *
 * Approach:
 * - Normalize the (start, end, step) tuple depending on how many args were
 *   passed.
 * - Determine direction so the loop terminates when start crosses end.
 * - Guard step === 0 to avoid an infinite loop (lodash throws; here we throw
 *   too).
 */

function range(start, end, step) {
  // Normalize arguments
  if (end === undefined) {
    end = start;
    start = 0;
  }
  if (step === undefined) {
    step = start < end ? 1 : -1;
  }
  step = Number(step);
  if (step === 0) {
    throw new Error('step cannot be zero');
  }
  start = Number(start);
  end = Number(end);

  // Determine length of the resulting array
  let length;
  if (step > 0 && start < end) {
    length = Math.ceil((end - start) / step);
  } else if (step < 0 && start > end) {
    length = Math.ceil((end - start) / step); // both negative -> positive
  } else {
    length = 0;
  }

  const result = new Array(length > 0 ? length : 0);
  let current = start;
  for (let i = 0; i < length; i++) {
    result[i] = current;
    current += step;
  }
  return result;
}

// --- Tests ---

console.log('range default:', JSON.stringify(range(4))); // expected: [0,1,2,3]
console.log('range start end:', JSON.stringify(range(1, 5))); // expected: [1,2,3,4]
console.log('range with step:', JSON.stringify(range(0, 20, 5))); // expected: [0,5,10,15]
console.log('range descending:', JSON.stringify(range(5, 0, -1))); // expected: [5,4,3,2,1]
console.log('range auto step:', JSON.stringify(range(4, -1))); // expected: [4,3,2,1,0]
console.log('range zero end:', JSON.stringify(range(0))); // expected: []
console.log('range equal start end:', JSON.stringify(range(2, 2))); // expected: []
console.log('range fractional step:', JSON.stringify(range(0, 1, 0.25))); // expected: [0,0.25,0.5,0.75]
