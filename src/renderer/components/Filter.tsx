import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { getDbcJson } from 'renderer/cantool/cantool';
import { DbcKey, FilterType } from 'renderer/cantool/DbcType';
import { storeGetDbc } from 'renderer/store';
import FilterDialog from './FilterDialog';

const Filter = ({
  selected,
  filters,
  onClick,
  onSave,
  onDelete,
  deleteDisabled,
}: {
  selected: string;
  filters: FilterType;
  onClick(event: SelectChangeEvent): void;
  onSave(name: string, values: string[]): void;
  onDelete(): void;
  deleteDisabled: boolean;
}) => {
  const [dbc, setDbc] = useState(storeGetDbc());
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(null);

  const jsonDbc: string[][] = useMemo(() => {
    const json = getDbcJson(dbc);
    const allSignals: string[][] = [];
    Object.entries(json).forEach(([, value]) => {
      value.signals.forEach((x) => {
        if (x?.isMultiplexor) return;
        allSignals.push([x.label.toLowerCase(), x.name]);
      });
    });
    allSignals.sort((a, b) =>
      a[1].toLowerCase().localeCompare(b[1].toLowerCase())
    );
    return allSignals;
  }, [dbc]);

  const handleDialogClose = () => {
    setOpen(false);
  };

  const handleDialogSave = (name: string, values: string[]) => {
    setOpen(false);
    onSave(name, values);
  };

  return (
    <div className="flex flex-row justify-evenly gap-4">
      <FormControl
        className="self-center"
        sx={{ m: 1, minWidth: 120 }}
        size="small"
        fullWidth
      >
        <InputLabel id="filter-select-small">Page</InputLabel>
        <Select
          labelId="filter-select-small"
          value={selected}
          variant="outlined"
          className="p-1"
          size="small"
          onChange={onClick}
          label="Page"
        >
          {Object.entries(filters).map(([key, value]) => {
            return (
              <MenuItem key={key} value={key} className="p-1">
                {' '}
                {key.toUpperCase()}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
      <Button
        className="self-center mx-2"
        variant="contained"
        onClick={() => {
          setEdit(null);
          setOpen((d) => true);
        }}
      >
        Add
      </Button>
      <Button
        className="self-center mx-2"
        variant="contained"
        disabled={deleteDisabled}
        onClick={onDelete}
        color="error"
      >
        Delete
      </Button>
      <Button
        className="self-center mx-2"
        variant="contained"
        onClick={() => {
          setEdit(selected);
          setOpen((d) => true);
        }}
      >
        Edit
      </Button>
      <FilterDialog
        onSave={handleDialogSave}
        open={open}
        selected={edit}
        filters={filters}
        onClose={handleDialogClose}
        values={jsonDbc}
      />
    </div>
  );
};

export default Filter;
