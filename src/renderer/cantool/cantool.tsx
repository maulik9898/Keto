/* eslint-disable no-bitwise */
import { Dbc, DbcKey, Signal } from './DbcType';
import parseDbc from './transmutator';

const decode = require('can-dbc-decode');

export const getDbcJson = (dbcString: string) => {
  const d = parseDbc(dbcString) as Dbc;
  const obj: DbcKey = d.params.reduce((accumulator, value) => {
    return {
      ...accumulator,
      [value.canId]: value,
    };
  }, {});
  return obj;
};

export const canToDbc = (canId: string) => {
  return ((4 << 29) | parseInt(canId, 16)) >>> 0;
};

export const formatData = (
  data: string,
  len: number,
  isLittleEndian: boolean
) => {
  const d = data.replaceAll(' ', '');
  if (len === 8) return d;
  const diff = 8 - len;
  const diffStr = '00'.repeat(diff);
  return isLittleEndian ? d + diffStr : diffStr + d;
};

export const decodeCan = (canId: string, data: string, dbcJson: DbcKey) => {
  const dbcId = `${canToDbc(canId)}`;
  const dbcObj = dbcJson[dbcId];
  console.log(`CAN ID: ${canId}  DBCID : ${dbcId} DATA: ${data}`);
  if (!dbcObj) return null;
  const arrSignals: Signal[] = [];
  dbcObj?.signals?.forEach((x) => {
    const value = decode({
      rawData: formatData(data, dbcObj.dlc, x.isLittleEndian),
      start: x.startBit,
      size: x.bitLength,
      factor: x.factor,
      offset: x.offset,
      endianness: x.isLittleEndian ? 0 : 1,
      precision: 2,
    });
    arrSignals.push({ ...x, value, data });
  });
  dbcObj.signals = arrSignals;
  console.log(arrSignals);
  const ans: DbcKey = {
    [dbcId]: dbcObj,
  };
  return ans;
};
