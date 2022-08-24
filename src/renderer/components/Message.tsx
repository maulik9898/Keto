/* eslint-disable react/destructuring-assignment */
import { Divider } from '@mui/material';
import { Signal } from 'renderer/cantool/DbcType';

function Message({ signal }: { signal: Signal }) {
  return (
    <div className="w-[16rem] m-2 p-2 border-2">
      <div className="flex flex-col m-0 p-0  w-full ">
        <span
          className="self-center font-semibold grow p-1"
          style={{ overflowWrap: 'anywhere' }}
        >
          {signal.name.replaceAll('_', ' ')}
        </span>
        <Divider />
        <span className="self-center p-1 font-bold text-orange-500">
          {`${signal.value || 'NULL'} ${
            signal.value ? signal.postfixMetric || '' : ''
          }`}
        </span>
      </div>
    </div>
  );
}

export default Message;
