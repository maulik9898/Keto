import { Button } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import React, { useEffect, useMemo, useState } from 'react';
import { FilterType } from 'renderer/cantool/DbcType';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  values: string[][];
  onSave: (name: string, values: string[]) => void;
  selected: string | null;
  filters: FilterType;
}

const FilterDialog = (props: DialogProps) => {
  const { open, onClose, values, onSave, selected, filters } = props;
  const [filterName, setFilterName] = useState(selected || '');
  const [checkBox, setCheckBox] = useState(
    values.reduce(
      (a, v) => ({ ...a, [v[0]]: filters[selected]?.includes(v[0]) || false }),
      {}
    )
  );

  const saveDisabled = useMemo(() => {
    if (filterName === '') return true;
    const a = Object.entries(checkBox).every(([key, value]) => value === false);
    if (a) return true;
    return false;
  }, [checkBox, filterName]);

  useEffect(() => {
    setCheckBox(
      values.reduce(
        (a, v) => ({
          ...a,
          [v[0]]: filters[selected]?.includes(v[0]) || false,
        }),
        {}
      )
    );
  }, [filters, selected, values]);

  useEffect(() => {
    if (selected) {
      setFilterName(selected);
    } else {
      setFilterName('');
    }
  }, [selected]);

  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterName(e.target.value);
  };

  const handleCheckBoxChecked = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCheckBox((state) => ({
      ...state,
      [event.target.name]: event.target.checked,
    }));
  };

  const handleClearClick = () => {
    setCheckBox(values.reduce((a, v) => ({ ...a, [v[0]]: false }), {}));
  };

  const handleSelectClick = () => {
    setCheckBox(values.reduce((a, v) => ({ ...a, [v[0]]: true }), {}));
  };

  const handleInvertClick = () => {
    setCheckBox((val) =>
      values.reduce((a, v) => ({ ...a, [v[0]]: !val[v[0]] }), {})
    );
  };

  const handleSaveClick = () => {
    const newValues = Object.entries(checkBox)
      .filter(([key, value]) => value === true)
      .map(([key, value]) => key);
    onSave(filterName, newValues);
  };

  return (
    <Dialog
      className="p-4 "
      fullWidth
      maxWidth="lg"
      open={open}
      onClose={onClose}
    >
      <div className="m-4 p-4 flex flex-col gap-4">
        <div className="flex gap-6">
          <TextField
            className=" grow"
            label="Page Name"
            variant="outlined"
            value={filterName}
            onChange={handleTextFieldChange}
          />
          <Button
            variant="outlined"
            color="success"
            disabled={saveDisabled}
            onClick={handleSaveClick}
          >
            Save
          </Button>
        </div>
        <div className="flex flex-row justify-start gap-11">
          <Button variant="outlined" color="warning" onClick={handleClearClick}>
            Clear All
          </Button>
          <Button
            variant="outlined"
            color="warning"
            onClick={handleSelectClick}
          >
            Select All
          </Button>
          <Button
            variant="outlined"
            color="warning"
            onClick={handleInvertClick}
          >
            Invert
          </Button>
        </div>

        <div className="flex flex-row flex-wrap m-4 justify-between">
          {values.map((x) => {
            return (
              <FormControlLabel
                key={x[1]}
                className="w-[16rem]"
                control={<Checkbox name={x[0]} />}
                label={x[1].replaceAll('_', ' ')}
                checked={checkBox[x[0]]}
                onChange={handleCheckBoxChecked}
              />
            );
          })}
        </div>
      </div>
    </Dialog>
  );
};

export default FilterDialog;
