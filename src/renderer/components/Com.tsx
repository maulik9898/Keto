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
  getLogPath,
  getPath,
  storeGetDbc,
  storeGetFilter,
  storeSetFilter,
} from 'renderer/store';
import { DbcKey, FilterType } from 'renderer/cantool/DbcType';
import fs from 'fs';
import { ensureDir } from 'fs-extra';
import Message from './Message';
import Filter from './Filter';
import logo from '../../../assets/keto-white-logo.png';
import SendButtonGroup from './SendButtonGroup';

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

      const decodedData = decodeCan(data[0], data[1], jsonDisplay);
      if (!decodedData) return;
      setData((d) => ({ ...d, ...decodedData }));
    } catch (error) {
      console.error(error);
    }
  };

  // useEffect(() => {
  //   const data: string[] = [
  //     '["18305040", "01 00 FF 00 00 00 00 00"]',
  //     '["18305040", "01 00 FF 00 00 00 00 00"]',
  //     '["18305040", "01 00 FF 00 00 00 00 00"]',
  //     '["18305040", "01 00 FF 00 00 00 00 00"]',
  //     '["18305040", "01 00 FF 00 00 00 00 00"]',
  //   ];

  //   let i = 0;
  //   setTimeout(() => {
  //     const interval = setInterval(() => {
  //       onData(data[i]);
  //       if (i === data.length - 1) {
  //         clearInterval(interval);
  //       }
  //       i += 1;
  //     }, 2000);
  //   }, 2000);
  // }, []);

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


  const sendData = ( id: string, data: string, isExtended: boolean) => {
    if (comPort.isOpen) {
      const send = `${id},${isExtended ? 1 : 0},${data}\n`;
      console.log(send);
      comPort.write(send, (err) => {
        console.log(err);
      });
    }
  };

  const saveToFile = (e) => {
    try {
      const data = JSON.parse(e);
      logFileStream.current.write(`${Date.now()},${data[0]},${data[1]}\n`);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const parser = comPort.pipe(new ReadlineParser({ delimiter: '\n' }));
    parser.on('data', onData);
    comPort.on('close', () => {
      setStatus('close');
      parser.removeListener('data', saveToFile);
      logFileStream.current.close();
      console.log('closed..');
    });
    comPort.on('open', () => {
      const tzoffset = new Date().getTimezoneOffset() * 60000;
      const timeElapsed = Date.now();
      const currentTime = new Date(timeElapsed - tzoffset);
      const p = path.join(
        logPath,
        `${currentTime.toISOString().split('.')[0].replaceAll(':', '-')}.log`
      );
      logFileStream.current = fs.createWriteStream(p, { flags: 'w+' });
      parser.on('data', saveToFile);
      setStatus('open');
      console.log('open..');
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
