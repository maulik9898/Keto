/* eslint-disable no-nested-ternary */
/* eslint-disable react/destructuring-assignment */
import { Divider } from '@mui/material';
import { Signal } from 'renderer/cantool/DbcType';

function Message({ signal, status }: { signal: Signal; status: string }) {
  let error = false;
  if (signal.comment) {
    const lowLimit = parseInt(signal.comment?.split('#')[0], 10);
    const upLimit = parseInt(signal.comment?.split('#')[1], 10);
    if (
      !Number.isNaN(lowLimit) &&
      !Number.isNaN(upLimit) &&
      signal.value !== undefined
    ) {
      error = signal.value < lowLimit || signal.value > upLimit;
    }
    console.log(
      `${signal.name} LOW: ${lowLimit}  UP: ${upLimit} Value: ${signal.value} Error: ${error}`
    );
  }
  const state = signal.states?.find((s) => s.value === signal.value);
  const phyValue =
    state?.state || (signal.value !== undefined ? signal.value : 'NULL');

  return (
    <div className={`w-[16rem] m-2 p-2 border-2 ${
            phyValue === 'NULL'
              ? 'text-gray-500'
              : error
              ? 'text-yellow-200 bg-red-800'
              : 'text-black bg-green-500'
          }`}>
      <div className="flex flex-col m-0 p-0  w-full ">
        <span
          className="self-center font-semibold grow p-1"
          style={{ overflowWrap: 'anywhere' }}
        >
          {signal.name.replaceAll('_', ' ')}
        </span>
        <Divider className={` ${
            phyValue === 'NULL'
              ? 'bg-gray-800'
              : error
              ? 'bg-red-500'
              : 'bg-green-800'
          }`}/>
        <span
          className={`self-center p-1 font-bold `}
        >
          {`${phyValue} ${
            state
              ? ' '
              : signal.value !== undefined
              ? signal.postfixMetric || ''
              : ''
          }`}
        </span>
      </div>
    </div>
  );
}

export default Message;
