import {
  Alert,
  Box,
  Button,
  Card,
  Input,
  Snackbar,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
} from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { langs } from '@uiw/codemirror-extensions-langs';
import fs from 'fs/promises';
import LogoutIcon from '@mui/icons-material/Logout';
import {
  storeClear,
  storeGet,
  storeGetDbc,
  storeGetFilter,
  storeSet,
  storeSetDbc,
  storeSetFilter,
} from 'renderer/store';
import { getDbcJson } from 'renderer/cantool/cantool';
import { useNavigate } from 'react-router';
import { DbcKey } from 'renderer/cantool/DbcType';

function DbcView() {
  const theme = useTheme();
  const fileInput = useRef();
  const [data, setData] = useState('');
  const [fileName, setFileName] = useState('No File selected');
  const [viewType, setViewType] = useState('json');
  const [toastOpen, setToastOpen] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const json: DbcKey = useMemo(() => (data ? getDbcJson(data) : {}), [data]);

  const handleViewType = (
    event: React.MouseEvent<HTMLElement>,
    newAlignment: string | null
  ) => {
    setViewType(newAlignment);
  };

  const save = () => {
    const filter = storeGetFilter();
    const allFilter: Set<string> = new Set();
    Object.entries(json).forEach(([key, value]) => {
      value.signals.forEach((x) => {
        allFilter.add(x.label.toLowerCase());
      });
    });
    storeSetFilter({ ...filter, all: Array.from(allFilter) });
    storeSetDbc(data);
    setMessage(`Saved ${fileName} file..`);
    setToastOpen(true);
  };

  useEffect(() => {
    const d = storeGetDbc();
    if (d) {
      setData(d);
    }
  }, []);
  const printFile = async (e) => {
    const path = e.target.files[0]?.path;
    if (!path) {
      setData('');
      setFileName('No File selected');
      return;
    }
    try {
      const d = await fs.readFile(path, { encoding: 'utf8' });
      setData(d);
      setFileName(e.target.files[0]?.name);
    } catch (err) {
      console.log(err);
    }
  };

  const handleToastClose = () => {
    setMessage('');
    setToastOpen(false);
  };

  return (
    <div className="flex w-full">
      <div className="p-4 flex flex-col w-full h-full">
        <div className="m-4 flex flex-row justify-between items-center">
          <Button
            variant="contained"
            onClick={() => fileInput?.current?.click()}
          >
            Choose File
            <input
              id="inputTag"
              className="p-1 rounded-lg"
              ref={fileInput}
              style={{ display: 'none' }}
              type="file"
              accept=".bin"
              onInput={(e) => printFile(e)}
            />
          </Button>
          <span className="self-center">{fileName}</span>
          <div className="flex flex-row justify-between items-center gap-4">
            <Button
              variant="contained"
              color="success"
              onClick={save}
              className="mx-4"
              disabled={!data}
            >
              <pre> Save </pre>
            </Button>
            {/* <ToggleButtonGroup
              className="mx-4"
              value={viewType}
              exclusive
              size="small"
              onChange={handleViewType}
              aria-label="text alignment"
            >
              <ToggleButton value="dbc" aria-label="left aligned">
                <span>DBC</span>
              </ToggleButton>
              <ToggleButton value="json" aria-label="centered">
                <span>JSON</span>
              </ToggleButton>
            </ToggleButtonGroup> */}
            <Button
              key="exit"
              color="info"
              onClick={() => {
                navigate('/', { replace: true });
              }}
              variant="contained"
              startIcon={<LogoutIcon />}
            >
              Exit
            </Button>
          </div>
        </div>

        {/* <Box className="h-[85vh] relative">
          <CodeMirror
            style={{ height: 'inherit' }}
            className="text-sm"
            value={viewType === 'json' ? JSON.stringify(json, null, 2) : data}
            theme="dark"
            height="inherit"
            extensions={[langs.json()]}
            readOnly
          />
        </Box> */}
      </div>
      <Snackbar
        open={toastOpen}
        autoHideDuration={6000}
        onClose={handleToastClose}
      >
        <Alert
          onClose={handleToastClose}
          severity="success"
          sx={{ width: '100%' }}
        >
          {message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default DbcView;
