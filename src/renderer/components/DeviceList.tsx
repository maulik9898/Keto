import { useEffect, useState } from 'react';
import { SerialPort } from 'serialport';
import { PortInfo } from '@serialport/bindings-cpp';
import { Button, Card, List, ListItemButton } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import keto from '../../../assets/keto.png';

import Device from './Device';

function DeviceList() {
  const navigate = useNavigate();
  const [devices, setDevices] = useState([] as PortInfo[]);
  const [error, setError] = useState(null as string);
  const [selected, setSelected] = useState(null as string);
  const [loading, setLoading] = useState(false);

  const refreshDevices = async () => {
    setLoading(true);
    const newDevices = await SerialPort.list();
    console.log(newDevices);
    setDevices(newDevices);
    setLoading(false);
  };

  const navigateHandler = (event) => {
    event.preventDefault();
    const device = devices.find((x) => x.path === selected);
    navigate(`/com/${encodeURIComponent(selected)}`, { state: device });
  };

  useEffect(() => {
    (async () => {
      await refreshDevices();
    })();

    return () => {};
  }, []);

  return (
    <>
      <div
        className="flex w-full"
        style={{
          background: `url("${keto}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="p-4 h-fit m-auto rounded-lg ">
          <div
            style={{ backgroundColor: 'rgba(0,0,0, 0.6)' }}
            className="flex flex-row justify-between m-2 p-4 rounded-lg"
          >
            <p className="">Available Devices</p>
            <RefreshIcon
              onClick={refreshDevices}
              className="hover:cursor-pointer"
            />
          </div>
          {!loading && (
            <>
              <List aria-label="main mailbox folders" className="min-w-[300px]">
                {devices.map((e) => {
                  return (
                    <ListItemButton
                      onClick={() => setSelected(e.path)}
                      selected={e.path === selected}
                      key={e.path}
                      className="mt-2 p-0 bg-green-300 hover:rounded-lg"
                    >
                      <Device device={e} selected={e.path === selected} />
                    </ListItemButton>
                  );
                })}
              </List>
              <div className="m-2">
                <Button
                  onClick={navigateHandler}
                  disabled={!selected}
                  variant="contained"
                  className="m-0 w-full"
                >
                  <span className=" font-bold">Open</span>
                </Button>
              </div>
            </>
          )}
          <div className="m-2 mt-6">
            <Button
              variant="contained"
              color="info"
              className=" w-full my-6"
              onClick={() => navigate('/dbc', { replace: true })}
            >
              Configure
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default DeviceList;
