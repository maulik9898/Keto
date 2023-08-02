import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import LogoutIcon from '@mui/icons-material/Logout';
import { Button, SelectChangeEvent, Stack } from '@mui/material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { PortInfo } from '@serialport/bindings-cpp';
import { useEffect, useMemo, useRef, useState } from 'react';
import { SerialPort, ReadlineParser } from 'serialport';
import { decodeCan, getDbcJson } from 'renderer/cantool/cantool';
import {
  ButtonI,
  getLogPath,
  storeGetDbc,
  storeGetFilter,
  storeSetFilter
} from 'renderer/store';
import { DbcKey } from 'renderer/cantool/DbcType';
import fs from 'fs';
import Message from './Message';
import Filter from './Filter';
import logo from '../../../assets/keto-white-logo.png';
import SendButtonGroup from './SendButtonGroup';

const options = {
  weekday: 'short', // Short weekday (e.g., "Mon")
  month: 'short', // Short month name (e.g., "Sep")
  day: '2-digit', // Day of the month with leading zeros (e.g., "26")
  hour: '2-digit', // Hour with leading zeros (e.g., "17")
  minute: '2-digit', // Minute with leading zeros (e.g., "14")
  second: '2-digit', // Second with leading zeros (e.g., "14")
  year: 'numeric', // Full year (e.g., "2022")
};
const path = require('path');

