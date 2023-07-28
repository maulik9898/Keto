import React from 'react';
import { Button, SelectChangeEvent, Stack } from '@mui/material';
import { Send } from '@mui/icons-material';

import { ButtonI, useButtonStore } from 'renderer/store';
import AddButton from './AddButton';
import SendButton from './SendButton';

interface ButtonProps {
  onClick: (button: ButtonI) => void;
}

const SendButtonGroup: React.FC<ButtonProps> = ({ onClick }) => {
  const buttons = useButtonStore((state) => state.buttons);
  return (
    <div className="mx-8 my-4">
      <div className="flex flex-row flex-wrap gap-4 ">
        <AddButton />
        {buttons.map((button) => (
          <SendButton
            onClick={onClick}
            button={button}
            key={button.name + button.id}
          />
        ))}
      </div>
    </div>
  );
};

export default SendButtonGroup;
