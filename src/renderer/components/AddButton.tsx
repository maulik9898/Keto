import { Add, Send } from '@mui/icons-material';
import {
  Button,
  Dialog,
  FormControlLabel,
  Switch,
  TextField,
} from '@mui/material';
import React from 'react';
import { useButtonStore } from 'renderer/store';

const AddButton = () => {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState('');
  const [data, setData] = React.useState('');
  const [id, setId] = React.useState('');
  const [isExtended, setIsExtended] = React.useState(false);
  const [delay, setDelay] = React.useState(0);
  const [repeat, setRepeat] = React.useState(1);

  const addButton = useButtonStore((state) => state.addButton);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const saveDisabled = name === '' || data === '' || id === '';

  const handleSave = () => {
    addButton({ name, data, id, isExtended, delay, repeat });
    handleClose();
  };

  return (
    <div>
      <Button onClick={handleOpen} variant="outlined" startIcon={<Add />}>
        Add
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <div className="flex flex-col m-8 gap-4">
          <TextField
            required
            label="Name"
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <TextField
            required
            label="ID"
            variant="outlined"
            value={id}
            onChange={(e) => setId(e.target.value)}
          />
          <TextField
            required
            label="Data"
            variant="outlined"
            value={data}
            onChange={(e) => setData(e.target.value)}
          />
          <TextField
            label="Delay"
            variant="outlined"
            type="number"
            value={delay}
            onChange={(e) => setDelay(parseInt(e.target.value, 10))}
          />
          <TextField
            label="Repeat"
            variant="outlined"
            type="number"
            value={repeat}
            onChange={(e) => setRepeat(parseInt(e.target.value, 10))}
          />
          <FormControlLabel
            className="ml-0 gap-2"
            control={
              <Switch
                className="ml-0"
                checked={isExtended}
                onChange={(e) => setIsExtended(e.target.checked)}
              />
            }
            label="Extended"
          />
          <div className="flex flex-row justify-between">
            <Button
              variant="outlined"
              disabled={saveDisabled}
              onClick={handleSave}
            >
              Save
            </Button>
            <Button variant="outlined" color="error" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default AddButton;