function Com() {
  const { port } = useParams();
  const device = useLocation();
  const { state } = device as { state: PortInfo };
  const navigate = useNavigate();
  const [status, setStatus] = useState('close');
  const [jsonDisplay, setData] = useState(getDbcJson(storeGetDbc()) as DbcKey);
  const [filters, setFilters] = useState(storeGetFilter());
  const [selectedFilter, setSelectedFilter] = useState(
    filters.all ? 'all' : Object.keys(filters)[0]
  );

  const jsonDbc: DbcKey = useMemo(() => getDbcJson(storeGetDbc()), []);

  const logPath = useMemo(() => getLogPath(), []);

  const initialTime = useRef();
  const [isFirst, setIsFirst] = useState(true);
  const logFileStream = useRef(); // fs.createWriteStream(logPath, { flags: 'a' });     // fs.createWriteStream(logPath, { flags: 'a' });

  const deleteDisabled = Object.keys(filters).length === 1;

  const currentFilter = useMemo(() => {
    return new Set(filters[selectedFilter]);
  }, [filters, selectedFilter]);

  useEffect(() => {
    storeSetFilter(filters);
  }, [filters]);

  const comPort = useMemo(
    () =>
      new SerialPort({
        path: port,
        baudRate: 115200,
        autoOpen: false,
      }),
    [port]
  );

  const stop = async () => {
    if (comPort.isOpen) {
      const err = await comPort.close();
      console.log(err);
    }
  };

  const start = async () => {
    if (!comPort.isOpen) {
      const err = await comPort.open();
      console.log(err);
    }
  };

  const onData = (e) => {
    try {
      const data = JSON.parse(e);
      console.log(data);
      if (initialTime.current == null) {
        initialTime.current = new Date();
        console.log('setting time');
      }
      const currentTime = new Date();
      const timeDiff =
        currentTime.getTime() -
        (initialTime?.current?.getTime() == null
          ? currentTime.getTime()
          : initialTime.current.getTime());
      console.log('timediff: ', timeDiff / 1000);
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      saveToFile(data, timeDiff);
      const decodedData = decodeCan(data[0], data[1], jsonDisplay);
      if (!decodedData) return;
      setData((d) => ({ ...d, ...decodedData }));
    } catch (error) {
      console.error(error);
    }
  };

  const sendTemp = () => {
    const data: string = '["18305040", "01 00 FF 00 00 00 00 00"]';

    let i = 0;
    setTimeout(() => {
      const interval = setInterval(() => {
        onData(data);
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        if (i === 100) {
          clearInterval(interval);
        }
        i += 1;
      }, 30);
    }, 1000);
  };

  const handleFilterChange = (event: SelectChangeEvent) => {
    setSelectedFilter(event.target.value);
  };

  const handleFilterSave = (name: string, values: string[]) => {
    setFilters((f) => ({ ...f, [name]: values }));
  };

  const handleFilterDelete = () => {
    const newF = { ...filters };
    delete newF[selectedFilter];
    setSelectedFilter(Object.keys(newF)[0]);
    setFilters(newF);
  };

  const sendData = (button: ButtonI) => {
    if (comPort.isOpen) {
      // send data with delay and repeat
      const { id, isExtended, data, delay, repeat } = button;
      let counter = 0; // Initialize a counter to track the number of times the function is called

      const sendLoop = () => {
        counter += 1; // Increment the counter after each function call
        const send = `${id},${isExtended ? 1 : 0},${data}\n`;
        console.log(`${new Date()} `, send);
        comPort.write(send, (err) => {
          if (err) {
            console.log(err);
          }
        });
        // Check if the function has been called 5 times
        if (counter === repeat) {
          clearInterval(interval); // Stop the interval after 5 calls
        }
      };

      let interval = setInterval(sendLoop, delay); // Set an interval
    }
  };

  const saveToFile = (e, timeDiff) => {
    const data = e;
    console.log('initialtime', initialTime);
    console.log('isfirst', isFirst);

    console.log('timediff: ', timeDiff / 1000);

    const log = `   ${(timeDiff / 1000).toFixed(6)} 1  ${data[0]}x       Rx   d ${
      data[1].split(' ').length
    } ${data[1]}\n`;
    console.log(log);
    logFileStream.current.write(log);
  };

  function formatCustomDate(date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const day = date.toLocaleString('en-US', { weekday: 'short' });
    const month = months[date.getMonth()];
    const dayOfMonth = date.getDate();
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    // Pad single-digit dayOfMonth, hours, minutes, and seconds with leading zeros
    const formattedDayOfMonth = dayOfMonth.toString().padStart(2, '0');
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');

    const formattedDate = `${day} ${month} ${formattedDayOfMonth} ${formattedHours}:${formattedMinutes}:${formattedSeconds} ${year}`;
    return formattedDate;
  }

  useEffect(() => {
    const parser = comPort.pipe(new ReadlineParser({ delimiter: '\n' }));
    parser.on('data', (data) => {
      onData(data);
    });
    comPort.on('close', () => {
      setStatus('close');
      logFileStream.current.close();
      console.log('closed..');
      initialTime.current = null;
    });
    comPort.on('open', () => {
      const tzoffset = new Date().getTimezoneOffset() * 60000;
      const timeElapsed = Date.now();
      const currentTime = new Date();

      const header = `date ${formatCustomDate(currentTime)}
base hex  timestamps absolute
no internal events logged\n`;

      const p = path.join(
        logPath,
        `${currentTime
          .toLocaleString('en-US', options)
          .split('.')[0]
          .replaceAll(':', '-')}.asc`
      );
      logFileStream.current = fs.createWriteStream(p, { flags: 'w+' });
      logFileStream.current.write(header);

      setStatus('open');
      console.log('open..');
      //sendTemp();
    });
    return () => {
      if (comPort.isOpen) {
        comPort.close((err) => {
          console.log(err);
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comPort]);

  return (
    <div className="flex flex-col  w-full">
      <div className="flex flex-row flex-wrap gap-y-3 justify-between content-center gap-x-3 m-8">
        <img className="self-center mr-4 ml-4npm run " alt="icon" src={logo} />
        <div
          className={`flex flex-col self-center content-center border p-2 rounded-lg ${
            status === 'open' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          <span className="text-lg self-center">
            {`${state.manufacturer}`} &nbsp; {`(${state.path})`} &nbsp;{' '}
            {`#${state.serialNumber}`}
          </span>
          <span className="font-bold">
            {status === 'open' ? 'Connected...' : 'Disconnected...'}
          </span>
        </div>
        <Filter
          selected={selectedFilter}
          filters={filters}
          onClick={handleFilterChange}
          onSave={handleFilterSave}
          onDelete={handleFilterDelete}
          deleteDisabled={deleteDisabled}
        />
        <Stack className="m-2 self-center" direction="row" spacing={2}>
          <Button
            onClick={start}
            key="start"
            color="success"
            disabled={status === 'open'}
            variant="contained"
            startIcon={<PlayArrowIcon />}
          >
            Start
          </Button>
          <Button
            key="stop"
            variant="contained"
            color="error"
            disabled={status === 'close'}
            onClick={stop}
            startIcon={<StopIcon />}
          >
            Stop
          </Button>
          <Button
            key="exit"
            color="info"
            onClick={() => {
              stop();
              navigate('/', { replace: true });
            }}
            variant="contained"
            startIcon={<LogoutIcon />}
          >
            Exit
          </Button>
        </Stack>
      </div>
      {/* <CodeMirror
        className="rounded-lg p-2 m-4"
        value={JSON.stringify(jsonDisplay, null, 2)}
        height="600px"
        theme="dark"
        extensions={[langs.json()]}
        readOnly
      /> */}
      <SendButtonGroup onClick={sendData} />
      <div
        className="flex flex-row flex-wrap mx-2 mb-4 justify-around"
        style={{ breakInside: 'avoid-column' }}
      >
        {Object.entries(jsonDisplay)
          .map(([, value]) => {
            return value.signals.filter((y) => {
              if (y?.isMultiplexor) return false;
              if (currentFilter.size === 0) return true;
              return currentFilter.has(y.label.toLowerCase());
            });
          })
          .flat()
          .sort((a, b) =>
            a.name.toLowerCase().localeCompare(b.name.toLowerCase())
          )
          .map((x) => {
            return <Message key={x.label} signal={x} status={status} />;
          })}
      </div>
    </div>
  );
}

export default Com;
