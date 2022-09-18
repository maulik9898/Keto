/* eslint-disable eqeqeq */
/* eslint-disable no-bitwise */
import BigNumber from 'bignumber.js';

const roundTo = require('round-to');

const bitwise = require('bitwise');

function reOrder(s) {
  const res = [];
  for (let i = 0; i < 8; i++) {
    res.push(s.slice(i * 2, i * 2 + 2));
  }
  const arr = res.reverse();
  return arr.join('');
}

function getPrecesion(a) {
  if (!isFinite(a)) return 0;
  let e = 1;
  let p = 0;
  while (Math.round(a * e) / e !== a) {
    e *= 10;
    p++;
  }
  return p;
}
// endianness: 0 - little, 1 - big
function readData(rawData, start, size, endianness, signed) {
  const bitArr = bitwise.buffer.read(
    Buffer.from(endianness === 1 ? rawData : reOrder(rawData), 'hex')
  );
  const targetbit = bitArr.slice(
    endianness === 1 ? start : 64 - start - size,
    endianness === 1 ? start + size : 64 - start
  );
  const bin = targetbit.join('');
  let res = parseInt(bin, 2);
  let x = new BigNumber(bin, 2);
  const t1 = new BigNumber('8000000000000000', 16);
  const t2 = new BigNumber('10000000000000000', 16);
  if (x.isInteger() && x.gte(0) && signed) {
    if (bin.length == 8 && x.gte('80', 16)) x = x.minus('100', 16);
    if (bin.length == 16 && x.gte('8000', 16)) x = x.minus('10000', 16);
    if (bin.length == 32 && x.gte('80000000', 16)) x = x.minus('100000000', 16);
    if (bin.length == 64 && x.gte(t1)) {
      x = x.minus(t2);
    }
    if (
      bin.length == 8 ||
      bin.length == 16 ||
      bin.length == 32 ||
      bin.length == 64
    )
      res = x.toString(10);
  }
  // return signed ?
  //   (parseInt(`-${targetbit.join('')}`, 2) >>> 0) :
  //   parseInt(targetbit.join(''), 2);
  return res;
}

module.exports = function decode(input) {
  const {
    rawData,
    size,
    factor,
    offset,
    precision,
    endianness,
    signed
  } =
  input;
  let {
    start
  } = input;

  if (typeof rawData === 'undefined') {
    throw new Error('input HEX data is required');
  }

  if (rawData.length < 16) {
    throw new Error('Invalid input HEX data');
  }

  if (!Number.isInteger(start)) {
    throw new Error('Invalid start position');
  }

  if (!size || !Number.isInteger(size)) {
    throw new Error('Invalid bit size');
  }

  start = !endianness ?
    start :
    (Math.floor(start / 8) + 1) * 8 - 1 - start + Math.floor(start / 8) * 8;

  const res = readData(rawData, start, size, endianness, signed);
  return roundTo(
    res * (factor || 1) + (offset || 0),
    Math.min(precision || 20, getPrecesion(res * (factor || 1) + (offset || 0)))
  );
};