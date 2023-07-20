/* eslint-disable no-bitwise */
import { Dbc, DbcKey, Signal } from './DbcType';
import parseDbc from './transmutator';
import decode from './canDecode';

/** This function convert dbc file to json . */
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
  if (isExtendedCANID(canId)) {
    return ((1 << 29) | parseInt(canId, 16)) >>> 0;
  }
  return parseInt(canId, 16);
};

function isExtendedCANID(canIDStr: string): boolean {
  // Convert the string to an integer (base 16)
  const canID: number = parseInt(canIDStr, 16);

  // Check the 11th bit (for standard CAN ID) or 29th bit (for extended CAN ID)
  const isExtended: boolean = (canID & (1 << 10)) !== 0; // 0x3FF for standard (11-bit) or 0x1FFFFFFF for extended (29-bit)
  return isExtended;
}

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
  if (!dbcObj) return null;
  const anyMultiPlexor = dbcObj.signals.find((s) => s.isMultiplexor);
  const signals = dbcObj?.signals.slice();
  let multiplexValue: number | null = null;
  if (anyMultiPlexor) {
    multiplexValue = decode({
      rawData: formatData(data, dbcObj.dlc, anyMultiPlexor.isLittleEndian),
      start: anyMultiPlexor.startBit,
      size: anyMultiPlexor.bitLength,
      factor: anyMultiPlexor.factor,
      offset: anyMultiPlexor.offset,
      endianness: anyMultiPlexor.isLittleEndian ? 0 : 1,
      precision: 2,
      signed: anyMultiPlexor.isSigned,
    });
  }
  const arrSignals: Signal[] = [];
  signals?.forEach((x) => {
    if (multiplexValue) {
      if (x.multiplexerValue !== multiplexValue) {
        arrSignals.push({ ...x, data });
        return;
      }
    }
    const value = decode({
      rawData: formatData(data, dbcObj.dlc, x.isLittleEndian),
      start: x.startBit,
      size: x.bitLength,
      factor: x.factor,
      offset: x.offset,
      endianness: x.isLittleEndian ? 0 : 1,
      precision: 2,
      signed: x.isSigned,
    });
    arrSignals.push({ ...x, value, data });
  });
  dbcObj.signals = arrSignals;
  const ans: DbcKey = {
    [dbcId]: dbcObj,
  };
  return ans;
};
