/* eslint-disable react/destructuring-assignment */
import { Divider } from '@mui/material';
import { Signal } from 'renderer/cantool/DbcType';

function Message({ signal }: { signal: Signal }) {
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
    // console.log(
    //   `${signal.name} LOW: ${lowLimit}  UP: ${upLimit} Value: ${signal.value} Error: ${error}`
    // );
  }

  return (
    <div className={`w-[16rem] m-2 p-2 border-2 ${error ? 'bg-red-800' : ''}`}>
      <div className="flex flex-col m-0 p-0  w-full ">
        <span
          className="self-center font-semibold grow p-1"
          style={{ overflowWrap: 'anywhere' }}
        >
          {signal.name.replaceAll('_', ' ')}
        </span>
        <Divider />
        <span
          className={`self-center p-1 font-bold ${
            error ? 'text-yellow-200' : 'text-orange-500'
          } `}
        >
          {`${signal.value !== undefined ? signal.value : 'NULL'} ${
            signal.value !== undefined ? signal.postfixMetric || '' : ''
          }`}
        </span>
      </div>
    </div>
  );
}

export default Message;
