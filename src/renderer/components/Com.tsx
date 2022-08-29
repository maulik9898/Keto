import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import LogoutIcon from '@mui/icons-material/Logout';
import { Button, SelectChangeEvent, Stack } from '@mui/material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { PortInfo } from '@serialport/bindings-cpp';
import { useEffect, useMemo, useState } from 'react';
import { SerialPort, ReadlineParser } from 'serialport';
import { decodeCan, getDbcJson } from 'renderer/cantool/cantool';
import { storeGetDbc, storeGetFilter, storeSetFilter } from 'renderer/store';
import { DbcKey, FilterType } from 'renderer/cantool/DbcType';
import Message from './Message';
import Filter from './Filter';

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
      const decodedData = decodeCan(data[2], data[4], jsonDbc);
      if (!decodedData) return;
      setData((d) => ({ ...d, ...decodedData }));
    } catch (error) {
      console.error(error);
    }
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

  useEffect(() => {
    const parser = comPort.pipe(new ReadlineParser({ delimiter: '\n' }));
    parser.on('data', onData);
    comPort.on('close', () => {
      setStatus('close');
      console.log('closed..');
    });
    comPort.on('open', () => {
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
      <div className="flex flex-row justify-between gap-x-3 m-8">
        <div className="flex flex-col">
          <span className="text-lg self-center">
            {`${state.manufacturer}`} &nbsp; {`(${state.path})`} &nbsp;{' '}
            {`#${state.serialNumber}`}
          </span>
          <span
            className={`font-bold ${
              status === 'open' ? 'text-green-600' : 'text-red-600'
            }`}
          >
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
        <Stack className="m-2" direction="row" spacing={2}>
          <Button
            onClick={start}
            key="start"
            color="success"
            disabled={status === 'open'}
            variant="outlined"
            startIcon={<PlayArrowIcon color="success" />}
          >
            Start
          </Button>
          <Button
            key="stop"
            variant="outlined"
            color="error"
            disabled={status === 'close'}
            onClick={stop}
            startIcon={<StopIcon color="error" />}
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
            variant="outlined"
            startIcon={<LogoutIcon color="info" />}
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
      <div
        className="flex flex-row flex-wrap mx-2 mb-4 justify-around"
        style={{ breakInside: 'avoid-column' }}
      >
        {Object.entries(jsonDisplay).map(([key, value]) => {
          return value.signals
            .filter((y) => {
              if (currentFilter.size === 0) return true;
              return currentFilter.has(y.label.toLowerCase());
            })
            .map((x) => {
              return <Message key={x.label} signal={x} />;
            });
        })}
      </div>
    </div>
  );
}

export default Com;
